import { memoize } from "interstelar";
import {
  cleanVariableName,
  extractBindingsFromCondition,
  ParsedCondition
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
  runLeftUpdateOnNodes
} from "../util";
import { AccumulatorCondition } from "./AccumulatorNode";
import { AlphaMemoryNode } from "./AlphaMemoryNode";
import { ReteNode } from "./ReteNode";

export class TestAtJoinNode<Schema extends IFact> {
  static create<S extends IFact>(
    fieldArg1: number | null,
    condition: ParsedCondition<S> | AccumulatorCondition<S>,
    fieldArg2: string | null
  ): TestAtJoinNode<S> {
    return new TestAtJoinNode<S>(fieldArg1, condition, fieldArg2);
  }

  fieldArg1: number | null;
  condition: ParsedCondition<Schema> | AccumulatorCondition<Schema>;
  fieldArg2: string | null;

  constructor(
    fieldArg1: number | null,
    condition: ParsedCondition<Schema> | AccumulatorCondition<Schema>,
    fieldArg2: string | null
  ) {
    this.fieldArg1 = fieldArg1;
    this.condition = condition;
    this.fieldArg2 = fieldArg2;
  }
}

export const createTestAtJoinNode = memoize(TestAtJoinNode.create);

export function performJoinTests<Schema extends IFact>(
  tests: Array<TestAtJoinNode<Schema>>,
  t: Token<Schema>,
  f: Schema
): false | IVariableBindings<Schema> {
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

export function sameTests<Schema extends IFact>(
  a: Array<TestAtJoinNode<Schema>>,
  b: Array<TestAtJoinNode<Schema>>
): boolean {
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

export class JoinNode<Schema extends IFact> extends ReteNode<Schema> {
  static create<S extends IFact>(
    rete: Rete<S>,
    parent: ReteNode<S>,
    alphaMemory: AlphaMemoryNode<S>,
    tests: Array<TestAtJoinNode<S>>
  ): JoinNode<S> {
    for (let i = 0; i < parent.children.length; i++) {
      const sibling = parent.children[i];

      if (sibling instanceof JoinNode && sibling.alphaMemory === alphaMemory) {
        if (sameTests(sibling.tests, tests)) {
          return sibling;
        }
      }
    }

    const node = new JoinNode<S>(rete, parent, alphaMemory, tests);

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

    for (let i = 0; i < this.alphaMemory.facts.length; i++) {
      const fact = this.alphaMemory.facts[i];

      const bindings = performJoinTests(this.tests, t, fact);

      if (bindings) {
        const newToken = Token.create(this, t, fact, bindings);
        runLeftActivateOnNodes(this.children, newToken);
      }
    }
  }

  leftUpdate(prev: Token<Schema>, t: Token<Schema>): void {
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

  leftRetract(t: Token<Schema>): void {
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

  rightActivate(f: Schema): void {
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

  rightUpdate(prev: Schema, f: Schema): void {
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

  rightRetract(f: Schema): void {
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

  private propagateUpdates(
    oldBindings: IVariableBindings<Schema> | false,
    newBindings: IVariableBindings<Schema> | false,
    oldToken: Token<Schema> | false,
    newToken: Token<Schema> | false
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
