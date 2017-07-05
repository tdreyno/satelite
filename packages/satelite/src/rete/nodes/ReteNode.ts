import { IList } from "../util";

export interface IReteNode {
  type: "join" | "production" | "root-join";
  children: IList<IReteNode>;
  parent: IReteNode | null;
}
