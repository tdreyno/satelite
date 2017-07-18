import { memoize } from "interstelar";
import isString = require("lodash/isString");
import { IFact, IFactFields, IValue } from "./Fact";
import { IIdentifier, IPrimitive } from "./Identifier";
import { AccumulatorCondition } from "./nodes/AccumulatorNode";
import { createTestAtJoinNode, TestAtJoinNode } from "./nodes/JoinNode";
import { getVariablePrefix, placeholder } from "./Rete";
import { IVariableBindings } from "./Token";

export type IConstantTest = string;

export type ICompareFn<T = any> = (a: T, b: T) => boolean;

export class Comparison {
  compareFn: ICompareFn;
  value: IPrimitive | IIdentifier | IConstantTest | IValue;

  constructor(compareFn: ICompareFn, value: any | IConstantTest) {
    this.compareFn = compareFn;
    this.value = value;
  }
}

export function compare(
  compareFn: ICompareFn,
  value: any | IConstantTest,
): Comparison {
  return new Comparison(compareFn, value);
}

export function isVariable(v: any): boolean {
  return isString(v) && v.startsWith(getVariablePrefix());
}

export function isComparison(v: any): boolean {
  return v instanceof Comparison;
}

export function isPlaceholder(v: any): boolean {
  return isString(v) && v === placeholder;
}

export function isConstant(v: any): boolean {
  return !isVariable(v) && !isPlaceholder(v) && !isComparison(v);
}

export interface ICondition extends Array<any> {
  [0]: IPrimitive | IIdentifier | IConstantTest;
  [1]: string | IConstantTest;
  [2]: IValue | IConstantTest;

  isNegated?: boolean;
}

export interface IVariableNames {
  [varName: string]: IFactFields;
}

export class ParsedCondition {
  static create(
    identifier: IPrimitive | IIdentifier | IConstantTest | Comparison,
    attribute: string | IConstantTest | Comparison,
    value: IValue | IConstantTest | Comparison,
    isNegated: boolean,
  ) {
    return new ParsedCondition(identifier, attribute, value, isNegated);
  }

  identifier: IPrimitive | IIdentifier | IConstantTest | Comparison;
  attribute: string | IConstantTest | Comparison;
  value: IValue | IConstantTest | Comparison;
  constantFields: Partial<IFact>;
  placeholderFields: { [P in IFactFields]?: true };
  variableFields: { [P in IFactFields]?: string };
  comparisonFields: { [P in IFactFields]?: Comparison };
  variableNames: IVariableNames;
  isNegated: boolean;

  constructor(
    identifier: IPrimitive | IIdentifier | IConstantTest | Comparison,
    attribute: string | IConstantTest | Comparison,
    value: IValue | IConstantTest | Comparison,
    isNegated: boolean,
  ) {
    this.identifier = identifier;
    this.attribute = attribute;
    this.value = value;
    this.constantFields = {};
    this.variableFields = {};
    this.comparisonFields = {};
    this.placeholderFields = {};
    this.variableNames = {};
    this.isNegated = isNegated;

    if (isComparison(identifier)) {
      this.comparisonFields["0"] = identifier as Comparison;
    } else if (isVariable(identifier)) {
      this.variableNames[identifier as string] = "0";
      this.variableFields["0"] = identifier as string;
    } else if (isPlaceholder(identifier)) {
      this.placeholderFields["0"] = true;
    } else {
      this.constantFields["0"] = identifier as IIdentifier;
    }

    if (isComparison(attribute)) {
      this.comparisonFields["1"] = attribute as Comparison;
    } else if (isVariable(attribute)) {
      this.variableNames[attribute as string] = "1";
      this.variableFields["1"] = attribute as string;
    } else if (isPlaceholder(attribute)) {
      this.placeholderFields["1"] = true;
    } else {
      this.constantFields["1"] = attribute as string;
    }

    if (isComparison(value)) {
      this.comparisonFields["2"] = value as Comparison;
    } else if (isVariable(value)) {
      this.variableNames[value as string] = "2";
      this.variableFields["2"] = value as string;
    } else if (isPlaceholder(value)) {
      this.placeholderFields["2"] = true;
    } else {
      this.constantFields["2"] = value as any;
    }
  }
}

// Memoize so conditions are be compared later.
// Converts condition `toJSON` for caching. Might not be worth the memory.
const memoizedParseCondition = memoize(ParsedCondition.create);

export function parseCondition(c: AccumulatorCondition): AccumulatorCondition;
export function parseCondition(c: ICondition): ParsedCondition;
export function parseCondition(
  c: ICondition | AccumulatorCondition,
): ParsedCondition | AccumulatorCondition {
  if (c instanceof AccumulatorCondition) {
    return c;
  }

  return memoizedParseCondition(c[0], c[1], c[2], c.isNegated || false);
}

export function getJoinTestsFromCondition(
  c: ParsedCondition | AccumulatorCondition,
  earlierConditions: Array<ParsedCondition | AccumulatorCondition>,
): TestAtJoinNode[] {
  const variableNames: IVariableNames =
    c instanceof AccumulatorCondition ? {} : c.variableNames;

  const comparisonFields: { [P in IFactFields]?: Comparison } =
    c instanceof AccumulatorCondition ? {} : c.comparisonFields;

  const results: TestAtJoinNode[] = [];

  for (const variableName in variableNames) {
    if (variableNames.hasOwnProperty(variableName)) {
      const earlierCondition = findVariableInEarlierConditions(
        variableName,
        earlierConditions,
      );

      if (earlierCondition) {
        const fieldArg1 = parseInt(variableNames[variableName], 10);

        const fieldArg2 =
          earlierCondition instanceof AccumulatorCondition
            ? earlierCondition.bindingName
            : earlierCondition.variableNames[variableName];

        results.unshift(
          createTestAtJoinNode(fieldArg1, earlierCondition, fieldArg2),
        );
      } else {
        results.unshift(createTestAtJoinNode(null, c, null));
      }
    }
  }

  for (const comparisonField in comparisonFields) {
    if (comparisonFields.hasOwnProperty(comparisonField)) {
      const comparison: Comparison = (comparisonFields as any)[comparisonField];

      if (isVariable(comparison.value)) {
        const earlierCondition = findVariableInEarlierConditions(
          comparison.value,
          earlierConditions,
        );
      } else {
        results.unshift(createTestAtJoinNode(null, c, null));
      }
    }
  }

  return results;
}

export function findVariableInEarlierConditions(
  variableName: string,
  earlierConditions: Array<ParsedCondition | AccumulatorCondition>,
): ParsedCondition | AccumulatorCondition | undefined {
  for (let i = 0; i < earlierConditions.length; i++) {
    const c = earlierConditions[i];

    if (c instanceof AccumulatorCondition) {
      if (c.bindingName === variableName) {
        return c;
      }
    } else if (!!c.variableNames[variableName]) {
      return c;
    }
  }
}

export function cleanVariableNamePure(variableName: string): string {
  return variableName.charAt(0) === getVariablePrefix()
    ? variableName.slice(1, variableName.length)
    : variableName;
}

export const cleanVariableName = memoize(cleanVariableNamePure);

export function extractBindingsFromCondition(
  c: ParsedCondition | AccumulatorCondition,
  f: IFact,
  b: IVariableBindings,
): IVariableBindings {
  const bindings = Object.assign({}, b);

  if (c instanceof AccumulatorCondition) {
    bindings[cleanVariableName(c.bindingName)] = f;
    return bindings;
  }

  // tslint:disable-next-line:forin
  for (const variableName in c.variableNames) {
    const cleanedVariableName = cleanVariableName(variableName);

    if (typeof bindings[cleanedVariableName] === "undefined") {
      const variableField = c.variableNames[variableName];

      bindings[cleanedVariableName] = f[variableField];
    }
  }

  return bindings;
}

export function getVariableNamesFromCondition(
  c: ParsedCondition | AccumulatorCondition,
): Set<string> {
  if (c instanceof AccumulatorCondition) {
    return new Set([c.bindingName]);
  } else {
    return new Set(Object.keys(c.variableNames));
  }
}

export function getVariableNamesFromConditions(
  conditions: Array<ParsedCondition | AccumulatorCondition>,
): Set<string> {
  return conditions.reduce((acc, c) => {
    return new Set([...acc, ...getVariableNamesFromCondition(c)]);
  }, new Set());
}

export function dependentVariableNames(
  parentConditions: Array<ParsedCondition | AccumulatorCondition>,
  subConditions: Array<ParsedCondition | AccumulatorCondition>,
): Set<string> {
  const parentVarNames = getVariableNamesFromConditions(parentConditions);
  const subVarNames = getVariableNamesFromConditions(subConditions);

  return new Set(
    Array.from(subVarNames).filter(subVarName =>
      parentVarNames.has(subVarName),
    ),
  );
}
