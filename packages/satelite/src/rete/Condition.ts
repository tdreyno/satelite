import { memoize } from "interstelar";
import { IFact, IFactFields, IValue } from "./Fact";
import { IIdentifier, IPrimitive } from "./Identifier";
import { ITestAtJoinNode, makeTestAtJoinNode } from "./nodes/JoinNode";
import { setFactField } from "./util";

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

function keyForIndex(index: number): IFactFields {
  if (index === 0) {
    return "identifier";
  } else if (index === 1) {
    return "attribute";
  } else {
    return "value";
  }
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

  return [
    identifier,
    attribute,
    value,
  ].reduce((sum: IParsedCondition, v: IFactFields, index: number) => {
    const key = keyForIndex(index);

    if (isVariable(v)) {
      sum.variableNames[v] = key;
      setFactField(sum.variableFields, key, v);
    } else {
      setFactField(sum.constantFields, key, v);
    }

    return sum;
  }, result);
}

// Memoize so conditions are be compared later.
// Converts condition `toJSON` for caching. Might not be worth the memory.
const memoizedParseCondition = memoize(baseParseCondition);

export function parseCondition(c: ICondition): IParsedCondition {
  return memoizedParseCondition(c[0], c[1], c[2]);
}

export function getJoinTestsFromCondition(
  c: ICondition,
  earlierConditions: IParsedCondition[],
): ITestAtJoinNode[] {
  const { variableNames } = parseCondition(c);

  const output: ITestAtJoinNode[] = [];

  return Object.keys(
    variableNames,
  ).reduce((results, variableName: IFactFields) => {
    const earlierConditionIndex = findVariableInEarlierConditions(
      variableName,
      earlierConditions,
    );

    if (earlierConditionIndex !== -1) {
      const fieldArg1 = variableNames[variableName];

      const earlierCondition = earlierConditions[earlierConditionIndex];
      const fieldArg2 = earlierCondition.variableNames[variableName];

      results.push(
        makeTestAtJoinNode(fieldArg1, earlierConditionIndex, fieldArg2),
      );
    }

    return results;
  }, output);
}

export function findVariableInEarlierConditions(
  variableName: string,
  earlierConditions: IParsedCondition[],
): number {
  return earlierConditions.findIndex(
    ({ variableNames }) => !!variableNames[variableName],
  );
}
