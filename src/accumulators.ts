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

export function acc<Schema extends IFact, T>(
  bindingName: string,
  accumulator: IAccumulator<Schema, T>,
  ...conditions: IConditions<Schema>
): AccumulatorCondition<Schema, T> {
  const parsedConditions = map<
    any,
    ParsedCondition<Schema> | AccumulatorCondition<Schema>
  >(conditions, parseCondition);

  return new AccumulatorCondition(bindingName, accumulator, parsedConditions);
}

export function count<Schema extends IFact>(
  bindingName: string,
  ...conditions: IConditions<Schema>
) {
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

export function max<Schema extends IFact>(
  bindingName: string,
  ...conditions: IConditions<Schema>
) {
  return acc(
    bindingName,
    {
      reducer: (sum: number | undefined, item: Token<Schema>): number => {
        const value = item.fact[2] as number;

        if (typeof sum === "undefined") {
          return value;
        }

        return value > sum ? value : sum;
      },
      initialValue: undefined
    },
    ...conditions
  );
}

export function min<Schema extends IFact>(
  bindingName: string,
  ...conditions: IConditions<Schema>
) {
  return acc(
    bindingName,
    {
      reducer: (sum: number | undefined, item: Token<Schema>): number => {
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

export function exists<Schema extends IFact>(
  bindingName: string,
  ...conditions: IConditions<Schema>
) {
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

export type ICollectionMapperFn<Schema extends IFact> = (
  f: Schema,
  b: IVariableBindings<Schema>
) => any;
export function collect<Schema extends IFact>(
  bindingName: string,
  mapperAlias: string | ICollectionMapperFn<Schema>,
  ...conditions: Array<ICondition<Schema> | AccumulatorCondition<Schema>>
): AccumulatorCondition<Schema>;
export function collect<Schema extends IFact>(
  bindingName: string,
  ...conditions: Array<ICondition<Schema> | AccumulatorCondition<Schema>>
): AccumulatorCondition<Schema>;
export function collect<Schema extends IFact>(
  bindingName: string,
  ...mapperFnOrConditions: Array<
    | string
    | ICondition<Schema>
    | AccumulatorCondition<Schema>
    | ICollectionMapperFn<Schema>
  >
): AccumulatorCondition<Schema> {
  let mapperFn: ICollectionMapperFn<Schema> = (f: Schema) => f;
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
    ICondition<Schema> | AccumulatorCondition<Schema>
  > = mapperFnOrConditions as any;

  return acc(
    bindingName,
    {
      reducer: (sum: any[], item: Token<Schema>): any[] => {
        sum.push(mapperFn(item.fact, item.bindings));
        return sum;
      },
      initialValue: [] as any[],
      tokenPerBindingMatch: true
    },
    ...conditions
  );
}

export function collectBindings<Schema extends IFact>(
  bindingName: string,
  onlyKeys?: string[]
): AccumulatorCondition<Schema> {
  return collect(
    bindingName,
    // tslint:disable-next-line:variable-name
    (_f, bindings) => (onlyKeys ? pick(bindings, onlyKeys) : bindings)
  );
}

export function sortBy<Schema extends IFact>(
  bindingName: string,
  dataKey: string,
  sortKeys: string[],
  orderKeys?: string[]
): AccumulatorCondition<Schema> {
  const cleanKey = cleanVariableName(dataKey);

  return acc(bindingName, {
    // tslint:disable-next-line:variable-name
    reducer: (_sum: any[], item: Token<Schema>): any[] => {
      return lodashOrderBy(item.bindings[cleanKey] as any, sortKeys, orderKeys);
    },
    initialValue: [] as any[],
    tokenPerBindingMatch: true
  });
}

export interface IEntity {
  id: IPrimitive | IIdentifier | IConstantTest;
  [attribute: string]: IValue;
}

export function entity<Schema extends IFact>(
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
      reducer: (sum: IEntity | undefined, item: Token<Schema>): IEntity => {
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
