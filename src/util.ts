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
  item: T,
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

export function runLeftActivateOnNodes(nodes: ReteNode[], t: Token): void {
  for (let i = 0; i < nodes.length; i++) {
    const child = nodes[i];
    child.leftActivate(t);
  }
}

export function runLeftUpdateOnNodes(
  nodes: ReteNode[],
  prev: Token,
  t: Token,
): void {
  if (compareTokensAndBindings(prev, t)) {
    return;
  }

  for (let i = 0; i < nodes.length; i++) {
    const child = nodes[i];
    child.leftUpdate(prev, t);
  }
}

export function runLeftRetractOnNodes(nodes: ReteNode[], t: Token): void {
  for (let i = 0; i < nodes.length; i++) {
    const child = nodes[i];
    child.leftRetract(t);
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

export function shallowDiffers(a: any, b: any): boolean {
  for (const i in a) {
    if (!(i in b)) {
      return true;
    }
  }

  for (const i in b) {
    if (a[i] !== b[i]) {
      return true;
    }
  }

  return false;
}

export function union<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...a, ...b]);
}

export function intersection<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...a].filter(x => b.has(x)));
}

export function difference<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...a].filter(x => !b.has(x)));
}
