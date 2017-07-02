import { IFact } from "./Fact";
import {
  constantTestNodeActivation,
  IRootConstantTestNode,
  makeRootConstantTestNode,
} from "./nodes/ConstantTestNode";
// import { IBetaMemoryNode, makeBetaMemoryNode } from "./nodes/BetaMemoryNode";
// import { IReteNode } from "./nodes/ReteNode";
import { deleteTokenAndDescendents } from "./Token";
import {
  addToListHead,
  IList,
  removeFromList,
  runLeftActivationOnNode,
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

// For each parent.children, if child is a BetaMemoryNode, return it.
//
// Otherwise, create a BetaMemoryNode:
//   newNode.parent = parent
//   Add `newNode` to `parent.children`.
//   Call `updateNewNodeWithMatchesFromAbove(newNode)`.
// export function buildOrShareBetaMemoryNode(parent: IReteNode): IBetaMemoryNode {
//   if (parent.children) {
//     for (const child of parent.children) {
//       if (child.type === "beta-memory") {
//         return child as IBetaMemoryNode;
//       }
//     }
//   }

//   const bm = makeBetaMemoryNode();
//   bm.parent = parent;
//   parent.children = addToListHead(parent.children, bm);

//   updateNewNodeWithMatchesFromAbove(bm);

//   return bm;
// }
