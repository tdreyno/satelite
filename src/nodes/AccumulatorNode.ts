import cloneDeep = require("lodash/cloneDeep");
import { memoize } from "interstelar";
import { cleanVariableName, ParsedCondition } from "../Condition";
import {
  compareTokens,
  compareTokensAndBindings,
  findParent,
  Token,
} from "../Token";
import {
  findInList,
  removeIndexFromList,
  runLeftActivateOnNodes,
  runLeftRetractOnNodes,
} from "../util";
import { AccumulatedRootNode } from "./AccumulatedRootNode";
import { AccumulatedTailNode } from "./AccumulatedTailNode";
import { ReteNode } from "./ReteNode";

export interface IAccumulator<T> {
  reducer: IAccumulatorReducer<T>;
  initialValue: T;
  tokenPerBindingMatch?: boolean;
}

export type IBindingId = number;

let nextBindingId = 0;
function getBindingId(bindings: { [key: string]: any }, compareValues = false) {
  const keys = Object.keys(bindings);

  if (!compareValues) {
    return getBindingIdByKeys(keys);
  }

  return getBindingIdByValues(keys, keys.map(k => bindings[k]));
}

// tslint:disable-next-line:variable-name
const getBindingIdByKeys = memoize((_keys: string[]) => nextBindingId++);

const getBindingIdByValues = memoize(
  // tslint:disable-next-line:variable-name
  (_keys: string[], _values: any[]) => nextBindingId++,
);

export class AccumulatorCondition<T = any> {
  bindingName: string;
  accumulator: IAccumulator<T>;
  conditions: Array<ParsedCondition | AccumulatorCondition>;

  constructor(
    bindingName: string,
    accumulator: IAccumulator<T>,
    conditions: Array<ParsedCondition | AccumulatorCondition>,
  ) {
    this.bindingName = bindingName;
    this.accumulator = accumulator;
    this.conditions = conditions;
  }
}

export type IAccumulatorReducer<T> = (acc: T, t: Token) => T;

export class AccumulatorNode extends ReteNode {
  static create(
    parent: ReteNode,
    c: AccumulatorCondition,
    subnetworkHead: AccumulatedRootNode,
    subnetworkTail: ReteNode,
    isIndependent: boolean,
  ): AccumulatorNode {
    const node = new AccumulatorNode(c, subnetworkHead, isIndependent);

    node.parent = parent;
    parent.children.unshift(node);
    node.updateNewNodeWithMatchesFromAbove();

    const accTail = AccumulatedTailNode.create(subnetworkTail, node);
    accTail.updateNewNodeWithMatchesFromAbove();

    return node;
  }

  subnetworkHead: ReteNode;
  items: Token[] = [];
  facts: Map<IBindingId, Token[]> = new Map();
  results: Map<IBindingId, Token> = new Map();
  pendingSubnetwork: Set<Token> = new Set();
  accumulator: AccumulatorCondition;
  isIndependent: boolean;

  sharedIndependentToken = Token.create(this, null, [
    "global",
    "token",
    "sharedIndependent",
  ]);

  constructor(
    accumulator: AccumulatorCondition,
    subnetworkHead: ReteNode,
    isIndependent: boolean,
  ) {
    super();

    this.accumulator = accumulator;
    this.subnetworkHead = subnetworkHead;
    this.isIndependent = isIndependent;

    if (this.isIndependent) {
      this.executeAccumulator(this.sharedIndependentToken);
    }
  }

  leftActivate(t: Token): void {
    if (findInList(this.items, t, compareTokens) !== -1) {
      return;
    }

    this.items.push(t);

    if (this.isIndependent) {
      return;
    }

    this.pendingSubnetwork.add(t);

    runLeftActivateOnNodes([this.subnetworkHead], t);

    if (this.pendingSubnetwork.has(t)) {
      this.executeAccumulator(t);
    }
  }

  leftRetract(t: Token): void {
    const i = findInList(this.items, t, compareTokens);
    if (i === -1) {
      return;
    }

    const knownToken = this.items[i];

    if (!this.isIndependent) {
      this.pendingSubnetwork.add(knownToken);

      runLeftRetractOnNodes([this.subnetworkHead], knownToken);

      if (this.pendingSubnetwork.has(knownToken)) {
        this.executeAccumulator(knownToken);
      }
    }

    removeIndexFromList(this.items, i);
  }

  rightActivateReduced(t: Token): void {
    let initialToken: Token | undefined;

    if (this.isIndependent) {
      initialToken = this.sharedIndependentToken;
    } else {
      initialToken = findParent(this.items, t);

      if (!initialToken) {
        throw new Error("activate a non-parented token?");
      }

      this.pendingSubnetwork.delete(initialToken);
    }

    const binding = this.getBindingId(initialToken);

    let facts = this.facts.get(binding);

    if (!facts) {
      facts = [];
    }

    if (findInList(facts, t, compareTokens) !== -1) {
      return;
    }

    facts.push(t);
    this.facts.set(binding, facts);

    this.executeAccumulator(initialToken);
  }

  rightRetractReduced(t: Token): void {
    let initialToken: Token | undefined;

    if (this.isIndependent) {
      initialToken = this.sharedIndependentToken;
    } else {
      initialToken = findParent(this.items, t);

      if (!initialToken) {
        throw new Error("retract a non-parented token?");
      }

      this.pendingSubnetwork.delete(initialToken);
    }

    const binding = this.getBindingId(initialToken);

    const tokens = this.facts.get(binding);

    if (!tokens) {
      return;
    }

    const i = findInList(tokens, t, compareTokens);

    if (i === -1) {
      return;
    }

    removeIndexFromList(tokens, i);

    this.executeAccumulator(initialToken);
  }

  rerunForChild(child: ReteNode) {
    const savedListOfChildren = this.children;
    this.children = [child];

    // Resend facts.
    for (const [_, t] of this.results) {
      runLeftActivateOnNodes(this.children, t);
    }

    this.children = savedListOfChildren;
  }

  private getBindingId(t: Token): number {
    return getBindingId(
      t.bindings,
      this.accumulator.accumulator.tokenPerBindingMatch,
    );
  }

  private cleanupOldResults(bindingId: IBindingId) {
    const formerResult = this.results.get(bindingId);
    if (formerResult) {
      this.results.delete(bindingId);
      runLeftRetractOnNodes(this.children, formerResult);
    }
  }

  private executeAccumulator(initialToken: Token): void {
    const bindingId = this.getBindingId(initialToken);

    const tokens = this.facts.get(bindingId);

    let result;

    if (!tokens || tokens.length <= 0) {
      result = this.accumulator.accumulator.initialValue;
    } else {
      result = tokens.reduce(
        this.accumulator.accumulator.reducer,
        cloneDeep(this.accumulator.accumulator.initialValue),
      );
    }

    const cleanedVariableName = cleanVariableName(this.accumulator.bindingName);

    // Base off the first known token. Not sure if this is correct.
    // Might need to have a way of getting a non-subnetwork parent token.
    const t = Token.create(this, initialToken, result, {
      ...initialToken.bindings,
      [cleanedVariableName]: result,
    });

    const previousResult = this.results.get(bindingId);

    if (previousResult && compareTokensAndBindings(previousResult, t)) {
      // no-op
    } else {
      this.cleanupOldResults(bindingId);

      // If reducer has a non-value initial state.
      if (typeof result === "undefined") {
        return;
      }
    }

    this.results.set(bindingId, t);

    runLeftActivateOnNodes(this.children, t);
  }
}
