import { parseCondition } from "./Condition";
import { AccumulatorCondition, IAccumulator } from "./nodes/AccumulatorNode";
import { IConditions } from "./Rete";
import { Token } from "./Token";

export function acc<T>(
  bindingName: string,
  accumulator: IAccumulator<T>,
  conditions?: IConditions,
): AccumulatorCondition<T> {
  const parsedConditions = conditions
    ? conditions.map(parseCondition)
    : undefined;
  return new AccumulatorCondition(bindingName, accumulator, parsedConditions);
}

export function count(bindingName: string, conditions?: IConditions) {
  return acc(
    bindingName,
    {
      reducer: (acc: number): number => {
        return acc + 1;
      },
      initialValue: 0,
    },
    conditions,
  );
}

export function max(bindingName: string, conditions?: IConditions) {
  return acc(
    bindingName,
    {
      reducer: (acc: number, item: Token): number => {
        const value = item.fact[2] as number;
        return value > acc ? value : acc;
      },
      initialValue: 0,
    },
    conditions,
  );
}
