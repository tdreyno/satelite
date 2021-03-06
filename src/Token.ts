import isEqual = require("lodash/isEqual");
import { IFact } from "./Fact";
import { AccumulatorNode } from "./nodes/AccumulatorNode";
import { ComparisonNode } from "./nodes/ComparisonNode";
import { JoinNode } from "./nodes/JoinNode";
import { RootJoinNode } from "./nodes/RootJoinNode";

export type ITokenValue = IFact;

export interface IVariableBindings {
  [variableName: string]: any;
}

let nextTokenId = 0;

export class Token {
  static create(
    node: RootJoinNode | JoinNode | AccumulatorNode | ComparisonNode,
    parent: Token | null,
    fact: ITokenValue,
    bindings: IVariableBindings = {}
  ) {
    const token = new Token(node, parent, fact, bindings);

    if (parent) {
      parent.children.unshift(token);
    }

    return token;
  }

  readonly id: number = nextTokenId++;
  readonly parent: Token | null;
  readonly fact: ITokenValue;
  readonly bindings: IVariableBindings;
  readonly node: JoinNode | RootJoinNode | AccumulatorNode | ComparisonNode;
  readonly children: Token[] = [];

  constructor(
    node: RootJoinNode | JoinNode | AccumulatorNode | ComparisonNode,
    parent: Token | null,
    fact: ITokenValue,
    bindings: IVariableBindings = {}
  ) {
    this.node = node;
    this.parent = parent;
    this.fact = fact;
    this.bindings = bindings;
  }

  toString(): string {
    return `<Token\n\t\tid=${this.id}\n\t\tfact=${JSON.stringify(
      this.fact
    )}\n\t\tbindings=${JSON.stringify(this.bindings)}>`;
  }
}

export function compareTokens(t1: Token, t2: Token): boolean {
  return t1.node === t2.node && t1.fact === t2.fact;
}

export function compareTokensAndBindings(t1: Token, t2: Token): boolean {
  if (!compareTokens(t1, t2)) {
    return false;
  }

  return isEqual(t1.bindings, t2.bindings);
}

export function isParent(parent: Token, child: Token): boolean {
  if (parent === child) {
    return true;
  }

  let p = child.parent;

  while (p) {
    if (p === parent) {
      return true;
    }

    p = p.parent;
  }
  return false;
}

export function findParent(parents: Token[], child: Token): Token | undefined {
  for (let i = 0; i < parents.length; i++) {
    const parent = parents[i];

    if (isParent(parent, child)) {
      return parent;
    }
  }
}
