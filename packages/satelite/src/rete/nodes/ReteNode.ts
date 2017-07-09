import { IList } from "../util";

export interface IReteNode {
  type:
    | "join"
    | "production"
    | "root-join"
    | "root"
    | "query"
    | "negative"
    | "accumulator";
  children: IList<IReteNode>;
  parent: IReteNode | null;
}

export abstract class ReteNode {
  type: string;
  children: IList<IReteNode>;
  parent: IReteNode | null;
}

export class RootNode extends ReteNode {
  static create() {
    return new RootNode();
  }

  type = "root";
  parent = null;
}
