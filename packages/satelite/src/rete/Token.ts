import { IFact } from "./Fact";
import { IJoinNode } from "./nodes/JoinNode";
import { IRootJoinNode } from "./nodes/RootJoinNode";
import { addToListHead, IList } from "./util";

export interface IToken {
  parent: IToken | null;
  fact: IFact;
  node: IJoinNode | IRootJoinNode;
  children: IList<IToken>;
}

export function makeToken(
  node: IRootJoinNode | IJoinNode,
  parent: IToken | null,
  f: IFact,
): IToken {
  const t: IToken = Object.create(null);

  t.node = node;
  t.parent = parent;
  t.fact = f;
  t.children = null;

  if (parent) {
    parent.children = addToListHead(parent.children, t);
  }

  return t;
}

export function compareTokens(t1: IToken, t2: IToken): boolean {
  return t1.fact === t2.fact;
}
