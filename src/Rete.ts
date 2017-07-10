import { isArray } from "lodash";
import {
  getJoinTestsFromCondition,
  ICondition,
  parseCondition,
  ParsedCondition,
} from "./Condition";
import { IFact, makeFact } from "./Fact";
import {
  AccumulatorCondition,
  AccumulatorNode,
  IAccumulator,
} from "./nodes/AccumulatorNode";
import {
  AlphaMemoryNode,
  createExhaustiveHashTable,
  IExhaustiveHashTable,
  lookupInHashTable,
} from "./nodes/AlphaMemoryNode";
import { JoinNode } from "./nodes/JoinNode";
import { NegativeNode } from "./nodes/NegativeNode";
import { ProductionNode } from "./nodes/ProductionNode";
import { QueryNode } from "./nodes/QueryNode";
import { ReteNode, RootNode } from "./nodes/ReteNode";
import { RootJoinNode } from "./nodes/RootJoinNode";
import { IActivateCallback, Production } from "./Production";
import { Query } from "./Query";
import { Token } from "./Token";

// tslint:disable:max-classes-per-file

export type ITerminalNode = Production | Query;

export { IIdentifier } from "./Identifier";

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

export function acc<T>(
  bindingName: string,
  accumulator: IAccumulator<T>,
  conditions?: Array<ICondition | AccumulatorCondition>,
): AccumulatorCondition<T> {
  const parsedConditions = conditions
    ? conditions.map(parseCondition)
    : undefined;
  return new AccumulatorCondition(bindingName, accumulator, parsedConditions);
}

export function count(
  bindingName: string,
  conditions?: Array<ICondition | AccumulatorCondition>,
) {
  return acc(
    bindingName,
    {
      reducer: (acc: number): number => {
        return acc + 1;
      },
      initialValue: 0,
    },
    conditions,
  );
}

export function max(
  bindingName: string,
  conditions?: Array<ICondition | AccumulatorCondition>,
) {
  return acc(
    bindingName,
    {
      reducer: (acc: number, item: Token): number => {
        const value = item.fact[2] as number;
        return value > acc ? value : acc;
      },
      initialValue: 0,
    },
    conditions,
  );
}

export class Rete {
  static create(): {
    self: Rete;
    addFact: (factTuple: IFact) => void;
    removeFact: (factTuple: IFact) => void;
    addFacts: (factTuple: IFact | IFact[]) => void;
    removeFacts: (factTuple: IFact | IFact[]) => void;
    addProduction: (
      conditions: Array<ICondition | AccumulatorCondition>,
      callback: IActivateCallback,
    ) => Production;
    addQuery: (conditions: Array<ICondition | AccumulatorCondition>) => Query;
  } {
    const r = new Rete();

    return {
      self: r,
      addFact: r.addFact,
      removeFact: r.removeFact,
      addFacts: r.addFacts,
      removeFacts: r.removeFacts,
      addProduction: r.addProduction,
      addQuery: r.addQuery,
    };
  }

  root = RootNode.create();
  terminalNodes: ITerminalNode[] = [];
  facts: Set<IFact> = new Set();
  hashTable: IExhaustiveHashTable = createExhaustiveHashTable();

  constructor() {
    this.addFact = this.addFact.bind(this);
    this.addFacts = this.addFacts.bind(this);
    this.removeFact = this.removeFact.bind(this);
    this.removeFacts = this.removeFacts.bind(this);
    this.addProduction = this.addProduction.bind(this);
    this.addQuery = this.addQuery.bind(this);
  }

  addFact(factTuple: IFact): void {
    const f = makeFact(factTuple[0], factTuple[1], factTuple[2]);

    if (!this.facts.has(f)) {
      this.facts.add(f);

      this.dispatchToAlphaMemories(f, "activate");
    }
  }

  addFacts(facts: IFact | IFact[]): void {
    const items = isArray(facts) ? [facts] : facts;

    items.forEach(this.addFact);
  }

  removeFact(fact: IFact): void {
    const f = makeFact(fact[0], fact[1], fact[2]);

    if (this.facts.has(f)) {
      this.dispatchToAlphaMemories(f, "retract");

      this.facts.delete(f);
    }

    this.root.rightRetract(f);
  }

  removeFacts(facts: IFact | IFact[]): void {
    const items = isArray(facts) ? [facts] : facts;

    items.forEach(this.removeFact);
  }

  addProduction(
    conditions: Array<ICondition | AccumulatorCondition>,
    callback: IActivateCallback,
  ): Production {
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

    this.terminalNodes.unshift(production);

    return production;
  }

  addQuery(conditions: Array<ICondition | AccumulatorCondition>): Query {
    const parsedConditions = conditions.map(parseCondition);
    const currentNode = this.buildOrShareNetworkForConditions(
      parsedConditions,
      [],
    );

    const query = Query.create(parsedConditions);
    query.queryNode = QueryNode.create(query);
    currentNode.children.unshift(query.queryNode);

    query.queryNode.parent = currentNode;

    query.queryNode.updateNewNodeWithMatchesFromAbove();

    this.terminalNodes.unshift(query);

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
        if (c.conditions) {
          const subNetwork = this.buildOrShareNetworkForConditions(
            c.conditions,
            conditionsHigherUp,
            currentNode,
          );

          subNetwork.parent = currentNode;
          currentNode.children.unshift(subNetwork);

          currentNode = subNetwork;
          currentNode.updateNewNodeWithMatchesFromAbove();
        }

        currentNode = AccumulatorNode.create(currentNode, c);
      } else if (currentNode === this.root) {
        const alphaMemory = AlphaMemoryNode.create(this, c);
        currentNode = RootJoinNode.create(currentNode, alphaMemory);
      } else {
        const alphaMemory = AlphaMemoryNode.create(this, c);
        const joinTests = getJoinTestsFromCondition(c, conditionsHigherUp);
        currentNode = c.isNegated
          ? NegativeNode.create(currentNode, alphaMemory, joinTests)
          : JoinNode.create(currentNode, alphaMemory, joinTests);
      }

      conditionsHigherUp.push(c);
    }

    return currentNode;
  }
}
