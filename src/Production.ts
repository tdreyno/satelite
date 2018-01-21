import { IFact } from "./Fact";
import { ProductionNode } from "./nodes/ProductionNode";
import { IVariableBindings } from "./Token";

export type IActivateCallback = (
  variableBindings: IVariableBindings,
  extra: {
    fact: IFact;
  },
) => undefined | void | null | IFact | IFact[];

export type IInternalActivateCallback = (
  v: IVariableBindings,
  extra: {
    fact: IFact;
  },
) => undefined | void | null | IFact | IFact[];

export class Production {
  static create(onActivationCallback: IActivateCallback) {
    return new Production(onActivationCallback);
  }

  productionNode!: ProductionNode;
  onActivationCallback: IInternalActivateCallback;

  constructor(onActivationCallback: IActivateCallback) {
    this.onActivationCallback = onActivationCallback;
  }

  onActivation(
    f: IFact,
    b: IVariableBindings,
  ): undefined | void | null | IFact | IFact[] {
    return this.onActivationCallback(b, {
      fact: f,
    });
  }
}
