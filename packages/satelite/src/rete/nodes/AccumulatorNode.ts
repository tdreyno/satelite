import { cleanVariableName, IParsedCondition } from "../Condition";
import { compareTokens, IToken, makeToken } from "../Token";
import {
  addToListHead,
  findInList,
  IList,
  reduceList,
  removeIndexFromList,
  runLeftActivateOnNodes,
  updateNewNodeWithMatchesFromAbove,
} from "../util";
import { IReteNode } from "./ReteNode";

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

export type IAccumulatorReducer<T> = (acc: T, t: IToken) => T;

export interface IAccumulatorNode extends IReteNode {
  type: "accumulator";
  items: IList<IToken>;
  accumulator: AccumulatorCondition;
}

export function makeAccumulatorNode(
  accumulator: AccumulatorCondition,
): IAccumulatorNode {
  const node: IAccumulatorNode = Object.create(null);

  node.type = "accumulator";
  node.items = null;
  node.accumulator = accumulator;

  return node;
}

export function buildOrShareAccumulatorNode(
  parent: IReteNode,
  c: AccumulatorCondition,
): IAccumulatorNode {
  const node = makeAccumulatorNode(c);

  node.parent = parent;
  parent.children = addToListHead(parent.children, node);

  updateNewNodeWithMatchesFromAbove(node);

  return node;
}

export function executeAccumulator(node: IAccumulatorNode): void {
  const result = reduceList(
    node.items,
    node.accumulator.accumulator.reducer,
    node.accumulator.accumulator.initialValue,
  );

  const cleanedVariableName = cleanVariableName(node.accumulator.bindingName);
  const t = makeToken(node, null, result, { [cleanedVariableName]: result });

  runLeftActivateOnNodes(node.children, t);
}

export function accumulatorNodeLeftActivate(
  node: IAccumulatorNode,
  t: IToken,
): void {
  if (findInList(node.items, t, compareTokens) !== -1) {
    return;
  }

  node.items = addToListHead(node.items, t);

  executeAccumulator(node);
}

export function accumulatorNodeLeftRetract(
  node: IAccumulatorNode,
  t: IToken,
): void {
  const foundIndex = findInList(node.items, t, compareTokens);

  if (foundIndex === -1) {
    return;
  }

  node.items = removeIndexFromList(node.items, foundIndex);

  executeAccumulator(node);
}
