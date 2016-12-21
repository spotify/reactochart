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

  // todo: static getDomain
  static getDataDomain(props) {
    const {horizontal, data, getX, getY} = props;
    const accessor = horizontal ?  makeAccessor(getY) : makeAccessor(getX);
    // only have to specify range axis domain, other axis uses default domainFromData
    const rangeAxis = horizontal ? 'y' : 'x';
    return {
      [rangeAxis]: domainFromData(data, accessor)
    };
  }
  static getDomain(props) {
    return RangeBarChart.getDomain(makeRangeBarChartProps(props));
  }
  static getSpacing(props) {
    const {barThickness, horizontal, scale, data} = props;
    const tickDomain = props.domain;
    const domain = BarChart.getDataDomain(props);
    const P = barThickness / 2; //padding
    const k = horizontal ? 'y' : 'x';
    //find the edges of the tick domain, and map them through the scale function
    const [TD1, TD2] = _.map(_.pick(tickDomain[k], [0, tickDomain[k].length - 1]), scale[k]);
    //find the edges of the data domain, and map them through the scale function
    const [D1, D2] = _.map(_.pick(domain[k], [0, domain[k].length - 1]), scale[k]);
    //find the neccessary spacing (based on bar width) to push the bars completely inside the tick domain
    const [S1, S2] = [_.clamp(P - (D1 - TD1), 0, P), _.clamp(P - (D2 - TD2), 0, P)];//_.map([_.clamp(P - (D1 - TD1), 0, P), _.clamp(P - (TD2 - D2), 0, P)], scale[k]);
    if(horizontal){
      return {top: S2, right: 0, bottom: S1, left: 0}
    } else {
      return {top: 0, right: S1, bottom: 0, left: S2}
    }
  }
  render() {
    invariant(hasXYScales(this.props.scale), `BarChart.props.scale.x and scale.y must both be valid d3 scales`);

    const rangeBarChartProps = makeRangeBarChartProps(this.props);

    return <RangeBarChart {...rangeBarChartProps} />;
  }
}
