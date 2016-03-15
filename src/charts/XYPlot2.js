import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';
import resolveObjectProps from 'utils/resolveObjectProps';
import resolveXYScales from 'utils/resolveXYScales';

class XYPlot2 extends React.Component {
  static defaultProps = {
    width: 400,
    height: 250,
    axisType: {x: 'number', y: 'number'},
    nice: {x: true, y: true},
    invertAxis: {x: false, y: false},
    tickCount: {x: 10, y: 10},
    tickLength: {x: 6, y: 6},
    labelPadding: {x: 6, y: 6},
    emptyLabel: "Unknown",
    showLabels: {x: true, y: true},
    showGrid: {x: true, y: true},
    showTicks: {x: true, y: true},
    showZero: {x: false, y: false},
    axisLabelPadding: {x: 10, y: 10},
    axisLabelAlign: {
      x: {horizontal: 'left', vertical: 'top'},
      y: {horizontal: 'right', vertical: 'top'}
    },

    // these values are inferred from data if not provided, therefore empty defaults
    margin: {}, padding: {}, spacing: {}, domain: {},
    ticks: {}, labelValues: {}, labelFormat: {}, axisLabel: {}
  };

  static getMargin() {
    return {top: 20, bottom: 20, left: 20, right: 20};
  }

  render() {
    console.log('xyplot2 props', this.props);
    return <svg></svg>
  }
}


const xyKeys = [
  'scaleType', 'domain', 'nice', 'invertScale', 'tickCount', 'ticks', 'tickLength',
  'labelValues', 'labelFormat', 'labelPadding', 'showLabels', 'showGrid', 'showTicks', 'showZero',
  'axisLabel', 'axisLabelAlign', 'axisLabelPadding'
];
const dirKeys = ['margin', 'padding', 'spacing'];

const XYPlotResolved = _.flow([
  resolveXYScales,
  _.partial(resolveObjectProps, _, xyKeys, ['x', 'y']),
  _.partial(resolveObjectProps, _, dirKeys, ['top', 'bottom', 'left', 'right'])
])(XYPlot2);

export default XYPlotResolved;