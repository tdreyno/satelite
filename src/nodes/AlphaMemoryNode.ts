import { memoize } from "interstelar";
import {
  isComparison,
  isConstant,
  isPlaceholder,
  ParsedCondition,
} from "../Condition";
import { IFact, IValue } from "../Fact";
import { IIdentifier, IPrimitive } from "../Identifier";
import { Rete } from "../Rete";
import { removeFromList, replaceInList } from "../util";
import { ReteNode } from "./ReteNode";

export type IExhaustiveHashTable = Map<number, AlphaMemoryNode>;

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
): AlphaMemoryNode | undefined {
  const hashCode = getHashCode(identifier, attribute, value);

  return hashTable.get(hashCode);
}

export function addToHashTable(
  rete: Rete,
  identifier: IPrimitive | IIdentifier | null,
  attribute: string | null,
  value: IValue | null,
): AlphaMemoryNode {
  const node = new AlphaMemoryNode(
    rete,
    `${identifier ? JSON.stringify(identifier) : "_"} ${attribute ||
      "_"} ${value ? JSON.stringify(value) : "_"}`,
  );

  const hashCode = getHashCode(identifier, attribute, value);
  rete.hashTable.set(hashCode, node);

  return node;
}

export function createExhaustiveHashTable(): IExhaustiveHashTable {
  return new Map();
}

export class AlphaMemoryNode extends ReteNode {
  static create(rete: Rete, c: ParsedCondition): AlphaMemoryNode {
    const identifierTest: any | null = isConstant(c.identifier)
      ? c.identifier
      : null;
    const attributeTest: any | null = isConstant(c.attribute)
      ? c.attribute
      : null;
    const valueTest: any | null = isConstant(c.value) ? c.value : null;

    const identifierIsPlaceholder =
      isPlaceholder(c.identifier) || isComparison(c.identifier);
    const attributeIsPlaceholder =
      isPlaceholder(c.attribute) || isComparison(c.attribute);
    const valueIsPlaceholder = isPlaceholder(c.value) || isComparison(c.value);

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
      rete,
      identifierTest,
      attributeTest,
      valueTest,
    );

    for (const f of rete.facts) {
      const matchesIdentifier =
        !identifierTest || identifierIsPlaceholder || f[0] === identifierTest;

      const matchesAttribute =
        !attributeTest || attributeIsPlaceholder || f[1] === attributeTest;

      const matchesValue =
        !valueTest || valueIsPlaceholder || f[2] === valueTest;

      if (matchesIdentifier && matchesAttribute && matchesValue) {
        alphaMemory.activate(f);
      }
    }

    return alphaMemory;
  }

  name: string;
  facts: IFact[] = [];
  successors: ReteNode[] = [];

  constructor(rete: Rete, name: string) {
    super(rete);

    this.name = name;
  }

  activate(f: IFact): void {
    this.log("activate", f);

    this.facts.push(f);

    for (let j = 0; j < this.successors.length; j++) {
      const successor = this.successors[j];
      successor.rightActivate(f);
    }
  }

  update(prev: IFact, f: IFact): void {
    this.log("update", prev, f);

    replaceInList(this.facts, prev, f);

    for (let j = 0; j < this.successors.length; j++) {
      const successor = this.successors[j];
      successor.rightUpdate(prev, f);
    }
  }

  retract(f: IFact): void {
    this.log("retract", f);

    for (let j = 0; j < this.successors.length; j++) {
      const successor = this.successors[j];
      successor.rightRetract(f);
    }

    removeFromList(this.facts, f);
  }
}
