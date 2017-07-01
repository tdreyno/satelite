import { IFact, IFactFields } from "./Fact";
import {
  alphaMemoryNodeActivation,
  IAlphaMemoryNode,
  makeAlphaMemoryNode,
} from "./nodes/AlphaMemoryNode";
import { IBetaMemoryNode, makeBetaMemoryNode } from "./nodes/BetaMemoryNode";
import { IReteNode } from "./nodes/ReteNode";
import { ICondition, isConstantTest } from "./Rule";
import { deleteTokenAndDescendents } from "./Token";
import {
  addToListHead,
  getFactField,
  IList,
  removeFromList,
  runLeftActivationOnNode,
} from "./util";

export interface IRete {
  root: IRootConstantTestNode;
  workingMemory: IList<IFact>;
}

export interface IConstantTestNode {
  fieldToTest: IFactFields | "no-test";
  fieldMustEqual: any;
  outputMemory: IAlphaMemoryNode | null;
  children: IList<IConstantTestNode>;
}

export interface IRootConstantTestNode extends IConstantTestNode {
  fieldToTest: "no-test";
}

export function makeConstantTestNode(
  fieldToTest: IFactFields | "no-test",
  fieldMustEqual?: any,
  outputMemory?: IAlphaMemoryNode | null,
  children?: IList<IConstantTestNode>,
): IConstantTestNode {
  const ct: IConstantTestNode = Object.create(null);

  ct.fieldToTest = fieldToTest;
  ct.fieldMustEqual = fieldMustEqual || null;
  ct.outputMemory = outputMemory || null;
  ct.children = children || null;

  return ct;
}

export function makeRootConstantTestNode(): IRootConstantTestNode {
  return makeConstantTestNode("no-test") as IRootConstantTestNode;
}

export function makeRete(): IRete {
  const r: IRete = Object.create(null);

  r.root = makeRootConstantTestNode();
  r.workingMemory = null;

  return r;
}

function constantTestNodeActivation(node: IConstantTestNode, f: IFact): void {
  if (node.fieldToTest === "no-test") {
    return;
  }

  const v = getFactField(f, node.fieldToTest);

  if (v !== node.fieldMustEqual) {
    return;
  }

  if (node.outputMemory) {
    alphaMemoryNodeActivation(node.outputMemory, f);
  }

  if (node.children) {
    for (const c of node.children) {
      constantTestNodeActivation(c, f);
    }
  }
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

export function buildOrShareConstantTestNode(
  parent: IConstantTestNode,
  f: IFactFields,
  sym: any,
): IConstantTestNode {
  if (parent.children) {
    for (const child of parent.children) {
      if (child.fieldToTest === f && child.fieldMustEqual === sym) {
        return child;
      }
    }
  }

  return makeConstantTestNode(f, sym);
}

export function buildOrShareAlphaMemoryNode(
  r: IRete,
  c: ICondition,
): IAlphaMemoryNode {
  let currentNode: IConstantTestNode = r.root;

  const isConstant: {
    [key: string]: boolean;
  } = {
    identifier: isConstantTest(c.identifier),
    attribute: isConstantTest(c.attribute),
    value: isConstantTest(c.value),
  };

  for (const key in isConstant) {
    if (isConstant[key]) {
      const sym = getFactField(c, key as IFactFields);
      currentNode = buildOrShareConstantTestNode(
        currentNode,
        key as IFactFields,
        sym,
      );
    }
  }

  if (currentNode.outputMemory) {
    return currentNode.outputMemory;
  }

  const alphaMemory = makeAlphaMemoryNode();
  currentNode.outputMemory = alphaMemory;

  if (r.workingMemory) {
    for (const fact of r.workingMemory) {
      for (const key in isConstant) {
        if (isConstant[key]) {
          alphaMemoryNodeActivation(alphaMemory, fact);
        }
      }
    }
  }

  return alphaMemory;
}

// For each parent.children, if child is a BetaMemoryNode, return it.
//
// Otherwise, create a BetaMemoryNode:
//   newNode.parent = parent
//   Add `newNode` to `parent.children`.
//   Call `updateNewNodeWithMatchesFromAbove(newNode)`.
export function buildOrShareBetaMemoryNode(parent: IReteNode): IBetaMemoryNode {
  if (parent.children) {
    for (const child of parent.children) {
      if (child.type === "beta-memory") {
        return child as IBetaMemoryNode;
      }
    }
  }

  const bm = makeBetaMemoryNode();
  bm.parent = parent;
  parent.children = addToListHead(parent.children, bm);

  updateNewNodeWithMatchesFromAbove(bm);

  return bm;
}
