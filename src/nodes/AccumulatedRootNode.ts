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

export class AccumulatedRootNode extends ReteNode {
  static create(rete: Rete, isIndependent: boolean): AccumulatedRootNode {
    return new AccumulatedRootNode(rete, isIndependent);
  }

  items: Token[] = [];
  isIndependent: boolean;

  constructor(rete: Rete, isIndependent: boolean) {
    super(rete);

    this.isIndependent = isIndependent;
  }

  leftActivate(t: Token): void {
    if (findInList(this.items, t, compareTokens) !== -1) {
      return;
    }

    this.log("leftActivate", t);

    this.items.push(t);

    runLeftActivateOnNodes(this.children, t);
  }

  leftUpdate(prev: Token, t: Token): void {
    const foundIndex = findInList(this.items, prev, compareTokens);

    if (foundIndex === -1) {
      return;
    }

    this.log("leftUpdate", prev, t);

    replaceIndexFromList(this.items, foundIndex, t);

    runLeftUpdateOnNodes(this.children, prev, t);
  }

  leftRetract(t: Token): void {
    const foundIndex = findInList(this.items, t, compareTokens);

    if (foundIndex === -1) {
      return;
    }

    this.log("leftRetract", t);

    removeIndexFromList(this.items, foundIndex);

    runLeftRetractOnNodes(this.children, t);
  }

  rerunForChild(child: ReteNode) {
    for (let i = 0; i < this.items.length; i++) {
      runLeftActivateOnNodes([child], this.items[i]);
    }
  }
}
