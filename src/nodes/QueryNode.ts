import { Query } from "../Query";
import { Rete } from "../Rete";
import { compareTokensAndBindings, Token } from "../Token";
import { findInList, removeIndexFromList, replaceIndexFromList } from "../util";
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

    this.query.didChange();
  }

  leftUpdate(prev: Token, t: Token): void {
    const foundIndex = findInList(this.items, prev, compareTokensAndBindings);

    if (foundIndex === -1) {
      return;
    }

    this.log("leftUpdate", prev, t);

    replaceIndexFromList(this.items, foundIndex, t);

    this.query.didChange();
  }

  leftRetract(t: Token): void {
    const foundIndex = findInList(this.items, t, compareTokensAndBindings);

    if (foundIndex === -1) {
      return;
    }

    this.log("leftRetract", t);

    removeIndexFromList(this.items, foundIndex);

    this.query.didChange();
  }
}
