import { memoize } from "interstelar/dist-es5";
import { ICondition, isConstant } from "../Condition";
import { IFact, IValue } from "../Fact";
import { IIdentifier, IPrimitive } from "../Identifier";
import { IRete } from "../Rete";
import {
  addToListHead,
  IList,
  removeFromList,
  runRightActivateOnNode,
  runRightRetractOnNode,
} from "../util";
import { IReteNode } from "./ReteNode";

export interface IAlphaMemoryNode {
  facts: IList<IFact>;
  successors: IList<IReteNode>;
  referenceCount: number;
}

export function makeAlphaMemoryNode(): IAlphaMemoryNode {
  const am: IAlphaMemoryNode = Object.create(null);

  am.facts = null;
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

export function alphaMemoryNodeActivate(
  node: IAlphaMemoryNode,
  f: IFact,
): void {
  node.facts = addToListHead(node.facts, f);
  f.alphaMemories = addToListHead(f.alphaMemories, node);

  if (node.successors) {
    for (let j = 0; j < node.successors.length; j++) {
      const successor = node.successors[j];
      runRightActivateOnNode(successor, f);
    }
  }
}

export function alphaMemoryNodeRetract(node: IAlphaMemoryNode, f: IFact): void {
  node.facts = removeFromList(node.facts, f);
  f.alphaMemories = addToListHead(f.alphaMemories, node);
  if (node.successors) {
    for (let j = 0; j < node.successors.length; j++) {
      const successor = node.successors[j];
      runRightRetractOnNode(successor, f);
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

  for (const f of r.workingMemory) {
    if (
      (!identifierTest || f.identifier === identifierTest) &&
      (!attributeTest || f.attribute === attributeTest) &&
      (!valueTest || f.value === valueTest)
    ) {
      alphaMemoryNodeActivate(alphaMemory as IAlphaMemoryNode, f);
    }
  }

  return alphaMemory;
}
