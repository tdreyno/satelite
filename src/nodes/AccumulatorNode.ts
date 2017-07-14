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

    // Cleanup previous results if there.
    this.cleanupOldResults(-1);
    this.cleanupOldResults(bindingId);

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

    this.cleanupOldResults(bindingId);

    if (tokens.length > 0) {
      this.executeAccumulator(bindingId);
    } else {
      this.executeAccumulator(-1);
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
      const accumulatorBindings: Set<string> = (this.accumulator.conditions ||
        [])
        .reduce((sum, c) => {
          if (c instanceof ParsedCondition) {
            Object.keys(c.variableNames).forEach(v => sum.add(v));
          }

          return sum;
        }, new Set());

      if (accumulatorBindings.size <= 0) {
        this.executeAccumulator(-1);
      } else {
        // if (this.parent) {
        //   this.parent.rerunForChild(this);
        // }
        // if (this.parent && (this.parent as any).items) {
        //   for (let i = 0; i < (this.parent as any).items.length; i++) {
        //     const t = (this.parent as any).items[i];
        //     this.leftActivate(t);
        //   }
        // }
      }
    }

    this.children = savedListOfChildren;
  }

  private cleanupOldResults(bindingId: number) {
    const formerResult = this.results.get(bindingId);
    if (formerResult) {
      this.results.delete(-1);
      runLeftRetractOnNodes(this.children, formerResult);
    }
  }

  private executeAccumulator(bindingId: number): void {
    let tokens = this.items.get(bindingId);

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
