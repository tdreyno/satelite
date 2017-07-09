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
  f: IFactTuple,
  v: IVariableBindings,
  addProducedFact: IAddFactsSignature,
) => any;

export class Production {
  static create(onActivation: IActivateCallback) {
    return new Production(onActivation);
  }

  productionNode: ProductionNode;
  onActivation: IInternalActivateCallback;

  constructor(onActivation: IActivateCallback) {
    this.onActivation = (
      f: IFactTuple,
      b: IVariableBindings,
      addProducedFact: (facts: IFactTuple | IFactTuple[]) => void,
    ): void => {
      onActivation(b, {
        fact: f,
        addProducedFact,
      });
    };
  }
}
