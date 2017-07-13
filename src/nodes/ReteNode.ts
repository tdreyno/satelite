import { IFact } from "../Fact";
import { Token } from "../Token";

let nextNodeId = 0;
export abstract class ReteNode {
  id = nextNodeId++;
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

  // tslint:disable-next-line:variable-name
  rerunForChild(_child: ReteNode) {
    throw new Error("Tried to leftRetract a node without an implementation");
  }

  updateNewNodeWithMatchesFromAbove(): void {
    const parent = this.parent;

    if (!parent) {
      return;
    }

    parent.rerunForChild(this);
  }
}

export class RootNode extends ReteNode {
  static create() {
    return new RootNode();
  }

  type = "root";

  // tslint:disable-next-line:no-empty variable-name
  rightRetract(_f: IFact) {}

  // tslint:disable-next-line:no-empty variable-name
  rerunForChild(_child: ReteNode) {}
}
