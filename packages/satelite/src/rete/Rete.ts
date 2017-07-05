import { getJoinTestsFromCondition, ICondition } from "./Condition";
import { IFactTuple, makeFact } from "./Fact";
import { buildOrShareAlphaMemoryNode } from "./nodes/AlphaMemoryNode";
import { buildOrShareJoinNode } from "./nodes/JoinNode";
import { makeProductionNode } from "./nodes/ProductionNode";
import { IReteNode } from "./nodes/ReteNode";
import { IRootJoinNode, makeRootJoinNode } from "./nodes/RootJoinNode";
import { IProduction, makeProduction } from "./Production";
import { IToken } from "./Token";
import {
  addToListHead,
  IList,
  runRightActivateOnNode,
  runRightRetractOnNode,
  updateNewNodeWithMatchesFromAbove,
} from "./util";

export interface IRete {
  root: IRootJoinNode;
  productions: IList<IProduction>;
}

export function makeRete(): IRete {
  const r: IRete = Object.create(null);

  r.root = makeRootJoinNode();
  r.productions = null;

  return r;
}

export function addFact(r: IRete, factTuple: IFactTuple): IRete {
  const f = makeFact(factTuple[0], factTuple[1], factTuple[2]);

  runRightActivateOnNode(r.root, f);

  return r;
}

// tslint:disable-next-line:variable-name
export function removeFact(r: IRete, fact: IFactTuple): IRete {
  const f = makeFact(fact[0], fact[1], fact[2]);

  runRightRetractOnNode(r.root, f);

  return r;
}

export function buildOrShareNetworkForConditions(
  r: IRete,
  conditions: ICondition[],
  earlierConditions: ICondition[],
): IReteNode {
  let currentNode: IReteNode = r.root;
  const conditionsHigherUp = earlierConditions;

  for (let i = 0; i < conditions.length; i++) {
    const c = conditions[i];

    currentNode = buildOrShareJoinNode(
      currentNode,
      buildOrShareAlphaMemoryNode(r.root, c),
      getJoinTestsFromCondition(c, conditionsHigherUp),
    );

    conditionsHigherUp.push(c);
  }

  return currentNode;
}

export function addProduction(
  r: IRete,
  conditions: ICondition[],
  callback: (f: IFactTuple, t: IToken) => any,
): IRete {
  const currentNode = buildOrShareNetworkForConditions(r, conditions, []);

  const production = makeProduction(callback);
  production.productionNode = makeProductionNode(production);
  currentNode.children = addToListHead(
    currentNode.children,
    production.productionNode,
  );

  production.productionNode.parent = currentNode;

  updateNewNodeWithMatchesFromAbove(production.productionNode);

  r.productions = addToListHead(r.productions, production);

  return r;
}
