import { IFact } from "./Fact";
import { ProductionNode } from "./nodes/ProductionNode";
import { IVariableBindings } from "./Token";

export type IAddFactsSignature = (...facts: IFact[]) => void;
export type IActivateCallback = (
  variableBindings: IVariableBindings,
  extra: {
    fact: IFact;
    addProducedFact: IAddFactsSignature;
  },
) => any;

export type IInternalActivateCallback = (
  v: IVariableBindings,
  extra: {
    fact: IFact;
    addProducedFact: IAddFactsSignature;
  },
) => any;

export class Production {
  static create(onActivationCallback: IActivateCallback) {
    return new Production(onActivationCallback);
  }

  productionNode: ProductionNode;
  onActivationCallback: IInternalActivateCallback;

  constructor(onActivationCallback: IActivateCallback) {
    this.onActivationCallback = onActivationCallback;
  }

  onActivation(
    f: IFact,
    b: IVariableBindings,
    addProducedFact: (...facts: IFact[]) => void,
  ): void {
    this.onActivationCallback(b, {
      fact: f,
      addProducedFact,
    });
  }
}
