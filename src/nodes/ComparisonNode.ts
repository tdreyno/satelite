import { Comparison, isVariable, cleanVariableName } from "../Condition";
import { IFactFields } from "../Fact";
import { compareTokens, Token } from "../Token";
import {
  findInList,
  removeIndexFromList,
  runLeftActivateOnNodes,
  runLeftRetractOnNodes,
} from "../util";
import { ReteNode } from "./ReteNode";

export class ComparisonNode extends ReteNode {
  static create(
    parent: ReteNode,
    comparisonKey: IFactFields,
    comparison: Comparison,
  ): ComparisonNode {
    const node = new ComparisonNode(parent, comparisonKey, comparison);

    parent.children.unshift(node);

    node.updateNewNodeWithMatchesFromAbove();

    return node;
  }

  items: Token[] = [];
  comparisonKey: IFactFields;
  comparison: Comparison;

  constructor(
    parent: ReteNode,
    comparisonKey: IFactFields,
    comparison: Comparison,
  ) {
    super();

    this.parent = parent;
    this.comparisonKey = comparisonKey;
    this.comparison = comparison;
  }

  leftActivate(t: Token): void {
    if (findInList(this.items, t, compareTokens) !== -1) {
      return;
    }

    this.items.push(t);

    this.executeLeft(t, runLeftActivateOnNodes);
  }

  leftRetract(t: Token): void {
    const foundIndex = findInList(this.items, t, compareTokens);

    if (foundIndex === -1) {
      return;
    }

    this.items = removeIndexFromList(this.items, foundIndex);

    this.executeLeft(t, runLeftRetractOnNodes);
  }

  rerunForChild(child: ReteNode) {
    const tokens = this.items;

    const savedListOfChildren = this.children;
    this.children = [child];

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      this.executeLeft(t, runLeftActivateOnNodes);
    }

    this.children = savedListOfChildren;
  }

  private executeLeft(
    t: Token,
    action: (children: ReteNode[], t: Token) => void,
  ) {
    const value = t.fact[this.comparisonKey];

    let compareWith;

    if (isVariable(this.comparison.value)) {
      const variableName = cleanVariableName(this.comparison.value);
      compareWith = t.bindings[variableName];
    } else {
      compareWith = this.comparison.value;
    }

    const result = this.comparison.compareFn(value, compareWith);

    if (result) {
      action(this.children, t);
    }
  }
}
