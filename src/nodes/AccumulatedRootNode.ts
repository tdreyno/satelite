import { Rete } from "../Rete";
import { compareTokens, Token } from "../Token";
import {
  findInList,
  removeIndexFromList,
  runLeftActivateOnNodes,
  runLeftRetractOnNodes,
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
    const tokens = this.items;

    const savedListOfChildren = this.children;
    this.children = [child];

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      this.leftActivate(t);
    }

    this.children = savedListOfChildren;
  }
}
