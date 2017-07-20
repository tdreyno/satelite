import isFunction = require("lodash/isFunction");
import * as PropTypes from "prop-types";
import * as React from "react";

// import hoistStatics from "hoist-non-react-statics";
import { Query } from "../Query";
import { IAnyCondition, Rete } from "../Rete";
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
            rete: PropTypes.instanceOf(Rete),
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

            this.tearDownQuery();

            const conditions = conditionsOrPropConditions.map(
              conditionsOrPropCondition => {
                if (!isFunction(conditionsOrPropCondition)) {
                  return conditionsOrPropCondition;
                }

                return conditionsOrPropCondition(props);
              },
            );

            if (conditions.length > 0) {
              this.query = (this.context.rete as Rete).query(...conditions);
              this.query.onChange(this.executeReteToProps);
            }

            this.executeReteToProps();
          }

          tearDownQuery() {
            if (!this.context || !this.context.rete || !this.query) {
              return;
            }

            this.query.offChange(this.executeReteToProps);
            this.query = null;
          }

          executeReteToProps() {
            const variableBindings =
              (this.query && this.query.getVariableBindings()[0]) || {};

            const fromFn = storesToProps(
              variableBindings,
              this.context.rete,
              this.props,
              this.context,
            );

            // TODO: Avoid re-renders on fat arrow functions (memoize)

            this.setState(prevState => Object.assign({}, prevState, fromFn));
          }

          // tslint:disable-next-line:variable-name
          componentWillUpdate(_nextProps: any, nextState: any) {
            console.log("Render", nextState);
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
