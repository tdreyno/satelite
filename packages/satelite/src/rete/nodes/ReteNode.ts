import { IList } from "../util";

export interface IReteNode {
  type: "join" | "production" | "root-join" | "root" | "query";
  children: IList<IReteNode>;
  parent: IReteNode | null;
}

export interface IRootNode extends IReteNode {
  type: "root";
  parent: null;
}

export function makeRootNode(): IRootNode {
  const node: IRootNode = Object.create(null);

  node.type = "root";
  node.parent = null;

  return node;
}
