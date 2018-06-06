import difference = require("lodash/difference");
import find = require("lodash/find");
import intersection = require("lodash/intersection");
import map = require("lodash/map");
import { extractBindingsFromCondition, ParsedCondition } from "../Condition";
import { IFact, makeFact } from "../Fact";
import { Production } from "../Production";
import { IUpdateList, Rete } from "../Rete";
import { compareTokens, Token } from "../Token";
import { findInList, removeIndexFromList, replaceIndexFromList } from "../util";
import { AccumulatorCondition } from "./AccumulatorNode";
import { ReteNode } from "./ReteNode";

export interface IResultingFacts<Schema extends IFact> {
  token: Token<Schema>;
  facts: Schema[];
}

export class ProductionNode<Schema extends IFact> extends ReteNode<Schema> {
  static create<S extends IFact>(
    r: Rete<S>,
    production: Production<S>,
    conditions: Array<ParsedCondition<S> | AccumulatorCondition<S>>
  ): ProductionNode<S> {
    return new ProductionNode<S>(r, production, conditions);
  }

  items: Array<Token<Schema>> = [];
  production: Production<Schema>;
  conditions: Array<ParsedCondition<Schema> | AccumulatorCondition<Schema>>;
  resultingFacts: Array<IResultingFacts<Schema>> = [];

  constructor(
    r: Rete<Schema>,
    production: Production<Schema>,
    conditions: Array<ParsedCondition<Schema> | AccumulatorCondition<Schema>>
  ) {
    super(r);

    this.production = production;
    this.conditions = conditions;
  }

  leftActivate(t: Token<Schema>): void {
    if (findInList(this.items, t, compareTokens) !== -1) {
      return;
    }

    this.log("leftActivate", t);

    this.items.push(t);

    const facts = this.activateForToken(t);

    if (facts) {
      this.assertDependentFacts(facts);

      this.resultingFacts.push({
        token: t,
        facts
      });
    }
  }

  leftUpdate(prev: Token<Schema>, t: Token<Schema>) {
    const foundIndex = findInList(this.items, prev, compareTokens);

    if (foundIndex === -1) {
      return;
    }

    this.log("leftUpdate", prev, t);

    this.items = replaceIndexFromList(this.items, foundIndex, t);

    const resultingFactIndex = this.findResultingFactsIndex(prev);
    const oldFacts = this.resultingFacts[resultingFactIndex];

    const newFacts = this.activateForToken(t);

    // Just a logging production or something.
    if (!oldFacts && !newFacts) {
      return;
    }

    // Just new facts, assert them.
    if (!oldFacts && newFacts) {
      this.assertDependentFacts(newFacts);

      this.resultingFacts.push({
        token: t,
        facts: newFacts
      });
    }

    // Just old facts, retract them all
    if (oldFacts && !newFacts) {
      const facts = this.resultingFacts[resultingFactIndex].facts;

      this.resultingFacts = removeIndexFromList(
        this.resultingFacts,
        resultingFactIndex
      );

      this.retractDependentFacts(facts);
    }

    if (oldFacts && newFacts) {
      const { assert, retract, update } = this.groupFactChanges(
        oldFacts.facts,
        newFacts
      );

      this.retractDependentFacts(retract);
      this.assertDependentFacts(assert);
      this.updateDependentFacts(update);

      this.resultingFacts[resultingFactIndex] = {
        token: t,
        facts: newFacts
      };
    }
  }

  leftRetract(t: Token<Schema>): void {
    const foundIndex = findInList(this.items, t, compareTokens);

    if (foundIndex === -1) {
      return;
    }

    this.log("leftRetract", t);

    this.items = removeIndexFromList(this.items, foundIndex);

    const foundResultingFactIndex = this.findResultingFactsIndex(t);

    if (foundResultingFactIndex !== -1) {
      const facts = this.resultingFacts[foundResultingFactIndex].facts;

      this.resultingFacts = removeIndexFromList(
        this.resultingFacts,
        foundResultingFactIndex
      );

      this.retractDependentFacts(facts);
    }
  }

  private findResultingFactsIndex(t: Token<Schema>): number {
    return findInList(this.resultingFacts, t, (resultingFact, token) => {
      return compareTokens(resultingFact.token, token);
    });
  }

  private assertDependentFacts(facts: Schema[]): void {
    for (let i = 0; i < facts.length; i++) {
      this.rete.assert(facts[i]);
    }
  }

  private updateDependentFacts(updates: IUpdateList<Schema>): void {
    for (let i = 0; i < updates.length; i++) {
      this.rete.update(updates[i].from, updates[i].to);
    }
  }

  private retractDependentFacts(facts: Schema[]): void {
    for (let i = 0; i < facts.length; i++) {
      this.rete.retract(facts[i]);
    }
  }

  private activateForToken(t: Token<Schema>): Schema[] | undefined {
    const lastCondition = this.conditions[this.conditions.length - 1];

    let bindings = t.bindings;
    if (lastCondition) {
      bindings = extractBindingsFromCondition(lastCondition, t.fact, bindings);
    }

    const resultingFacts = this.production.onActivation(t.fact, bindings);

    if (resultingFacts && Array.isArray(resultingFacts)) {
      return Array.isArray(resultingFacts[0])
        ? (resultingFacts as Schema[])
        : map([resultingFacts] as Schema[], f => makeFact(f[0], f[1], f[2]));
    }
  }

  private groupFactChanges(oldFacts: Schema[], newFacts: Schema[]) {
    const oldFactsWithoutValues = map(oldFacts, f =>
      makeFact(f[0], f[1], true)
    );

    const newFactsWithoutValues = map(newFacts, f =>
      makeFact(f[0], f[1], true)
    );

    const uniqueOldFacts = difference(
      oldFactsWithoutValues,
      newFactsWithoutValues
    );

    const uniqueNewFacts = difference(
      newFactsWithoutValues,
      oldFactsWithoutValues
    );

    const sharedFacts = intersection(
      newFactsWithoutValues,
      oldFactsWithoutValues
    );

    const toBeUpdated: IUpdateList<Schema> = [];

    for (let i = 0; i < sharedFacts.length; i++) {
      const sharedFact = sharedFacts[i];

      const finder = (f: Schema) =>
        f[0] === sharedFact[0] && f[1] === sharedFact[1];

      const oldFact = find(oldFacts, finder);
      const newFact = find(newFacts, finder);

      if (oldFact === newFact) {
        continue;
      }

      toBeUpdated.push({
        from: oldFact as Schema,
        to: newFact as Schema
      });
    }

    return {
      retract: uniqueOldFacts,
      assert: uniqueNewFacts,
      update: toBeUpdated
    };
  }
}
