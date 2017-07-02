import { ICondition, isConstant } from "../Condition";
import { IFact, IFactFields } from "../Fact";
import { IRete } from "../Rete";
import {
  addToListHead,
  getConditionField,
  IList,
  runRightActivationOnNode,
} from "../util";
import {
  buildOrShareConstantTestNode,
  IConstantTestNode,
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
  node: IAlphaMemoryNode,
  f: IFact,
): void {
  const i = makeAlphaMemoryItem(node, f);

  node.items = addToListHead(node.items, i);
  f.alphaMemoryItems = addToListHead(f.alphaMemoryItems, i);

  if (node.successors) {
    for (const successor of node.successors) {
      runRightActivationOnNode(successor, f);
    }
  }
}

export function buildOrShareAlphaMemoryNode(
  r: IRete,
  c: ICondition,
): IAlphaMemoryNode {
  let currentNode: IConstantTestNode = r.root;

  const constants: {
    [key: string]: boolean;
  } = {
    identifier: isConstant(c[0]),
    attribute: isConstant(c[1]),
    value: isConstant(c[2]),
  };

  for (const key in constants) {
    if (constants[key]) {
      const sym = getConditionField(c, key as IFactFields);
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
      for (const key in constants) {
        if (constants[key]) {
          alphaMemoryNodeActivation(alphaMemory, fact);
        }
      }
    }
  }

  return alphaMemory;
}
