import { Rete } from "../Rete";
import { compareTokens, Token } from "../Token";
import { findInList, removeIndexFromList } from "../util";
import { AccumulatorNode } from "./AccumulatorNode";
import { ReteNode } from "./ReteNode";

export class AccumulatedTailNode extends ReteNode {
  static create(
    rete: Rete,
    parent: ReteNode,
    accumulatorNode: AccumulatorNode,
  ): AccumulatedTailNode {
    const node = new AccumulatedTailNode(rete, parent, accumulatorNode);

    parent.children.unshift(node);

    node.updateNewNodeWithMatchesFromAbove();

    return node;
  }

  items: Token[] = [];
  accumulatorNode: AccumulatorNode;

  constructor(rete: Rete, parent: ReteNode, accumulatorNode: AccumulatorNode) {
    super(rete);

    this.parent = parent;
    this.accumulatorNode = accumulatorNode;
  }

  leftActivate(t: Token): void {
    if (findInList(this.items, t, compareTokens) !== -1) {
      return;
    }

    this.log("leftActivate", t);

    this.items.push(t);

    this.accumulatorNode.rightActivateReduced(t);
  }

  leftRetract(t: Token): void {
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
