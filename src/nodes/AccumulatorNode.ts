import { memoize } from "interstelar";
import { cloneDeep } from "lodash";
import { cleanVariableName, ParsedCondition } from "../Condition";
import { compareTokens, Token } from "../Token";
import {
  findInList,
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

// tslint:disable-next-line:variable-name
const getBindingIdByKeys = memoize((_keys: string[]) => nextBindingId++);

const getBindingIdByValues = memoize(
  // tslint:disable-next-line:variable-name
  (_keys: string[], _values: any[]) => nextBindingId++,
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

    // debugger;
    node.updateNewNodeWithMatchesFromAbove();

    return node;
  }

  items: Map<number, Token[]> = new Map();
  results: Map<number, Token> = new Map();
  accumulator: AccumulatorCondition;

  constructor(accumulator: AccumulatorCondition) {
    super();

    this.accumulator = accumulator;
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

    if (this.items.size > 0) {
      for (const [bindingId] of this.items) {
        this.executeAccumulator(bindingId);
      }
    } else {
      this.executeAccumulator(-1);
    }

    this.children = savedListOfChildren;
  }

  private executeAccumulator(bindingId: number): void {
    const tokens = this.items.get(bindingId);

    let result;
    if (!tokens) {
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
    const t = Token.create(this, tokens ? tokens[0] : null, result, {
      [cleanedVariableName]: result,
      ...tokens && tokens[0] ? tokens[0].bindings : {},
    });

    this.results.set(bindingId, t);

    runLeftActivateOnNodes(this.children, t);
  }
}
