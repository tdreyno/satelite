import { IFact } from "../Fact";
import { Rete } from "../Rete";
import { Token } from "../Token";

let nextNodeId = 0;
export class ReteNode {
  id = nextNodeId++;
  rete: Rete;
  children: ReteNode[] = [];
  parent: ReteNode | null = null;

  constructor(rete: Rete) {
    this.rete = rete;
  }

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

  toString(nested = true): string {
    return `<${this.constructor.name} id=${this.id}${nested
      ? ` children=[${this.children.map(c => c.toString(false))}]`
      : ""}>`;
  }

  log(eventName: string, ...data: any[]) {
    if (!this.rete.loggers) {
      return;
    }

    const cleanData = data
      .map(d => {
        if (d instanceof Token) {
          return d.toString();
        }

        return JSON.stringify(d);
      })
      .map(s => `\n\t${s}`);

    this.rete.log(eventName, this.toString(), ...cleanData);
  }
}

export class RootNode extends ReteNode {
  static create(rete: Rete) {
    return new RootNode(rete);
  }

  // tslint:disable-next-line:no-empty variable-name
  rightRetract(f: IFact) {
    this.log("rightRetract", f);
  }

  // tslint:disable-next-line:no-empty variable-name
  rerunForChild(_child: ReteNode) {}
}
