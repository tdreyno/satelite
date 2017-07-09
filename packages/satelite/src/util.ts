import { IFact } from "./Fact";
import { ReteNode } from "./nodes/ReteNode";
import { Token } from "./Token";

export function removeFromList<T>(list: T[], item: T): T[] {
  const i = list.indexOf(item);

  return removeIndexFromList(list, i);
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

export function runRightRetractOnNodes(nodes: ReteNode[], f: IFact): void {
  for (let i = 0; i < nodes.length; i++) {
    const child = nodes[i];
    child.rightRetract(f);
  }
}
