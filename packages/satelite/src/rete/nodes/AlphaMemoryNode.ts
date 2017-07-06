import { memoize } from "interstelar/dist-es5";
import { IParsedCondition, isConstant } from "../Condition";
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
  name: string;
  facts: IList<IFact>;
  successors: IList<IReteNode>;
}

export function makeAlphaMemoryNode(name: string): IAlphaMemoryNode {
  const am: IAlphaMemoryNode = Object.create(null);

  am.name = name;
  am.facts = null;
  am.successors = null;

  return am;
}

export type IExhaustiveHashTable = Map<number, IAlphaMemoryNode>;

let nextHashCode = 0;
// tslint:disable:variable-name
export const getHashCode = memoize(
  (
    _identifier: IPrimitive | IIdentifier | null,
    _attribute: string | null,
    _value: IValue | null,
  ): number => nextHashCode++,
);
// tslint:enable:variable-name

export function lookupInHashTable(
  hashTable: IExhaustiveHashTable,
  identifier: IPrimitive | IIdentifier | null,
  attribute: string | null,
  value: IValue | null,
): IAlphaMemoryNode | undefined {
  const hashCode = getHashCode(identifier, attribute, value);

  return hashTable.get(hashCode);
}

export function addToHashTable(
  hashTable: IExhaustiveHashTable,
  identifier: IPrimitive | IIdentifier | null,
  attribute: string | null,
  value: IValue | null,
): IAlphaMemoryNode {
  const node = makeAlphaMemoryNode(
    `${identifier || "_"} ${attribute || "_"} ${value || "_"}`,
  );

  const hashCode = getHashCode(identifier, attribute, value);
  hashTable.set(hashCode, node);

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

  if (node.successors) {
    for (let j = 0; j < node.successors.length; j++) {
      const successor = node.successors[j];
      runRightActivateOnNode(successor, f);
    }
  }
}

export function alphaMemoryNodeRetract(node: IAlphaMemoryNode, f: IFact): void {
  if (node.successors) {
    for (let j = 0; j < node.successors.length; j++) {
      const successor = node.successors[j];

      runRightRetractOnNode(successor, f);
    }
  }

  node.facts = removeFromList(node.facts, f);
}

export function buildOrShareAlphaMemoryNode(
  rete: IRete,
  c: IParsedCondition,
): IAlphaMemoryNode {
  const identifierTest = isConstant(c.identifier) ? c.identifier : null;
  const attributeTest = isConstant(c.attribute) ? c.attribute : null;
  const valueTest = isConstant(c.value) ? c.value : null;

  let alphaMemory = lookupInHashTable(
    rete.hashTable,
    identifierTest,
    attributeTest,
    valueTest,
  );

  if (alphaMemory) {
    return alphaMemory;
  }

  alphaMemory = addToHashTable(
    rete.hashTable,
    identifierTest,
    attributeTest,
    valueTest,
  );

  for (const f of rete.facts) {
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
