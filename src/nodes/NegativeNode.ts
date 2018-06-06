import { IFact } from "../Fact";
import { Rete } from "../Rete";
import { compareTokens, Token } from "../Token";
import {
  findInList,
  removeIndexFromList,
  runLeftActivateOnNodes,
  runLeftRetractOnNodes
} from "../util";
import { AlphaMemoryNode } from "./AlphaMemoryNode";
import { performJoinTests, sameTests, TestAtJoinNode } from "./JoinNode";
import { ReteNode } from "./ReteNode";

export class NegativeNode<Schema extends IFact> extends ReteNode<Schema> {
  static create<S extends IFact>(
    rete: Rete<S>,
    parent: ReteNode<S>,
    alphaMemory: AlphaMemoryNode<S>,
    tests: Array<TestAtJoinNode<S>>
  ): NegativeNode<S> {
    for (let i = 0; i < parent.children.length; i++) {
      const sibling = parent.children[i];

      if (
        sibling instanceof NegativeNode &&
        sibling.alphaMemory === alphaMemory
      ) {
        if (sameTests(sibling.tests, tests)) {
          return sibling;
        }
      }
    }

    const node = new NegativeNode<S>(rete, parent, alphaMemory, tests);

    parent.children.unshift(node);
    alphaMemory.successors.unshift(node);

    node.updateNewNodeWithMatchesFromAbove();

    return node;
  }

  items: Array<Token<Schema>> = [];
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
  }

  leftActivate(t: Token<Schema>): void {
    if (findInList(this.items, t, compareTokens) !== -1) {
      return;
    }

    this.log("leftActivate", t);

    this.items.push(t);

    this.executeLeft(t, runLeftActivateOnNodes);
  }

  leftRetract(t: Token<Schema>): void {
    const foundIndex = findInList(this.items, t, compareTokens);

    if (foundIndex === -1) {
      return;
    }

    this.log("leftRetract", t);

    this.items = removeIndexFromList(this.items, foundIndex);

    this.executeLeft(t, runLeftRetractOnNodes);
  }

  rightRetract(f: Schema): void {
    this.log("rightRetract", f);

    this.executeRight(f, runLeftRetractOnNodes);
  }

  rightActivate(f: Schema): void {
    this.log("rightActivate", f);

    this.executeRight(f, runLeftActivateOnNodes);
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

  private executeLeft(
    t: Token<Schema>,
    action: (children: Array<ReteNode<Schema>>, t: Token<Schema>) => void
  ) {
    let didMatch = false;

    for (let i = 0; i < this.alphaMemory.facts.length; i++) {
      const fact = this.alphaMemory.facts[i];

      if (performJoinTests(this.tests, t, fact)) {
        didMatch = true;
        break;
      }
    }

    if (!didMatch) {
      action(this.children, t);
    }
  }

  private executeRight(
    f: Schema,
    action: (children: Array<ReteNode<Schema>>, f: Token<Schema>) => void
  ) {
    for (let i = 0; i < this.items.length; i++) {
      const t = this.items[i];

      if (!performJoinTests(this.tests, t, f)) {
        action(this.children, t);
        continue;
      }
    }
  }
}
