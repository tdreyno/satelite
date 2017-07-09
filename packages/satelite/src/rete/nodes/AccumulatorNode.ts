import { cleanVariableName, IParsedCondition } from "../Condition";
import { compareTokens, Token } from "../Token";
import {
  findInList,
  reduceList,
  removeIndexFromList,
  runLeftActivateOnNodes,
} from "../util";
import { ReteNode } from "./ReteNode";

export interface IAccumulator<T> {
  reducer: IAccumulatorReducer<T>;
  initialValue: T;
}

export class AccumulatorCondition<T = any> {
  bindingName: string;
  accumulator: IAccumulator<T>;
  conditions?: Array<IParsedCondition | AccumulatorCondition>;

  constructor(
    bindingName: string,
    accumulator: IAccumulator<T>,
    conditions?: Array<IParsedCondition | AccumulatorCondition>,
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
  items: Token[] = [];
  accumulator: AccumulatorCondition;

  constructor(accumulator: AccumulatorCondition) {
    super();

    this.accumulator = accumulator;
  }

  executeAccumulator(): void {
    const result = reduceList(
      this.items,
      this.accumulator.accumulator.reducer,
      this.accumulator.accumulator.initialValue,
    );

    const cleanedVariableName = cleanVariableName(this.accumulator.bindingName);
    const t = Token.create(this, null, result, {
      [cleanedVariableName]: result,
    });

    runLeftActivateOnNodes(this.children, t);
  }

  leftActivate(t: Token): void {
    if (findInList(this.items, t, compareTokens) !== -1) {
      return;
    }

    this.items.unshift(t);

    this.executeAccumulator();
  }

  leftRetract(t: Token): void {
    const foundIndex = findInList(this.items, t, compareTokens);

    if (foundIndex === -1) {
      return;
    }

    this.items = removeIndexFromList(this.items, foundIndex);

    this.executeAccumulator();
  }
}
