import { Comparison } from "../Condition";
import { IFact, SchemaFields } from "../Fact";
import { Rete } from "../Rete";
import { compareTokens, Token } from "../Token";
import {
  findInList,
  removeIndexFromList,
  runLeftActivateOnNodes,
  runLeftRetractOnNodes
} from "../util";
import { ReteNode } from "./ReteNode";

export class ComparisonNode<Schema extends IFact> extends ReteNode<Schema> {
  static create<S extends IFact>(
    rete: Rete<S>,
    parent: ReteNode<S>,
    comparisonKey: SchemaFields,
    comparison: Comparison<S>
  ): ComparisonNode<S> {
    const node = new ComparisonNode<S>(rete, parent, comparisonKey, comparison);

    parent.children.unshift(node);

    node.updateNewNodeWithMatchesFromAbove();

    return node;
  }

  items: Array<Token<Schema>> = [];
  comparisonKey: SchemaFields;
  comparison: Comparison<Schema>;

  constructor(
    rete: Rete<Schema>,
    parent: ReteNode<Schema>,
    comparisonKey: SchemaFields,
    comparison: Comparison<Schema>
  ) {
    super(rete);

    this.parent = parent;
    this.comparisonKey = comparisonKey;
    this.comparison = comparison;
  }

  leftActivate(t: Token<Schema>): void {
    if (findInList(this.items, t, compareTokens) !== -1) {
      return;
    }

    this.log("leftActivate", t);

    this.items.push(t);

    this.executeLeft(t, runLeftActivateOnNodes);
  }

  leftRetract(t: Token<Schema>): void {
    const foundIndex = findInList(this.items, t, compareTokens);

    if (foundIndex === -1) {
      return;
    }

    this.log("leftRetract", t);

    this.items = removeIndexFromList(this.items, foundIndex);

    this.executeLeft(t, runLeftRetractOnNodes);
  }

  rerunForChild(child: ReteNode<Schema>) {
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
    t: Token<Schema>,
    action: (children: Array<ReteNode<Schema>>, t: Token<Schema>) => void
  ) {
    const value = t.fact[this.comparisonKey];

    const result = this.comparison.compareFn(value, t.bindings);

    if (result) {
      action(this.children, t);
    }
  }
}
