import { getJoinTestsFromCondition, ICondition } from "./Condition";
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
import {
  buildOrShareBetaMemoryNode,
  IBetaMemoryNode,
} from "./nodes/BetaMemoryNode";
import { makeDummyNode } from "./nodes/DummyNode";
import { buildOrShareJoinNode } from "./nodes/JoinNode";
import { makeProductionNode } from "./nodes/ProductionNode";
import { IReteNode, IRootNode, makeRootNode } from "./nodes/ReteNode";
import { IProduction, makeProduction } from "./Production";
import { IToken } from "./Token";
import {
  addToListHead,
  IList,
  updateNewNodeWithMatchesFromAbove,
} from "./util";

export interface IRete {
  root: IRootNode;
  workingMemory: Set<IFact>;
  hashTable: IExhaustiveHashTable;
  productions: IList<IProduction>;
}

export function makeRete(): IRete {
  const r: IRete = Object.create(null);

  r.root = makeRootNode();
  r.workingMemory = new Set();
  r.hashTable = createExhaustiveHashTable();
  r.productions = null;

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

export function addFact(r: IRete, factTuple: IFactTuple): IRete {
  const f = makeFact(factTuple[0], factTuple[1], factTuple[2]);

  // Prevent duplicates
  if (r.workingMemory.has(f)) {
    return r;
  }

  r.workingMemory.add(f);

  dispatchToAlphaMemories(r, f, alphaMemoryNodeActivate);

  return r;
}

// tslint:disable-next-line:variable-name
export function removeFact(r: IRete, fact: IFactTuple): IRete {
  const f = makeFact(fact[0], fact[1], fact[2]);

  dispatchToAlphaMemories(r, f, alphaMemoryNodeRetract);

  r.workingMemory.delete(f);

  return r;
}

export function buildOrShareNetworkForConditions(
  r: IRete,
  conditions: ICondition[],
  earlierConditions: ICondition[],
): IReteNode {
  let currentNode: IReteNode = r.root;
  const conditionsHigherUp = earlierConditions;

  for (let i = 0; i < conditions.length; i++) {
    const c = conditions[i];

    // if c is positive
    currentNode =
      currentNode === r.root
        ? makeDummyNode(r.root)
        : buildOrShareBetaMemoryNode(currentNode);

    const tests = getJoinTestsFromCondition(c, conditionsHigherUp);
    const alphaMemory = buildOrShareAlphaMemoryNode(r, c);

    currentNode = buildOrShareJoinNode(
      currentNode as IBetaMemoryNode,
      alphaMemory,
      tests,
    );
    // if c is negative, but not ncc
    // if c is ncc

    conditionsHigherUp.push(c);
  }

  return currentNode;
}

export function addProduction(
  r: IRete,
  conditions: ICondition[],
  callback: (f: IFactTuple, t: IToken) => any,
): IRete {
  const currentNode = buildOrShareNetworkForConditions(r, conditions, []);

  const production = makeProduction(callback);
  production.productionNode = makeProductionNode(production);
  currentNode.children = addToListHead(
    currentNode.children,
    production.productionNode,
  );

  production.productionNode.parent = currentNode;

  updateNewNodeWithMatchesFromAbove(production.productionNode);

  r.productions = addToListHead(r.productions, production);

  return r;
}
