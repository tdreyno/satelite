import eq = require("lodash/eq");
import isEqualWith = require("lodash/isEqualWith");
import isFunction = require("lodash/isFunction");
import map = require("lodash/map");
// import hoistStatics = require("hoist-non-react-statics");
import * as PropTypes from "prop-types";
import * as React from "react";

import { ICondition } from "../Condition";
import { IFact } from "../Fact";
import { AccumulatorCondition } from "../nodes/AccumulatorNode";
import { Query } from "../Query";
import { Rete } from "../Rete";
import { IVariableBindings } from "../Token";

const isEqual = (a: any, b: any) => isEqualWith(a, b, eq);

export type IReteToProps<Schema extends IFact, ReteProps, OwnProps> = (
  variables: IVariableBindings<Schema>,
  rete: Rete<Schema>,
  nextProps: OwnProps
) => ReteProps;

export type IPropConditions<Schema extends IFact, OwnProps> = (
  props: OwnProps
) => ICondition<Schema> | AccumulatorCondition<Schema>;
export type IConditionsOrPropConditions<Schema extends IFact, OwnProps> =
  | ICondition<Schema>
  | AccumulatorCondition<Schema>
  | IPropConditions<Schema, OwnProps>;

export function subscribe<Schema extends IFact, ReteProps, OwnProps>(
  ...conditionsOrPropConditions: Array<
    IConditionsOrPropConditions<Schema, OwnProps>
  >
): (<TFunction extends React.ComponentClass<ReteProps | OwnProps>>(
  ComposedComponent: TFunction
) => React.ComponentClass<OwnProps>) {
  return ComposedComponent => {
    class Injected extends React.Component<OwnProps, ReteProps> {
      static wrappedComponent = ComposedComponent;
      static displayName = `Injected${ComposedComponent.displayName}`;

      static contextTypes = {
        rete: PropTypes.instanceOf(Rete)
      };

      query: Query<Schema> | null = null;

      // True until the query is parsed.
      hasPropConditions: boolean = true;

      constructor(props: OwnProps) {
        super(props);

        this.executeReteToProps = this.executeReteToProps.bind(this);
      }

      shouldComponentUpdate(
        nextProps: OwnProps,
        nextState: ReteProps
      ): boolean {
        return (
          !isEqual(this.props, nextProps) || !isEqual(this.state, nextState)
        );
      }

      componentWillMount() {
        this.buildQuery(this.props);
      }

      componentWillReceiveProps(nextProps: OwnProps) {
        if (!this.hasPropConditions) {
          return;
        }

        this.buildQuery(nextProps);
      }

      componentWillUnmount() {
        this.tearDownQuery();
      }

      buildQuery(props: OwnProps) {
        if (!this.context || !this.context.rete) {
          return;
        }

        // Don't re-build if inputs are the same.
        if (this.query && isEqual(this.props, props)) {
          return;
        }

        this.tearDownQuery();

        this.hasPropConditions = false;

        const conditions = map(
          conditionsOrPropConditions,
          conditionsOrPropCondition => {
            if (!isFunction(conditionsOrPropCondition)) {
              this.hasPropConditions = true;
              return conditionsOrPropCondition;
            }

            return conditionsOrPropCondition(props);
          }
        );

        if (conditions.length > 0) {
          this.query = (this.context.rete as Rete<Schema>).query(...conditions);
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
        if (!this.query) {
          return;
        }

        const variableBindings = this.query.variableBindings[0];

        if (variableBindings) {
          this.setState(variableBindings as any);
        }
      }

      // tslint:disable-next-line:variable-name
      // componentWillUpdate(_nextProps: any, nextState: any) {
      //   console.log("Render", this.state, nextState);
      //   // const e = isEqual(this.state, nextState);
      // }

      render() {
        return <ComposedComponent {...this.props} {...this.state} />;
      }
    }

    // hoistStatics(Injected, ComposedComponent as any);

    return Injected;
  };
}
