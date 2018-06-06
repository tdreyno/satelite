import { IFact } from "../Fact";
import { Rete } from "../Rete";
import { compareTokens, Token } from "../Token";
import { findInList, removeIndexFromList, replaceIndexFromList } from "../util";
import { AccumulatorNode } from "./AccumulatorNode";
import { ReteNode } from "./ReteNode";

export class AccumulatedTailNode<Schema extends IFact> extends ReteNode<
  Schema
> {
  static create<S extends IFact>(
    rete: Rete<S>,
    parent: ReteNode<S>,
    accumulatorNode: AccumulatorNode<S>
  ): AccumulatedTailNode<S> {
    const node = new AccumulatedTailNode<S>(rete, parent, accumulatorNode);

    parent.children.unshift(node);

    node.updateNewNodeWithMatchesFromAbove();

    return node;
  }

  items: Array<Token<Schema>> = [];
  accumulatorNode: AccumulatorNode<Schema>;

  constructor(
    rete: Rete<Schema>,
    parent: ReteNode<Schema>,
    accumulatorNode: AccumulatorNode<Schema>
  ) {
    super(rete);

    this.parent = parent;
    this.accumulatorNode = accumulatorNode;
  }

  leftActivate(t: Token<Schema>): void {
    if (findInList(this.items, t, compareTokens) !== -1) {
      return;
    }

    this.log("leftActivate", t);

    this.items.push(t);

    this.accumulatorNode.rightActivateReduced(t);
  }

  leftUpdate(prev: Token<Schema>, t: Token<Schema>): void {
    const foundIndex = findInList(this.items, t, compareTokens);

    if (foundIndex === -1) {
      return;
    }

    this.log("leftUpdate", prev, t);

    replaceIndexFromList(this.items, foundIndex, t);

    this.accumulatorNode.rightUpdateReduced(prev, t);
  }

  leftRetract(t: Token<Schema>): void {
    const foundIndex = findInList(this.items, t, compareTokens);

    if (foundIndex === -1) {
      return;
    }

    this.log("leftActivate", t);

    removeIndexFromList(this.items, foundIndex);

    this.accumulatorNode.rightRetractReduced(t);
  }

  rerunForChild() {
    for (let i = 0; i < this.items.length; i++) {
      const token = this.items[i];
      this.accumulatorNode.rightActivateReduced(token);
    }
  }
}
