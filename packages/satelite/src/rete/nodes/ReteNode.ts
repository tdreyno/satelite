import { IFact } from "../Fact";
import { Token } from "../Token";
import { AccumulatorNode } from "./AccumulatorNode";
import { JoinNode } from "./JoinNode";

export abstract class ReteNode {
  type: string;
  children: ReteNode[] = [];
  parent: ReteNode | null = null;

  // tslint:disable-next-line:variable-name
  rightActivate(_f: IFact): void {
    throw new Error("Tried to rightActivate a node without an implementation");
  }

  // tslint:disable-next-line:variable-name
  rightRetract(_f: IFact): void {
    throw new Error("Tried to rightRetract a node without an implementation");
  }

  // tslint:disable-next-line:variable-name
  leftActivate(_t: Token): void {
    throw new Error("Tried to leftActivate a node without an implementation");
  }

  // tslint:disable-next-line:variable-name
  leftRetract(_t: Token): void {
    throw new Error("Tried to leftRetract a node without an implementation");
  }

  updateNewNodeWithMatchesFromAbove(): void {
    const parent = this.parent;

    if (!parent) {
      return;
    }

    switch (parent.type) {
      case "root":
        break;
      case "root-join":
      case "join":
      case "negative":
        const facts = (parent as JoinNode).alphaMemory.facts;

        if (facts) {
          const savedListOfChildren = parent.children;
          parent.children = [this];

          for (let i = 0; i < facts.length; i++) {
            const fact = facts[i];
            parent.rightActivate(fact);
          }

          parent.children = savedListOfChildren;
        }

        break;

      case "accumulator":
        const savedListOfChildren = parent.children;
        parent.children = [this];

        (parent as AccumulatorNode).executeAccumulator();

        parent.children = savedListOfChildren;

        break;

      default:
        throw new Error(
          `Tried to updateMatches of unknown parent ${parent.type}`,
        );
    }
  }
}

export class RootNode extends ReteNode {
  static create() {
    return new RootNode();
  }

  type = "root";

  // tslint:disable-next-line:no-empty
  rightRetract() {}
}
