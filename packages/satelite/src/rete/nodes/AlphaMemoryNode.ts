import { IFact, IFactFields } from "../Fact";
import { IRete } from "../Rete";
import { ICondition } from "../Rule";
import {
  addToListHead,
  getFactField,
  IList,
  runRightActivationOnNode,
} from "../util";
import {
  buildOrShareConstantTestNode,
  IConstantTestNode,
  isConstantTest,
} from "./ConstantTestNode";
import { IReteNode } from "./ReteNode";

export interface IAlphaMemoryNode {
  items: IList<IAlphaMemoryItem>;
  successors: IList<IReteNode>;
  referenceCount: number;
}

export interface IAlphaMemoryItem {
  fact: IFact;
  alphaMemory: IAlphaMemoryNode;
}

export function makeAlphaMemoryNode(): IAlphaMemoryNode {
  const am: IAlphaMemoryNode = Object.create(null);

  am.items = null;
  am.successors = null;
  am.referenceCount = 0;

  return am;
}

export function makeAlphaMemoryItem(
  am: IAlphaMemoryNode,
  f: IFact,
): IAlphaMemoryItem {
  const i: IAlphaMemoryItem = Object.create(null);

  i.alphaMemory = am;
  i.fact = f;

  return i;
}

export function alphaMemoryNodeActivation(
  am: IAlphaMemoryNode,
  f: IFact,
): void {
  const i = makeAlphaMemoryItem(am, f);

  am.items = addToListHead(am.items, i);
  f.alphaMemoryItems = addToListHead(f.alphaMemoryItems, i);

  if (am.successors) {
    for (const node of am.successors) {
      runRightActivationOnNode(node, f);
    }
  }
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
