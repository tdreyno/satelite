import { memoize } from "interstelar";
import intersection = require("lodash/intersection");
import isString = require("lodash/isString");
import union = require("lodash/union");
import { IFact, IValue, SchemaFields } from "./Fact";
import { IIdentifier, IPrimitive } from "./Identifier";
import { AccumulatorCondition } from "./nodes/AccumulatorNode";
import { createTestAtJoinNode, TestAtJoinNode } from "./nodes/JoinNode";
import { getVariablePrefix, placeholder } from "./Rete";
import { IVariableBindings } from "./Token";

export function cleanVariableNamePure(variableName: string): string {
  return variableName.charAt(0) === getVariablePrefix()
    ? variableName.slice(1, variableName.length)
    : variableName;
}

export const cleanVariableName = memoize(cleanVariableNamePure);

export type IConstantTest = string;

export type ICompareFn<Schema extends IFact> = (
  a: any,
  b: IVariableBindings<Schema>
) => boolean;

export class Comparison<Schema extends IFact> {
  compareFn: ICompareFn<Schema>;

  constructor(compareFn: ICompareFn<Schema>) {
    this.compareFn = compareFn;
  }
}

export function compare<Schema extends IFact>(
  compareFn: ICompareFn<Schema>
): Comparison<Schema> {
  return new Comparison(compareFn);
}

function getValueOfComparisonTarget<Schema extends IFact>(
  v: any,
  bindings: IVariableBindings<Schema>
) {
  if (isVariable(v)) {
    return getVariableFromBindings(v, bindings);
  }

  return v;
}

function getVariableFromBindings<Schema extends IFact>(
  name: string,
  bindings: IVariableBindings<Schema>
) {
  return bindings[cleanVariableName(name)];
}

export const isIdentifierType = (type: string) =>
  compare((a: IIdentifier): boolean => type === a.attribute);
export const isNegative = compare((a: number): boolean => a < 0);
export const isBetween = (a: any, c: any) =>
  compare(
    (b: number, bindings): boolean =>
      getValueOfComparisonTarget(a, bindings) <= b &&
      b <= getValueOfComparisonTarget(c, bindings)
  );
export const lessThanOrEqualTo = (v: any) =>
  compare(
    (a: number, bindings): boolean =>
      a <= getValueOfComparisonTarget(v, bindings)
  );
export const lessThan = (v: any) =>
  compare(
    (a: number, bindings): boolean =>
      a < getValueOfComparisonTarget(v, bindings)
  );
export const greaterThan = (v: any) =>
  compare(
    (a: number, bindings): boolean =>
      a > getValueOfComparisonTarget(v, bindings)
  );
export const greaterThanOrEqualTo = (v: any) =>
  compare(
    (a: number, bindings): boolean =>
      a >= getValueOfComparisonTarget(v, bindings)
  );
export const equals = (v: any) =>
  compare(
    (a: any, bindings): boolean => a === getValueOfComparisonTarget(v, bindings)
  );
export const notEquals = (v: any) =>
  compare((a, bindings) => a !== getValueOfComparisonTarget(v, bindings));

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

export interface ICondition<S extends IFact> {
  0: S[0] | IConstantTest | Comparison<S>;
  1: S[1] | IConstantTest | Comparison<S>;
  2: S[2] | IConstantTest | Comparison<S>;

  isNegated?: boolean;
}

export interface IVariableNames {
  [varName: string]: SchemaFields;
}

export class ParsedCondition<Schema extends IFact> {
  static create<S extends IFact>(
    identifier: S[0] | IConstantTest | Comparison<S>,
    attribute: S[1] | IConstantTest | Comparison<S>,
    value: S[2] | IConstantTest | Comparison<S>,
    isNegated: boolean
  ) {
    return new ParsedCondition<S>(identifier, attribute, value, isNegated);
  }

  identifier: Schema[0] | IConstantTest | Comparison<Schema>;
  attribute: Schema[1] | IConstantTest | Comparison<Schema>;
  value: Schema[2] | IConstantTest | Comparison<Schema>;
  constantFields: Partial<Schema>;
  placeholderFields: { [P in SchemaFields]?: true };
  variableFields: { [P in SchemaFields]?: string };
  comparisonFields: { [P in SchemaFields]?: Comparison<Schema> };
  variableNames: IVariableNames;
  isNegated: boolean;

  constructor(
    identifier: IPrimitive | IIdentifier | IConstantTest | Comparison<Schema>,
    attribute: string | IConstantTest | Comparison<Schema>,
    value: IValue | IConstantTest | Comparison<Schema>,
    isNegated: boolean
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
      this.comparisonFields["0"] = identifier as Comparison<Schema>;
      this.placeholderFields["0"] = true;
    } else if (isVariable(identifier)) {
      this.variableNames[identifier as string] = "0";
      this.variableFields["0"] = identifier as string;
    } else if (isPlaceholder(identifier)) {
      this.placeholderFields["0"] = true;
    } else {
      this.constantFields["0"] = identifier as IIdentifier;
    }

    if (isComparison(attribute)) {
      this.comparisonFields["1"] = attribute as Comparison<Schema>;
      this.placeholderFields["1"] = true;
    } else if (isVariable(attribute)) {
      this.variableNames[attribute as string] = "1";
      this.variableFields["1"] = attribute as string;
    } else if (isPlaceholder(attribute)) {
      this.placeholderFields["1"] = true;
    } else {
      this.constantFields["1"] = attribute as string;
    }

    if (isComparison(value)) {
      this.comparisonFields["2"] = value as Comparison<Schema>;
      this.placeholderFields["2"] = true;
    } else if (isVariable(value)) {
      this.variableNames[value as string] = "2";
      this.variableFields["2"] = value as string;
    } else if (isPlaceholder(value)) {
      this.placeholderFields["2"] = true;
    } else {
      this.constantFields["2"] = value;
    }
  }
}

// Memoize so conditions are be compared later.
// Converts condition `toJSON` for caching. Might not be worth the memory.
const memoizedParseCondition = memoize(ParsedCondition.create);

export function parseCondition<Schema extends IFact, T>(
  c: AccumulatorCondition<Schema, T>
): AccumulatorCondition<Schema, T>;
export function parseCondition<Schema extends IFact>(
  c: ICondition<Schema>
): ParsedCondition<Schema>;
export function parseCondition<Schema extends IFact, T>(
  c: ICondition<Schema> | AccumulatorCondition<Schema, T>
): ParsedCondition<Schema> | AccumulatorCondition<Schema, T> {
  if (c instanceof AccumulatorCondition) {
    return c;
  }

  const isNegated = (c as any).isNegated || false;

  return memoizedParseCondition(c[0], c[1], c[2], isNegated);
}

export function getJoinTestsFromCondition<Schema extends IFact>(
  c: ParsedCondition<Schema> | AccumulatorCondition<Schema>,
  earlierConditions: Array<
    ParsedCondition<Schema> | AccumulatorCondition<Schema>
  >
): Array<TestAtJoinNode<Schema>> {
  const variableNames: IVariableNames =
    c instanceof AccumulatorCondition ? {} : c.variableNames;

  const results: Array<TestAtJoinNode<Schema>> = [];

  for (const variableName in variableNames) {
    if (variableNames.hasOwnProperty(variableName)) {
      const earlierCondition = findVariableInEarlierConditions(
        variableName,
        earlierConditions
      );

      if (earlierCondition) {
        const fieldArg1 = parseInt(variableNames[variableName], 10);

        const fieldArg2 =
          earlierCondition instanceof AccumulatorCondition
            ? earlierCondition.bindingName
            : earlierCondition.variableNames[variableName];

        results.unshift(
          createTestAtJoinNode(fieldArg1, earlierCondition, fieldArg2)
        );
      } else {
        results.unshift(createTestAtJoinNode(null, c, null));
      }
    }
  }

  return results;
}

export function findVariableInEarlierConditions<Schema extends IFact>(
  variableName: string,
  earlierConditions: Array<
    ParsedCondition<Schema> | AccumulatorCondition<Schema>
  >
): ParsedCondition<Schema> | AccumulatorCondition<Schema> | undefined {
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

export function extractBindingsFromCondition<Schema extends IFact>(
  c: ParsedCondition<Schema> | AccumulatorCondition<Schema>,
  f: Schema,
  b: IVariableBindings<Schema>
): IVariableBindings<Schema> {
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

export function getVariableNamesFromCondition<Schema extends IFact>(
  c: ParsedCondition<Schema> | AccumulatorCondition<Schema>
): string[] {
  if (c instanceof AccumulatorCondition) {
    return [c.bindingName];
  } else {
    return Object.keys(c.variableNames);
  }
}

export function getVariableNamesFromConditions<Schema extends IFact>(
  conditions: Array<ParsedCondition<Schema> | AccumulatorCondition<Schema>>
): string[] {
  return conditions.reduce(
    (acc, c) => union(acc, getVariableNamesFromCondition(c)),
    [] as string[]
  );
}

export function dependentVariableNames<Schema extends IFact>(
  parentConditions: Array<
    ParsedCondition<Schema> | AccumulatorCondition<Schema>
  >,
  subConditions: Array<ParsedCondition<Schema> | AccumulatorCondition<Schema>>
): string[] {
  return intersection(
    getVariableNamesFromConditions(parentConditions),
    getVariableNamesFromConditions(subConditions)
  );
}
