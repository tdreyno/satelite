import { IFact, IFactFields } from "../Fact";
import { IToken, makeToken } from "../Token";
import {
  addToListHead,
  findNearestAncestorWithSameAlphaMemory,
  IList,
  removeFromList,
  runLeftActivateOnNode,
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

export function performJoinTests(
  tests: IList<ITestAtJoinNode>,
  t: IToken,
  f: IFact,
): boolean {
  if (!tests) {
    return true;
  }

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const arg1 = f[test.fieldArg1];

    if (t.fact) {
      const arg2 = t.fact[test.fieldArg2];

      // TODO: Make this comparison any predicate
      if (arg1 !== arg2) {
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
  if (!node.alphaMemory.facts) {
    return;
  }

  for (let i = 0; i < node.alphaMemory.facts.length; i++) {
    const fact = node.alphaMemory.facts[i];

    if (node.children && performJoinTests(node.tests, t, fact)) {
      for (let j = 0; j < node.children.length; j++) {
        const child = node.children[j];
        runLeftActivateOnNode(child, t, fact);
      }
    }
  }
}

export function joinNodeRightActivation(node: IJoinNode, f: IFact): void {
  function executeTests(t: IToken) {
    if (node.children && performJoinTests(node.tests, t, f)) {
      for (let j = 0; j < node.children.length; j++) {
        const child = node.children[j];
        runLeftActivateOnNode(child, t, f);
      }
    }
  }

  if (node.parent.type === "dummy") {
    const t = makeToken(node.parent, null, f);
    executeTests(t);
  } else {
    if (node.parent.items) {
      for (let i = 0; i < node.parent.items.length; i++) {
        executeTests(node.parent.items[i]);
      }
    }
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
  } else if (!alphaMemory.facts) {
    parent.children = removeFromList(parent.children, node);
  }

  return node;
}
