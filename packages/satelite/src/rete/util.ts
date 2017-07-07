import { IFact } from "./Fact";
import {
  accumulatorNodeLeftActivate,
  accumulatorNodeLeftRetract,
  executeAccumulator,
  IAccumulatorNode,
} from "./nodes/AccumulatorNode";
import {
  IJoinNode,
  joinNodeLeftActivate,
  joinNodeLeftRetract,
  joinNodeRightActivate,
  joinNodeRightRetract,
} from "./nodes/JoinNode";
import {
  INegativeNode,
  negativeNodeLeftActivate,
  negativeNodeLeftRetract,
  negativeNodeRightActivate,
  negativeNodeRightRetract,
} from "./nodes/NegativeNode";
import {
  IProductionNode,
  productionNodeLeftActivate,
  productionNodeLeftRetract,
} from "./nodes/ProductionNode";
import {
  IQueryNode,
  queryNodeLeftActivate,
  queryNodeLeftRetract,
} from "./nodes/QueryNode";
import { IReteNode } from "./nodes/ReteNode";
import {
  IRootJoinNode,
  rootJoinNodeRightActivate,
  rootJoinNodeRightRetract,
} from "./nodes/RootJoinNode";
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

  return removeIndexFromList(list, i);
}

export function removeIndexFromList<T>(
  list: T[] | null,
  index: number,
): T[] | null {
  if (!list) {
    return null;
  }

  if (index !== -1) {
    list.splice(index, 1);
  }

  if (list.length <= 0) {
    return null;
  }

  return list;
}

export function findInList<T, K>(
  list: IList<T> | null,
  item: K,
  comparator: (a: T, b: K) => boolean,
): number {
  if (list) {
    for (let i = 0; i < list.length; i++) {
      if (comparator(list[i], item)) {
        return i;
      }
    }
  }

  return -1;
}

export function reduceList<T, V>(
  list: IList<T>,
  reducer: (acc: V, i: T) => V,
  initialValue: V,
): V {
  let currentValue = initialValue;

  if (list) {
    for (let i = 0; i < list.length; i++) {
      currentValue = reducer(currentValue, list[i]);
    }
  }

  return currentValue;
}

export function runLeftActivateOnNodes(
  nodes: IList<IReteNode>,
  t: IToken,
): void {
  if (nodes) {
    for (let i = 0; i < nodes.length; i++) {
      const child = nodes[i];
      runLeftActivateOnNode(child, t);
    }
  }
}

export function runLeftActivateOnNode(node: IReteNode, t: IToken): void {
  switch (node.type) {
    case "query":
      return queryNodeLeftActivate(node as IQueryNode, t);
    case "production":
      return productionNodeLeftActivate(node as IProductionNode, t);
    case "join":
      return joinNodeLeftActivate(node as IJoinNode, t);
    case "negative":
      return negativeNodeLeftActivate(node as INegativeNode, t);
    case "accumulator":
      return accumulatorNodeLeftActivate(node as IAccumulatorNode, t);
    default:
      throw new Error(`Tried to leftActivate unknown node ${node.type}`);
  }
}

export function runLeftRetractOnNodes(
  nodes: IList<IReteNode>,
  t: IToken,
): void {
  if (nodes) {
    for (let i = 0; i < nodes.length; i++) {
      const child = nodes[i];
      runLeftRetractOnNode(child, t);
    }
  }
}

// tslint:disable-next-line:variable-name
export function runLeftRetractOnNode(node: IReteNode, t: IToken) {
  switch (node.type) {
    case "query":
      return queryNodeLeftRetract(node as IQueryNode, t);
    case "production":
      return productionNodeLeftRetract(node as IProductionNode, t);
    case "join":
      return joinNodeLeftRetract(node as IJoinNode, t);
    case "negative":
      return negativeNodeLeftRetract(node as INegativeNode, t);
    case "accumulator":
      return accumulatorNodeLeftRetract(node as IAccumulatorNode, t);
    default:
      throw new Error(`Tried to leftRetract unknown node ${node.type}`);
  }
}

export function runRightActivateOnNodes(
  nodes: IList<IReteNode>,
  f: IFact,
): void {
  if (nodes) {
    for (let i = 0; i < nodes.length; i++) {
      const child = nodes[i];
      runRightActivateOnNode(child, f);
    }
  }
}

export function runRightActivateOnNode(node: IReteNode, f: IFact) {
  switch (node.type) {
    case "root-join":
      return rootJoinNodeRightActivate(node as IRootJoinNode, f);
    case "join":
      return joinNodeRightActivate(node as IJoinNode, f);
    case "negative":
      return negativeNodeRightActivate(node as INegativeNode, f);
    default:
      throw new Error(`Tried to rightActivate unknown node ${node.type}`);
  }
}

export function runRightRetractOnNodes(
  nodes: IList<IReteNode>,
  f: IFact,
): void {
  if (nodes) {
    for (let i = 0; i < nodes.length; i++) {
      const child = nodes[i];
      runRightRetractOnNode(child, f);
    }
  }
}

export function runRightRetractOnNode(node: IReteNode, f: IFact) {
  switch (node.type) {
    case "root":
      break;
    case "root-join":
      return rootJoinNodeRightRetract(node as IRootJoinNode, f);
    case "join":
      return joinNodeRightRetract(node as IJoinNode, f);
    case "negative":
      return negativeNodeRightRetract(node as INegativeNode, f);
    default:
      throw new Error(`Tried to rightRetract unknown node ${node.type}`);
  }
}

export function updateNewNodeWithMatchesFromAbove(newNode: IReteNode): void {
  const parent = newNode.parent;

  if (!parent) {
    return;
  }

  switch (parent.type) {
    case "root-join":
    case "join":
    case "negative":
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

    case "accumulator":
      const savedListOfChildren = parent.children;
      parent.children = [newNode];

      executeAccumulator(parent as IAccumulatorNode);

      parent.children = savedListOfChildren;

      break;

    default:
      throw new Error(
        `Tried to updateMatches of unknown parent ${parent.type}`,
      );
  }
}
