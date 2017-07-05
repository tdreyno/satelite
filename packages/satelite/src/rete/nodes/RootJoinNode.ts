import { IFact } from "../Fact";
import { IToken, makeToken } from "../Token";
import { runLeftActivateOnNode, runLeftRetractOnNode } from "../util";
import {
  alphaMemoryNodeActivate,
  alphaMemoryNodeRetract,
  createExhaustiveHashTable,
  IAlphaMemoryNode,
  IExhaustiveHashTable,
  lookupInHashTable,
} from "./AlphaMemoryNode";
import { IReteNode } from "./ReteNode";

export interface IRootJoinNode extends IReteNode {
  type: "root-join";
  parent: null;
  facts: Set<IFact>;
  tokens: IList<IToken>;
  hashTable: IExhaustiveHashTable;
}

export function makeRootJoinNode(): IRootJoinNode {
  const node: IRootJoinNode = Object.create(null);

  node.type = "root-join";
  node.children = null;
  node.facts = new Set();
  node.hashTable = createExhaustiveHashTable();

  return node;
}

export function rootJoinNodeRightActivate(node: IRootJoinNode, f: IFact): void {
  node.facts.add(f);

  dispatchToAlphaMemories(node, f, alphaMemoryNodeActivate);

  const t = makeToken(node, null, f);

  if (node.children) {
    for (let j = 0; j < node.children.length; j++) {
      const child = node.children[j];
      runLeftActivateOnNode(child, t);
    }
  }
}

export function rootJoinNodeRightRetract(node: IRootJoinNode, f: IFact): void {
  node.facts.delete(f);

  dispatchToAlphaMemories(node, f, alphaMemoryNodeRetract);

  const t = makeToken(node, null, f);

  if (node.children) {
    for (let j = 0; j < node.children.length; j++) {
      const child = node.children[j];
      runLeftRetractOnNode(child, t);
    }
  }
}

export function dispatchToAlphaMemories(
  node: IRootJoinNode,
  f: IFact,
  fn: (am: IAlphaMemoryNode, f: IFact) => void,
) {
  let am;

  am = lookupInHashTable(node.hashTable, f.identifier, f.attribute, f.value);
  if (am) {
    fn(am, f);
  }

  am = lookupInHashTable(node.hashTable, f.identifier, f.attribute, null);
  if (am) {
    fn(am, f);
  }

  am = lookupInHashTable(node.hashTable, null, f.attribute, f.value);
  if (am) {
    fn(am, f);
  }

  am = lookupInHashTable(node.hashTable, f.identifier, null, f.value);
  if (am) {
    fn(am, f);
  }

  am = lookupInHashTable(node.hashTable, null, null, f.value);
  if (am) {
    fn(am, f);
  }

  am = lookupInHashTable(node.hashTable, null, f.attribute, null);
  if (am) {
    fn(am, f);
  }

  am = lookupInHashTable(node.hashTable, f.identifier, null, null);
  if (am) {
    fn(am, f);
  }

  am = lookupInHashTable(node.hashTable, null, null, null);
  if (am) {
    fn(am, f);
  }
}
