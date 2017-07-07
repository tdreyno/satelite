import { memoize } from "interstelar";
import { IFact, IFactFields, IValue } from "./Fact";
import { IIdentifier, IPrimitive } from "./Identifier";
import { ITestAtJoinNode, makeTestAtJoinNode } from "./nodes/JoinNode";
import { getVariablePrefix } from "./Rete";
import { IVariableBindings } from "./Token";
import { addToListHead, IList } from "./util";

export type IConstantTest = string;

export function isVariable(v: any): boolean {
  return typeof v === "string" && v.startsWith(getVariablePrefix());
}

export function isConstant(v: any): boolean {
  return !isVariable(v);
}

export interface ICondition extends Array<any> {
  [0]: IPrimitive | IIdentifier | IConstantTest;
  [1]: string | IConstantTest;
  [2]: IValue | IConstantTest;

  isNegated?: boolean;
}

export interface IParsedCondition {
  identifier: IPrimitive | IIdentifier | IConstantTest;
  attribute: string | IConstantTest;
  value: IValue | IConstantTest;
  constantFields: Partial<IFact>;
  variableFields: { [P in IFactFields]?: string };
  variableNames: { [varName: string]: IFactFields };
  isNegated: boolean;
}

function baseParseCondition(
  identifier: IPrimitive | IIdentifier | IConstantTest,
  attribute: string | IConstantTest,
  value: IValue | IConstantTest,
  isNegated: boolean,
): IParsedCondition {
  const result: IParsedCondition = Object.create(null);

  result.identifier = identifier;
  result.attribute = attribute;
  result.value = value;
  result.constantFields = Object.create(null);
  result.variableFields = Object.create(null);
  result.variableNames = Object.create(null);
  result.isNegated = isNegated;

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
  return memoizedParseCondition(c[0], c[1], c[2], c.isNegated || false);
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
    const earlierCondition = findVariableInEarlierConditions(
      variableName,
      earlierConditions,
    );

    if (earlierCondition) {
      const fieldArg1 = variableNames[variableName];

      const fieldArg2 = earlierCondition.variableNames[variableName];

      results = addToListHead(
        results,
        makeTestAtJoinNode(fieldArg1, earlierCondition, fieldArg2),
      );
    }
  }

  return results;
}

export function findVariableInEarlierConditions(
  variableName: string,
  earlierConditions: IParsedCondition[],
): IParsedCondition | undefined {
  for (let i = 0; i < earlierConditions.length; i++) {
    const c = earlierConditions[i];
    if (!!c.variableNames[variableName]) {
      return c;
    }
  }
}

export function extractBindingsFromCondition(
  c: IParsedCondition,
  f: IFact,
  b: IVariableBindings,
): IVariableBindings {
  const bindings = Object.assign({}, b);

  // tslint:disable-next-line:forin
  for (const variableName in c.variableNames) {
    const cleanedVariableName =
      variableName.charAt(0) === getVariablePrefix()
        ? variableName.slice(1, variableName.length)
        : variableName;

    if (typeof bindings[cleanedVariableName] === "undefined") {
      const variableField = c.variableNames[variableName];

      bindings[cleanedVariableName] = f[variableField];
    }
  }

  return bindings;
}
