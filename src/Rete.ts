import bindAll = require("lodash/bindAll");
import each = require("lodash/each");
import isFunction = require("lodash/isFunction");
import map = require("lodash/map");
import {
  Comparison,
  dependentVariableNames,
  getJoinTestsFromCondition,
  ICondition,
  parseCondition,
  ParsedCondition
} from "./Condition";
import { IFact, IValue, makeFact, SchemaFields } from "./Fact";
import { IIdentifier, IPrimitive } from "./Identifier";
import { AccumulatedRootNode } from "./nodes/AccumulatedRootNode";
import { AccumulatorCondition, AccumulatorNode } from "./nodes/AccumulatorNode";
import {
  AlphaMemoryNode,
  createExhaustiveHashTable,
  IExhaustiveHashTable,
  lookupInHashTable
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
import { removeIndexFromList } from "./util";

export type ITerminalNode<Schema extends IFact> =
  | Production<Schema>
  | Query<Schema>;

let variablePrefix = "?";

export function getVariablePrefix(): string {
  return variablePrefix;
}

export function setVariablePrefix(p: string): void {
  variablePrefix = p;
}

export const placeholder = "__placeholder__";

export function not<Schema extends IFact>(c: ICondition<Schema>) {
  c.isNegated = true;
  return c;
}

export type IConditions<Schema extends IFact> = Array<
  ICondition<Schema> | AccumulatorCondition<Schema>
>;
export interface IThenCreateProduction<Schema extends IFact> {
  then: (callback: IActivateCallback<Schema>) => Production<Schema>;
}

export interface IEntityResult<Schema> {
  facts: Set<Schema>;
  attributes: { [attribute: string]: IValue };
}

export interface IUpdate<Schema> {
  from: Schema;
  to: Schema;
}
export type IUpdateList<Schema> = Array<IUpdate<Schema>>;

export interface IBatchedAction<Schema> {
  type: "update" | "assert" | "retract";
  value: Schema | IUpdate<Schema>;
}

export type ILogger = (message: string, ...data: any[]) => any;
export interface ILoggerMap {
  [eventName: string]: ILogger;
}
export type ILoggers = ILoggerMap | ILogger;

export class Rete<Schema extends IFact> {
  static create<S extends IFact>(loggers?: ILoggers): Rete<S> {
    return new Rete<S>(loggers);
  }

  _ = placeholder;
  self = this;
  root: RootNode<Schema> = RootNode.create<Schema>(this);
  hashTable: IExhaustiveHashTable<Schema> = createExhaustiveHashTable<Schema>();
  facts: Schema[] = [];
  loggers?: ILoggers;

  returnAfterRecording = false;
  recordActions = false;
  queuedActions: Array<IBatchedAction<Schema>> = [];

  private terminalNodes: Array<ITerminalNode<Schema>> = [];
  private entities: Map<
    IIdentifier | IPrimitive,
    IEntityResult<Schema>
  > = new Map();

  constructor(loggers?: ILoggers) {
    this.loggers = loggers;

    bindAll(this, [
      // Internal
      "addFact",
      "removeFact",
      "updateFact",
      "addProduction",
      "addQuery",

      // Public
      "assert",
      "retract",
      "update",
      "rule",
      "query",
      "findEntity",
      "retractEntity",
      "beginTransaction",
      "commitTransaction"
    ]);
  }

  log(eventName: string, ...data: any[]): void {
    if (!this.loggers) {
      return;
    }

    if (isFunction(this.loggers)) {
      this.loggers(eventName, ...data);
      return;
    }

    const loggerMap = this.loggers as ILoggerMap;

    if (isFunction(loggerMap[eventName])) {
      loggerMap[eventName](eventName, ...data);
    }
  }

  // External API.
  assert(...facts: Schema[]): void {
    each(facts, f => this.addFact(f));
  }

  retract(...facts: Schema[]): void {
    each(facts, f => this.removeFact(f));
  }

  update(...facts: Schema[]): void {
    each(facts, f => this.updateFact(f));
  }

  rule(...conditions: IConditions<Schema>): IThenCreateProduction<Schema> {
    return this.addProduction(...conditions);
  }

  query(...conditions: IConditions<Schema>): Query<Schema> {
    return this.addQuery(...conditions);
  }

  findEntity(id: IIdentifier | IPrimitive): IEntityResult<Schema> | undefined {
    return this.entities.get(id);
  }

  retractEntity(id: IIdentifier | IPrimitive): void {
    const e = this.findEntity(id);

    if (e) {
      this.retract(...e.facts);
    }
  }

  beginTransaction() {
    if (this.returnAfterRecording) {
      throw new Error(`Already in a transation!`);
    }

    this.returnAfterRecording = true;
    this.recordActions = true;
  }

  commitTransaction(): Array<IBatchedAction<Schema>> {
    if (!this.returnAfterRecording) {
      throw new Error(`Not in a transation!`);
    }

    this.returnAfterRecording = false;

    each(this.queuedActions, ({ type, value }) => {
      switch (type) {
        case "assert":
          this.addFact(value as Schema, false);
          break;
        case "retract":
          this.removeFact(value as Schema, false);
          break;
        case "update":
          this.updateFact((value as IUpdate<Schema>).to, false);
          break;
      }
    });

    const results = [...this.queuedActions];
    this.queuedActions.length = 0;

    this.recordActions = false;

    return results;
  }

  toJSONString() {
    return JSON.stringify(Array.from(this.facts), undefined, 2);
  }

  // Internal API.

  private addFact(factTuple: Schema, shouldRecord = this.recordActions): void {
    const f = makeFact(factTuple[0], factTuple[1], factTuple[2]);

    if (this.facts.indexOf(f) === -1) {
      if (shouldRecord) {
        this.queuedActions.push({
          type: "assert",
          value: f
        });

        if (this.returnAfterRecording) {
          return;
        }
      }

      this.log("Asserting", f);
      this.facts.push(f);

      const existingEntity: IEntityResult<Schema> = this.entities.get(f[0]) || {
        facts: new Set(),
        attributes: {}
      };

      existingEntity.facts.add(f);
      existingEntity.attributes[f[1]] = f[2];
      this.entities.set(f[0], existingEntity);

      this.dispatchToAlphaMemories(f, "activate");
    }
  }

  private removeFact(fact: Schema, shouldRecord = this.recordActions): void {
    const f = makeFact(fact[0], fact[1], fact[2]);

    const factIndex = this.facts.indexOf(f);
    if (factIndex !== -1) {
      if (shouldRecord) {
        this.queuedActions.push({
          type: "retract",
          value: f
        });

        if (this.returnAfterRecording) {
          return;
        }
      }

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

  private getOldFact(newFact: Schema): Schema | undefined {
    for (const f of this.facts) {
      if (f[0] === newFact[0] && f[1] === newFact[1]) {
        return f;
      }
    }
  }

  private updateFact(
    factTuple: Schema,
    shouldRecord = this.recordActions
  ): void {
    const f = makeFact(factTuple[0], factTuple[1], factTuple[2]);

    const oldFact = this.getOldFact(f);
    if (!oldFact) {
      this.addFact(f);
      return;
    }

    if (oldFact[2] === f[2]) {
      return;
    }

    if (shouldRecord) {
      this.queuedActions.push({
        type: "update",
        value: { from: oldFact, to: f }
      });

      if (this.returnAfterRecording) {
        return;
      }
    }

    this.log("Updating", f);

    const oldFactIndex = this.facts.indexOf(oldFact);
    removeIndexFromList(this.facts, oldFactIndex);

    this.facts.push(f);

    const existingEntity = this.entities.get(f[0]) as IEntityResult<Schema>;
    existingEntity.facts.delete(oldFact);
    existingEntity.facts.add(f);

    existingEntity.attributes[f[1]] = f[2];
    this.entities.set(f[0], existingEntity);

    this.updateAlphaMemories(oldFact, f);
  }

  private addProduction(
    ...conditions: IConditions<Schema>
  ): IThenCreateProduction<Schema> {
    return {
      then: (callback: IActivateCallback<Schema>) => {
        const parsedConditions = map<
          any,
          ParsedCondition<Schema> | AccumulatorCondition<Schema>
        >(conditions, parseCondition);

        const currentNode = this.buildOrShareNetworkForConditions(
          parsedConditions,
          []
        );

        const production = Production.create(callback);
        production.productionNode = ProductionNode.create(
          this,
          production,
          parsedConditions
        );

        currentNode.children.unshift(production.productionNode);

        production.productionNode.parent = currentNode;

        production.productionNode.updateNewNodeWithMatchesFromAbove();

        this.terminalNodes.push(production);

        return production;
      }
    };
  }

  private addQuery(...conditions: IConditions<Schema>): Query<Schema> {
    const parsedConditions = map<
      any,
      ParsedCondition<Schema> | AccumulatorCondition<Schema>
    >(conditions, parseCondition);

    const currentNode = this.buildOrShareNetworkForConditions(
      parsedConditions,
      []
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
    f: Schema,
    fnName: "activate" | "retract"
  ): void {
    const fn = (am?: AlphaMemoryNode<Schema>) => am && am[fnName](f);

    fn(lookupInHashTable(this.hashTable, f[0], f[1], f[2]));
    fn(lookupInHashTable(this.hashTable, f[0], f[1], null));
    fn(lookupInHashTable(this.hashTable, null, f[1], f[2]));
    fn(lookupInHashTable(this.hashTable, f[0], null, f[2]));
    fn(lookupInHashTable(this.hashTable, null, null, f[2]));
    fn(lookupInHashTable(this.hashTable, null, f[1], null));
    fn(lookupInHashTable(this.hashTable, f[0], null, null));
    fn(lookupInHashTable(this.hashTable, null, null, null));
  }

  private updateAlphaMemories(prev: Schema, f: Schema): void {
    const oldTables = [
      lookupInHashTable(this.hashTable, prev[0], prev[1], prev[2]),
      lookupInHashTable(this.hashTable, prev[0], prev[1], null),
      lookupInHashTable(this.hashTable, null, prev[1], prev[2]),
      lookupInHashTable(this.hashTable, prev[0], null, prev[2]),
      lookupInHashTable(this.hashTable, null, null, prev[2]),
      lookupInHashTable(this.hashTable, null, prev[1], null),
      lookupInHashTable(this.hashTable, prev[0], null, null),
      lookupInHashTable(this.hashTable, null, null, null)
    ];

    const newTables = [
      lookupInHashTable(this.hashTable, f[0], f[1], f[2]),
      lookupInHashTable(this.hashTable, f[0], f[1], null),
      lookupInHashTable(this.hashTable, null, f[1], f[2]),
      lookupInHashTable(this.hashTable, f[0], null, f[2]),
      lookupInHashTable(this.hashTable, null, null, f[2]),
      lookupInHashTable(this.hashTable, null, f[1], null),
      lookupInHashTable(this.hashTable, f[0], null, null),
      lookupInHashTable(this.hashTable, null, null, null)
    ];

    for (let i = 0; i < oldTables.length; i++) {
      const oldTable = oldTables[i];
      const newTable = newTables[i];

      if (!oldTable && !newTable) {
        continue;
      }

      if (!oldTable && newTable) {
        newTable.activate(f);
        continue;
      }

      if (oldTable && !newTable) {
        oldTable.retract(prev);
        continue;
      }

      if (oldTable && newTable) {
        if (oldTable === newTable) {
          oldTable.update(prev, f);
          continue;
        }

        oldTable.retract(prev);
        newTable.activate(f);
      }
    }
  }

  private buildOrShareNetworkForConditions(
    conditions: Array<ParsedCondition<Schema> | AccumulatorCondition<Schema>>,
    earlierConditions: Array<
      ParsedCondition<Schema> | AccumulatorCondition<Schema>
    >,
    currentNode: ReteNode<Schema> = this.root
  ): ReteNode<Schema> {
    const conditionsHigherUp = [...earlierConditions];

    for (let i = 0; i < conditions.length; i++) {
      const c = conditions[i];

      if (c instanceof AccumulatorCondition) {
        const dependentVars = dependentVariableNames(
          conditionsHigherUp,
          c.conditions
        );

        const isIndependent =
          dependentVars.length <= 0 && currentNode === this.root;
        const accRoot = AccumulatedRootNode.create(this, isIndependent);
        const accTail = this.buildOrShareNetworkForConditions(
          c.conditions,
          conditionsHigherUp,
          accRoot
        );

        currentNode = AccumulatorNode.create(
          this,
          currentNode,
          c,
          accRoot,
          accTail,
          isIndependent,
          dependentVars
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
          joinTests
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
            ] as Comparison<Schema>;

            currentNode = ComparisonNode.create(
              this,
              currentNode,
              comparisonFieldKey as SchemaFields,
              comparisonField
            );
          }
        }
      }

      conditionsHigherUp.push(c);
    }

    return currentNode;
  }
}
