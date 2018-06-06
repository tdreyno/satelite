import { extractBindingsFromCondition } from "../Condition";
import { IFact } from "../Fact";
import { Rete } from "../Rete";
import { Token } from "../Token";
import {
  runLeftActivateOnNodes,
  runLeftRetractOnNodes,
  runLeftUpdateOnNodes
} from "../util";
import { AlphaMemoryNode } from "./AlphaMemoryNode";
import { TestAtJoinNode } from "./JoinNode";
import { ReteNode } from "./ReteNode";

export class RootJoinNode<Schema extends IFact> extends ReteNode<Schema> {
  static create<S extends IFact>(
    rete: Rete<S>,
    parent: ReteNode<S>,
    alphaMemory: AlphaMemoryNode<S>,
    tests: Array<TestAtJoinNode<S>>
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

  alphaMemory: AlphaMemoryNode<Schema>;
  tests: Array<TestAtJoinNode<Schema>>;

  constructor(
    rete: Rete<Schema>,
    parent: ReteNode<Schema>,
    alphaMemory: AlphaMemoryNode<Schema>,
    tests: Array<TestAtJoinNode<Schema>>
  ) {
    super(rete);

    this.parent = parent;
    this.alphaMemory = alphaMemory;
    this.tests = tests;

    this.parent.children.unshift(this);
    this.alphaMemory.successors.unshift(this);
  }

  rightActivate(f: Schema): void {
    this.log("rightActivate", f);

    const bindings = this.tests[0]
      ? extractBindingsFromCondition(this.tests[0].condition, f, {})
      : {};

    const t = Token.create(this, null, f, bindings);

    runLeftActivateOnNodes(this.children, t);
  }

  rightUpdate(prev: Schema, f: Schema): void {
    this.log("rightUpdate", prev, f);

    const bindingsPrev = this.tests[0]
      ? extractBindingsFromCondition(this.tests[0].condition, prev, {})
      : {};

    const tPrev = Token.create(this, null, prev, bindingsPrev);

    const bindings = this.tests[0]
      ? extractBindingsFromCondition(this.tests[0].condition, f, {})
      : {};
    const t = Token.create(this, null, f, bindings);

    // TODO: Should these be compared?

    runLeftUpdateOnNodes(this.children, tPrev, t);
  }

  rightRetract(f: Schema): void {
    this.log("rightRetract", f);

    const bindings = this.tests[0]
      ? extractBindingsFromCondition(this.tests[0].condition, f, {})
      : {};

    const t = Token.create(this, null, f, bindings);

    runLeftRetractOnNodes(this.children, t);
  }

  leftActivate(t: Token<Schema>): void {
    this.log("leftActivate", t);

    runLeftActivateOnNodes(this.children, t);
  }

  rerunForChild(child: ReteNode<Schema>) {
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
