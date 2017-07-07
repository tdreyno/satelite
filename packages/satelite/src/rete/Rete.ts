import {
  getJoinTestsFromCondition,
  ICondition,
  IParsedCondition,
  parseCondition,
} from "./Condition";
import { IFact, IFactTuple, makeFact } from "./Fact";
import {
  alphaMemoryNodeActivate,
  alphaMemoryNodeRetract,
  buildOrShareAlphaMemoryNode,
  createExhaustiveHashTable,
  IAlphaMemoryNode,
  IExhaustiveHashTable,
  lookupInHashTable,
} from "./nodes/AlphaMemoryNode";
import { buildOrShareJoinNode } from "./nodes/JoinNode";
import { buildOrShareNegativeNode } from "./nodes/NegativeNode";
import { makeProductionNode } from "./nodes/ProductionNode";
import { makeQueryNode } from "./nodes/QueryNode";
import { IReteNode, IRootNode, makeRootNode } from "./nodes/ReteNode";
import { makeRootJoinNode } from "./nodes/RootJoinNode";
import { IActivateCallback, IProduction, makeProduction } from "./Production";
import { IQuery, makeQuery } from "./Query";
import {
  addToListHead,
  IList,
  runRightRetractOnNode,
  updateNewNodeWithMatchesFromAbove,
} from "./util";

export type ITerminalNode = IProduction | IQuery;

export { IIdentifier } from "./Identifier";

let variablePrefix = "?";

export function getVariablePrefix(): string {
  return variablePrefix;
}

export function setVariablePrefix(p: string): void {
  variablePrefix = p;
}

export function not(c: ICondition) {
  c.isNegated = true;
  return c;
}

export class Rete {
  static create(): {
    addFact: (factTuple: IFactTuple) => void;
    removeFact: (factTuple: IFactTuple) => void;
    addProduction: (
      conditions: ICondition[],
      callback: IActivateCallback,
    ) => IProduction;
    addQuery: (conditions: ICondition[]) => IQuery;
  } {
    const r = new Rete();

    return {
      addFact: r.addFact,
      removeFact: r.removeFact,
      addProduction: r.addProduction,
      addQuery: r.addQuery,
    };
  }

  root: IRootNode = makeRootNode();
  terminalNodes: IList<ITerminalNode> = null;
  facts: Set<IFact> = new Set();
  hashTable: IExhaustiveHashTable = createExhaustiveHashTable();

  constructor() {
    this.addFact = this.addFact.bind(this);
    this.removeFact = this.removeFact.bind(this);
    this.addProduction = this.addProduction.bind(this);
    this.addQuery = this.addQuery.bind(this);
  }

  addFact(factTuple: IFactTuple): void {
    const f = makeFact(factTuple[0], factTuple[1], factTuple[2]);

    if (!this.facts.has(f)) {
      this.facts.add(f);

      this.dispatchToAlphaMemories(f, alphaMemoryNodeActivate);
    }
  }

  removeFact(fact: IFactTuple): void {
    const f = makeFact(fact[0], fact[1], fact[2]);

    if (this.facts.has(f)) {
      this.dispatchToAlphaMemories(f, alphaMemoryNodeRetract);

      this.facts.delete(f);
    }

    runRightRetractOnNode(this.root, f);
  }

  addProduction(
    conditions: ICondition[],
    callback: IActivateCallback,
  ): IProduction {
    const parsedConditions = conditions.map(parseCondition);
    const currentNode = this.buildOrShareNetworkForConditions(
      parsedConditions,
      [],
    );

    const production = makeProduction(callback);
    production.productionNode = makeProductionNode(
      this,
      production,
      parsedConditions,
    );
    currentNode.children = addToListHead(
      currentNode.children,
      production.productionNode,
    );

    production.productionNode.parent = currentNode;

    updateNewNodeWithMatchesFromAbove(production.productionNode);

    this.terminalNodes = addToListHead(this.terminalNodes, production);

    return production;
  }

  addQuery(conditions: ICondition[]): IQuery {
    const parsedConditions = conditions.map(parseCondition);
    const currentNode = this.buildOrShareNetworkForConditions(
      parsedConditions,
      [],
    );

    const query = makeQuery(parsedConditions);
    query.queryNode = makeQueryNode(query);
    currentNode.children = addToListHead(currentNode.children, query.queryNode);

    query.queryNode.parent = currentNode;

    updateNewNodeWithMatchesFromAbove(query.queryNode);

    this.terminalNodes = addToListHead(this.terminalNodes, query);

    return query;
  }

  private dispatchToAlphaMemories(
    f: IFact,
    fn: (am: IAlphaMemoryNode, f: IFact) => void,
  ): void {
    let am;

    am = lookupInHashTable(this.hashTable, f.identifier, f.attribute, f.value);
    if (am) {
      fn(am, f);
    }

    am = lookupInHashTable(this.hashTable, f.identifier, f.attribute, null);
    if (am) {
      fn(am, f);
    }

    am = lookupInHashTable(this.hashTable, null, f.attribute, f.value);
    if (am) {
      fn(am, f);
    }

    am = lookupInHashTable(this.hashTable, f.identifier, null, f.value);
    if (am) {
      fn(am, f);
    }

    am = lookupInHashTable(this.hashTable, null, null, f.value);
    if (am) {
      fn(am, f);
    }

    am = lookupInHashTable(this.hashTable, null, f.attribute, null);
    if (am) {
      fn(am, f);
    }

    am = lookupInHashTable(this.hashTable, f.identifier, null, null);
    if (am) {
      fn(am, f);
    }

    am = lookupInHashTable(this.hashTable, null, null, null);
    if (am) {
      fn(am, f);
    }
  }

  private buildOrShareNetworkForConditions(
    conditions: IParsedCondition[],
    earlierConditions: IParsedCondition[],
  ): IReteNode {
    let currentNode: IReteNode = this.root;
    const conditionsHigherUp = earlierConditions;

    for (let i = 0; i < conditions.length; i++) {
      const c = conditions[i];
      const alphaMemory = buildOrShareAlphaMemoryNode(this, c);

      const joinTests = getJoinTestsFromCondition(c, conditionsHigherUp);

      currentNode =
        currentNode === this.root
          ? makeRootJoinNode(currentNode, alphaMemory)
          : c.isNegated
            ? buildOrShareNegativeNode(currentNode, alphaMemory, joinTests)
            : buildOrShareJoinNode(currentNode, alphaMemory, joinTests);

      conditionsHigherUp.push(c);
    }

    return currentNode;
  }
}
