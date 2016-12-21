import React from 'react';
import _ from 'lodash';
import invariant from 'invariant';
import RangeBarChart from './RangeBarChart';
import * as CustomPropTypes from './utils/CustomPropTypes';
import {hasXYScales} from './utils/Scale';
import {makeAccessor, domainFromData} from './utils/Data';

// BarChart represents a basic "Value/Value" bar chart,
// where each bar represents a single independent variable value and a single dependent value,
// with bars that are centered horizontally on x-value and extend from 0 to y-value,
// (or centered vertically on their y-value and extend from 0 to the x-value, in the case of horizontal chart variant)
// eg. http://www.snapsurveys.com/wp-content/uploads/2012/10/bar_2d8.png

// For other bar chart types, see RangeBarChart and AreaBarChart

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

export default class BarChart extends React.Component {
  static propTypes = {
    scale: CustomPropTypes.xyObjectOf(React.PropTypes.func.isRequired),
    data: React.PropTypes.array,
    getX: CustomPropTypes.getter,
    getY: CustomPropTypes.getter,
    horizontal: React.PropTypes.bool,

    barThickness: React.PropTypes.number,
    barClassName: React.PropTypes.string,
    barStyle: React.PropTypes.object
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
  render() {
    invariant(hasXYScales(this.props.scale), `BarChart.props.scale.x and scale.y must both be valid d3 scales`);

    const rangeBarChartProps = makeRangeBarChartProps(this.props);

    return <RangeBarChart {...rangeBarChartProps} />;
  }
}
