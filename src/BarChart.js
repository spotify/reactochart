import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import RangeBarChart from './RangeBarChart';
import * as CustomPropTypes from './utils/CustomPropTypes';
import {hasXYScales} from './utils/Scale';
import {makeAccessor, domainFromData} from './utils/Data';
import xyPropsEqual from './utils/xyPropsEqual';


function makeRangeBarChartProps(barChartProps) {
  // this component is a simple wrapper around RangeBarChart,
  // passing accessors to make range bars which span from zero to the data value
  const {horizontal, getX, getY} = barChartProps;
  const getZero = _.constant(0);

  return {
    ...barChartProps,
    getX: horizontal ? getZero : getX,
    getY: horizontal ? getY : getZero,
    getXEnd: horizontal ? getX : undefined,
    getYEnd: horizontal ? undefined : getY
  };
}

/**
 * BarChart represents a basic "Value/Value" bar chart,
 * where each bar represents a single independent variable value and a single dependent value,
 * with bars that are centered horizontally on x-value and extend from 0 to y-value,
 * (or centered vertically on their y-value and extend from 0 to the x-value, in the case of horizontal chart variant)
 * eg. http://www.snapsurveys.com/wp-content/uploads/2012/10/bar_2d8.png
 *
 * For other bar chart types, see RangeBarChart and AreaBarChart
 */

export default class BarChart extends React.Component {
  static propTypes = {
    /**
     * D3 scales for the X and Y axes of the chart, in {x, y} object format.
     */
    scale: CustomPropTypes.xyObjectOf(PropTypes.func.isRequired),
    /**
     * Array of data to be plotted. One bar will be rendered per datum in the array.
     */
    data: PropTypes.array,
    getX: CustomPropTypes.getter,
    getY: CustomPropTypes.getter,
    /**
     * Boolean which determines whether the chart will use horizontal or vertical bars.
     * When `true`, bars will be horizontal, ie. the X-axis will be treated as the dependent axis.
     */
    horizontal: PropTypes.bool,

    /**
     * Thickness (in pixels) of each bar (ie. bar height if `horizontal` is `true`, otherwise bar width).
     */
    barThickness: PropTypes.number,
    /**
     * Inline style object to be applied to each bar.
     */
    barStyle: PropTypes.object,
    /**
     * Class attribute to be applied to each bar.
     */
    barClassName: PropTypes.string,
    /**
     * Data getter for class attribute to be applied to each bar. Whereas `className` passes the same class to all
     * bars, this is a function called once per bar, which gets the bar's datum as its first argument,
     * so that each bar may determine its own className.
     */
    getClass: CustomPropTypes.getter,

    /**
     * `mousemove` event handler callback, called when user's mouse moves within a bar.
     */
    onMouseMoveBar: PropTypes.func,
    /**
     * `mouseenter` event handler callback, called when user's mouse enters a bar.
     */
    onMouseEnterBar: PropTypes.func,
    /**
     * `mouseleave` event handler callback, called when user's mouse leaves a bar.
     */
    onMouseLeaveBar: PropTypes.func
  };
  static defaultProps = {
    data: [],
    horizontal: false,
    barThickness: 8,
    barClassName: '',
    barStyle: {}
  };

  // gets data domain of independent variable
  static getDomain(props) {
    return RangeBarChart.getDomain(makeRangeBarChartProps(props));
  }
  static getSpacing(props) {
    return RangeBarChart.getSpacing(makeRangeBarChartProps(props));
  }

  shouldComponentUpdate(nextProps, nextState) {
    const shouldUpdate = !xyPropsEqual(this.props, nextProps, ['barStyle']);
    return shouldUpdate;
  }

  render() {
    invariant(hasXYScales(this.props.scale), `BarChart.props.scale.x and scale.y must both be valid d3 scales`);

    const rangeBarChartProps = makeRangeBarChartProps(this.props);

    return <RangeBarChart {...rangeBarChartProps} />;
  }
}
