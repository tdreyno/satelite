import { isFunction } from "lodash";
import * as React from "react";

// import hoistStatics from "hoist-non-react-statics";
import { IFact } from "../Fact";
import { Query } from "../Query";
import { IAnyCondition, IConditions, Rete } from "../Rete";
import { IVariableBindings } from "../Token";

export type IReteToProps<ReteProps, OwnProps> = (
  variables: IVariableBindings,
  rete: Rete,
  nextProps: OwnProps,
  context: object,
) => ReteProps;

export type IPropConditions<OwnProps> = (props: OwnProps) => IAnyCondition;
export type IConditionsOrPropConditions<OwnProps> =
  | IAnyCondition
  | IPropConditions<OwnProps>;

export function subscribe<ReteProps, OwnProps>(
  ...conditionsOrPropConditions: Array<IConditionsOrPropConditions<OwnProps>>,
): {
  then: (
    storesToProps: IReteToProps<ReteProps, OwnProps>,
  ) => (<TFunction extends React.ComponentClass<ReteProps | OwnProps>>(
    ComposedComponent: TFunction,
  ) => React.ComponentClass<OwnProps>);
} {
  return {
    then: storesToProps => {
      return ComposedComponent => {
        class Injected extends React.PureComponent<OwnProps, ReteProps> {
          static wrappedComponent = ComposedComponent;
          static displayName = `Injected${ComposedComponent.displayName}`;

          static contextTypes = {
            rete: React.PropTypes.instanceOf(Rete),
          };

          query: Query | null = null;

          constructor(props: OwnProps) {
            super(props);

            this.executeReteToProps = this.executeReteToProps.bind(this);
          }

          componentWillMount() {
            this.buildQuery(this.props);
          }

          componentWillReceiveProps(nextProps: OwnProps) {
            this.buildQuery(nextProps);
          }

          componentWillUnmount() {
            this.tearDownQuery();
          }

          buildQuery(props: OwnProps) {
            if (!this.context || !this.context.rete) {
              return;
            }

            if (this.query) {
              this.tearDownQuery();
            }

            const conditions = conditionsOrPropConditions.map(
              conditionsOrPropCondition => {
                if (!isFunction(conditionsOrPropCondition)) {
                  return conditionsOrPropCondition;
                }

                return conditionsOrPropCondition(props);
              },
            );

            this.query = (this.context.rete as Rete).query(...conditions);
            this.query.onChange(this.executeReteToProps);
          }

          tearDownQuery() {
            if (!this.context || !this.context.rete || !this.query) {
              return;
            }

            this.query.offChange(this.executeReteToProps);
            this.query = null;
          }

          executeReteToProps(
            facts: IFact[],
            variableBindings: IVariableBindings[],
          ) {
            const fromFn = storesToProps(
              variableBindings,
              this.context.rete,
              this.props,
              this.context,
            );

            this.setState(prevState => Object.assign({}, prevState, fromFn));
          }

          render() {
            return <ComposedComponent {...this.props} {...this.state} />;
          }
        }

        // hoistStatics(Injected, ComposedComponent);

        return Injected;
      };
    },
  };
}
