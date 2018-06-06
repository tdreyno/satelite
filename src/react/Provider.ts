import * as PropTypes from "prop-types";
import { Component } from "react";
import { IFact } from "../Fact";
import { Rete } from "../Rete";

export class Provider<Schema extends IFact> extends Component<{
  rete: Rete<Schema>;
  children: JSX.Element;
}> {
  static propTypes = {
    rete: PropTypes.instanceOf(Rete).isRequired,
    children: PropTypes.any.isRequired
  };

  static childContextTypes = {
    rete: PropTypes.object.isRequired
  };

  getChildContext() {
    return {
      rete: this.props.rete
    };
  }

  render(): JSX.Element {
    return this.props.children;
  }
}
