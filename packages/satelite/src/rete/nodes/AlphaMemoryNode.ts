import { memoize } from "interstelar/dist-es5";
import { ICondition, isConstant } from "../Condition";
import { IFact, IValue } from "../Fact";
import { IIdentifier, IPrimitive } from "../Identifier";
import { IRete } from "../Rete";
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

export type IExhaustiveHashTable = Map<number, IAlphaMemoryNode>;

let hashCode = 0;
// tslint:disable:variable-name
export const getHashCode = memoize(
  (
    _identifier: IPrimitive | IIdentifier | null,
    _attribute: string | null,
    _value: IValue | null,
  ): number => hashCode++,
);
// tslint:enable:variable-name

export function lookupInHashTable(
  hashTable: IExhaustiveHashTable,
  identifier: IPrimitive | IIdentifier | null,
  attribute: string | null,
  value: IValue | null,
): IAlphaMemoryNode | undefined {
  return hashTable.get(getHashCode(identifier, attribute, value));
}

export function addToHashTable(
  hashTable: IExhaustiveHashTable,
  identifier: IPrimitive | IIdentifier | null,
  attribute: string | null,
  value: IValue | null,
): IAlphaMemoryNode {
  const node = makeAlphaMemoryNode();

  hashTable.set(getHashCode(identifier, attribute, value), node);

  return node;
}

export function createExhaustiveHashTable(): IExhaustiveHashTable {
  return new Map();
}

export const alphaMemoryForCondition = memoize((
  // tslint:disable-next-line:variable-name
  _identifier: IPrimitive | IIdentifier | null,
  // tslint:disable-next-line:variable-name
  _attribute: string | null,
  // tslint:disable-next-line:variable-name
  _value: IValue | null,
) => makeAlphaMemoryNode());

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
    for (let j = 0; j < node.successors.length; j++) {
      const successor = node.successors[j];
      runRightActivationOnNode(successor, f);
    }
  }
}

export function buildOrShareAlphaMemoryNode(
  r: IRete,
  c: ICondition,
): IAlphaMemoryNode {
  const identifierTest = isConstant(c[0]) ? c[0] : null;
  const attributeTest = isConstant(c[1]) ? c[1] : null;
  const valueTest = isConstant(c[2]) ? c[2] : null;

  let alphaMemory = lookupInHashTable(
    r.hashTable,
    identifierTest,
    attributeTest,
    valueTest,
  );

  if (alphaMemory) {
    return alphaMemory;
  }

  alphaMemory = addToHashTable(
    r.hashTable,
    identifierTest,
    attributeTest,
    valueTest,
  );

  if (r.workingMemory) {
    for (let i = 0; i < r.workingMemory.length; i++) {
      const f = r.workingMemory[i];

      if (
        (!identifierTest || f.identifier === identifierTest) &&
        (!attributeTest || f.attribute === attributeTest) &&
        (!valueTest || f.value === valueTest)
      ) {
        alphaMemoryNodeActivation(alphaMemory as IAlphaMemoryNode, f);
      }
    }
  }

  return alphaMemory;
}
