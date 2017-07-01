import { IReteNode } from "./ReteNode";

export interface IDummyNode extends IReteNode {
  type: "dummy";
  parent: null;

  // Will be empty, so validation checks always pass.
  items: null;
}
