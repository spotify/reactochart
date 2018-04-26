import React from "react";
import _ from "lodash";
import { bisector } from "d3";
import shallowEqual from "./utils/shallowEqual";
import PropTypes from "prop-types";

import * as CustomPropTypes from "./utils/CustomPropTypes";
import { getValue } from "./utils/Data";
import xyPropsEqual from "./utils/xyPropsEqual";

export default class LineChart extends React.Component {
  static propTypes = {
    /**
     * the array of data objects
     */
    data: PropTypes.array.isRequired,
    /**
     * Accessor function for line X values, called once per datum, or a single X value to be used for the entire line.
     */
    x: CustomPropTypes.valueOrAccessor,
    /**
     * Accessor function for line Y values, called once per datum, or a single Y value to be used for the entire line.
     */
    y: CustomPropTypes.valueOrAccessor,
    /**
     * Inline style object to be applied to the line path
     */
    lineStyle: PropTypes.object,
    /**
     * Class attribute to be applied to the line path
     */
    lineClassName: PropTypes.string,
    /**
     * D3 scale for X axis - provided by XYPlot
     */
    xScale: PropTypes.func,
    /**
     * D3 scale for Y axis - provided by XYPlot
     */
    yScale: PropTypes.func
  };
  static defaultProps = {
    lineStyle: {},
    lineClassName: ""
  };

  componentWillMount() {
    this.initBisector(this.props);
  }
  componentWillReceiveProps(nextProps) {
    this.initBisector(nextProps);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !xyPropsEqual(this.props, nextProps, ["lineStyle", "lineClassName"]);
  }

  initBisector(props) {
    this.setState({ bisectX: bisector(d => getValue(props.x, d)).left });
  }

  getHovered = (x, y) => {
    const closestDataIndex = this.state.bisectX(this.props.data, x);
    return this.props.data[closestDataIndex];
  };

  render() {
    const { data, xScale, yScale, x, y, lineStyle, lineClassName } = this.props;

    const points = _.map(data, (d, i) => [
      xScale(getValue(x, d, i)),
      yScale(getValue(y, d, i))
    ]);
    const pathStr = pointsToPathStr(points);

    return (
      <g className={`${this.props.name} ${lineClassName}`}>
        <path d={pathStr} style={lineStyle} />
      </g>
    );
  }
}

function pointsToPathStr(points) {
  // takes array of points in [[x, y], [x, y]... ] format
  // returns SVG path string in "M X Y L X Y" format
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#Line_commands
  // todo: replace this with d3 path generator
  return _.map(points, ([x, y], i) => {
    const command = i === 0 ? "M" : "L";
    return `${command} ${x} ${y}`;
  }).join(" ");
}
