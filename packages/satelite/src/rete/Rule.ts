import { IValue } from "./Fact";
import { IIdentifier } from "./Identifier";

export type IConstantTest = any;

export interface ICondition {
  identifier: IIdentifier | IConstantTest;
  attribute: string | IConstantTest;
  value: IValue | IConstantTest;
}

export function isConstantTest(v: any): boolean {
  return typeof v !== "string" || v.startsWith("?");
}
