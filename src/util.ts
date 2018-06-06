import { IFact } from "./Fact";
import { ReteNode } from "./nodes/ReteNode";
import { compareTokensAndBindings, Token } from "./Token";

export function removeFromList<T>(list: T[], item: T): T[] {
  const i = list.indexOf(item);

  return removeIndexFromList(list, i);
}

export function replaceInList<T>(list: T[], itemA: T, itemB: T): T[] {
  const i = list.indexOf(itemA);

  return replaceIndexFromList(list, i, itemB);
}

export function replaceIndexFromList<T>(
  list: T[],
  index: number,
  item: T
): T[] {
  list[index] = item;

  return list;
}

export function removeIndexFromList<T>(list: T[], index: number): T[] {
  if (index !== -1) {
    list.splice(index, 1);
  }

  return list;
}

export function findInList<T, K>(
  list: T[],
  item: K,
  comparator: (a: T, b: K) => boolean
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
  initialValue: V
): V {
  let currentValue = initialValue;

  for (let i = 0; i < list.length; i++) {
    currentValue = reducer(currentValue, list[i]);
  }

  return currentValue;
}

export function runLeftActivateOnNodes<Schema extends IFact>(
  nodes: Array<ReteNode<Schema>>,
  t: Token<Schema>
): void {
  for (let i = 0; i < nodes.length; i++) {
    const child = nodes[i];
    child.leftActivate(t);
  }
}

export function runLeftUpdateOnNodes<Schema extends IFact>(
  nodes: Array<ReteNode<Schema>>,
  prev: Token<Schema>,
  t: Token<Schema>
): void {
  if (compareTokensAndBindings(prev, t)) {
    return;
  }

  for (let i = 0; i < nodes.length; i++) {
    const child = nodes[i];
    child.leftUpdate(prev, t);
  }
}

export function runLeftRetractOnNodes<Schema extends IFact>(
  nodes: Array<ReteNode<Schema>>,
  t: Token<Schema>
): void {
  for (let i = 0; i < nodes.length; i++) {
    const child = nodes[i];
    child.leftRetract(t);
  }
}

export function runRightActivateOnNodes<Schema extends IFact>(
  nodes: Array<ReteNode<Schema>>,
  f: Schema
): void {
  for (let i = 0; i < nodes.length; i++) {
    const child = nodes[i];
    child.rightActivate(f);
  }
}

export function runRightUpdateOnNodes<Schema extends IFact>(
  nodes: Array<ReteNode<Schema>>,
  prev: Schema,
  f: Schema
): void {
  for (let i = 0; i < nodes.length; i++) {
    const child = nodes[i];
    child.rightUpdate(prev, f);
  }
}

export function runRightRetractOnNodes<Schema extends IFact>(
  nodes: Array<ReteNode<Schema>>,
  f: Schema
): void {
  for (let i = 0; i < nodes.length; i++) {
    const child = nodes[i];
    child.rightRetract(f);
  }
}
