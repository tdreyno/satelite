import { memoize } from "interstelar";
import { IFact, IFactFields, IValue } from "./Fact";
import { IIdentifier, IPrimitive } from "./Identifier";
import { ITestAtJoinNode, makeTestAtJoinNode } from "./nodes/JoinNode";
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
  c: ICondition,
  earlierConditions: ICondition[],
): IList<ITestAtJoinNode> {
  const { variableNames } = parseCondition(c);

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

      const earlierCondition = parseCondition(
        earlierConditions[earlierConditionIndex],
      );
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
  earlierConditions: ICondition[],
): number {
  for (let i = 0; i < earlierConditions.length; i++) {
    const { variableNames } = parseCondition(earlierConditions[i]);
    if (!!variableNames[variableName]) {
      return i;
    }
  }

  return -1;
}
