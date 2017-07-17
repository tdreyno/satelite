import { extractBindingsFromCondition, ParsedCondition } from "../Condition";
import { IFact } from "../Fact";
import { Production } from "../Production";
import { Rete } from "../Rete";
import { compareTokens, Token } from "../Token";
import { findInList, removeIndexFromList } from "../util";
import { ReteNode } from "./ReteNode";

export interface IResultingFacts {
  token: Token;
  facts: IFact[];
}

export class ProductionNode extends ReteNode {
  static create(
    r: Rete,
    production: Production,
    conditions: ParsedCondition[],
  ): ProductionNode {
    return new ProductionNode(r, production, conditions);
  }

  rete: Rete;
  items: Token[] = [];
  production: Production;
  conditions: ParsedCondition[];
  resultingFacts: IResultingFacts[] = [];

  constructor(r: Rete, production: Production, conditions: ParsedCondition[]) {
    super();

    this.rete = r;
    this.production = production;
    this.conditions = conditions;
  }

  leftActivate(t: Token): void {
    if (findInList(this.items, t, compareTokens) !== -1) {
      return;
    }

    this.items.push(t);

    const addProducedFacts = (...facts: IFact[]) => {
      for (let i = 0; i < facts.length; i++) {
        this.rete.assert(facts[i]);
      }

      this.resultingFacts.push({
        token: t,
        facts,
      });
    };

    const lastCondition = this.conditions[this.conditions.length - 1];

    let bindings = t.bindings;
    if (lastCondition) {
      bindings = extractBindingsFromCondition(lastCondition, t.fact, bindings);
    }

    this.production.onActivation(t.fact, bindings, addProducedFacts);
  }

  leftRetract(t: Token): void {
    const foundIndex = findInList(this.items, t, compareTokens);

    if (foundIndex === -1) {
      return;
    }

    this.items = removeIndexFromList(this.items, foundIndex);

    const foundResultingFactIndex = findInList(
      this.resultingFacts,
      t,
      (resultingFact, token) => {
        return compareTokens(resultingFact.token, token);
      },
    );

    if (foundResultingFactIndex !== -1) {
      const facts = this.resultingFacts[foundResultingFactIndex].facts;

      this.resultingFacts = removeIndexFromList(
        this.resultingFacts,
        foundResultingFactIndex,
      );

      for (let i = 0; i < facts.length; i++) {
        this.rete.retract(facts[i]);
      }
    }
  }
}
