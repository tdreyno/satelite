import { IFact, IFactFields } from "../Fact";
import { IToken, makeToken } from "../Token";
import {
  addToListHead,
  findNearestAncestorWithSameAlphaMemory,
  forEachList,
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
      const arg2 = getFactField(t.fact, test.fieldArg2);

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
  forEachList(item => {
    if (performJoinTests(node.tests, t, item.fact)) {
      forEachList(child => {
        runLeftActivationOnNode(child, t, item.fact);
      }, node.children);
    }
  }, node.alphaMemory.items);
}

export function joinNodeRightActivation(node: IJoinNode, f: IFact): void {
  function executeTests(t: IToken) {
    if (performJoinTests(node.tests, t, f)) {
      forEachList(child => {
        runLeftActivationOnNode(child, t, f);
      }, node.children);
    }
  }

  if (node.parent.type === "dummy") {
    const t = makeToken(node.parent, null, f);
    executeTests(t);
  } else {
    forEachList(executeTests, node.parent.items);
  }
}

function findSharableChildJoinNode(
  children: IList<IReteNode>,
  alphaMemory: IAlphaMemoryNode,
  tests: IList<ITestAtJoinNode>,
): IReteNode | undefined {
  if (!children) {
    return;
  }

  for (let i = 0; i < children.length; i++) {
    const c = children[i];

    if (
      c.type === "join" &&
      (c as IJoinNode).alphaMemory === alphaMemory &&
      (c as IJoinNode).tests === tests
    ) {
      return c;
    }
  }
}

export function buildOrShareJoinNode(
  parent: IBetaMemoryNode,
  alphaMemory: IAlphaMemoryNode,
  tests: IList<ITestAtJoinNode>,
): IJoinNode {
  const foundChild = findSharableChildJoinNode(
    parent.allChildren,
    alphaMemory,
    tests,
  );

  if (foundChild) {
    return foundChild as IJoinNode;
  }

  const node = makeJoinNode(parent, alphaMemory, tests);
  parent.children = addToListHead(parent.children, node);
  parent.allChildren = addToListHead(parent.allChildren, node);

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
