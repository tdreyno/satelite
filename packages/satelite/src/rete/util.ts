import { ICondition } from "./Condition";
import { IFact, IFactFields } from "./Fact";
import {
  betaMemoryNodeLeftActivation,
  IBetaMemoryNode,
} from "./nodes/BetaMemoryNode";
import {
  IJoinNode,
  joinNodeLeftActivation,
  joinNodeRightActivation,
} from "./nodes/JoinNode";
// import {
//   INegatedConjunctiveConditionsNode,
//   negatedConjunctiveConditionsNodeLeftActivation,
// } from "./nodes/NegatedConjunctiveConditionsNode";
// import {
//   INegatedConjunctiveConditionsPartnerNode,
//   negatedConjunctiveConditionsPartnerNodeLeftActivation,
// } from "./nodes/NegatedConjunctiveConditionsPartnerNode";
// import {
//   INegativeNode,
//   negativeNodeLeftActivation,
//   negativeNodeRightActivation,
// } from "./nodes/NegativeNode";
import {
  IProductionNode,
  productionNodeLeftActivation,
} from "./nodes/ProductionNode";
import { IReteNode } from "./nodes/ReteNode";
import { IToken } from "./Token";

export type IList<T> = T[] | null;

export function addToListHead<T>(list: IList<T> | null, item: T): T[] {
  list = list || [];
  list.unshift(item);
  return list;
}

export function removeFromList<T>(list: T[] | null, item: T): T[] | null {
  if (!list) {
    return null;
  }

  const i = list.indexOf(item);

  if (i !== -1) {
    list.splice(i);
  }

  return list;
}

export function runLeftActivateOnNode(
  node: IReteNode,
  t: IToken,
  f: IFact | null,
): void {
  switch (node.type) {
    case "production":
      return productionNodeLeftActivation(
        node as IProductionNode,
        t,
        f as IFact,
      );
    case "beta-memory":
      return betaMemoryNodeLeftActivation(node as IBetaMemoryNode, t, f);
    case "join":
      return joinNodeLeftActivation(node as IJoinNode, t);
    // case "negative":
    //   return negativeNodeLeftActivation(node as INegativeNode, t, f);
    // case "ncc":
    //   return negatedConjunctiveConditionsNodeLeftActivation(
    //     node as INegatedConjunctiveConditionsNode,
    //     t,
    //     f,
    //   );
    // case "ncc-partner":
    //   return negatedConjunctiveConditionsPartnerNodeLeftActivation(
    //     node as INegatedConjunctiveConditionsPartnerNode,
    //     t,
    //     f,
    //   );
  }
}

// tslint:disable-next-line:variable-name
export function runLeftRetractOnNode(node: IReteNode, _t: IToken, _f: IFact) {
  switch (node.type) {
  }
}

export function runRightActivateOnNode(node: IReteNode, f: IFact) {
  switch (node.type) {
    case "join":
      return joinNodeRightActivation(node as IJoinNode, f);
    // case "negative":
    //   return negativeNodeRightActivation(node as INegativeNode, f);
  }
}

// tslint:disable-next-line:variable-name
export function runRightRetractOnNode(node: IReteNode, _f: IFact) {
  switch (node.type) {
  }
}

export function updateNewNodeWithMatchesFromAbove(newNode: IReteNode): void {
  const parent = newNode.parent;

  if (!parent) {
    return;
  }

  switch (parent.type) {
    case "beta-memory":
      const betaMemoryItems = (parent as IBetaMemoryNode).items;

      if (betaMemoryItems) {
        for (let i = 0; i < betaMemoryItems.length; i++) {
          const t = betaMemoryItems[i];
          runLeftActivateOnNode(newNode, t, t.fact);
        }
      }

      break;

    case "join":
      const facts = (parent as IJoinNode).alphaMemory.facts;

      if (facts) {
        const savedListOfChildren = parent.children;
        parent.children = [newNode];

        for (let i = 0; i < facts.length; i++) {
          const fact = facts[i];
          runRightActivateOnNode(parent, fact);
        }

        parent.children = savedListOfChildren;
      }

      break;

    // case "negative":
    //   const negativeNodeItems = (parent as INegativeNode).items;

    //   if (negativeNodeItems) {
    //     for (let i = 0; i < negativeNodeItems.length; i++) {
    //       const t = negativeNodeItems[i];
    //       if (t.joinResults) {
    //         runLeftActivateOnNode(newNode, t, null);
    //       }
    //     }
    //   }

    //   break;

    // case "ncc":
    //   const nccItems = (parent as INegatedConjunctiveConditionsNode).items;

    //   if (nccItems) {
    //     for (let i = 0; i < nccItems.length; i++) {
    //       const t = nccItems[i];
    //       if (t.nccResults) {
    //         runLeftActivateOnNode(newNode, t, null);
    //       }
    //     }
    //   }

    //   break;
  }
}

export function getConditionField(f: ICondition, field: IFactFields): any {
  switch (field) {
    case "identifier":
      return f[0];
    case "attribute":
      return f[1];
    case "value":
      return f[2];
  }
}
