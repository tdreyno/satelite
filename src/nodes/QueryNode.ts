import { Query } from "../Query";
import { compareTokensAndBindings, Token } from "../Token";
import { findInList, removeFromList, removeIndexFromList } from "../util";
import { ReteNode } from "./ReteNode";

export class QueryNode extends ReteNode {
  static create(query: Query) {
    return new QueryNode(query);
  }

  items: Token[] = [];
  query: Query;
  facts: any[] = [];

  constructor(query: Query) {
    super();
    this.query = query;
  }

  leftActivate(t: Token): void {
    if (findInList(this.items, t, compareTokensAndBindings) !== -1) {
      return;
    }

    this.items.unshift(t);
    this.facts.unshift(t.fact);

    this.query.didChange();
  }

  leftRetract(t: Token): void {
    const foundIndex = findInList(this.items, t, compareTokensAndBindings);

    if (foundIndex === -1) {
      return;
    }

    removeIndexFromList(this.items, foundIndex);
    removeFromList(this.facts, t.fact);

    this.query.didChange();
  }
}
