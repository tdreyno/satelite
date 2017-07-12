import * as React from "react";

// import hoistStatics from "hoist-non-react-statics";
import { Rete } from "../Rete";

export type IReteToProps<ReteProps, OwnProps> = (
  rete: Rete,
  nextProps: OwnProps,
  context: object,
) => ReteProps;

export function inject<ReteProps, OwnProps>(
  storesToProps: IReteToProps<ReteProps, OwnProps>,
): (<TFunction extends React.ComponentClass<ReteProps | OwnProps>>(
  ComposedComponent: TFunction,
) => React.ComponentClass<OwnProps>) {
  return ComposedComponent => {
    class Injected extends React.Component<OwnProps, {}> {
      static wrappedComponent = ComposedComponent;
      static displayName = `Injected${ComposedComponent.displayName}`;

      static contextTypes = {
        rete: React.PropTypes.instanceOf(Rete),
      };

      constructor(props: OwnProps) {
        super(props);
      }

      componentWillMount() {
        if (this.context && this.context.rete) {
          this.executeReteToProps(this.props);
        }
      }

      executeReteToProps(props: OwnProps) {
        const fromFn = storesToProps(this.context.rete, props, this.context);

        // TODO: track created bindings/listeners/queries

        this.setState(prevState => Object.assign({}, prevState, fromFn));
      }

      componentWillUnmount() {
        if (!this.context || !this.context.rete) {
          return;
        }

        // TODO: cleanup created bindings/listeners/queries
      }

      render() {
        return <ComposedComponent {...this.props} {...this.state} />;
      }
    }

    // hoistStatics(Injected, ComposedComponent);

    return Injected;
  };
}
