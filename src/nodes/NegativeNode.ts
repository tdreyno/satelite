import { IFact } from "../Fact";
import { Rete } from "../Rete";
import { compareTokens, Token } from "../Token";
import {
  findInList,
  removeIndexFromList,
  runLeftActivateOnNodes,
  runLeftRetractOnNodes,
} from "../util";
import { AlphaMemoryNode } from "./AlphaMemoryNode";
import { performJoinTests, sameTests, TestAtJoinNode } from "./JoinNode";
import { ReteNode } from "./ReteNode";

export class NegativeNode extends ReteNode {
  static create(
    rete: Rete,
    parent: ReteNode,
    alphaMemory: AlphaMemoryNode,
    tests: TestAtJoinNode[],
  ): NegativeNode {
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

    const node = new NegativeNode(rete, parent, alphaMemory, tests);

    parent.children.unshift(node);
    alphaMemory.successors.unshift(node);

    node.updateNewNodeWithMatchesFromAbove();

    return node;
  }

  items: Token[] = [];
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
  }

  leftActivate(t: Token): void {
    if (findInList(this.items, t, compareTokens) !== -1) {
      return;
    }

    this.log("leftActivate", t);

    this.items.push(t);

    this.executeLeft(t, runLeftActivateOnNodes);
  }

  leftRetract(t: Token): void {
    const foundIndex = findInList(this.items, t, compareTokens);

    if (foundIndex === -1) {
      return;
    }

    this.log("leftRetract", t);

    this.items = removeIndexFromList(this.items, foundIndex);

    this.executeLeft(t, runLeftRetractOnNodes);
  }

  rightRetract(f: IFact): void {
    this.log("rightRetract", f);

    this.executeRight(f, runLeftRetractOnNodes);
  }

  rightActivate(f: IFact): void {
    this.log("rightActivate", f);

    this.executeRight(f, runLeftActivateOnNodes);
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

  private executeLeft(
    t: Token,
    action: (children: ReteNode[], t: Token) => void,
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
    f: IFact,
    action: (children: ReteNode[], f: Token) => void,
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
