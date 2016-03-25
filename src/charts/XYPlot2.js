import React from 'react';
import _ from 'lodash';
import d3 from 'd3';

import resolveObjectProps from 'utils/resolveObjectProps';
import resolveXYScales from 'utils/resolveXYScales';
import {innerSize} from 'utils/Margin';


function closestNumberInList(number, list) {
  return list.reduce((closest, current) => {
    return Math.abs(current - number) < Math.abs(closest - number) ? current : closest;
  });
}
function indexOfClosestNumberInList(number, list) {
  return list.reduce((closestI, current, i) => {
    return Math.abs(current - number) < Math.abs(list[closestI] - number) ? i : closestI;
  }, 0);
}

class XYPlot2 extends React.Component {
  static propTypes = {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    scale: React.PropTypes.object,
    scaleType: React.PropTypes.object,
    domain: React.PropTypes.object,
    margin: React.PropTypes.object,
    // todo spacing & padding...
    nice: React.PropTypes.object,
    invertScale: React.PropTypes.object,

    onMouseMove: React.PropTypes.func,
    onMouseEnter: React.PropTypes.func,
    onMouseLeave: React.PropTypes.func,
    onMouseDown: React.PropTypes.func,
    onMouseUp: React.PropTypes.func
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
    // spacing: {}
  };

  onMouseMove = (e) => {
    if(!this.props.onMouseMove) return;

    const {scale, scaleType, height, width, margin} = this.props;

    // todo padding
    // to return:
    // {event, isInMargin, outerX, outerY, innerX, innerY, xValue, yValue}

    // todo faster method than getBoundingClientRect on every mouseover?
    const chartBB = e.currentTarget.getBoundingClientRect();
    const outerX = Math.round(e.clientX - chartBB.left);
    const outerY = Math.round(e.clientY - chartBB.top);
    const innerX = (outerX - margin.left);
    const innerY = (outerY - margin.top);

    const chartSize = innerSize({width, height}, margin);

    const xValue = (!_.inRange(innerX, 0, chartSize.width /* + padding.left + padding.right */)) ? null :
      (scaleType.x === 'ordinal') ?
        scale.x.domain()[indexOfClosestNumberInList(innerX, scale.x.range())] :
        scale.x.invert(innerX);
    const yValue = (!_.inRange(innerY, 0, chartSize.height /* + padding.top + padding.bottom */)) ? null :
      (scaleType.y === 'ordinal') ?
        scale.y.domain()[indexOfClosestNumberInList(innerY, scale.y.range())] :
        scale.y.invert(innerY);

    // const chart = this.refs['chart-series-0'];
    // const hovered = (chart && _.isFunction(chart.getHovered)) ? chart.getHovered(chartXVal) : null;

    this.props.onMouseMove({event: e, outerX, outerY, innerX, innerY, xValue, yValue});

    // this.trueProps.onMouseMove(hovered, e, {chartX, chartY, chartXVal, chartYVal});
  };

  render() {
    console.log('xyplot2 props', this.props);
    const {width, height, margin} = this.props;
    const chartSize = innerSize({width, height}, margin);
    const propsToPass = {...this.props, ...chartSize};

    return <svg {...{width, height, onMouseMove: this.onMouseMove}}>
      <rect fill="thistle" {...{width, height}} />
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        <rect fill="#dddddd" {...chartSize} />
        {React.Children.map(this.props.children, child => {
          return (_.isNull(child) || _.isUndefined(child)) ? null :
            React.cloneElement(child, propsToPass);
        })}
      </g>
    </svg>
  }
}


const xyKeys = ['scaleType', 'domain', 'invertScale'];
const dirKeys = ['margin', 'padding', 'spacing'];

const XYPlot2Resolved = _.flow([
  resolveXYScales,
  _.partial(resolveObjectProps, _, xyKeys, ['x', 'y']),
  _.partial(resolveObjectProps, _, dirKeys, ['top', 'bottom', 'left', 'right'])
])(XYPlot2);

export default XYPlot2Resolved;