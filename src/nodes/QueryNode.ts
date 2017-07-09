import { IFact } from "../Fact";
import { Query } from "../Query";
import { compareTokens, Token } from "../Token";
import { findInList, removeFromList, removeIndexFromList } from "../util";
import { ReteNode } from "./ReteNode";

export class QueryNode extends ReteNode {
  static create(query: Query) {
    return new QueryNode(query);
  }

  type = "query";
  items: Token[] = [];
  query: Query;
  facts: IFact[] = [];

  constructor(query: Query) {
    super();
    this.query = query;
  }

  leftActivate(t: Token): void {
    if (findInList(this.items, t, compareTokens) !== -1) {
      return;
    }

    this.items.unshift(t);
    this.facts.unshift(t.fact);

    this.query.didChange();
  }

  leftRetract(t: Token): void {
    const foundIndex = findInList(this.items, t, compareTokens);

    if (foundIndex === -1) {
      return;
    }

    removeIndexFromList(this.items, foundIndex);
    removeFromList(this.facts, t.fact);

    this.query.didChange();
  }
}
