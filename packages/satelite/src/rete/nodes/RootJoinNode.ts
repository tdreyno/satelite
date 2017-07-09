import { IFact } from "../Fact";
import { Token } from "../Token";
import { runLeftActivateOnNodes, runLeftRetractOnNodes } from "../util";
import { AlphaMemoryNode } from "./AlphaMemoryNode";
import { ReteNode } from "./ReteNode";

export class RootJoinNode extends ReteNode {
  static create(parent: ReteNode, alphaMemory: AlphaMemoryNode) {
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
}
