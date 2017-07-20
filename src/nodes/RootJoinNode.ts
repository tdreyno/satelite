import { extractBindingsFromCondition } from "../Condition";
import { IFact } from "../Fact";
import { Rete } from "../Rete";
import { Token } from "../Token";
import { runLeftActivateOnNodes, runLeftRetractOnNodes } from "../util";
import { AlphaMemoryNode } from "./AlphaMemoryNode";
import { TestAtJoinNode } from "./JoinNode";
import { ReteNode } from "./ReteNode";

export class RootJoinNode extends ReteNode {
  static create(
    rete: Rete,
    parent: ReteNode,
    alphaMemory: AlphaMemoryNode,
    tests: TestAtJoinNode[],
  ) {
    for (let i = 0; i < parent.children.length; i++) {
      const sibling = parent.children[i];

      if (
        sibling instanceof RootJoinNode &&
        sibling.alphaMemory === alphaMemory &&
        sibling.tests === tests
      ) {
        return sibling;
      }
    }

    return new RootJoinNode(rete, parent, alphaMemory, tests);
  }

  alphaMemory: AlphaMemoryNode;
  tests: TestAtJoinNode[];

  constructor(
    rete: Rete,
    parent: ReteNode,
    alphaMemory: AlphaMemoryNode,
    tests: TestAtJoinNode[],
  ) {
    super(rete);

    this.parent = parent;
    this.alphaMemory = alphaMemory;
    this.tests = tests;

    this.parent.children.unshift(this);
    this.alphaMemory.successors.unshift(this);
  }

  rightActivate(f: IFact): void {
    this.log("rightActivate", f);

    const bindings = this.tests[0]
      ? extractBindingsFromCondition(this.tests[0].condition, f, {})
      : {};

    const t = Token.create(this, null, f, bindings);

    runLeftActivateOnNodes(this.children, t);
  }

  rightRetract(f: IFact): void {
    this.log("rightRetract", f);

    const bindings = this.tests[0]
      ? extractBindingsFromCondition(this.tests[0].condition, f, {})
      : {};

    const t = Token.create(this, null, f, bindings);

    runLeftRetractOnNodes(this.children, t);
  }

  leftActivate(t: Token): void {
    this.log("leftActivate", t);

    runLeftActivateOnNodes(this.children, t);
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
