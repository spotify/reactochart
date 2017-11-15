import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import resolveObjectProps from './utils/resolveObjectProps';
import resolveXYScales from './utils/resolveXYScales';
import {innerSize} from './utils/Margin';
import {inferScaleType} from './utils/Scale';
import {methodIfFuncProp} from './util';

function indexOfClosestNumberInList(number, list) {
  return list.reduce((closestI, current, i) => {
    return Math.abs(current - number) < Math.abs(list[closestI] - number) ? i : closestI;
  }, 0);
}

function invertPointScale(scale, rangeValue) {
  // shim until d3.scalePoint.invert() is implemented for real
  // given a value from the output range, returns the *nearest* corresponding value in the input domain
  const rangePoints = scale.domain().map(domainValue => scale(domainValue));
  const nearestPointIndex = indexOfClosestNumberInList(rangeValue, rangePoints);
  return scale.domain()[nearestPointIndex];
}

function getMouseOptions(event, {scale, height, width, margin}) {
  const chartBB = event.currentTarget.getBoundingClientRect();
  const outerX = Math.round(event.clientX - chartBB.left);
  const outerY = Math.round(event.clientY - chartBB.top);
  const innerX = (outerX - (margin.left || 0));
  const innerY = (outerY -(margin.top || 0));
  const chartSize = innerSize({width, height}, margin);
  const scaleType = {x: inferScaleType(scale.x), y: inferScaleType(scale.y)};

  const xValue = (!_.inRange(innerX, 0, chartSize.width /* + padding.left + padding.right */)) ? null :
    (scaleType.x === 'ordinal') ?
      invertPointScale(scale.x, innerX) :
      scale.x.invert(innerX);
  const yValue = (!_.inRange(innerY, 0, chartSize.height /* + padding.top + padding.bottom */)) ? null :
    (scaleType.y === 'ordinal') ?
      invertPointScale(scale.y, innerY) :
      scale.y.invert(innerY);

  return {event, outerX, outerY, innerX, innerY, xValue, yValue, scale, margin};
}

class XYPlot extends React.Component {
  static propTypes = {
    /**
     * (outer) width of the chart (SVG element).
     */
    width: PropTypes.number,
    /**
     * (outer) width of the chart (SVG element).
     */
    height: PropTypes.number,
    /**
     * The X and/or Y domains of the data in {x: [...], y: [...]} format.
     * For numerical scales, this is represented as [min, max] of the data;
     * for ordinal/categorical scales it is an array of known values ie. ['a', 'b', 'c'].
     * Automatically determined from data if not passed.
     */
    domain: PropTypes.object,
    /**
     *
     */
    margin: PropTypes.object,

    /**
     * d3 scales for the X and Y axes of the chart, in {x, y} object format.
     * (optional, normally determined automatically by XYPlot)
     */
    scale: PropTypes.object,

    scaleType: PropTypes.object,

    spacing: PropTypes.object,
    // todo spacing & padding...
    padding: PropTypes.object,
    nice: PropTypes.object,
    invertScale: PropTypes.object,

    onMouseMove: PropTypes.func,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onMouseDown: PropTypes.func,
    onMouseUp: PropTypes.func
  };

  static defaultProps = {
    width: 400,
    height: 250,
    // nice: {x: true, y: true},
    invertScale: {x: false, y: false},
    // emptyLabel: "Unknown",

    // these values are inferred from data if not provided, therefore empty defaults
    // scaleType: {},
    // domain: {},
    // margin: {},
    //spacing: {top: 0, bottom: 0, left: 0, right: 0}
  };

  onXYMouseEvent = (callbackKey, event) => {
    const callback = this.props[callbackKey];
    if(!_.isFunction(callback)) return;
    const options = getMouseOptions(event, this.props);
    callback(options);
  };
  onMouseMove = _.partial(this.onXYMouseEvent, 'onMouseMove');
  onMouseDown = _.partial(this.onXYMouseEvent, 'onMouseDown');
  onMouseUp = _.partial(this.onXYMouseEvent, 'onMouseUp');
  onClick = _.partial(this.onXYMouseEvent, 'onClick');
  onMouseEnter = (event) => this.props.onMouseEnter({event});
  onMouseLeave = (event) => this.props.onMouseLeave({event});

  render() {
    const {width, height, margin, spacing} = this.props;
    // subtract margin + spacing from width/height to obtain inner width/height of panel & chart area
    // panelSize is the area including chart + spacing but NOT margin
    // chartSize is smaller, chart *only*, not including margin or spacing
    const panelSize = innerSize({width, height}, margin);
    const chartSize = innerSize(panelSize, spacing);

    const handlerNames = ['onMouseMove', 'onMouseEnter', 'onMouseLeave', 'onMouseDown', 'onMouseUp', 'onClick'];
    const handlers = _.fromPairs(handlerNames.map(n => [n, methodIfFuncProp(n, this.props, this)]));

    const propsToPass = {
      ..._.omit(this.props, ['children']),
      ...chartSize
    };

    return <svg {...{width, height, className: 'xy-plot', onMouseMove: this.onMouseMove}} {...handlers}>
      <rect className="chart-background" {...{width, height}} />
      <g transform={`translate(${margin.left + spacing.left}, ${margin.top + spacing.top})`} className="chart-inner">
        <rect transform={`translate(${-spacing.left}, ${-spacing.top})`} className="plot-background" {...panelSize} />
        {React.Children.map(this.props.children, child => {
          return (_.isNull(child) || _.isUndefined(child)) ? null :
            React.cloneElement(child, propsToPass);
        })}
      </g>
    </svg>
  }
}

const xyKeys = ['scaleType', 'domain', 'invertScale', 'nice'];
const dirKeys = ['margin', 'padding', 'spacing'];

const XYPlotResolved = _.flow([
  resolveXYScales,
  _.partial(resolveObjectProps, _, xyKeys, ['x', 'y']),
  _.partial(resolveObjectProps, _, dirKeys, ['top', 'bottom', 'left', 'right'])
])(XYPlot);

export default XYPlotResolved;
