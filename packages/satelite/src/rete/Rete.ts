import { getJoinTestsFromCondition, ICondition } from "./Condition";
import { IFact } from "./Fact";
import { buildOrShareAlphaMemoryNode } from "./nodes/AlphaMemoryNode";
import {
  buildOrShareBetaMemoryNode,
  IBetaMemoryNode,
} from "./nodes/BetaMemoryNode";
import {
  constantTestNodeActivation,
  IRootConstantTestNode,
  makeRootConstantTestNode,
} from "./nodes/ConstantTestNode";
import { buildOrShareJoinNode } from "./nodes/JoinNode";
import { makeProductionNode } from "./nodes/ProductionNode";
import { IReteNode } from "./nodes/ReteNode";
import { makeProduction } from "./Production";
// import { IBetaMemoryNode, makeBetaMemoryNode } from "./nodes/BetaMemoryNode";
// import { IReteNode } from "./nodes/ReteNode";
import { deleteTokenAndDescendents } from "./Token";
import {
  addToListHead,
  IList,
  removeFromList,
  runLeftActivationOnNode,
  updateNewNodeWithMatchesFromAbove,
} from "./util";

export interface IRete {
  root: IRootConstantTestNode;
  workingMemory: IList<IFact>;
}

export function makeRete(): IRete {
  const r: IRete = Object.create(null);

  r.root = makeRootConstantTestNode();
  r.workingMemory = null;

  return r;
}

export function addFact(r: IRete, f: IFact): IRete {
  r.workingMemory = addToListHead(r.workingMemory, f);
  constantTestNodeActivation(r.root, f);

  return r;
}

export function removeFact(r: IRete, f: IFact): IRete {
  if (f.alphaMemoryItems) {
    for (const item of f.alphaMemoryItems) {
      item.alphaMemory.items = removeFromList(item.alphaMemory.items, item);
    }
  }

  if (f.tokens) {
    for (const t of f.tokens) {
      deleteTokenAndDescendents(t);
    }
  }

  if (f.negativeJoinResults) {
    for (const jr of f.negativeJoinResults) {
      jr.owner.joinResults = removeFromList(jr.owner.joinResults, jr);

      if (!jr.owner.joinResults) {
        if (jr.owner.node.children) {
          for (const child of jr.owner.node.children) {
            runLeftActivationOnNode(child, jr.owner, null);
          }
        }
      }
    }
  }

  r.workingMemory = removeFromList(r.workingMemory, f);

  return r;
}

export function buildOrShareNetworkForConditions(
  r: IRete,
  parent: IReteNode,
  conditions: ICondition[],
  earlierConditions: ICondition[],
): IReteNode {
  let currentNode = parent;
  const conditionsHigherUp = earlierConditions;

  for (const c of conditions) {
    // if c is positive
    currentNode = buildOrShareBetaMemoryNode(currentNode);
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
  callback: () => any,
): IRete {
  const currentNode = buildOrShareNetworkForConditions(
    r,
    r.root,
    conditions,
    [],
  );

  const production = makeProduction(callback);
  production.productionNode = makeProductionNode(production);
  currentNode.children = addToListHead(
    currentNode.children,
    production.productionNode,
  );

  updateNewNodeWithMatchesFromAbove(production.productionNode);

  return r;
}
