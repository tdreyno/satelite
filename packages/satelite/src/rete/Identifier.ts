export type IPrimitive = string | number;

export interface IIdentifier {
  attribute: string;
  value: IPrimitive;
}

// TODO, memoize this.
export function makeIdentifier(
  attribute: string,
  value: IPrimitive,
): IIdentifier {
  const i = Object.create(null);

  i.attribute = attribute;
  i.value = value;

  return i;
}

export function compareIdentifiers(i1: IIdentifier, i2: IIdentifier): boolean {
  return i1.attribute === i2.attribute && i1.value === i2.value;
}
