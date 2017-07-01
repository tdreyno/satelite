import { IFact } from "../Fact";
import { addToListHead, IList, runRightActivationOnNode } from "../util";
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
