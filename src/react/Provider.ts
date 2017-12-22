import * as PropTypes from "prop-types";
import { Component } from "react";
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
    rete: PropTypes.object.isRequired,
  };

  getChildContext() {
    return {
      rete: this.props.rete,
    };
  }

  render(): JSX.Element {
    return this.props.children;
  }
}
