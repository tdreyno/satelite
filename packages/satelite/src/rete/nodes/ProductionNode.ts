import { extractBindingsFromCondition, IParsedCondition } from "../Condition";
import { IFactTuple, makeFactTuple } from "../Fact";
import { Production } from "../Production";
import { Rete } from "../Rete";
import { compareTokens, Token } from "../Token";
import { findInList, removeIndexFromList } from "../util";
import { ReteNode } from "./ReteNode";

export interface IResultingFacts {
  token: Token;
  facts: IFactTuple[];
}

export class ProductionNode extends ReteNode {
  static create(
    r: Rete,
    production: Production,
    conditions: IParsedCondition[],
  ): ProductionNode {
    return new ProductionNode(r, production, conditions);
  }

  type = "production";
  rete: Rete;
  items: Token[] = [];
  production: Production;
  conditions: IParsedCondition[];
  resultingFacts: IResultingFacts[] = [];

  constructor(r: Rete, production: Production, conditions: IParsedCondition[]) {
    super();

    this.rete = r;
    this.production = production;
    this.conditions = conditions;
  }

  leftActivate(t: Token): void {
    if (findInList(this.items, t, compareTokens) !== -1) {
      return;
    }

    this.items.unshift(t);

    const addProducedFacts = (factOrFacts: IFactTuple | IFactTuple[]) => {
      const facts: IFactTuple[] =
        factOrFacts[1] && typeof factOrFacts[1] === "string"
          ? [factOrFacts]
          : factOrFacts as any;

      for (let i = 0; i < facts.length; i++) {
        this.rete.addFact(facts[i]);
      }

      this.resultingFacts.unshift({
        token: t,
        facts,
      });
    };

    const lastCondition = this.conditions[this.conditions.length - 1];

    let bindings = t.bindings;
    if (lastCondition) {
      bindings = extractBindingsFromCondition(lastCondition, t.fact, bindings);
    }

    this.production.onActivation(
      makeFactTuple(t.fact),
      bindings,
      addProducedFacts,
    );
  }

  leftRetract(t: Token): void {
    const foundIndex = findInList(this.items, t, compareTokens);

    if (foundIndex === -1) {
      return;
    }

    this.items = removeIndexFromList(this.items, foundIndex);

    if (this.resultingFacts) {
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
          this.rete.removeFact(facts[i]);
        }
      }
    }
  }
}
