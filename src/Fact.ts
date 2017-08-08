import { memoize } from "interstelar";
import * as t from "io-ts";
import { IdentifierOrPrimitive, IIdentifierOrPrimitive } from "./Identifier";
import { contract } from "./util";

export const Value = t.any;
export const Fact = t.tuple([IdentifierOrPrimitive, t.string, t.any], "Fact");

export const FactFields = t.union(
  [t.literal("0"), t.literal("1"), t.literal("2")],
  "FactFields",
);

export type IValue = t.TypeOf<typeof Value>;
export type IFact = t.TypeOf<typeof Fact>;
export type IFactFields = t.TypeOf<typeof FactFields>;

export const makeFactPure = contract(
  [IdentifierOrPrimitive, t.string, Value],
  Fact,
  (
    identifier: IIdentifierOrPrimitive,
    attribute: string,
    value: IValue,
  ): IFact => {
    return [identifier, attribute, value];
  },
);

export const makeFact = memoize(makeFactPure);

export const compareFacts = contract(
  [Fact, Fact],
  t.boolean,
  (f1: IFact, f2: IFact) => {
    return f1[0] === f2[0] && f1[1] === f2[1] && f1[2] === f2[2];
  },
);
