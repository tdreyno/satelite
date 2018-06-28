import isFunction = require("lodash/isFunction");
import isString = require("lodash/isString");
import map = require("lodash/map");
import lodashOrderBy = require("lodash/orderBy");
import pick = require("lodash/pick");
import {
  cleanVariableName,
  ICondition,
  IConstantTest,
  parseCondition,
  ParsedCondition
} from "./Condition";
import { IFact, IValue } from "./Fact";
import { IIdentifier, IPrimitive } from "./Identifier";
import { AccumulatorCondition, IAccumulator } from "./nodes/AccumulatorNode";
import { IConditions, placeholder as _ } from "./Rete";
import { IVariableBindings, Token } from "./Token";

export function identifier(fact: IFact) {
  return fact[0];
}

export function attribute(fact: IFact) {
  return fact[1];
}

export function value(fact: IFact) {
  return fact[2];
}

export function acc<T>(
  bindingName: string,
  accumulator: IAccumulator<T>,
  ...conditions: IConditions
): AccumulatorCondition<T> {
  const parsedConditions = map<any, ParsedCondition | AccumulatorCondition>(
    conditions,
    parseCondition
  );

  return new AccumulatorCondition(bindingName, accumulator, parsedConditions);
}

export function count(bindingName: string, ...conditions: IConditions) {
  return acc(
    bindingName,
    {
      reducer: (sum: number): number => {
        return sum + 1;
      },
      initialValue: 0
    },
    ...conditions
  );
}

export function max(bindingName: string, ...conditions: IConditions) {
  return acc(
    bindingName,
    {
      reducer: (sum: number | undefined, item: Token): number => {
        const v = item.fact[2] as number;

        if (typeof sum === "undefined") {
          return v;
        }

        return v > sum ? v : sum;
      },
      initialValue: undefined
    },
    ...conditions
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
      initialValue: undefined
    },
    ...conditions
  );
}

export function exists(bindingName: string, ...conditions: IConditions) {
  return acc(
    bindingName,
    {
      reducer: (): boolean => true,
      initialValue: false,
      tokenPerBindingMatch: true
    },
    ...conditions
  );
}

export type ICollectionMapperFn = (f: IFact, b: IVariableBindings) => any;
export function collect(
  bindingName: string,
  mapperAlias: string | ICollectionMapperFn,
  ...conditions: Array<ICondition | AccumulatorCondition>
): AccumulatorCondition;
export function collect(
  bindingName: string,
  ...conditions: Array<ICondition | AccumulatorCondition>
): AccumulatorCondition;
export function collect(
  bindingName: string,
  ...mapperFnOrConditions: Array<
    string | ICondition | AccumulatorCondition | ICollectionMapperFn
  >
): AccumulatorCondition {
  let mapperFn: ICollectionMapperFn = (f: IFact) => f;
  const firstVariadicArgument = mapperFnOrConditions[0];

  if (isString(firstVariadicArgument)) {
    const stringAlias: string = cleanVariableName(
      mapperFnOrConditions.shift() as any
    );

    // tslint:disable-next-line:variable-name
    mapperFn = (_f, b) => b[stringAlias];
  } else if (isFunction(firstVariadicArgument)) {
    mapperFn = mapperFnOrConditions.shift() as any;
  }

  // Whatever is left are conditions
  const conditions: Array<
    ICondition | AccumulatorCondition
  > = mapperFnOrConditions as any;

  return acc(
    bindingName,
    {
      reducer: (sum: any[], item: Token): any[] => {
        sum.push(mapperFn(item.fact, item.bindings));
        return sum;
      },
      initialValue: [] as any[],
      tokenPerBindingMatch: true
    },
    ...conditions
  );
}

export function collectBindings(
  bindingName: string,
  onlyKeys?: string[]
): AccumulatorCondition {
  return collect(
    bindingName,
    // tslint:disable-next-line:variable-name
    (_f, bindings) => (onlyKeys ? pick(bindings, onlyKeys) : bindings)
  );
}

export function sortBy(
  bindingName: string,
  dataKey: string,
  sortKeys: string[],
  orderKeys?: string[]
): AccumulatorCondition {
  const cleanKey = cleanVariableName(dataKey);

  return acc(bindingName, {
    // tslint:disable-next-line:variable-name
    reducer: (_sum: any[], item: Token): any[] => {
      return lodashOrderBy(item.bindings[cleanKey], sortKeys, orderKeys);
    },
    initialValue: [] as any[],
    tokenPerBindingMatch: true
  });
}

export interface IEntity {
  id: IPrimitive | IIdentifier | IConstantTest;
  [attribute: string]: IValue;
}

export function entity(
  bindingName: string,
  entityId: IPrimitive | IIdentifier | IConstantTest,
  options?: {
    renamerFn?: (key: string) => string;
    stripPrefix: boolean | string;
  }
) {
  // Default renamer is just "identity".
  let renamerFn = (k: string) => k;

  if (options) {
    if (options.renamerFn) {
      renamerFn = options.renamerFn;
    } else if (typeof options.stripPrefix !== "undefined") {
      if (isString(options.stripPrefix)) {
        renamerFn = (k: string) => k.replace(options.stripPrefix as string, "");
      } else if (options.stripPrefix === true) {
        renamerFn = (k: string) => {
          const parts = k.split("/");
          return parts[parts.length - 1];
        };
      }
    }
  }

  return acc(
    bindingName,
    {
      reducer: (sum: IEntity | undefined, item: Token): IEntity => {
        const f = item.fact;

        const result: IEntity = sum || { id: f[0] };

        const key = renamerFn(f[1]);
        result[key] = f[2];

        return result;
      },
      initialValue: undefined,
      tokenPerBindingMatch: true
    },
    [entityId, _, _]
  );
}
