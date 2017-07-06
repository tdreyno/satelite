import { IFact } from "../Fact";
import { IQuery } from "../Query";
import { compareTokens, IToken } from "../Token";
import {
  addToListHead,
  findInList,
  IList,
  removeFromList,
  removeIndexFromList,
} from "../util";
import { IReteNode } from "./ReteNode";

export interface IQueryNode extends IReteNode {
  type: "query";
  items: IList<IToken>;
  query: IQuery;
  facts: IList<IFact>;
}

export function makeQueryNode(query: IQuery): IQueryNode {
  const node: IQueryNode = Object.create(null);

  node.type = "query";
  node.items = null;
  node.facts = null;
  node.query = query;

  return node;
}

export function queryNodeLeftActivate(node: IQueryNode, t: IToken): void {
  if (findInList(node.items, t, compareTokens) !== -1) {
    return;
  }

  node.items = addToListHead(node.items, t);
  node.facts = addToListHead(node.facts, t.fact);

  node.query.didChange();
}

export function queryNodeLeftRetract(node: IQueryNode, t: IToken): void {
  const foundIndex = findInList(node.items, t, compareTokens);

  if (foundIndex === -1) {
    return;
  }

  node.items = removeIndexFromList(node.items, foundIndex);
  node.facts = removeFromList(node.facts, t.fact);

  node.query.didChange();
}
