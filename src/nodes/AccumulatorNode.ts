import { memoize } from "interstelar";
import { cloneDeep } from "lodash";
import { cleanVariableName, ParsedCondition } from "../Condition";
import { compareTokens, findParent, Token } from "../Token";
import {
  findInList,
  removeIndexFromList,
  runLeftActivateOnNodes,
  runLeftRetractOnNodes,
} from "../util";
import { AccumulatedRootNode } from "./AccumulatedRootNode";
import { AccumulatedTailNode } from "./AccumulatedTailNode";
import { JoinNode } from "./JoinNode";
import { ReteNode } from "./ReteNode";

export interface IAccumulator<T> {
  reducer: IAccumulatorReducer<T>;
  initialValue: T;
  tokenPerBindingMatch?: boolean;
}

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
  ): AccumulatorNode {
    const node = new AccumulatorNode(c, subnetworkHead);

    node.parent = parent;
    parent.children.unshift(node);
    node.updateNewNodeWithMatchesFromAbove();

    const accTail = AccumulatedTailNode.create(subnetworkTail, node);
    accTail.updateNewNodeWithMatchesFromAbove();

    return node;
  }

  subnetworkHead: ReteNode;
  items: Token[] = [];
  facts: Map<number, Token[]> = new Map();
  results: Map<number, Token> = new Map();
  accumulator: AccumulatorCondition;

  constructor(accumulator: AccumulatorCondition, subnetworkHead: ReteNode) {
    super();

    this.accumulator = accumulator;
    this.subnetworkHead = subnetworkHead;
  }

  leftActivate(t: Token): void {
    if (findInList(this.items, t, compareTokens) !== -1) {
      return;
    }

    this.items.unshift(t);

    runLeftActivateOnNodes([this.subnetworkHead], t);
  }

  leftRetract(t: Token): void {
    if (findInList(this.items, t, compareTokens) === -1) {
      return;
    }

    this.items.unshift(t);

    runLeftRetractOnNodes([this.subnetworkHead], t);
  }

  rightActivateReduced(t: Token): void {
    const parent = findParent(this.items, t);

    const bindings = parent ? parent.bindings : t.bindings;

    const bindingId = getBindingId(
      bindings,
      this.accumulator.accumulator.tokenPerBindingMatch,
    );

    let facts = this.facts.get(bindingId);

    if (!facts) {
      facts = [];
    }

    if (findInList(facts, t, compareTokens) !== -1) {
      return;
    }

    facts.unshift(t);
    this.facts.set(bindingId, facts);

    // Cleanup previous results if there.
    // this.cleanupOldResults(-1);
    // this.cleanupOldResults(bindingId);

    this.executeAccumulator(bindingId);
  }

  rightRetractReduced(t: Token): void {
    const parent = findParent(this.items, t);

    const bindings = parent ? parent.bindings : t.bindings;

    const bindingId = getBindingId(
      bindings,
      this.accumulator.accumulator.tokenPerBindingMatch,
    );

    const tokens = this.facts.get(bindingId);

    if (!tokens) {
      return;
    }

    const i = findInList(tokens, t, compareTokens);

    if (i === -1) {
      return;
    }

    removeIndexFromList(tokens, i);

    this.cleanupOldResults(bindingId);

    if (tokens.length > 0) {
      this.executeAccumulator(bindingId);
    } else {
      // Needs a retract, likely
      // this.executeAccumulator(-1);
    }
  }

  rerunForChild(child: ReteNode) {
    const savedListOfChildren = this.children;
    this.children = [child];

    for (const [bindingId] of this.facts) {
      this.executeAccumulator(bindingId);
    }

    this.children = savedListOfChildren;
  }

  private cleanupOldResults(bindingId: number) {
    const formerResult = this.results.get(bindingId);
    if (formerResult) {
      this.results.delete(bindingId);
      runLeftRetractOnNodes(this.children, formerResult);
    }
  }

  private executeAccumulator(bindingId: number): void {
    let tokens = this.facts.get(bindingId);

    let result;
    if (!tokens) {
      result = this.accumulator.accumulator.initialValue;
      tokens = (this.parent as JoinNode).items || [];
    } else {
      result = tokens.reduce(
        this.accumulator.accumulator.reducer,
        cloneDeep(this.accumulator.accumulator.initialValue),
      );
    }

    // If reducer has a non-value initial state.
    if (typeof result === "undefined") {
      return;
    }

    const cleanedVariableName = cleanVariableName(this.accumulator.bindingName);

    // Base off the first known token. Not sure if this is correct.
    // Might need to have a way of getting a non-subnetwork parent token.
    const t = Token.create(this, tokens[0] || null, result, {
      ...tokens[0] ? tokens[0].bindings : {},
      [cleanedVariableName]: result,
    });

    this.results.set(bindingId, t);

    runLeftActivateOnNodes(this.children, t);
  }
}
