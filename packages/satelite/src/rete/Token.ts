import { IFact } from "./Fact";
import { IBetaMemoryNode } from "./nodes/BetaMemoryNode";
import { IDummyNode } from "./nodes/DummyNode";
import { INegatedConjunctiveConditionsNode } from "./nodes/NegatedConjunctiveConditionsNode";
import { INegatedConjunctiveConditionsPartnerNode } from "./nodes/NegatedConjunctiveConditionsPartnerNode";
import { INegativeJoinResult, INegativeNode } from "./nodes/NegativeNode";
import {
  addToListHead,
  IList,
  removeFromList,
  runLeftActivationOnNode,
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
    | IDummyNode
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
    for (let i = 0; i < t.children.length; i++) {
      const child = t.children[i];
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

  if (t.node.type === "negative") {
    if (t.joinResults) {
      for (let i = 0; i < t.joinResults.length; i++) {
        const jr = t.joinResults[i];
        jr.fact.negativeJoinResults = removeFromList(
          jr.fact.negativeJoinResults,
          jr,
        );
      }
    }
  } else if (t.node.type === "ncc") {
    if (t.nccResults) {
      for (let i = 0; i < t.nccResults.length; i++) {
        const result = t.nccResults[i];
        if (result.fact) {
          result.fact.tokens = removeFromList(result.fact.tokens, result);
        }

        if (result.parent) {
          result.parent.children = removeFromList(
            result.parent.children,
            result,
          );
        }
      }
    }
  } else if (t.node.type === "ncc-partner") {
    if (t.owner) {
      t.owner.nccResults = removeFromList(t.owner.nccResults, t);

      if (!t.owner.nccResults && t.node.nccNode.children) {
        for (let i = 0; i < t.node.nccNode.children.length; i++) {
          const child = t.node.nccNode.children[i];
          runLeftActivationOnNode(child, t.owner, null);
        }
      }
    }
  }
}

export function deleteDescendentsOfToken(t: IToken): void {
  if (t.children) {
    for (let i = 0; i < t.children.length; i++) {
      const child = t.children[i];
      deleteTokenAndDescendents(child);
    }
  }
}
