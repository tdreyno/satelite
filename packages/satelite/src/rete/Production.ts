import { IFactTuple } from "./Fact";
import { IProductionNode } from "./nodes/ProductionNode";
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

export interface IProduction {
  productionNode: IProductionNode;
  onActivation: IInternalActivateCallback;
}

export function makeProduction(onActivation: IActivateCallback): IProduction {
  const node: IProduction = Object.create(null);

  node.onActivation = (
    f: IFactTuple,
    b: IVariableBindings,
    addProducedFact: (facts: IFactTuple | IFactTuple[]) => void,
  ): void => {
    onActivation(b, {
      fact: f,
      addProducedFact,
    });
  };

  return node;
}
