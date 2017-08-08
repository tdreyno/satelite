import { memoize } from "interstelar";
import * as t from "io-ts";
import { validate } from "./util";

export const Primitive = t.union([t.string, t.number], "Primitive");
export const Identifier = t.interface(
  {
    attribute: t.string,
    value: t.any,
  },
  "Identifier",
);
export const IdentifierOrPrimitive = t.union(
  [Identifier, Primitive],
  "IdentifierOrPrimitive",
);

export type IIdentifier = t.TypeOf<typeof Identifier>;
export type IPrimitive = t.TypeOf<typeof Primitive>;
export type IIdentifierOrPrimitive = t.TypeOf<typeof IdentifierOrPrimitive>;

export function baseMakeIdentifier(attribute: string, value: any): IIdentifier {
  validate(attribute, t.string);

  return {
    attribute,
    value,
  };
}

export const makeIdentifier = memoize(baseMakeIdentifier);

export function compareIdentifiers(i1: IIdentifier, i2: IIdentifier): boolean {
  validate(i1, Identifier);
  validate(i2, Identifier);

  return i1.attribute === i2.attribute && i1.value === i2.value;
}
