import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import {methodIfFuncProp} from './util.js';
import * as CustomPropTypes from './utils/CustomPropTypes';
import {dataTypeFromScaleType} from './utils/Scale';
import {makeAccessor2, domainFromRangeData, domainFromData, getDataDomainByAxis} from './utils/Data';
import xyPropsEqual from './utils/xyPropsEqual';

/**
 * MarkerLine is similar to a bar chart,
 * except that it just draws a line at the data value, rather than a full bar.
 * If the independent variable is a range, the length of the line will represent that range,
 * otherwise all lines will be the same length.
 * The dependent variable must be a single value, not a range.
 */

function getTickType(props) {
  const {xEnd, yEnd, horizontal} = props;
  // warn if a range is passed for the dependent variable, which is expected to be a value
  if((!horizontal && !_.isUndefined(yEnd)) || (horizontal && !_.isUndefined(xEnd)))
    console.warn("Warning: MarkerLineChart can only show the independent variable as a range, not the dependent variable.");

  if((!horizontal && !_.isUndefined(xEnd)) || (horizontal && !_.isUndefined(yEnd)))
    return "RangeValue";

  return "ValueValue";
}


export default class MarkerLineChart extends React.Component {
  static propTypes = {
    // the array of data objects
    data: PropTypes.array.isRequired,
    // accessor for X & Y coordinates
    x: CustomPropTypes.valueOrAccessor,
    y: CustomPropTypes.valueOrAccessor,
    xEnd: CustomPropTypes.valueOrAccessor,
    yEnd: CustomPropTypes.valueOrAccessor,

    horizontal: PropTypes.bool,
    lineLength: PropTypes.number,

    // x & y scale types
    xScaleType: PropTypes.object,
    yScaleType: PropTypes.object,
    xScale: PropTypes.object,
    yScale: PropTypes.object,

    onMouseEnterLine: PropTypes.func,
    onMouseMoveLine: PropTypes.func,
    onMouseLeaveLine: PropTypes.func
  };
  static defaultProps = {
    horizontal: false,
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

  static getSpacing(props) {
    const tickType = getTickType(props);
    //no spacing for rangeValue marker charts since line start and end are set explicitly
    if(tickType === 'RangeValue') return {spacingTop: 0, spacingRight: 0, spacingBottom: 0, spacingLeft: 0};

    const {lineLength, horizontal, data, xDomain, yDomain, xScale, yScale, x, y} = props;
    const P = lineLength / 2; //padding
    const markDomain = horizontal ? yDomain : xDomain;
    const markScale = horizontal ? yScale : xScale;
    const markAccessor = horizontal ? makeAccessor2(y) : makeAccessor2(x);
    const markDataDomain = domainFromData(data, markAccessor);

    // todo refactor/add better comments to clarify
    // find the edges of the tick domain, and map them through the scale function
    const [domainHead, domainTail] = _([_.first(markDomain), _.last(markDomain)]).map(markScale).sortBy(); //sort the pixel values return by the domain extents
    // find the edges of the data domain, and map them through the scale function
    const [dataDomainHead, dataDomainTail] = _([_.first(markDataDomain), _.last(markDataDomain)]).map(markScale).sortBy(); //sort the pixel values return by the domain extents
    // find the necessary spacing (based on bar width) to push the bars completely inside the tick domain
    const [spacingTail, spacingHead] = [
      _.clamp(P - (domainTail - dataDomainTail), 0, P),
      _.clamp(P - (dataDomainHead - domainHead), 0, P)
    ];

    if(horizontal) {
      return {spacingTop: spacingHead, spacingBottom: spacingTail, spacingLeft: 0, spacingRight: 0};
    } else {
      return {spacingTop: 0, spacingBottom: 0, spacingLeft: spacingHead, spacingRight: spacingTail}
    }
  }

  static getDomain(props) {
    if(getTickType(props) === 'RangeValue') { // set range domain for range type
      const {data, x, xEnd, y, yEnd, xScaleType, yScaleType, horizontal} = props;

      // only have to specify range axis domain, other axis uses default domainFromData
      // in this chart type, the range axis, if there is one, is always the *independent* variable
      const rangeAxis = horizontal ? 'y' : 'x';
      const rangeStartAccessor = horizontal ? makeAccessor2(y) : makeAccessor2(x);
      const rangeEndAccessor = horizontal ? makeAccessor2(yEnd) : makeAccessor2(xEnd);
      const rangeDataType = dataTypeFromScaleType(horizontal ? yScaleType : xScaleType);

      return {
        [`${rangeAxis}Domain`]: domainFromRangeData(data, rangeStartAccessor, rangeEndAccessor, rangeDataType)
      };
    } else {
      return {};
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const shouldUpdate = !xyPropsEqual(this.props, nextProps, []);
    return shouldUpdate;
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

    const {x, xEnd, y, yEnd, horizontal, xScale, yScale} = this.props;
    const xVal = xScale(makeAccessor2(x)(d));
    const yVal = yScale(makeAccessor2(y)(d));
    const xEndVal = _.isUndefined(xEnd) ? 0 : xScale(makeAccessor2(xEnd)(d));
    const yEndVal = _.isUndefined(yEnd) ? 0 : yScale(makeAccessor2(yEnd)(d));
    const [x1, y1] = [xVal, yVal];
    const x2 = horizontal ?  xVal : xEndVal;
    const y2 = horizontal ? yEndVal : yVal;
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

    const {x, y, horizontal, lineLength, xScale, yScale} = this.props;
    const xVal = xScale(makeAccessor2(x)(d));
    const yVal = yScale(makeAccessor2(y)(d));
    const x1 = (!horizontal) ? xVal - (lineLength / 2) : xVal;
    const x2 = (!horizontal) ? xVal + (lineLength / 2) : xVal;
    const y1 = (!horizontal) ? yVal : yVal - (lineLength / 2);
    const y2 = (!horizontal) ? yVal : yVal + (lineLength / 2);
    const key = `marker-line-${i}`;

    if(!_.every([x1, x2, y1, y2], _.isFinite)) return null;
    return <line className="marker-line" {...{x1, x2, y1, y2, key, onMouseEnter, onMouseMove, onMouseLeave}} />;
  };
}
