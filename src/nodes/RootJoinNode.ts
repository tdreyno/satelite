import { IFact } from "../Fact";
import { Token } from "../Token";
import { runLeftActivateOnNodes, runLeftRetractOnNodes } from "../util";
import { AlphaMemoryNode } from "./AlphaMemoryNode";
import { ReteNode } from "./ReteNode";

export class RootJoinNode extends ReteNode {
  static create(parent: ReteNode, alphaMemory: AlphaMemoryNode) {
    for (let i = 0; i < parent.children.length; i++) {
      const sibling = parent.children[i];

      if (
        sibling instanceof RootJoinNode &&
        sibling.alphaMemory === alphaMemory
      ) {
        return sibling;
      }
    }

    return new RootJoinNode(parent, alphaMemory);
  }

  type = "root-join";
  alphaMemory: AlphaMemoryNode;

  constructor(parent: ReteNode, alphaMemory: AlphaMemoryNode) {
    super();

    this.parent = parent;
    this.alphaMemory = alphaMemory;

    this.parent.children.unshift(this);
    this.alphaMemory.successors.unshift(this);
  }

  rightActivate(f: IFact): void {
    const t = Token.create(this, null, f);
    runLeftActivateOnNodes(this.children, t);
  }

  rightRetract(f: IFact): void {
    const t = Token.create(this, null, f);
    runLeftRetractOnNodes(this.children, t);
  }

  rerunForChild(child: ReteNode) {
    const facts = this.alphaMemory.facts;

    const savedListOfChildren = this.children;
    this.children = [child];

    for (let i = 0; i < facts.length; i++) {
      const fact = facts[i];
      this.rightActivate(fact);
    }

    this.children = savedListOfChildren;
  }
}
