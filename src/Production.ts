import { IFact } from "./Fact";
import { ProductionNode } from "./nodes/ProductionNode";
import { IVariableBindings } from "./Token";

export type IActivateCallback<Schema extends IFact> = (
  variableBindings: IVariableBindings<Schema>,
  extra: {
    fact: Schema;
  }
) => undefined | void | null | Schema | Schema[];

export type IInternalActivateCallback<Schema extends IFact> = (
  v: IVariableBindings<Schema>,
  extra: {
    fact: Schema;
  }
) => undefined | void | null | Schema | Schema[];

export class Production<Schema extends IFact> {
  static create<S extends IFact>(onActivationCallback: IActivateCallback<S>) {
    return new Production<S>(onActivationCallback);
  }

  productionNode!: ProductionNode<Schema>;
  onActivationCallback: IInternalActivateCallback<Schema>;

  constructor(onActivationCallback: IActivateCallback<Schema>) {
    this.onActivationCallback = onActivationCallback;
  }

  onActivation(
    f: Schema,
    b: IVariableBindings<Schema>
  ): undefined | void | null | Schema | Schema[] {
    return this.onActivationCallback(b, {
      fact: f
    });
  }
}
