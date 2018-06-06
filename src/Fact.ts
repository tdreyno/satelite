import { memoize } from "interstelar";
import { IIdentifier, IPrimitive } from "./Identifier";

export type IValue = any;

export interface IFact
  extends Array<IIdentifier | IPrimitive | string | IValue> {
  0: IIdentifier | IPrimitive;
  1: string;
  2: IValue;
  length: 3;
}

export type SchemaFields = "0" | "1" | "2";

export function makeFactPure(identifier: any, attribute: any, value: any): any {
  return [identifier, attribute, value] as any;
}

export const makeFact = memoize(makeFactPure);

export function compareFacts<Schema extends IFact>(
  f1: Schema,
  f2: Schema
): boolean {
  return f1[0] === f2[0] && f1[1] === f2[1] && f1[2] === f2[2];
}
