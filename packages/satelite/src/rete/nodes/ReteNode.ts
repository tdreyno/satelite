import { IList } from "../util";

export interface IReteNode {
  type:
    | "beta-memory"
    | "join"
    | "production"
    | "dummy"
    | "root"
    | "negative"
    | "ncc"
    | "ncc-partner";
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
  node.children = null;

  return node;
}
