import { IFact } from "../Fact";
import { compareTokens, Token } from "../Token";
import {
  findInList,
  removeIndexFromList,
  runLeftActivateOnNodes,
  runLeftRetractOnNodes,
} from "../util";
import { AlphaMemoryNode } from "./AlphaMemoryNode";
import { performJoinTests, TestAtJoinNode } from "./JoinNode";
import { ReteNode } from "./ReteNode";

export class NegativeNode extends ReteNode {
  static create(
    parent: ReteNode,
    alphaMemory: AlphaMemoryNode,
    tests: TestAtJoinNode[],
  ): NegativeNode {
    const node = new NegativeNode(parent, alphaMemory, tests);

    parent.children.unshift(node);
    alphaMemory.successors.unshift(node);

    node.updateNewNodeWithMatchesFromAbove();

    return node;
  }

  type = "negative";
  items: Token[] = [];
  alphaMemory: AlphaMemoryNode;
  tests: TestAtJoinNode[];

  constructor(
    parent: ReteNode,
    alphaMemory: AlphaMemoryNode,
    tests: TestAtJoinNode[],
  ) {
    super();

    this.parent = parent;
    this.alphaMemory = alphaMemory;
    this.tests = tests;
  }

  leftActivate(t: Token): void {
    if (findInList(this.items, t, compareTokens) !== -1) {
      return;
    }

    this.items.unshift(t);

    this.executeLeft(t, runLeftActivateOnNodes);
  }

  leftRetract(t: Token): void {
    const foundIndex = findInList(this.items, t, compareTokens);

    if (foundIndex === -1) {
      return;
    }

    this.items = removeIndexFromList(this.items, foundIndex);

    this.executeLeft(t, runLeftRetractOnNodes);
  }

  rightRetract(f: IFact): void {
    this.executeRight(f, runLeftRetractOnNodes);
  }

  rightActivate(f: IFact): void {
    this.executeRight(f, runLeftActivateOnNodes);
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
