import { Query } from "../Query";
import { Rete } from "../Rete";
import { compareTokensAndBindings, Token } from "../Token";
import {
  findInList,
  removeFromList,
  removeIndexFromList,
  replaceIndexFromList,
  replaceInList,
} from "../util";
import { ReteNode } from "./ReteNode";

export class QueryNode extends ReteNode {
  static create(rete: Rete, query: Query) {
    return new QueryNode(rete, query);
  }

  items: Token[] = [];
  query: Query;
  facts: any[] = [];

  constructor(rete: Rete, query: Query) {
    super(rete);

    this.query = query;
  }

  leftActivate(t: Token): void {
    if (findInList(this.items, t, compareTokensAndBindings) !== -1) {
      return;
    }

    this.log("leftActivate", t);

    this.addToken(t);

    this.query.didChange();
  }

  leftUpdate(prev: Token, t: Token): void {
    const foundIndex = findInList(this.items, prev, compareTokensAndBindings);

    if (foundIndex === -1) {
      return;
    }

    this.log("leftUpdate", prev, t);

    this.replaceToken(prev, t, foundIndex);

    this.query.didChange();
  }

  leftRetract(t: Token): void {
    const foundIndex = findInList(this.items, t, compareTokensAndBindings);

    if (foundIndex === -1) {
      return;
    }

    this.log("leftRetract", t);

    this.removeToken(t, foundIndex);

    this.query.didChange();
  }

  private addToken(t: Token) {
    this.items.push(t);
    this.facts.push(t.fact);
  }

  private replaceToken(prev: Token, t: Token, foundIndex: number) {
    replaceIndexFromList(this.items, foundIndex, t);
    replaceInList(this.facts, prev.fact, t.fact);
  }

  private removeToken(t: Token, foundIndex: number) {
    removeIndexFromList(this.items, foundIndex);

    removeFromList(this.facts, t.fact);
  }
}
