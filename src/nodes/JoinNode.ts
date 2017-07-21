import { memoize } from "interstelar";
import {
  cleanVariableName,
  extractBindingsFromCondition,
  ParsedCondition,
} from "../Condition";
import { IFact } from "../Fact";
import { Rete } from "../Rete";
import { compareTokens, IVariableBindings, Token } from "../Token";
import {
  findInList,
  removeIndexFromList,
  replaceIndexFromList,
  runLeftActivateOnNodes,
  runLeftRetractOnNodes,
  runLeftUpdateOnNodes,
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

      const bindingName: string =
        test.condition instanceof AccumulatorCondition
          ? test.fieldArg2
          : (test.condition.variableFields as any)[test.fieldArg2];

      const arg2: any = t.bindings[cleanVariableName(bindingName)];

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
    rete: Rete,
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

    const node = new JoinNode(rete, parent, alphaMemory, tests);

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

    for (let i = 0; i < this.alphaMemory.facts.length; i++) {
      const fact = this.alphaMemory.facts[i];

      const bindings = performJoinTests(this.tests, t, fact);

      if (bindings) {
        const newToken = Token.create(this, t, fact, bindings);
        runLeftActivateOnNodes(this.children, newToken);
      }
    }
  }

  leftUpdate(prev: Token, t: Token): void {
    const foundIndex = findInList(this.items, prev, compareTokens);

    if (foundIndex === -1) {
      return;
    }

    this.log("leftUpdate", prev, t);

    replaceIndexFromList(this.items, foundIndex, t);

    for (let i = 0; i < this.alphaMemory.facts.length; i++) {
      const fact = this.alphaMemory.facts[i];

      const oldBindings = performJoinTests(this.tests, prev, fact);
      const oldToken =
        oldBindings && Token.create(this, prev, fact, oldBindings);

      const newBindings = performJoinTests(this.tests, t, fact);
      const newToken = newBindings && Token.create(this, t, fact, newBindings);

      this.propagateUpdates(oldBindings, newBindings, oldToken, newToken);
    }
  }

  leftRetract(t: Token): void {
    const foundIndex = findInList(this.items, t, compareTokens);

    if (foundIndex === -1) {
      return;
    }

    this.log("leftRetract", t);

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

  rightActivate(f: IFact): void {
    this.log("rightActivate", f);

    for (let i = 0; i < this.items.length; i++) {
      const token = this.items[i];
      const bindings = performJoinTests(this.tests, token, f);

      if (bindings) {
        const newToken = Token.create(this, token, f, bindings);

        runLeftActivateOnNodes(this.children, newToken);
      }
    }
  }

  rightUpdate(prev: IFact, f: IFact): void {
    this.log("rightUpdate", prev, f);

    for (let i = 0; i < this.items.length; i++) {
      const token = this.items[i];

      const oldBindings = performJoinTests(this.tests, token, prev);
      const oldToken =
        oldBindings && Token.create(this, token, prev, oldBindings);

      const newBindings = performJoinTests(this.tests, token, f);
      const newToken = newBindings && Token.create(this, token, f, newBindings);

      this.propagateUpdates(oldBindings, newBindings, oldToken, newToken);
    }
  }

  rightRetract(f: IFact): void {
    this.log("rightRetract", f);

    for (let i = 0; i < this.items.length; i++) {
      const token = this.items[i];

      const bindings = performJoinTests(this.tests, token, f);

      if (bindings) {
        const newToken = Token.create(this, token, f, bindings);

        runLeftRetractOnNodes(this.children, newToken);
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

  private propagateUpdates(
    oldBindings: IVariableBindings | false,
    newBindings: IVariableBindings | false,
    oldToken: Token | false,
    newToken: Token | false,
  ) {
    // The join didn't work and still doesn't.
    if (!oldBindings && !newBindings) {
      return;
    }

    // The join used to work, but stopped.
    if (oldBindings && !newBindings && oldToken) {
      runLeftRetractOnNodes(this.children, oldToken);
      return;
    }

    // The join used to not work, but now it does.
    if (!oldBindings && newBindings && newToken) {
      runLeftActivateOnNodes(this.children, newToken);
      return;
    }

    // Both were true, let's propagate an update.
    if (oldBindings && newBindings && oldToken && newToken) {
      runLeftUpdateOnNodes(this.children, oldToken, newToken);
      return;
    }
  }
}
