import { IFactTuple, makeFactTuple } from "../Fact";
import { IProduction } from "../Production";
import { Rete } from "../Rete";
import { compareTokens, IToken } from "../Token";
import { addToListHead, findInList, IList, removeIndexFromList } from "../util";
import { IReteNode } from "./ReteNode";

export interface IResultingFacts {
  token: IToken;
  facts: IFactTuple[];
}

export interface IProductionNode extends IReteNode {
  type: "production";
  rete: Rete;
  items: IList<IToken>;
  production: IProduction;
  resultingFacts: IList<IResultingFacts>;
}

export function makeProductionNode(
  r: Rete,
  production: IProduction,
): IProductionNode {
  const node: IProductionNode = Object.create(null);

  node.type = "production";
  node.rete = r;
  node.items = null;
  node.production = production;
  node.resultingFacts = null;

  return node;
}

export function productionNodeLeftActivate(
  node: IProductionNode,
  t: IToken,
): void {
  if (findInList(node.items, t, compareTokens) !== -1) {
    return;
  }

  node.items = addToListHead(node.items, t);

  function addProducedFacts(factOrFacts: IFactTuple | IFactTuple[]) {
    const facts: IFactTuple[] =
      factOrFacts[1] && typeof factOrFacts[1] === "string"
        ? [factOrFacts]
        : factOrFacts as any;

    for (let i = 0; i < facts.length; i++) {
      node.rete.addFact(facts[i]);
    }

    node.resultingFacts = addToListHead(node.resultingFacts, {
      token: t,
      facts,
    });
  }

  function addFacts(factOrFacts: IFactTuple | IFactTuple[]) {
    const facts: IFactTuple[] =
      factOrFacts[1] && typeof factOrFacts[1] === "string"
        ? [factOrFacts]
        : factOrFacts as any;

    for (let i = 0; i < facts.length; i++) {
      node.rete.addFact(facts[i]);
    }
  }

  node.production.onActivation(
    makeFactTuple(t.fact),
    t,
    addProducedFacts,
    addFacts,
  );
}

export function productionNodeLeftRetract(
  node: IProductionNode,
  t: IToken,
): void {
  const foundIndex = findInList(node.items, t, compareTokens);

  if (foundIndex === -1) {
    return;
  }

  node.items = removeIndexFromList(node.items, foundIndex);

  if (node.resultingFacts) {
    const foundResultingFactIndex = findInList(
      node.resultingFacts,
      t,
      (resultingFact, token) => {
        return compareTokens(resultingFact.token, token);
      },
    );

    if (foundResultingFactIndex !== -1) {
      const facts = node.resultingFacts[foundResultingFactIndex].facts;

      node.resultingFacts = removeIndexFromList(
        node.resultingFacts,
        foundResultingFactIndex,
      );

      for (let i = 0; i < facts.length; i++) {
        node.rete.removeFact(facts[i]);
      }
    }
  }
}
