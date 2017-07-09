import { IFactTuple } from "./Fact";
import { ProductionNode } from "./nodes/ProductionNode";
import { IVariableBindings } from "./Token";

export type IAddFactsSignature = (facts: IFactTuple | IFactTuple[]) => void;
export type IActivateCallback = (
  variableBindings: IVariableBindings,
  extra: {
    fact: IFactTuple;
    addProducedFact: IAddFactsSignature;
  },
) => any;

export type IInternalActivateCallback = (
  v: IVariableBindings,
  extra: {
    fact: IFactTuple;
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
    f: IFactTuple,
    b: IVariableBindings,
    addProducedFact: (facts: IFactTuple | IFactTuple[]) => void,
  ): void {
    this.onActivationCallback(b, {
      fact: f,
      addProducedFact,
    });
  }
}
