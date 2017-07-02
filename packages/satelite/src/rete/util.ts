import { ICondition } from "./Condition";
import { IFact, IFactFields } from "./Fact";
import { IAlphaMemoryNode } from "./nodes/AlphaMemoryNode";
import {
  betaMemoryNodeLeftActivation,
  IBetaMemoryNode,
} from "./nodes/BetaMemoryNode";
import {
  IJoinNode,
  joinNodeLeftActivation,
  joinNodeRightActivation,
} from "./nodes/JoinNode";
import {
  INegatedConjunctiveConditionsNode,
  negatedConjunctiveConditionsNodeLeftActivation,
} from "./nodes/NegatedConjunctiveConditionsNode";
import {
  INegatedConjunctiveConditionsPartnerNode,
  negatedConjunctiveConditionsPartnerNodeLeftActivation,
} from "./nodes/NegatedConjunctiveConditionsPartnerNode";
import {
  INegativeNode,
  negativeNodeLeftActivation,
  negativeNodeRightActivation,
} from "./nodes/NegativeNode";
import { IReteNode } from "./nodes/ReteNode";
import { IToken } from "./Token";

export type IList<T> = T[] | null;

export function addToListHead<T>(list: IList<T> | null, item: T): T[] {
  list = list || [];
  list.unshift(item);
  return list;
}

export function findList<T>(
  fn: (item: T) => boolean,
  list: IList<T>,
): T | undefined {
  if (!list) {
    return undefined;
  }

  return list.find(fn);
}

export function mapList<T, V>(
  fn: (item: T, i: number) => V,
  list: IList<T>,
): IList<V> {
  if (!list) {
    return null;
  }

  return list.map(fn);
}

export function forEachList<T>(
  fn: (item: T, i: number) => any,
  list: IList<T>,
): void {
  if (!list) {
    return;
  }

  return list.forEach(fn);
}

export function removeFromList<T>(list: T[] | null, item: T): T[] | null {
  if (!list) {
    return null;
  }

  const i = list.indexOf(item);

  if (i !== -1) {
    list.splice(i);
  }

  return list;
}

export function runLeftActivationOnNode(
  node: IReteNode,
  t: IToken,
  f: IFact | null,
): void {
  switch (node.type) {
    case "beta-memory":
      return betaMemoryNodeLeftActivation(node as IBetaMemoryNode, t, f);
    case "join":
      return joinNodeLeftActivation(node as IJoinNode, t);
    case "negative":
      return negativeNodeLeftActivation(node as INegativeNode, t, f);
    case "ncc":
      return negatedConjunctiveConditionsNodeLeftActivation(
        node as INegatedConjunctiveConditionsNode,
        t,
        f,
      );
    case "ncc-partner":
      return negatedConjunctiveConditionsPartnerNodeLeftActivation(
        node as INegatedConjunctiveConditionsPartnerNode,
        t,
        f,
      );
  }
}

export function runRightActivationOnNode(node: IReteNode, f: IFact) {
  switch (node.type) {
    case "join":
      return joinNodeRightActivation(node as IJoinNode, f);
    case "negative":
      return negativeNodeRightActivation(node as INegativeNode, f);
  }
}

export function updateNewNodeWithMatchesFromAbove(newNode: IReteNode): void {
  const parent = newNode.parent;

  if (!parent) {
    return;
  }

  switch (parent.type) {
    case "beta-memory":
      forEachList(
        t => runLeftActivationOnNode(newNode, t, null),
        (parent as IBetaMemoryNode).items,
      );

      break;

    case "join":
      const savedListOfChildren = parent.children;
      parent.children = [newNode];

      forEachList(
        i => runRightActivationOnNode(parent, i.fact),
        (parent as IJoinNode).alphaMemory.items,
      );

      parent.children = savedListOfChildren;

      break;

    case "negative":
      forEachList(
        t => t.joinResults && runLeftActivationOnNode(newNode, t, null),
        (parent as INegativeNode).items,
      );

      break;

    case "ncc":
      forEachList(
        t => t.nccResults && runLeftActivationOnNode(newNode, t, null),
        (parent as INegatedConjunctiveConditionsNode).items,
      );

      break;
  }
}

export function getFactField<T extends { [P in IFactFields]?: any }>(
  f: T,
  field: IFactFields,
): any {
  switch (field) {
    case "identifier":
      return f.identifier;
    case "attribute":
      return f.attribute;
    case "value":
      return f.value;
  }
}

export function getConditionField(f: ICondition, field: IFactFields): any {
  switch (field) {
    case "identifier":
      return f[0];
    case "attribute":
      return f[1];
    case "value":
      return f[2];
  }
}

export function setFactField<T extends { [P in IFactFields]?: any }>(
  f: T,
  field: IFactFields,
  v: any,
): T {
  switch (field) {
    case "identifier":
      f.identifier = v;
      break;
    case "attribute":
      f.attribute = v;
      break;
    case "value":
      f.value = v;
      break;
  }

  return f;
}

export function findNearestAncestorWithSameAlphaMemory(
  node: IReteNode,
  alphaMemory: IAlphaMemoryNode,
): IReteNode | undefined {
  switch (node.type) {
    case "dummy":
      return;

    case "join":
      if ((node as IJoinNode).alphaMemory === alphaMemory) {
        return node;
      }
      break;

    case "negative":
      if ((node as INegativeNode).alphaMemory === alphaMemory) {
        return node;
      }
      break;

    case "ncc":
      const nccParent = (node as INegatedConjunctiveConditionsNode).partner
        .parent;
      return nccParent
        ? findNearestAncestorWithSameAlphaMemory(nccParent, alphaMemory)
        : undefined;

    default:
      const parent = node.parent;
      return parent
        ? findNearestAncestorWithSameAlphaMemory(parent, alphaMemory)
        : undefined;
  }
}
