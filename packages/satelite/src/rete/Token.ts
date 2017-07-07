import { IFact } from "./Fact";
// import { IPrimitive } from "./Identifier";
import { IJoinNode } from "./nodes/JoinNode";
import { IRootJoinNode } from "./nodes/RootJoinNode";
import { addToListHead, IList } from "./util";

export type ITokenValue = IFact; // | IPrimitive | object | any[];

export interface IVariableBindings {
  [variableName: string]: any;
}

export interface IToken {
  parent: IToken | null;
  fact: ITokenValue;
  bindings: IVariableBindings;
  node: IJoinNode | IRootJoinNode;
  children: IList<IToken>;
}

export function makeToken(
  node: IRootJoinNode | IJoinNode,
  parent: IToken | null,
  fact: ITokenValue,
  bindings: IVariableBindings = {},
): IToken {
  const t: IToken = Object.create(null);

  t.node = node;
  t.parent = parent;
  t.fact = fact;
  t.bindings = bindings;
  t.children = null;

  if (parent) {
    parent.children = addToListHead(parent.children, t);
  }

  return t;
}

export function compareTokens(t1: IToken, t2: IToken): boolean {
  return t1.node === t2.node && t1.fact === t2.fact;
}
