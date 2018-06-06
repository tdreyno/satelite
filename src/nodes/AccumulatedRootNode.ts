import { IFact } from "../Fact";
import { Rete } from "../Rete";
import { compareTokens, Token } from "../Token";
import {
  findInList,
  removeIndexFromList,
  replaceIndexFromList,
  runLeftActivateOnNodes,
  runLeftRetractOnNodes,
  runLeftUpdateOnNodes
} from "../util";
import { ReteNode } from "./ReteNode";

export class AccumulatedRootNode<Schema extends IFact> extends ReteNode<
  Schema
> {
  static create<S extends IFact>(
    rete: Rete<S>,
    isIndependent: boolean
  ): AccumulatedRootNode<S> {
    return new AccumulatedRootNode<S>(rete, isIndependent);
  }

  items: Array<Token<Schema>> = [];
  isIndependent: boolean;

  constructor(rete: Rete<Schema>, isIndependent: boolean) {
    super(rete);

    this.isIndependent = isIndependent;
  }

  leftActivate(t: Token<Schema>): void {
    if (findInList(this.items, t, compareTokens) !== -1) {
      return;
    }

    this.log("leftActivate", t);

    this.items.push(t);

    runLeftActivateOnNodes(this.children, t);
  }

  leftUpdate(prev: Token<Schema>, t: Token<Schema>): void {
    const foundIndex = findInList(this.items, prev, compareTokens);

    if (foundIndex === -1) {
      return;
    }

    this.log("leftUpdate", prev, t);

    replaceIndexFromList(this.items, foundIndex, t);

    runLeftUpdateOnNodes(this.children, prev, t);
  }

  leftRetract(t: Token<Schema>): void {
    const foundIndex = findInList(this.items, t, compareTokens);

    if (foundIndex === -1) {
      return;
    }

    this.log("leftRetract", t);

    removeIndexFromList(this.items, foundIndex);

    runLeftRetractOnNodes(this.children, t);
  }

  rerunForChild(child: ReteNode<Schema>) {
    const tokens = this.items;

    const savedListOfChildren = this.children;
    this.children = [child];

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      runLeftActivateOnNodes(this.children, t);
    }

    this.children = savedListOfChildren;
  }
}
