import { IList } from "../util";

export interface IReteNode {
  type:
    | "beta-memory"
    | "join"
    | "production"
    | "dummy"
    | "negative"
    | "ncc"
    | "ncc-partner";
  children: IList<IReteNode>;
  parent: IReteNode | null;
}
