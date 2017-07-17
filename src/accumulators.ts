import { IConstantTest, parseCondition } from "./Condition";
import { IValue } from "./Fact";
import { IIdentifier, IPrimitive } from "./Identifier";
import { AccumulatorCondition, IAccumulator } from "./nodes/AccumulatorNode";
import { IConditions, placeholder as _ } from "./Rete";
import { Token } from "./Token";

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
      reducer: (sum: number, item: Token): number => {
        const value = item.fact[2] as number;
        return value > sum ? value : sum;
      },
      initialValue: 0,
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

export function collect(bindingName: string, ...conditions: IConditions) {
  return acc(
    bindingName,
    {
      reducer: (sum: any[], item: Token): any[] => {
        sum.push(item.fact);
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
