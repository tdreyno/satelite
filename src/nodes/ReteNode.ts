import map = require("lodash/map");
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
    throw new Error(
      `${this.toString()} Tried to rightActivate a node without an implementation`,
    );
  }

  // tslint:disable-next-line:variable-name
  rightUpdate(_prev: IFact, _f: IFact): void {
    throw new Error(
      `${this.toString()} Tried to rightUpdate a node without an implementation`,
    );
  }

  // tslint:disable-next-line:variable-name
  rightRetract(_f: IFact): void {
    throw new Error(
      `${this.toString()} Tried to rightRetract a node without an implementation`,
    );
  }

  // tslint:disable-next-line:variable-name
  leftActivate(_t: Token): void {
    throw new Error(
      `${this.toString()} Tried to leftActivate a node without an implementation`,
    );
  }

  // tslint:disable-next-line:variable-name
  leftUpdate(_prev: Token, _t: Token): void {
    throw new Error(
      `${this.toString()} Tried to leftUpdate a node without an implementation`,
    );
  }

  // tslint:disable-next-line:variable-name
  leftRetract(_t: Token): void {
    throw new Error(
      `${this.toString()} Tried to leftRetract a node without an implementation`,
    );
  }

  // tslint:disable-next-line:variable-name
  rerunForChild(_child: ReteNode) {
    throw new Error(
      `${this.toString()} Tried to leftRetract a node without an implementation`,
    );
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
      ? ` children=[${map(this.children, c => c.toString(false))}]`
      : ""}>`;
  }

  logF(eventName: string, ...data: any[]) {
    const old = this.rete.loggers;

    this.rete.loggers = console.log.bind(this);

    this.log(eventName, ...data);

    this.rete.loggers = old;
  }

  log(eventName: string, ...data: any[]) {
    if (!this.rete.loggers) {
      return;
    }

    const cleanData = map(data, d => {
      if (d instanceof Token) {
        return d.toString();
      }

      return `\n\t${JSON.stringify(d)}`;
    });

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
