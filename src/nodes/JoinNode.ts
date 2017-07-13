import { memoize } from "interstelar";
import {
  cleanVariableName,
  extractBindingsFromCondition,
  ParsedCondition,
} from "../Condition";
import { IFact } from "../Fact";
import { compareTokens, IVariableBindings, Token } from "../Token";
import {
  findInList,
  removeIndexFromList,
  runLeftActivateOnNodes,
  runLeftRetractOnNodes,
} from "../util";
import { AccumulatorCondition } from "./AccumulatorNode";
import { AlphaMemoryNode } from "./AlphaMemoryNode";
import { ReteNode } from "./ReteNode";

export class TestAtJoinNode {
  static create(
    fieldArg1: number | null,
    condition: ParsedCondition | AccumulatorCondition,
    fieldArg2: string | null,
  ): TestAtJoinNode {
    return new TestAtJoinNode(fieldArg1, condition, fieldArg2);
  }

  fieldArg1: number | null;
  condition: ParsedCondition | AccumulatorCondition;
  fieldArg2: string | null;

  constructor(
    fieldArg1: number | null,
    condition: ParsedCondition | AccumulatorCondition,
    fieldArg2: string | null,
  ) {
    this.fieldArg1 = fieldArg1;
    this.condition = condition;
    this.fieldArg2 = fieldArg2;
  }
}

export const createTestAtJoinNode = memoize(TestAtJoinNode.create);

export function performJoinTests(
  tests: TestAtJoinNode[],
  t: Token,
  f: IFact,
): false | IVariableBindings {
  if (tests.length <= 0) {
    return t.bindings;
  }

  let bindings = Object.assign({}, t.bindings);

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];

    if (test.fieldArg1 !== null && test.fieldArg2 !== null) {
      const arg1: any = f[test.fieldArg1];
      const arg2: any =
        test.condition instanceof AccumulatorCondition
          ? t.bindings[cleanVariableName(test.fieldArg2)]
          : t.fact[parseInt(test.fieldArg2, 10)];

      // TODO: Make this comparison any predicate
      if (arg1 !== arg2) {
        return false;
      }
    }

    bindings = extractBindingsFromCondition(test.condition, f, bindings);
  }

  return bindings;
}

export function sameTests(a: TestAtJoinNode[], b: TestAtJoinNode[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

export class JoinNode extends ReteNode {
  static create(
    parent: ReteNode,
    alphaMemory: AlphaMemoryNode,
    tests: TestAtJoinNode[],
  ): JoinNode {
    for (let i = 0; i < parent.children.length; i++) {
      const sibling = parent.children[i];

      if (sibling instanceof JoinNode && sibling.alphaMemory === alphaMemory) {
        if (sameTests(sibling.tests, tests)) {
          return sibling;
        }
      }
    }

    const node = new JoinNode(parent, alphaMemory, tests);

    parent.children.unshift(node);
    alphaMemory.successors.unshift(node);

    node.updateNewNodeWithMatchesFromAbove();

    return node;
  }

  type = "join";
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

    for (let i = 0; i < this.alphaMemory.facts.length; i++) {
      const fact = this.alphaMemory.facts[i];

      const bindings = performJoinTests(this.tests, t, fact);

      if (bindings) {
        const newToken = Token.create(this, t, fact, bindings);
        runLeftActivateOnNodes(this.children, newToken);
      }
    }
  }

  leftRetract(t: Token): void {
    const foundIndex = findInList(this.items, t, compareTokens);

    if (foundIndex === -1) {
      return;
    }

    removeIndexFromList(this.items, foundIndex);

    for (let i = 0; i < this.alphaMemory.facts.length; i++) {
      const fact = this.alphaMemory.facts[i];

      const bindings = performJoinTests(this.tests, t, fact);

      if (bindings) {
        const newToken = Token.create(this, t, fact, bindings);
        runLeftRetractOnNodes(this.children, newToken);
      }
    }
  }

  rightRetract(f: IFact): void {
    for (let i = 0; i < this.items.length; i++) {
      const token = this.items[i];

      if (f !== token.fact) {
        continue;
      }

      const bindings = performJoinTests(this.tests, token, f);

      if (bindings) {
        const newToken = Token.create(this, token, f, bindings);

        runLeftRetractOnNodes(this.children, newToken);
      }
    }
  }

  rightActivate(f: IFact): void {
    for (let i = 0; i < this.items.length; i++) {
      const token = this.items[i];
      const bindings = performJoinTests(this.tests, token, f);

      if (bindings) {
        const newToken = Token.create(this, token, f, bindings);

        runLeftActivateOnNodes(this.children, newToken);
      }
    }
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
