import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';
import resolveObjectProps from 'utils/resolveObjectProps';
import resolveXYScales from 'utils/resolveXYScales';

import {innerSize} from 'utils/Margin';

class XYPlot2 extends React.Component {
  static propTypes = {

  };
  static defaultProps = {
    width: 400,
    height: 250,
    // scaleType: {x: 'number', y: 'number'},
    nice: {x: true, y: true},
    invertScale: {x: false, y: false},
    // tickCount: {x: 10, y: 10},
    // emptyLabel: "Unknown",

    // these values are inferred from data if not provided, therefore empty defaults
    scaleType: {},
    domain: {}, /* ticks: {}, */
    margin: {},
    padding: {},
    spacing: {}
  };

  // static getMargin() {
  //   return {top: 20, bottom: 20, left: 20, right: 20};
  // }

  render() {
    console.log('xyplot2 props', this.props);
    const {width, height, margin} = this.props;

    const chartSize = innerSize({width, height}, margin);

    const propsToPass = {...this.props, ...chartSize};
    console.log('margin', margin);

    return <svg {...{width, height}}>
      <rect fill="thistle" {...{width, height}} />
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        <rect fill="#dddddd" {...chartSize} />
        {React.Children.map(this.props.children, child => {
          return React.cloneElement(child, propsToPass);
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