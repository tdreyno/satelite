import { IFact, IFactFields } from "./Fact";
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

export function addToListHead<T>(list: T[] | null, item: T): T[] {
  list = list || [];
  list.unshift(item);
  return list;
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
