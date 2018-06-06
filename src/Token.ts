import isEqual = require("lodash/isEqual");
import { IFact } from "./Fact";
import { AccumulatorNode } from "./nodes/AccumulatorNode";
import { JoinNode } from "./nodes/JoinNode";
import { RootJoinNode } from "./nodes/RootJoinNode";

export interface IVariableBindings<Schema extends IFact> {
  [key: string]: any; // TODO, remove any

  thingy?: Schema;
}

let nextTokenId = 0;

export class Token<Schema extends IFact> {
  static create<S extends IFact>(
    node: RootJoinNode<S> | JoinNode<S> | AccumulatorNode<S>,
    parent: Token<S> | null,
    fact: S,
    bindings: IVariableBindings<S> = {}
  ) {
    const token = new Token<S>(node, parent, fact, bindings);

    if (parent) {
      parent.children.unshift(token);
    }

    return token;
  }

  readonly id: number = nextTokenId++;
  readonly parent: Token<Schema> | null;
  readonly fact: Schema;
  readonly bindings: IVariableBindings<Schema>;
  readonly node:
    | JoinNode<Schema>
    | RootJoinNode<Schema>
    | AccumulatorNode<Schema>;
  readonly children: Array<Token<Schema>> = [];

  constructor(
    node: RootJoinNode<Schema> | JoinNode<Schema> | AccumulatorNode<Schema>,
    parent: Token<Schema> | null,
    fact: Schema,
    bindings: IVariableBindings<Schema> = {}
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

export function compareTokens<Schema extends IFact>(
  t1: Token<Schema>,
  t2: Token<Schema>
): boolean {
  return t1.node === t2.node && t1.fact === t2.fact;
}

export function compareTokensAndBindings<Schema extends IFact>(
  t1: Token<Schema>,
  t2: Token<Schema>
): boolean {
  if (!compareTokens(t1, t2)) {
    return false;
  }

  return isEqual(t1.bindings, t2.bindings);
}

export function isParent<Schema extends IFact>(
  parent: Token<Schema>,
  child: Token<Schema>
): boolean {
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

export function findParent<Schema extends IFact>(
  parents: Array<Token<Schema>>,
  child: Token<Schema>
): Token<Schema> | undefined {
  for (let i = 0; i < parents.length; i++) {
    const parent = parents[i];

    if (isParent(parent, child)) {
      return parent;
    }
  }
}
