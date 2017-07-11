import { Component, PropTypes, ReactNode } from "react";
import { Rete } from "../Rete";

export class Provider extends Component<{
  rete: Rete;
  children: JSX.Element;
}> {
  static propTypes = {
    rete: PropTypes.instanceOf(Rete).isRequired,
    children: PropTypes.any.isRequired,
  };

  static childContextTypes = {
    stores: PropTypes.object.isRequired,
  };

  getChildContext() {
    return {
      rete: this.props.rete,
    };
  }

  render() {
    return this.props.children;
  }
}