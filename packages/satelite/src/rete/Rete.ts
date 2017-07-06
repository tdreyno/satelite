import {
  getJoinTestsFromCondition,
  ICondition,
  IParsedCondition,
  IVariableBindings,
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
import { makeProductionNode } from "./nodes/ProductionNode";
import { makeQueryNode } from "./nodes/QueryNode";
import { IReteNode, IRootNode, makeRootNode } from "./nodes/ReteNode";
import { makeRootJoinNode } from "./nodes/RootJoinNode";
import { IProduction, makeProduction } from "./Production";
import { IQuery, makeQuery } from "./Query";
import {
  addToListHead,
  IList,
  runRightRetractOnNode,
  updateNewNodeWithMatchesFromAbove,
} from "./util";

export type ITerminalNode = IProduction | IQuery;

export interface IRete {
  root: IRootNode;
  terminalNodes: IList<ITerminalNode>;
  facts: Set<IFact>;
  hashTable: IExhaustiveHashTable;
}

export function makeRete(): IRete {
  const r: IRete = Object.create(null);

  r.root = makeRootNode();
  r.terminalNodes = null;
  r.facts = new Set();
  r.hashTable = createExhaustiveHashTable();

  return r;
}

export function addFact(r: IRete, factTuple: IFactTuple): IRete {
  const f = makeFact(factTuple[0], factTuple[1], factTuple[2]);

  if (!r.facts.has(f)) {
    r.facts.add(f);

    dispatchToAlphaMemories(r, f, alphaMemoryNodeActivate);
  }

  return r;
}

// tslint:disable-next-line:variable-name
export function removeFact(r: IRete, fact: IFactTuple): IRete {
  const f = makeFact(fact[0], fact[1], fact[2]);

  if (r.facts.has(f)) {
    dispatchToAlphaMemories(r, f, alphaMemoryNodeRetract);

    r.facts.delete(f);
  }

  runRightRetractOnNode(r.root, f);

  return r;
}

export function dispatchToAlphaMemories(
  r: IRete,
  f: IFact,
  fn: (am: IAlphaMemoryNode, f: IFact) => void,
) {
  let am;

  am = lookupInHashTable(r.hashTable, f.identifier, f.attribute, f.value);
  if (am) {
    fn(am, f);
  }

  am = lookupInHashTable(r.hashTable, f.identifier, f.attribute, null);
  if (am) {
    fn(am, f);
  }

  am = lookupInHashTable(r.hashTable, null, f.attribute, f.value);
  if (am) {
    fn(am, f);
  }

  am = lookupInHashTable(r.hashTable, f.identifier, null, f.value);
  if (am) {
    fn(am, f);
  }

  am = lookupInHashTable(r.hashTable, null, null, f.value);
  if (am) {
    fn(am, f);
  }

  am = lookupInHashTable(r.hashTable, null, f.attribute, null);
  if (am) {
    fn(am, f);
  }

  am = lookupInHashTable(r.hashTable, f.identifier, null, null);
  if (am) {
    fn(am, f);
  }

  am = lookupInHashTable(r.hashTable, null, null, null);
  if (am) {
    fn(am, f);
  }
}

export function buildOrShareNetworkForConditions(
  r: IRete,
  conditions: IParsedCondition[],
  earlierConditions: IParsedCondition[],
): IReteNode {
  let currentNode: IReteNode = r.root;
  const conditionsHigherUp = earlierConditions;

  for (let i = 0; i < conditions.length; i++) {
    const c = conditions[i];
    const alphaMemory = buildOrShareAlphaMemoryNode(r, c);

    currentNode =
      currentNode === r.root
        ? makeRootJoinNode(currentNode, alphaMemory)
        : buildOrShareJoinNode(
            currentNode,
            alphaMemory,
            getJoinTestsFromCondition(c, conditionsHigherUp),
          );

    conditionsHigherUp.push(c);
  }

  return currentNode;
}

export function addProduction(
  r: IRete,
  conditions: ICondition[],
  callback: (
    f: IFactTuple,
    variableBindings: IVariableBindings,
    addProducedFacts: (facts: IFactTuple | IFactTuple[]) => void,
    addFact: (facts: IFactTuple | IFactTuple[]) => void,
  ) => void | null | undefined | IFactTuple | IFactTuple[],
): IProduction {
  const parsedConditions = conditions.map(parseCondition);
  const currentNode = buildOrShareNetworkForConditions(r, parsedConditions, []);

  const production = makeProduction(parsedConditions, callback);
  production.productionNode = makeProductionNode(r, production);
  currentNode.children = addToListHead(
    currentNode.children,
    production.productionNode,
  );

  production.productionNode.parent = currentNode;

  updateNewNodeWithMatchesFromAbove(production.productionNode);

  r.terminalNodes = addToListHead(r.terminalNodes, production);

  return production;
}

export function addQuery(r: IRete, conditions: ICondition[]): IQuery {
  const parsedConditions = conditions.map(parseCondition);
  const currentNode = buildOrShareNetworkForConditions(r, parsedConditions, []);

  const query = makeQuery(parsedConditions);
  query.queryNode = makeQueryNode(query);
  currentNode.children = addToListHead(currentNode.children, query.queryNode);

  query.queryNode.parent = currentNode;

  updateNewNodeWithMatchesFromAbove(query.queryNode);

  r.terminalNodes = addToListHead(r.terminalNodes, query);

  return query;
}
