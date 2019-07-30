import { bisector, line, curveLinear } from "d3";
import PropTypes from "prop-types";
import React from "react";
import * as CustomPropTypes from "./utils/CustomPropTypes";
import { getValue } from "./utils/Data";
import xyPropsEqual from "./utils/xyPropsEqual";

/**
 * `LineChart` displays data a series of points connected by straight line segments.
 */
export default class LineChart extends React.Component {
  static propTypes = {
    /**
     * Array of data objects
     */
    data: PropTypes.array.isRequired,
    /**
     * Accessor function for line X values, called once per datum, or a single value to be used for the entire line.
     */
    x: CustomPropTypes.valueOrAccessor,
    /**
     * Accessor function for line Y values, called once per datum, or a single value to be used for the entire line.
     */
    y: CustomPropTypes.valueOrAccessor,
    /**
     * Inline style object to be applied to the line path.
     */
    lineStyle: PropTypes.object,
    /**
     * Class attribute to be applied to the line path.
     */
    lineClassName: PropTypes.string,
    /**
     * D3 scale for X axis - provided by XYPlot.
     */
    xScale: PropTypes.func,
    /**
     * D3 scale for Y axis - provided by XYPlot.
     */
    yScale: PropTypes.func,
    /**
     * D3 curve for path generation
     */
    curve: PropTypes.func
  };
  static defaultProps = {
    lineStyle: {},
    lineClassName: "",
    curve: curveLinear
  };

  componentWillMount() {
    this.initBisector(this.props);
  }
  componentWillReceiveProps(nextProps) {
    this.initBisector(nextProps);
  }

  shouldComponentUpdate(nextProps) {
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
    const {
      data,
      xScale,
      yScale,
      x,
      y,
      curve,
      lineStyle,
      lineClassName
    } = this.props;

    const pathStr = line()
      .curve(curve)
      .x((d, i) => xScale(getValue(x, d, i)))
      .y((d, i) => yScale(getValue(y, d, i)))(data);

    return (
      <g className={`rct-line-chart ${lineClassName}`}>
        <path className={`rct-line-path`} d={pathStr} style={lineStyle} />
      </g>
    );
  }
}
