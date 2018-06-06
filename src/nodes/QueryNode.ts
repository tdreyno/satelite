import { IFact } from "../Fact";
import { Query } from "../Query";
import { Rete } from "../Rete";
import { compareTokensAndBindings, Token } from "../Token";
import { findInList, removeIndexFromList, replaceIndexFromList } from "../util";
import { ReteNode } from "./ReteNode";

export class QueryNode<Schema extends IFact> extends ReteNode<Schema> {
  static create<S extends IFact>(rete: Rete<S>, query: Query<S>) {
    return new QueryNode<S>(rete, query);
  }

  items: Array<Token<Schema>> = [];
  query: Query<Schema>;
  facts: any[] = [];

  constructor(rete: Rete<Schema>, query: Query<Schema>) {
    super(rete);

    this.query = query;
  }

  leftActivate(t: Token<Schema>): void {
    if (findInList(this.items, t, compareTokensAndBindings) !== -1) {
      return;
    }

    this.log("leftActivate", t);

    this.items.push(t);

    this.query.didChange();
  }

  leftUpdate(prev: Token<Schema>, t: Token<Schema>): void {
    const foundIndex = findInList(this.items, prev, compareTokensAndBindings);

    if (foundIndex === -1) {
      return;
    }

    this.log("leftUpdate", prev, t);

    replaceIndexFromList(this.items, foundIndex, t);

    this.query.didChange();
  }

  leftRetract(t: Token<Schema>): void {
    const foundIndex = findInList(this.items, t, compareTokensAndBindings);

    if (foundIndex === -1) {
      return;
    }

    this.log("leftRetract", t);

    removeIndexFromList(this.items, foundIndex);

    this.query.didChange();
  }
}
