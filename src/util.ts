import { isLeft } from "fp-ts/lib/Either";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import { flowRight } from "lodash";
import { IFact } from "./Fact";
import { ReteNode } from "./nodes/ReteNode";
import { compareTokensAndBindings, Token } from "./Token";

// tslint:disable:ban-types

export function assert(truthy: boolean, message?: string) {
  if (!truthy) {
    throw new Error(message || "Assertion Failed");
  }
}

export function validate<T>(value: any, type: t.Type<T>, location?: string): T {
  const validation = t.validate<T>(value, type);

  if (isLeft(validation)) {
    let message = PathReporter.report(validation).join("\n");

    if (location) {
      message = `${location}: ${message}`;
    }

    throw new Error(message);
  }

  return value as T;
}

export function contract<
  P extends Array<t.Type<any>>,
  R extends t.Type<any>,
  F extends Function
>(parameters: P, returnValue: R, fn: F): F {
  // tslint:disable-next-line:only-arrow-functions
  return function(...args: any[]) {
    if (args.length !== parameters.length) {
      throw new Error(
        `Incorrect number of parameters sent to function. Expected ${parameters.length}, got ${args.length}.`,
      );
    }

    for (let i = 0; i < parameters.length; i++) {
      validate(args[i], parameters[i], `Parameter ${i}`);
    }

    const result = fn(...args);

    validate(result, returnValue, "Return Value");

    return result;
  } as any;
}

export const removeFromList = <T>(list: T[], item: T): T[] => {
  const i = list.indexOf(item);

  return removeIndexFromList(list, i);
};

export function replaceInList<T>(list: T[], itemA: T, itemB: T): T[] {
  const i = list.indexOf(itemA);

  return replaceIndexFromList(list, i, itemB);
}

export function pre(checker: (args: any[]) => any) {
  return <F extends Function>(fn: F): F => {
    return ((...args: any[]) => {
      checker(args);
      return fn(...args);
    }) as any;
  };
}

export function post(checker: (returnValue: any, args: any[]) => any) {
  return <F extends Function>(fn: F): F => {
    return ((...args: any[]) => {
      const result = fn(...args);

      checker(result, args);

      return result;
    }) as any;
  };
}

export const conditions = flowRight;

export function replaceIndexFromList<T>(
  list: T[],
  index: number,
  item: T,
): T[] {
  list[index] = item;

  return list;
}

const replaceIndexFromList2 = conditions(
  pre(([list, index]) => assert(list[index] !== typeof undefined)),
  post((v, [list]) => assert(v.length === list.length)),
)(replaceIndexFromList);

replaceIndexFromList2([1, 2, 3], 2);

export function removeIndexFromList<T>(list: T[], index: number): T[] {
  if (index !== -1) {
    list.splice(index, 1);
  }

  return list;
}

export function findInList<T, K>(
  list: T[],
  item: K,
  comparator: (a: T, b: K) => boolean,
): number {
  for (let i = 0; i < list.length; i++) {
    if (comparator(list[i], item)) {
      return i;
    }
  }

  return -1;
}

export function reduceList<T, V>(
  list: T[],
  reducer: (acc: V, i: T) => V,
  initialValue: V,
): V {
  let currentValue = initialValue;

  for (let i = 0; i < list.length; i++) {
    currentValue = reducer(currentValue, list[i]);
  }

  return currentValue;
}

export function runLeftActivateOnNodes(nodes: ReteNode[], token: Token): void {
  for (let i = 0; i < nodes.length; i++) {
    const child = nodes[i];
    child.leftActivate(token);
  }
}

export function runLeftUpdateOnNodes(
  nodes: ReteNode[],
  prev: Token,
  token: Token,
): void {
  if (compareTokensAndBindings(prev, token)) {
    return;
  }

  for (let i = 0; i < nodes.length; i++) {
    const child = nodes[i];
    child.leftUpdate(prev, token);
  }
}

export function runLeftRetractOnNodes(nodes: ReteNode[], token: Token): void {
  for (let i = 0; i < nodes.length; i++) {
    const child = nodes[i];
    child.leftRetract(token);
  }
}

export function runRightActivateOnNodes(nodes: ReteNode[], f: IFact): void {
  for (let i = 0; i < nodes.length; i++) {
    const child = nodes[i];
    child.rightActivate(f);
  }
}

export function runRightUpdateOnNodes(
  nodes: ReteNode[],
  prev: IFact,
  f: IFact,
): void {
  for (let i = 0; i < nodes.length; i++) {
    const child = nodes[i];
    child.rightUpdate(prev, f);
  }
}

export function runRightRetractOnNodes(nodes: ReteNode[], f: IFact): void {
  for (let i = 0; i < nodes.length; i++) {
    const child = nodes[i];
    child.rightRetract(f);
  }
}
