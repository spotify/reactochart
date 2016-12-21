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

function getDataDomain(props) {
  const {horizontal, data, getX, getY} = props;
  const accessor = horizontal ?  makeAccessor(getY) : makeAccessor(getX);
  // only have to specify range axis domain, other axis uses default domainFromData
  const rangeAxis = horizontal ? 'y' : 'x';
  return {
    [rangeAxis]: domainFromData(data, accessor)
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
    const {barThickness, horizontal, scale, data, domain} = props;
    const dataDomain = getDataDomain(props);
    const P = barThickness / 2; //padding
    const k = horizontal ? 'y' : 'x';
    //find the edges of the tick domain, and map them through the scale function
    const [domainHead, domainTail] = [_.first(domain[k]), _.last(domain[k])].map(scale[k]);
    //find the edges of the data domain, and map them through the scale function
    const [dataDomainHead, dataDomainTail] = [_.first(dataDomain[k]), _.last(dataDomain[k])].map(scale[k]);
    //find the neccessary spacing (based on bar width) to push the bars completely inside the tick domain
    const [spacingHead, spacingTail] = [_.clamp(P - (dataDomainTail - domainTail), 0, P), _.clamp(P - (dataDomainHead - domainHead), 0, P)];
    if(horizontal){
      return {top: spacingHead, right: 0, bottom: spacingTail, left: 0}
    } else {
      return {top: 0, right: spacingTail, bottom: 0, left: spacingHead}
    }
  }
  render() {
    invariant(hasXYScales(this.props.scale), `BarChart.props.scale.x and scale.y must both be valid d3 scales`);

    const rangeBarChartProps = makeRangeBarChartProps(this.props);

    return <RangeBarChart {...rangeBarChartProps} />;
  }
}
