import { memoize } from "interstelar";
import { IFactFields, IFact, IValue } from "./Fact";
import { IIdentifier, IPrimitive } from "./Identifier";
import { AccumulatorCondition } from "./nodes/AccumulatorNode";
import { TestAtJoinNode } from "./nodes/JoinNode";
import { getVariablePrefix, placeholder } from "./Rete";
import { IVariableBindings } from "./Token";

export type IConstantTest = string;

export function isVariable(v: any): boolean {
  return typeof v === "string" && v.startsWith(getVariablePrefix());
}

export function isPlaceholder(v: any): boolean {
  return typeof v === "string" && v === placeholder;
}

export function isConstant(v: any): boolean {
  return !isVariable(v) && !isPlaceholder(v);
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
    identifier: IPrimitive | IIdentifier | IConstantTest,
    attribute: string | IConstantTest,
    value: IValue | IConstantTest,
    isNegated: boolean,
  ) {
    return new ParsedCondition(identifier, attribute, value, isNegated);
  }

  identifier: IPrimitive | IIdentifier | IConstantTest;
  attribute: string | IConstantTest;
  value: IValue | IConstantTest;
  constantFields: Partial<IFact>;
  placeholderFields: { [P in IFactFields]?: true };
  variableFields: { [P in IFactFields]?: string };
  variableNames: IVariableNames;
  isNegated: boolean;

  constructor(
    identifier: IPrimitive | IIdentifier | IConstantTest,
    attribute: string | IConstantTest,
    value: IValue | IConstantTest,
    isNegated: boolean,
  ) {
    this.identifier = identifier;
    this.attribute = attribute;
    this.value = value;
    this.constantFields = Object.create(null);
    this.variableFields = Object.create(null);
    this.placeholderFields = Object.create(null);
    this.variableNames = Object.create(null);
    this.isNegated = isNegated;

    if (isVariable(identifier)) {
      this.variableNames[identifier as string] = "0";
      this.variableFields["0"] = identifier as string;
    } else if (isPlaceholder(identifier)) {
      this.placeholderFields["0"] = true;
    } else {
      this.constantFields["0"] = identifier as IIdentifier;
    }

    if (isVariable(attribute)) {
      this.variableNames[attribute as string] = "1";
      this.variableFields["1"] = attribute as string;
    } else if (isPlaceholder(attribute)) {
      this.placeholderFields["1"] = true;
    } else {
      this.constantFields["1"] = attribute as string;
    }

    if (isVariable(value)) {
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

  const results: TestAtJoinNode[] = [];

  // `variableNames` has no prototype, so we don't need this test.
  // tslint:disable-next-line:forin
  for (const variableName in variableNames) {
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
        TestAtJoinNode.create(fieldArg1, earlierCondition, fieldArg2),
      );
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
    bindings[c.bindingName] = f;
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
