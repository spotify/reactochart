import { line, curveLinear } from 'd3-shape';
import { bisector } from 'd3-array';

import PropTypes from 'prop-types';
import React from 'react';
import * as CustomPropTypes from './utils/CustomPropTypes';
import { getValue } from './utils/Data';
import xyPropsEqual from './utils/xyPropsEqual';

/**
 * `LineChart` displays a series of points connected by straight line segments.
 * Each `LineChart` renders one line.
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
    curve: PropTypes.func,
  };
  static defaultProps = {
    lineStyle: {},
    lineClassName: '',
    curve: curveLinear,
  };

  static getBisectorState(props) {
    const bisectX = bisector(d => getValue(props.x, d)).left;
    return { bisectX };
  }

  static getDerivedStateFromProps(nextProps) {
    if (nextProps.x) {
      return LineChart.getBisectorState(nextProps);
    }

    return null;
  }

  state = {
    bisectX: null,
  };

  shouldComponentUpdate(nextProps) {
    return !xyPropsEqual(this.props, nextProps, ['lineStyle', 'lineClassName']);
  }

  getHovered = x => {
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
      lineClassName,
    } = this.props;

    const pathStr = line()
      .curve(curve)
      .x((d, i) => xScale(getValue(x, d, i)))
      .y((d, i) => yScale(getValue(y, d, i)))(data);

    return (
      <g className={`rct-line-chart ${lineClassName}`} aria-hidden="true">
        <path className="rct-line-path" d={pathStr} style={lineStyle} />
      </g>
    );
  }
}
