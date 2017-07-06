import { IFact } from "./Fact";
import {
  IJoinNode,
  joinNodeLeftActivate,
  joinNodeLeftRetract,
  joinNodeRightActivate,
  joinNodeRightRetract,
} from "./nodes/JoinNode";
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
    case "root-join":
      return rootJoinNodeRightRetract(node as IRootJoinNode, f);
    case "join":
      return joinNodeRightRetract(node as IJoinNode, f);
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
  }
}
