import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';

import {methodIfFuncProp} from './util.js';
import * as CustomPropTypes from './utils/CustomPropTypes';
import {dataTypeFromScaleType} from './utils/Scale';
import {makeAccessor, domainFromRangeData} from './utils/Data';

// MarkerLine is similar to a bar chart,
// except that it just draws a line at the data value, rather than a full bar
// If the independent variable is a range, the length of the line will represent that range
// Otherwise all lines will be the same length.
// The dependent variable must be a single value, not a range.

function getTickType(props) {
  const {getXEnd, getYEnd, orientation} = props;
  const isVertical = (orientation === 'vertical');
  // warn if a range is passed for the dependent variable, which is expected to be a value
  if((isVertical && !_.isUndefined(getYEnd)) || (!isVertical && !_.isUndefined(getXEnd)))
    console.warn("Warning: MarkerLineChart can only show the independent variable as a range, not the dependent variable.");

  if((isVertical && !_.isUndefined(getXEnd)) || (!isVertical && !_.isUndefined(getYEnd)))
    return "RangeValue";

  return "ValueValue";
}


export default class MarkerLineChart extends React.Component {
  static propTypes = {
    // the array of data objects
    data: PropTypes.array.isRequired,
    // accessor for X & Y coordinates
    getX: CustomPropTypes.getter,
    getY: CustomPropTypes.getter,
    getXEnd: CustomPropTypes.getter,
    getYEnd: CustomPropTypes.getter,

    orientation: PropTypes.oneOf(['vertical', 'horizontal']),
    lineLength: PropTypes.number,

    // x & y scale types
    scaleType: PropTypes.object,
    scale: PropTypes.object,

    onMouseEnterLine: PropTypes.func,
    onMouseMoveLine: PropTypes.func,
    onMouseLeaveLine: PropTypes.func
  };
  static defaultProps = {
    orientation: 'vertical',
    lineLength: 10
  };

  // todo reimplement padding/spacing
  /*
  static getOptions(props) {
    const {data, getX, getXEnd, getY, getYEnd, scaleType, orientation, lineLength} = props;
    const tickType = getTickType(props);
    const isVertical = (orientation === 'vertical');
    const accessors = {x: makeAccessor(getX), y: makeAccessor(getY)};
    const endAccessors = {x: makeAccessor(getXEnd), y: makeAccessor(getYEnd)};

    let options = {domain: {}, spacing: {}};

    if(tickType === 'RangeValue') { // set range domain for range type
      let rangeAxis = isVertical ? 'x' : 'y';
      options.domain[rangeAxis] =
        rangeAxisDomain(data, accessors[rangeAxis], endAccessors[rangeAxis], scaleType[rangeAxis]);
    } else {
      // the value, and therefore the center of the marker line, may fall exactly on the axis min or max,
      // therefore marker lines need (0.5*lineLength) spacing so they don't hang over the edge of the chart
      const halfLine = Math.ceil(0.5 * lineLength);
      options.spacing = isVertical ? {left: halfLine, right: halfLine} : {top: halfLine, bottom: halfLine};
    }

    return options;
  }
  */

  static getDomain(props) {
    if(getTickType(props) === 'RangeValue') { // set range domain for range type
      const {data, getX, getXEnd, getY, getYEnd, scaleType, orientation} = props;
      const horizontal = (orientation !== 'vertical');

      // only have to specify range axis domain, other axis uses default domainFromData
      // in this chart type, the range axis, if there is one, is always the *independent* variable
      const rangeAxis = horizontal ? 'y' : 'x';
      const rangeStartAccessor = horizontal ? makeAccessor(getY) : makeAccessor(getX);
      const rangeEndAccessor = horizontal ? makeAccessor(getYEnd) : makeAccessor(getXEnd);
      const rangeDataType = dataTypeFromScaleType(scaleType[rangeAxis]);

      return {
        [rangeAxis]: domainFromRangeData(data, rangeStartAccessor, rangeEndAccessor, rangeDataType)
      };
    }
  }

  onMouseEnterLine = (e, d) => {
    this.props.onMouseEnterLine(e, d);
  };
  onMouseMoveLine = (e, d) => {
    this.props.onMouseMoveLine(e, d);
  };
  onMouseLeaveLine = (e, d) => {
    this.props.onMouseLeaveLine(e, d);
  };

  render() {
    const tickType = getTickType(this.props);
    return <g className="marker-line-chart">
      {tickType === 'RangeValue' ?
        this.props.data.map(this.renderRangeValueLine) :
        this.props.data.map(this.renderValueValueLine)
      }
    </g>
  }

  renderRangeValueLine = (d, i) => {
    const [onMouseEnter, onMouseMove, onMouseLeave] =
      ['onMouseEnterLine', 'onMouseMoveLine', 'onMouseLeaveLine'].map(eventName => {
        // partially apply this bar's data point as 2nd callback argument
        const callback = methodIfFuncProp(eventName, this.props, this);
        return _.isFunction(callback) ? _.partial(callback, _, d) : null;
      });

    const {getX, getXEnd, getY, getYEnd, orientation, scale} = this.props;
    const isVertical = (orientation === 'vertical');
    const xVal = scale.x(makeAccessor(getX)(d));
    const yVal = scale.y(makeAccessor(getY)(d));
    const xEndVal = _.isUndefined(getXEnd) ? 0 : scale.x(makeAccessor(getXEnd)(d));
    const yEndVal = _.isUndefined(getYEnd) ? 0 : scale.y(makeAccessor(getYEnd)(d));
    const [x1, y1] = [xVal, yVal];
    const x2 = isVertical ? xEndVal : xVal;
    const y2 = isVertical ? yVal : yEndVal;
    const key = `marker-line-${i}`;

    if(!_.every([x1, x2, y1, y2], _.isFinite)) return null;
    return <line className="marker-line" {...{x1, x2, y1, y2, key, onMouseEnter, onMouseMove, onMouseLeave}} />
  };

  renderValueValueLine = (d, i) => {
    const [onMouseEnter, onMouseMove, onMouseLeave] =
      ['onMouseEnterLine', 'onMouseMoveLine', 'onMouseLeaveLine'].map(eventName => {
        // partially apply this bar's data point as 2nd callback argument
        const callback = methodIfFuncProp(eventName, this.props, this);
        return _.isFunction(callback) ? _.partial(callback, _, d) : null;
      });

    const {getX, getY, orientation, lineLength, scale} = this.props;
    const isVertical = (orientation === 'vertical');
    const xVal = scale.x(makeAccessor(getX)(d));
    const yVal = scale.y(makeAccessor(getY)(d));
    const x1 = isVertical ? xVal - (lineLength / 2) : xVal;
    const x2 = isVertical ? xVal + (lineLength / 2) : xVal;
    const y1 = isVertical ? yVal : yVal - (lineLength / 2);
    const y2 = isVertical ? yVal : yVal + (lineLength / 2);
    const key = `marker-line-${i}`;

    if(!_.every([x1, x2, y1, y2], _.isFinite)) return null;
    return <line className="marker-line" {...{x1, x2, y1, y2, key, onMouseEnter, onMouseMove, onMouseLeave}} />;
  };
}
