import { memoize } from "interstelar";
import { cloneDeep } from "lodash";
import { cleanVariableName, ParsedCondition } from "../Condition";
import { compareTokens, Token } from "../Token";
import {
  findInList,
  reduceList,
  removeFromList,
  removeIndexFromList,
  runLeftActivateOnNodes,
  runLeftRetractOnNodes,
} from "../util";
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

const getBindingIdByKeys = memoize((keys: string[]) => nextBindingId++);
const getBindingIdByValues = memoize(
  (keys: string[], values: any[]) => nextBindingId++,
);

export class AccumulatorCondition<T = any> {
  bindingName: string;
  accumulator: IAccumulator<T>;
  conditions?: Array<ParsedCondition | AccumulatorCondition>;

  constructor(
    bindingName: string,
    accumulator: IAccumulator<T>,
    conditions?: Array<ParsedCondition | AccumulatorCondition>,
  ) {
    this.bindingName = bindingName;
    this.accumulator = accumulator;
    this.conditions = conditions;
  }
}

export type IAccumulatorReducer<T> = (acc: T, t: Token) => T;

export class AccumulatorNode extends ReteNode {
  static create(parent: ReteNode, c: AccumulatorCondition): AccumulatorNode {
    const node = new AccumulatorNode(c);

    node.parent = parent;
    parent.children.unshift(node);

    node.updateNewNodeWithMatchesFromAbove();

    return node;
  }

  type = "accumulator";
  items: Map<number, Token[]> = new Map();
  results: Map<number, Token> = new Map();
  accumulator: AccumulatorCondition;

  constructor(accumulator: AccumulatorCondition) {
    super();

    this.accumulator = accumulator;
  }

  executeAccumulator(bindingId: number): void {
    const tokens = this.items.get(bindingId);

    if (!tokens) {
      return this.accumulator.accumulator.initialValue;
    }

    const result = tokens.reduce(
      this.accumulator.accumulator.reducer,
      cloneDeep(this.accumulator.accumulator.initialValue),
    );

    const cleanedVariableName = cleanVariableName(this.accumulator.bindingName);
    const t = Token.create(this, null, result, {
      [cleanedVariableName]: result,
    });

    this.results.set(bindingId, t);

    runLeftActivateOnNodes(this.children, t);
  }

  leftActivate(t: Token): void {
    const bindingId = getBindingId(
      t.bindings,
      this.accumulator.accumulator.tokenPerBindingMatch,
    );

    let tokens = this.items.get(bindingId);

    if (tokens && findInList(tokens, t, compareTokens) !== -1) {
      return;
    }

    if (!tokens) {
      tokens = [];
      this.items.set(bindingId, tokens);
    }

    tokens.unshift(t);

    this.executeAccumulator(bindingId);
  }

  leftRetract(t: Token): void {
    const bindingId = getBindingId(
      t.bindings,
      this.accumulator.accumulator.tokenPerBindingMatch,
    );

    const tokens = this.items.get(bindingId);

    if (!tokens) {
      return;
    }

    const i = findInList(tokens, t, compareTokens);

    if (i === -1) {
      return;
    }

    removeIndexFromList(tokens, i);

    const formerResult = this.results.get(bindingId);
    if (formerResult) {
      this.results.delete(bindingId);
      runLeftRetractOnNodes(this.children, formerResult);
    }

    if (tokens.length > 0) {
      this.executeAccumulator(bindingId);
    }
  }

  rerunForChild(child: ReteNode) {
    const savedListOfChildren = this.children;

    this.children = [child];

    for (const [bindingId] of this.items) {
      this.executeAccumulator(bindingId);
    }

    this.children = savedListOfChildren;
  }
}
