import { isFunction, isString } from "lodash";
import { cleanVariableName, IConstantTest, parseCondition } from "./Condition";
import { IFact, IValue } from "./Fact";
import { IIdentifier, IPrimitive } from "./Identifier";
import { AccumulatorCondition, IAccumulator } from "./nodes/AccumulatorNode";
import { IAnyCondition, IConditions, placeholder as _ } from "./Rete";
import { IVariableBindings, Token } from "./Token";

export function acc<T>(
  bindingName: string,
  accumulator: IAccumulator<T>,
  ...conditions: IConditions,
): AccumulatorCondition<T> {
  const parsedConditions = conditions.map(parseCondition);
  return new AccumulatorCondition(bindingName, accumulator, parsedConditions);
}

export function count(bindingName: string, ...conditions: IConditions) {
  return acc(
    bindingName,
    {
      reducer: (sum: number): number => {
        return sum + 1;
      },
      initialValue: 0,
    },
    ...conditions,
  );
}

export function max(bindingName: string, ...conditions: IConditions) {
  return acc(
    bindingName,
    {
      reducer: (sum: number | undefined, item: Token): number => {
        const value = item.fact[2] as number;

        if (typeof sum === "undefined") {
          return value;
        }

        return value > sum ? value : sum;
      },
      initialValue: undefined,
    },
    ...conditions,
  );
}

export function min(bindingName: string, ...conditions: IConditions) {
  return acc(
    bindingName,
    {
      reducer: (sum: number | undefined, item: Token): number => {
        const value = item.fact[2] as number;

        if (typeof sum === "undefined") {
          return value;
        }

        return value < sum ? value : sum;
      },
      initialValue: undefined,
    },
    ...conditions,
  );
}

export function exists(bindingName: string, ...conditions: IConditions) {
  return acc(
    bindingName,
    {
      // tslint:disable-next-line:variable-name
      reducer: (_acc: boolean): boolean => true,
      initialValue: false,
      tokenPerBindingMatch: true,
    },
    ...conditions,
  );
}

export type ICollectionMapperFn = (f: IFact, b: IVariableBindings) => any;
export function collect(
  bindingName: string,
  mapperAlias: string | ICollectionMapperFn,
  ...conditions: IAnyCondition[],
): AccumulatorCondition;
export function collect(
  bindingName: string,
  ...conditions: IAnyCondition[],
): AccumulatorCondition;
export function collect(
  bindingName: string,
  ...mapperFnOrConditions: Array<string | IAnyCondition | ICollectionMapperFn>,
): AccumulatorCondition {
  let mapperFn: ICollectionMapperFn = (f: IFact) => f;
  const firstVariadicArgument = mapperFnOrConditions[0];

  if (isString(firstVariadicArgument)) {
    const stringAlias: string = cleanVariableName(
      mapperFnOrConditions.shift() as any,
    );

    // tslint:disable-next-line:variable-name
    mapperFn = (_f, b) => b[stringAlias];
  } else if (isFunction(firstVariadicArgument)) {
    mapperFn = mapperFnOrConditions.shift() as any;
  }

  // Whatever is left are conditions
  const conditions: IAnyCondition[] = mapperFnOrConditions as any;

  return acc(
    bindingName,
    {
      reducer: (sum: any[], item: Token): any[] => {
        sum.push(mapperFn(item.fact, item.bindings));
        return sum;
      },
      initialValue: [] as any[],
    },
    ...conditions,
  );
}

export interface IEntity {
  id: IPrimitive | IIdentifier | IConstantTest;
  attributes: {
    [attribute: string]: IValue;
  };
}

export function entity(
  bindingName: string,
  entityId: IPrimitive | IIdentifier | IConstantTest,
) {
  return acc(
    bindingName,
    {
      reducer: (sum: IEntity | undefined, item: Token): IEntity => {
        const f = item.fact;

        const result: IEntity = sum || { id: item.fact[0], attributes: {} };

        result.attributes[f[1]] = f[2];

        return result;
      },
      initialValue: undefined,
      tokenPerBindingMatch: true,
    },
    [entityId, _, _],
  );
}
