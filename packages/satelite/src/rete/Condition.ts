import { memoize } from "interstelar";
import { IFact, IFactFields, IValue } from "./Fact";
import { IIdentifier, IPrimitive } from "./Identifier";
import { ITestAtJoinNode, makeTestAtJoinNode } from "./nodes/JoinNode";
import { IToken } from "./Token";
import { addToListHead, IList } from "./util";

export type IConstantTest = string;

export function isVariable(v: any): boolean {
  return typeof v === "string" && v.startsWith("?");
}

export function isConstant(v: any): boolean {
  return !isVariable(v);
}

export interface ICondition extends Array<any> {
  [0]: IPrimitive | IIdentifier | IConstantTest;
  [1]: string | IConstantTest;
  [2]: IValue | IConstantTest;
}

export interface IParsedCondition {
  identifier: IPrimitive | IIdentifier | IConstantTest;
  attribute: string | IConstantTest;
  value: IValue | IConstantTest;
  constantFields: Partial<IFact>;
  variableFields: { [P in IFactFields]?: string };
  variableNames: { [varName: string]: IFactFields };
}

function baseParseCondition(
  identifier: IPrimitive | IIdentifier | IConstantTest,
  attribute: string | IConstantTest,
  value: IValue | IConstantTest,
): IParsedCondition {
  const result: IParsedCondition = Object.create(null);

  result.identifier = identifier;
  result.attribute = attribute;
  result.value = value;
  result.constantFields = Object.create(null);
  result.variableFields = Object.create(null);
  result.variableNames = Object.create(null);

  if (isVariable(identifier)) {
    result.variableNames[identifier as string] = "identifier";
    result.variableFields.identifier = identifier as string;
  } else {
    result.constantFields.identifier = identifier as IIdentifier;
  }

  if (isVariable(attribute)) {
    result.variableNames[attribute as string] = "attribute";
    result.variableFields.attribute = attribute as string;
  } else {
    result.constantFields.attribute = attribute as string;
  }

  if (isVariable(value)) {
    result.variableNames[value as string] = "value";
    result.variableFields.value = value as string;
  } else {
    result.constantFields.value = value as any;
  }

  return result;
}

// Memoize so conditions are be compared later.
// Converts condition `toJSON` for caching. Might not be worth the memory.
const memoizedParseCondition = memoize(baseParseCondition);

export function parseCondition(c: ICondition): IParsedCondition {
  return memoizedParseCondition(c[0], c[1], c[2]);
}

export function getJoinTestsFromCondition(
  c: IParsedCondition,
  earlierConditions: IParsedCondition[],
): IList<ITestAtJoinNode> {
  const { variableNames } = c;

  let results: IList<ITestAtJoinNode> = null;

  // `variableNames` has no prototype, so we don't need this test.
  // tslint:disable-next-line:forin
  for (const variableName in variableNames) {
    const earlierConditionIndex = findVariableInEarlierConditions(
      variableName,
      earlierConditions,
    );

    if (earlierConditionIndex !== -1) {
      const fieldArg1 = variableNames[variableName];

      const earlierCondition = earlierConditions[earlierConditionIndex];
      const fieldArg2 = earlierCondition.variableNames[variableName];

      results = addToListHead(
        results,
        makeTestAtJoinNode(fieldArg1, earlierConditionIndex, fieldArg2),
      );
    }
  }

  return results;
}

export function findVariableInEarlierConditions(
  variableName: string,
  earlierConditions: IParsedCondition[],
): number {
  for (let i = 0; i < earlierConditions.length; i++) {
    const { variableNames } = earlierConditions[i];
    if (!!variableNames[variableName]) {
      return i;
    }
  }

  return -1;
}

export interface IVariableBindings {
  [variableName: string]: any;
}

export function defineVariables(
  conditions: IParsedCondition[],
  t: IToken,
): IVariableBindings {
  const foundVariables: IVariableBindings = {};

  let token: IToken | null = t;

  for (let i = conditions.length - 1; i >= 0; i--) {
    const condition = conditions[i];

    if (!token) {
      break;
    }

    // tslint:disable-next-line:forin
    for (const variableName in condition.variableNames) {
      if (typeof foundVariables[variableName] !== "undefined") {
        break;
      }

      const factKey = condition.variableNames[variableName];
      const variableData = token.fact[factKey];

      foundVariables[variableName] = variableData;
    }

    token = token ? token.parent : null;
  }

  return foundVariables;
}
