import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import _ from "lodash";
import moment from "moment";
import * as d3 from "d3";
import Playground from "component-playground";

// import *all* reactochart components/utils - usually you'd import one at a time
import * as Reactochart from "../../src";

import {
  randomWalk,
  randomWalkSeries,
  randomWalkTimeSeries,
  removeRandomData
} from "./data/util";
window.Reactochart = Reactochart;

export default class ExampleSection extends React.Component {
  static propTypes = {
    codeText: PropTypes.string,
    scope: PropTypes.object,
    isExpanded: PropTypes.bool,
    label: PropTypes.node,
    id: PropTypes.string,
    description: PropTypes.node,
    onClick: PropTypes.func
  };
  static defaultProps = {
    codeText: "",
    scope: {},
    isExpanded: true,
    label: "Example",
    id: ""
  };

  onClick = e => {
    if (this.props.onClick) {
      this.props.onClick(e, this.props.id);
    }
  };

  render() {
    const {
      codeText,
      isExpanded,
      label,
      id,
      description,
      onClick
    } = this.props;
    const scope = {
      React,
      ReactDOM,
      d3,
      _,
      moment,
      randomWalk,
      randomWalkSeries,
      randomWalkTimeSeries,
      // include all Reactochart components in scope
      ...Reactochart,
      ...this.props.scope
    };

    return (
      <div
        className={`row example ${
          isExpanded ? "example-active" : "example-inactive"
        }`}
      >
        <div className="col-md-12">
          <h3
            className="example-header"
            onClick={onClick ? this.onClick : _.noop}
          >
            {label || id} {isExpanded ? "▼" : "►"}
          </h3>

          {isExpanded ? (
            <div>
              {description ? (
                <div className="example-description">{description}</div>
              ) : null}
              <Playground codeText={codeText} scope={scope} noRender={false} />
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}
