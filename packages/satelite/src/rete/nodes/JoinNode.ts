import { IFact, IFactFields } from "../Fact";
import { IToken } from "../Token";
import {
  addToListHead,
  findList,
  findNearestAncestorWithSameAlphaMemory,
  getFactField,
  IList,
  removeFromList,
  runLeftActivationOnNode,
} from "../util";
import { IAlphaMemoryNode } from "./AlphaMemoryNode";
import { IBetaMemoryNode } from "./BetaMemoryNode";
import { IDummyNode } from "./DummyNode";
import { IReteNode } from "./ReteNode";

export interface ITestAtJoinNode {
  fieldArg1: IFactFields;
  conditionNumberOfArg2: number;
  fieldArg2: IFactFields;
}

export function makeTestAtJoinNode(
  fieldArg1: IFactFields,
  conditionNumberOfArg2: number,
  fieldArg2: IFactFields,
): ITestAtJoinNode {
  const tajn: ITestAtJoinNode = Object.create(null);

  tajn.fieldArg1 = fieldArg1;
  tajn.conditionNumberOfArg2 = conditionNumberOfArg2;
  tajn.fieldArg2 = fieldArg2;

  return tajn;
}

function eq(a: any, b: any): boolean {
  return a === b;
}

export function performJoinTests(
  tests: IList<ITestAtJoinNode>,
  t: IToken,
  f: IFact,
): boolean {
  if (!tests) {
    return true;
  }

  for (const test of tests) {
    const arg1 = getFactField(f, test.fieldArg1);

    if (t.fact) {
      const fact2 = getFactField(t.fact, test.fieldArg1);
      const arg2 = getFactField(fact2, test.fieldArg2);

      // TODO: Make this comparison any predicate
      if (!eq(arg1, arg2)) {
        return false;
      }
    }
  }

  return true;
}

export interface IJoinNode extends IReteNode {
  type: "join";
  parent: IBetaMemoryNode | IDummyNode;
  alphaMemory: IAlphaMemoryNode;
  tests: IList<ITestAtJoinNode>;
  nearestAncestorWithSameAlphaMemory: IReteNode | null;
}

export function makeJoinNode(
  parent: IBetaMemoryNode | IDummyNode,
  alphaMemory: IAlphaMemoryNode,
  tests: IList<ITestAtJoinNode>,
): IJoinNode {
  const node: IJoinNode = Object.create(null);

  node.type = "join";
  node.parent = parent;
  node.alphaMemory = alphaMemory;
  node.tests = tests;

  node.children = null;

  return node;
}

export function joinNodeLeftActivation(node: IJoinNode, t: IToken): void {
  if (node.alphaMemory.items) {
    for (const item of node.alphaMemory.items) {
      if (performJoinTests(node.tests, t, item.fact)) {
        if (node.children) {
          for (const child of node.children) {
            runLeftActivationOnNode(child, t, item.fact);
          }
        }
      }
    }
  }
}

export function joinNodeRightActivation(node: IJoinNode, f: IFact): void {
  if (node.parent.items) {
    for (const t of node.parent.items) {
      if (performJoinTests(node.tests, t, f)) {
        if (node.children) {
          for (const child of node.children) {
            runLeftActivationOnNode(child, t, f);
          }
        }
      }
    }
  }
}

// For each parent.children,
//   if child is a JoinNode,
//   and `child.alphaMemory` == `alphaMemory`
//   and `child.tests` == `tests`,
//     return it.
//
// Otherwie, create a JoinNode.
//   newNode.parent = parent
//   Add `newNode` to `parent.children`.
//   newNode.tests = tests
//   newNode.alphaMemory = alphaMemory
//
//   Add `newNode` to `alphaMemory.successors`.
export function buildOrShareJoinNode(
  parent: IBetaMemoryNode,
  alphaMemory: IAlphaMemoryNode,
  tests: IList<ITestAtJoinNode>,
): IJoinNode {
  const foundChild = findList(
    c =>
      c.type === "join" &&
      (c as IJoinNode).alphaMemory === alphaMemory &&
      (c as IJoinNode).tests === tests,
    parent.allChildren,
  );

  if (foundChild) {
    return foundChild as IJoinNode;
  }

  const node = makeJoinNode(parent, alphaMemory, tests);
  parent.children = addToListHead(parent.children, node);
  alphaMemory.successors = addToListHead(alphaMemory.successors, node);
  alphaMemory.referenceCount += 1;
  node.nearestAncestorWithSameAlphaMemory =
    findNearestAncestorWithSameAlphaMemory(parent, alphaMemory) || null;

  if (!parent.items) {
    alphaMemory.successors = removeFromList(alphaMemory.successors, node);
  } else if (!alphaMemory.items) {
    parent.children = removeFromList(parent.children, node);
  }

  return node;
}
