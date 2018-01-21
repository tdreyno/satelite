import { memoize } from "interstelar";

export type IPrimitive = string | number;

export class IIdentifier<T = IPrimitive> {
  attribute!: string;
  value!: T;
}

export function baseMakeIdentifier<T = IPrimitive>(
  attribute: string,
  value: T,
): IIdentifier<T> {
  const i = Object.create(null);

  i.attribute = attribute;
  i.value = value;

  return i;
}

export const makeIdentifier = memoize(baseMakeIdentifier);

export function compareIdentifiers(i1: IIdentifier, i2: IIdentifier): boolean {
  return i1.attribute === i2.attribute && i1.value === i2.value;
}
