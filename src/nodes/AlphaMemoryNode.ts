import { memoize } from "interstelar";
import {
  isComparison,
  isConstant,
  isPlaceholder,
  ParsedCondition
} from "../Condition";
import { IFact, IValue } from "../Fact";
import { IIdentifier, IPrimitive } from "../Identifier";
import { Rete } from "../Rete";
import { removeFromList, replaceInList } from "../util";
import { ReteNode } from "./ReteNode";

export type IExhaustiveHashTable<Schema extends IFact> = Map<
  number,
  AlphaMemoryNode<Schema>
>;

let nextHashCode = 0;
// tslint:disable:variable-name
export const getHashCode = memoize(
  (
    _identifier: IPrimitive | IIdentifier | null,
    _attribute: string | null,
    _value: IValue | null
  ): number => nextHashCode++
);
// tslint:enable:variable-name

export function lookupInHashTable<Schema extends IFact>(
  hashTable: IExhaustiveHashTable<Schema>,
  identifier: IPrimitive | IIdentifier | null,
  attribute: string | null,
  value: IValue | null
): AlphaMemoryNode<Schema> | undefined {
  const hashCode = getHashCode(identifier, attribute, value);

  return hashTable.get(hashCode);
}

export class AlphaMemoryNode<Schema extends IFact> extends ReteNode<Schema> {
  static create<S extends IFact>(
    rete: Rete<S>,
    c: ParsedCondition<S>
  ): AlphaMemoryNode<S> {
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
      valueTest
    );

    if (alphaMemory) {
      return alphaMemory;
    }

    alphaMemory = addToHashTable(
      rete,
      identifierTest,
      attributeTest,
      valueTest
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
  facts: Schema[] = [];
  successors: Array<ReteNode<Schema>> = [];

  constructor(rete: Rete<Schema>, name: string) {
    super(rete);

    this.name = name;
  }

  activate(f: Schema): void {
    this.log("activate", f);

    this.facts.push(f);

    for (let j = 0; j < this.successors.length; j++) {
      const successor = this.successors[j];
      successor.rightActivate(f);
    }
  }

  update(prev: Schema, f: Schema): void {
    this.log("update", prev, f);

    replaceInList(this.facts, prev, f);

    for (let j = 0; j < this.successors.length; j++) {
      const successor = this.successors[j];
      successor.rightUpdate(prev, f);
    }
  }

  retract(f: Schema): void {
    this.log("retract", f);

    for (let j = 0; j < this.successors.length; j++) {
      const successor = this.successors[j];
      successor.rightRetract(f);
    }

    removeFromList(this.facts, f);
  }
}

export function addToHashTable<Schema extends IFact>(
  rete: Rete<Schema>,
  identifier: IPrimitive | IIdentifier | null,
  attribute: string | null,
  value: IValue | null
): AlphaMemoryNode<Schema> {
  const node = new AlphaMemoryNode<Schema>(
    rete,
    `${identifier ? JSON.stringify(identifier) : "_"} ${attribute || "_"} ${
      value ? JSON.stringify(value) : "_"
    }`
  );

  const hashCode = getHashCode(identifier, attribute, value);
  rete.hashTable.set(hashCode, node);

  return node;
}

export function createExhaustiveHashTable<
  Schema extends IFact
>(): IExhaustiveHashTable<Schema> {
  return new Map();
}
