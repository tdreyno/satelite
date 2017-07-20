import isFunction = require("lodash/isFunction");
import {
  Comparison,
  dependentVariableNames,
  getJoinTestsFromCondition,
  ICondition,
  parseCondition,
  ParsedCondition,
} from "./Condition";
import { IFact, IFactFields, IValue, makeFact } from "./Fact";
import { IIdentifier, IPrimitive } from "./Identifier";
import { AccumulatedRootNode } from "./nodes/AccumulatedRootNode";
import { AccumulatorCondition, AccumulatorNode } from "./nodes/AccumulatorNode";
import {
  AlphaMemoryNode,
  createExhaustiveHashTable,
  IExhaustiveHashTable,
  lookupInHashTable,
} from "./nodes/AlphaMemoryNode";
import { ComparisonNode } from "./nodes/ComparisonNode";
import { JoinNode } from "./nodes/JoinNode";
import { NegativeNode } from "./nodes/NegativeNode";
import { ProductionNode } from "./nodes/ProductionNode";
import { QueryNode } from "./nodes/QueryNode";
import { ReteNode, RootNode } from "./nodes/ReteNode";
import { RootJoinNode } from "./nodes/RootJoinNode";
import { IActivateCallback, Production } from "./Production";
import { Query } from "./Query";
import { IVariableBindings } from "./Token";
import { removeIndexFromList } from "./util";

export type ITerminalNode = Production | Query;

let variablePrefix = "?";

export function getVariablePrefix(): string {
  return variablePrefix;
}

export function setVariablePrefix(p: string): void {
  variablePrefix = p;
}

export const placeholder = "__placeholder__";

export function not(c: ICondition) {
  c.isNegated = true;
  return c;
}

export type IAnyCondition = ICondition | AccumulatorCondition;
export type IConditions = IAnyCondition[];
export interface IThenCreateProduction {
  then: (callback: IActivateCallback) => Production;
}

export interface IEntityResult {
  facts: Set<IFact>;
  attributes: { [attribute: string]: IValue };
}

export type ILogger = (message: string, ...data: any[]) => any;
export type ILoggers =
  | {
      [eventName: string]: ILogger;
    }
  | ILogger;

export class Rete {
  static create(loggers?: ILoggers): Rete {
    return new Rete(loggers);
  }

  _ = placeholder;
  self = this;
  root = RootNode.create(this);
  hashTable: IExhaustiveHashTable = createExhaustiveHashTable();
  facts: IFact[] = [];
  loggers?: ILoggers;

  private terminalNodes: ITerminalNode[] = [];
  private entities: Map<IIdentifier | IPrimitive, IEntityResult> = new Map();

  constructor(loggers?: ILoggers) {
    this.loggers = loggers;

    this.addFact = this.addFact.bind(this);
    this.addFacts = this.addFacts.bind(this);
    this.removeFact = this.removeFact.bind(this);
    this.removeFacts = this.removeFacts.bind(this);
    this.updateFact = this.updateFact.bind(this);
    this.updateFacts = this.updateFacts.bind(this);
    this.addProduction = this.addProduction.bind(this);
    this.addQuery = this.addQuery.bind(this);

    this.assert = this.assert.bind(this);
    this.retract = this.retract.bind(this);
    this.update = this.update.bind(this);
    this.rule = this.rule.bind(this);
    this.query = this.query.bind(this);
    this.findAll = this.findAll.bind(this);
    this.findOne = this.findOne.bind(this);
    this.findEntity = this.findEntity.bind(this);
    this.retractEntity = this.retractEntity.bind(this);
  }

  log(eventName: string, ...data: any[]): void {
    if (!this.loggers) {
      return;
    }

    if (isFunction(this.loggers)) {
      this.loggers(eventName, ...data);
      return;
    }

    if (isFunction(this.loggers[eventName])) {
      this.loggers[eventName](eventName, ...data);
    }
  }

  // External API.
  assert(...facts: IFact[]): void {
    return this.addFacts(...facts);
  }
  retract(...facts: IFact[]): void {
    return this.removeFacts(...facts);
  }
  update(...facts: IFact[]): void {
    return this.updateFacts(...facts);
  }
  rule(...conditions: IConditions): IThenCreateProduction {
    return this.addProduction(...conditions);
  }
  query(...conditions: IConditions): Query {
    return this.addQuery(...conditions);
  }

  findAll(...conditions: IConditions): IVariableBindings[] {
    return this.addQuery(...conditions).getVariableBindings();
  }

  findOne(...conditions: IConditions): IVariableBindings {
    return this.addQuery(...conditions).getVariableBindings()[0];
  }

  findEntity(id: IIdentifier | IPrimitive): IEntityResult | undefined {
    return this.entities.get(id);
  }

  retractEntity(id: IIdentifier | IPrimitive): void {
    const e = this.findEntity(id);

    if (e) {
      this.retract(...e.facts);
    }
  }

  toJSONString() {
    return JSON.stringify(Array.from(this.facts), undefined, 2);
  }

  // Internal API.
  private addFacts(...facts: IFact[]): void {
    facts.forEach(this.addFact);
  }

  private removeFacts(...facts: IFact[]): void {
    facts.forEach(this.removeFact);
  }

  private updateFacts(...facts: IFact[]): void {
    facts.forEach(this.updateFact);
  }

  private addFact(factTuple: IFact): void {
    const f = makeFact(factTuple[0], factTuple[1], factTuple[2]);

    if (this.facts.indexOf(f) === -1) {
      this.log("Asserting", f);
      this.facts.push(f);

      const existingEntity: IEntityResult = this.entities.get(f[0]) || {
        facts: new Set(),
        attributes: {},
      };

      existingEntity.facts.add(f);
      existingEntity.attributes[f[1]] = f[2];
      this.entities.set(f[0], existingEntity);

      this.dispatchToAlphaMemories(f, "activate");
    }
  }

  private removeFact(fact: IFact): void {
    const f = makeFact(fact[0], fact[1], fact[2]);

    const factIndex = this.facts.indexOf(f);
    if (factIndex !== -1) {
      this.log("Retracting", f);
      removeIndexFromList(this.facts, factIndex);

      const existingEntity = this.entities.get(f[0]);

      if (existingEntity) {
        existingEntity.facts.delete(f);

        if (existingEntity.facts.size > 0) {
          delete existingEntity.attributes[f[1]];
          this.entities.set(f[0], existingEntity);
        } else {
          this.entities.delete(f[0]);
        }
      }

      this.dispatchToAlphaMemories(f, "retract");
    }

    this.root.rightRetract(f);
  }

  // TODO: Add an `update` in addition to `activate` and `retract`.
  private updateFact(fact: IFact): void {
    let wasAlreadySet = false;

    for (const f of this.facts) {
      if (f[0] === fact[0] && f[1] === fact[1]) {
        if (f[2] === fact[2]) {
          wasAlreadySet = true;
          break;
        }

        this.removeFact(f);
      }
    }

    if (!wasAlreadySet) {
      this.addFact(fact);
    }
  }

  private addProduction(...conditions: IConditions): IThenCreateProduction {
    return {
      then: (callback: IActivateCallback) => {
        const parsedConditions = conditions.map(parseCondition);
        const currentNode = this.buildOrShareNetworkForConditions(
          parsedConditions,
          [],
        );

        const production = Production.create(callback);
        production.productionNode = ProductionNode.create(
          this,
          production,
          parsedConditions,
        );

        currentNode.children.unshift(production.productionNode);

        production.productionNode.parent = currentNode;

        production.productionNode.updateNewNodeWithMatchesFromAbove();

        this.terminalNodes.push(production);

        return production;
      },
    };
  }

  private addQuery(...conditions: IConditions): Query {
    const parsedConditions = conditions.map(parseCondition);
    const currentNode = this.buildOrShareNetworkForConditions(
      parsedConditions,
      [],
    );

    const query = Query.create(parsedConditions);
    query.queryNode = QueryNode.create(this, query);
    currentNode.children.unshift(query.queryNode);

    query.queryNode.parent = currentNode;

    query.queryNode.updateNewNodeWithMatchesFromAbove();

    this.terminalNodes.push(query);

    return query;
  }

  private dispatchToAlphaMemories(
    f: IFact,
    fnName: "activate" | "retract",
  ): void {
    const fn = (am?: AlphaMemoryNode) => am && am[fnName](f);

    fn(lookupInHashTable(this.hashTable, f[0], f[1], f[2]));
    fn(lookupInHashTable(this.hashTable, f[0], f[1], null));
    fn(lookupInHashTable(this.hashTable, null, f[1], f[2]));
    fn(lookupInHashTable(this.hashTable, f[0], null, f[2]));
    fn(lookupInHashTable(this.hashTable, null, null, f[2]));
    fn(lookupInHashTable(this.hashTable, null, f[1], null));
    fn(lookupInHashTable(this.hashTable, f[0], null, null));
    fn(lookupInHashTable(this.hashTable, null, null, null));
  }

  private buildOrShareNetworkForConditions(
    conditions: Array<ParsedCondition | AccumulatorCondition>,
    earlierConditions: Array<ParsedCondition | AccumulatorCondition>,
    currentNode: ReteNode = this.root,
  ): ReteNode {
    const conditionsHigherUp = [...earlierConditions];

    for (let i = 0; i < conditions.length; i++) {
      const c = conditions[i];

      if (c instanceof AccumulatorCondition) {
        const dependentVars = dependentVariableNames(
          conditionsHigherUp,
          c.conditions,
        );

        const isIndependent =
          dependentVars.size <= 0 && currentNode === this.root;
        const accRoot = AccumulatedRootNode.create(this, isIndependent);
        const accTail = this.buildOrShareNetworkForConditions(
          c.conditions,
          conditionsHigherUp,
          accRoot,
        );

        currentNode = AccumulatorNode.create(
          this,
          currentNode,
          c,
          accRoot,
          accTail,
          isIndependent,
        );
      } else if (
        currentNode instanceof RootNode ||
        (currentNode instanceof AccumulatedRootNode &&
          currentNode.isIndependent)
      ) {
        const alphaMemory = AlphaMemoryNode.create(this, c);
        const joinTests = getJoinTestsFromCondition(c, conditionsHigherUp);
        currentNode = RootJoinNode.create(
          this,
          currentNode,
          alphaMemory,
          joinTests,
        );
      } else {
        const alphaMemory = AlphaMemoryNode.create(this, c);
        const joinTests = getJoinTestsFromCondition(c, conditionsHigherUp);

        currentNode = c.isNegated
          ? NegativeNode.create(this, currentNode, alphaMemory, joinTests)
          : JoinNode.create(this, currentNode, alphaMemory, joinTests);
      }

      if (!(c instanceof AccumulatorCondition)) {
        for (const comparisonFieldKey in c.comparisonFields) {
          if (c.comparisonFields.hasOwnProperty(comparisonFieldKey)) {
            const comparisonField = (c.comparisonFields as any)[
              comparisonFieldKey
            ] as Comparison;

            currentNode = ComparisonNode.create(
              this,
              currentNode,
              comparisonFieldKey as IFactFields,
              comparisonField,
            );
          }
        }
      }

      conditionsHigherUp.push(c);
    }

    return currentNode;
  }
}
