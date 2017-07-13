import { isFunction } from "lodash";
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
export type IOneOrMore<T> = T | T[];

export function subscribe<ReteProps, OwnProps>(
  ...conditionsOrPropConditions: Array<
    IOneOrMore<IConditionsOrPropConditions<OwnProps>>
  >,
): {
  then: (
    storesToProps: IReteToProps<ReteProps, OwnProps>,
  ) => (<TFunction extends React.ComponentClass<ReteProps | OwnProps>>(
    ComposedComponent: TFunction,
  ) => React.ComponentClass<OwnProps>);
} {
  const conditionSets = conditionsOrPropConditions.map(
    (conditionSet: any[]) => {
      if (conditionSet[1] && typeof conditionSet[1] === "string") {
        return [conditionSet];
      }

      return conditionSet;
    },
  );

  return {
    then: storesToProps => {
      return ComposedComponent => {
        class Injected extends React.PureComponent<OwnProps, ReteProps> {
          static wrappedComponent = ComposedComponent;
          static displayName = `Injected${ComposedComponent.displayName}`;

          static contextTypes = {
            rete: PropTypes.instanceOf(Rete),
          };

          queries: Set<Query> = new Set();

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
            this.tearDownQueries();
          }

          buildQuery(props: OwnProps) {
            if (!this.context || !this.context.rete) {
              return;
            }

            this.tearDownQueries();

            const conditions = conditionSets.map(conditionsOrPropCondition => {
              if (!isFunction(conditionsOrPropCondition)) {
                return conditionsOrPropCondition;
              }

              return conditionsOrPropCondition(props);
            });

            conditions.forEach(conditionSet => {
              const q = (this.context.rete as Rete).query(conditionSet);
              q.onChange(this.executeReteToProps);
              this.queries.add(q);
            });

            this.executeReteToProps();
          }

          tearDownQueries() {
            if (!this.context || !this.context.rete) {
              return;
            }

            for (const q of this.queries) {
              q.offChange(this.executeReteToProps);
              this.queries.delete(q);
            }
          }

          executeReteToProps() {
            const variableBindings = Array.from(
              this.queries,
            ).reduce((bindings, query) => {
              Object.assign(bindings, query.getVariableBindings());
              return bindings;
            }, {});

            console.log(variableBindings);

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
