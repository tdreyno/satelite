import { memoize } from "interstelar";
import { IIdentifier, IPrimitive } from "./Identifier";

export type IValue = any;
export type IFact = [IIdentifier | IPrimitive, string, IValue];
export type IFactFields = "0" | "1" | "2";

export function makeFactPure(
  identifier: IIdentifier | IPrimitive,
  attribute: string,
  value: IValue,
): IFact {
  return [identifier, attribute, value];
}

export const makeFact = memoize(makeFactPure);

export function compareFacts(f1: IFact, f2: IFact): boolean {
  return f1[0] === f2[0] && f1[1] === f2[1] && f1[2] === f2[2];
}
