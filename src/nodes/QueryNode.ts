import { Query } from "../Query";
import { Rete } from "../Rete";
import { compareTokensAndBindings, Token } from "../Token";
import { findInList, removeFromList, removeIndexFromList } from "../util";
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

    this.items.push(t);
    this.facts.push(t.fact);

    this.query.didChange();
  }

  leftRetract(t: Token): void {
    const foundIndex = findInList(this.items, t, compareTokensAndBindings);

    if (foundIndex === -1) {
      return;
    }

    this.log("leftRetract", t);

    removeIndexFromList(this.items, foundIndex);
    removeFromList(this.facts, t.fact);

    this.query.didChange();
  }
}
