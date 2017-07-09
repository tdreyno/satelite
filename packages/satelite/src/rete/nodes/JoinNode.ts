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
    fieldArg1: string,
    condition: ParsedCondition | AccumulatorCondition,
    fieldArg2: string,
  ): TestAtJoinNode {
    return new TestAtJoinNode(fieldArg1, condition, fieldArg2);
  }

  fieldArg1: string;
  condition: ParsedCondition | AccumulatorCondition;
  fieldArg2: string;

  constructor(
    fieldArg1: string,
    condition: ParsedCondition | AccumulatorCondition,
    fieldArg2: string,
  ) {
    this.fieldArg1 = fieldArg1;
    this.condition = condition;
    this.fieldArg2 = fieldArg2;
  }
}

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
    const arg1: any = f[test.fieldArg1];
    const arg2: any =
      test.condition instanceof AccumulatorCondition
        ? t.bindings[cleanVariableName(test.fieldArg2)]
        : t.fact[test.fieldArg2];

    // TODO: Make this comparison any predicate
    if (arg1 !== arg2) {
      return false;
    }

    bindings = extractBindingsFromCondition(test.condition, f, bindings);
  }

  return bindings;
}

export class JoinNode extends ReteNode {
  static create(
    parent: ReteNode,
    alphaMemory: AlphaMemoryNode,
    tests: TestAtJoinNode[],
  ): JoinNode {
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

    this.executeLeft(t, runLeftActivateOnNodes);
  }

  leftRetract(t: Token): void {
    const foundIndex = findInList(this.items, t, compareTokens);

    if (foundIndex === -1) {
      return;
    }

    removeIndexFromList(this.items, foundIndex);

    this.executeLeft(t, runLeftRetractOnNodes);
  }

  rightRetract(f: IFact): void {
    this.executeRight(f, runLeftRetractOnNodes);
  }

  rightActivate(f: IFact): void {
    this.executeRight(f, runLeftActivateOnNodes);
  }

  private executeRight(
    f: IFact,
    action: (children: ReteNode[], t: Token) => void,
  ) {
    for (let i = 0; i < this.items.length; i++) {
      const token = this.items[i];
      const bindings = performJoinTests(this.tests, token, f);

      if (bindings) {
        const newToken = Token.create(this, token, f, bindings);

        action(this.children, newToken);
      }
    }
  }

  private executeLeft(
    t: Token,
    action: (children: ReteNode[], t: Token) => void,
  ): void {
    for (let i = 0; i < this.alphaMemory.facts.length; i++) {
      const fact = this.alphaMemory.facts[i];
      const bindings = performJoinTests(this.tests, t, fact);

      if (bindings) {
        const newToken = Token.create(this, t, fact, bindings);
        action(this.children, newToken);
      }
    }
  }
}
