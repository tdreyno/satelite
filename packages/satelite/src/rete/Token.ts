import { IFact } from "./Fact";
import { IBetaMemoryNode } from "./nodes/BetaMemoryNode";
import { INegatedConjunctiveConditionsNode } from "./nodes/NegatedConjunctiveConditionsNode";
import { INegatedConjunctiveConditionsPartnerNode } from "./nodes/NegatedConjunctiveConditionsPartnerNode";
import { INegativeJoinResult, INegativeNode } from "./nodes/NegativeNode";
import {
  addToListHead,
  IList,
  removeFromList,
  // runLeftActivationOnNode,
} from "./util";

export interface IToken {
  parent: IToken | null;
  fact: IFact | null;
  node:
    | IBetaMemoryNode
    | INegatedConjunctiveConditionsNode
    | INegatedConjunctiveConditionsPartnerNode
    | INegativeNode;
  children: IList<IToken>;

  // For Negated
  joinResults: IList<INegativeJoinResult>;

  // For NCC
  nccResults: IList<IToken>;
  owner: IToken | null;
}

export function makeToken(
  node:
    | IBetaMemoryNode
    | INegatedConjunctiveConditionsNode
    | INegatedConjunctiveConditionsPartnerNode
    | INegativeNode,
  parent: IToken | null,
  f: IFact | null,
): IToken {
  const t: IToken = Object.create(null);

  t.node = node;
  t.parent = parent;
  t.fact = f;
  t.children = null;

  t.joinResults = null;
  t.nccResults = null;
  t.owner = null;

  if (parent) {
    parent.children = addToListHead(parent.children, t);
  }

  if (f) {
    f.tokens = addToListHead(f.tokens, t);
  }

  return t;
}

export function compareTokens(t1: IToken, t2: IToken): boolean {
  return t1.fact === t2.fact;
}

export function deleteTokenAndDescendents(t: IToken): void {
  if (t.children) {
    for (const child of t.children) {
      deleteTokenAndDescendents(child);
    }
  }

  if (t.node.type !== "ncc-partner") {
    t.node.items = removeFromList(t.node.items, t);
  }

  if (t.fact) {
    t.fact.tokens = removeFromList(t.fact.tokens, t);
  }

  // Remove self from parent's children.
  if (t.parent) {
    t.parent.children = removeFromList(t.parent.children, t);
  }

  // if (t.node.type === "negative") {
  //   if (t.joinResults) {
  //     for (const jr of t.joinResults) {
  //       jr.fact.negativeJoinResults = removeFromList(
  //         jr.fact.negativeJoinResults,
  //         jr,
  //       );
  //     }
  //   }
  // } else if (t.node.type === "ncc") {
  //   if (t.nccResults) {
  //     for (const result of t.nccResults) {
  //       if (result.fact) {
  //         result.fact.tokens = removeFromList(result.fact.tokens, result);
  //       }

  //       result.parent.children = removeFromList(result.parent.children, result);
  //     }
  //   }
  // } else if (t.node.type === "ncc-partner") {
  //   if (t.owner) {
  //     t.owner.nccResults = removeFromList(t.owner.nccResults, t);

  //     if (!t.owner.nccResults && t.node.nccNode.children) {
  //       for (const child of t.node.nccNode.children) {
  //         runLeftActivationOnNode(child, t.owner, null);
  //       }
  //     }
  //   }
  // }
}

export function deleteDescendentsOfToken(t: IToken): void {
  if (t.children) {
    for (const child of t.children) {
      deleteTokenAndDescendents(child);
    }
  }
}
