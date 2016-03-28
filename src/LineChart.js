import React from 'react';
// import shallowCompare from 'react-addons-shallow-compare';
// import PureRenderDebug from 'react-pure-render-debug';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';

// import resolveXYScales from './utils/resolveXYScales';
// import resolveObjectProps from './utils/resolveObjectProps';
import {accessor, AccessorPropType, InterfaceMixin} from './util.js';

// import shallowEqual from 'recompose/shallowEqual';

const LineChart = React.createClass({
  mixins: [InterfaceMixin('XYChart')],
  propTypes: {
    // the array of data objects
    data: PropTypes.array.isRequired,
    // accessor for X & Y coordinates
    getX: PropTypes.any,
    getY: PropTypes.any,

    // props from XYPlot
    scale: PropTypes.object
  },


  componentWillMount() {
    this.initBisector(this.props);
  },
  componentWillReceiveProps(newProps) {
    this.initBisector(newProps);
  },
  // shouldComponentUpdate(nextProps, nextState) {
  //   const shallowKeys = ['data', 'getValue'];
  //   const [shallowProps, shallowNextProps] = [this.props, nextProps].map(p => _.pick(p, shallowKeys));
  //   const isShallowEqual = shallowEqual(shallowProps, shallowNextProps);
  //
  //   const deeperKeys = ['scale'];
  //   const [deeperProps, deeperNextProps] = [this.props, nextProps].map(p => _.pick(p, deeperKeys));
  //   const isDeeperEqual = _.every(deeperKeys, k => shallowEqual(this.props[k], nextProps[k]));
  //
  //   const shouldUpdate = isShallowEqual && isDeeperEqual;
  //   // const shouldUpdate = PureRenderDebug.shouldComponentUpdate.call(this, nextProps, nextState);
  //   console.log('shouldUpdate', isShallowEqual, isDeeperEqual, shouldUpdate);
  //   return shouldUpdate;
  // },

  initBisector(props) {
    // this.setState({bisectX: d3.bisector(d => accessor(this.props.getValue.x)(d)).left});
    this.setState({bisectX: d3.bisector(d => accessor(this.props.getX)(d)).left});
  },

  getHovered(x, y) {
    const closestDataIndex = this.state.bisectX(this.props.data, x);
    //console.log(closestDataIndex, this.props.data[closestDataIndex]);
    return this.props.data[closestDataIndex];
  },

  render() {
    const {data, scale, getX, getY} = this.props;
    const accessors = {x: accessor(getX), y: accessor(getY)};
    // const accessors = _.fromPairs(['x', 'y'].map(k => [k, accessor((getValue || {})[k])]));
    const points = _.map(data, d => [scale.x(accessors.x(d)), scale.y(accessors.y(d))]);
    const pathStr = pointsToPathStr(points);

    return <g className={this.props.name}>
      <path d={pathStr} />
    </g>;
  }
});

function pointsToPathStr(points) {
  // takes array of points in [[x, y], [x, y]... ] format
  // returns SVG path string in "M X Y L X Y" format
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#Line_commands
  return _.map(points, ([x, y], i) => {
    const command = (i === 0) ? 'M' : 'L';
    return `${command} ${x} ${y}`;
  }).join(' ');
}

const xyKeys = [
  'domain', 'nice', 'invertAxis', 'tickCount', 'ticks', 'tickLength',
  'labelValues', 'labelFormat', 'labelPadding', 'showLabels', 'showGrid', 'showTicks', 'showZero',
  'axisLabel', 'axisLabelAlign', 'axisLabelPadding'
];
const dirKeys = ['margin', 'padding', 'spacing'];
//
// const LineChartResolved = _.flow([
//   resolveXYScales,
//   _.partial(resolveObjectProps, _, xyKeys, ['x', 'y']),
//   _.partial(resolveObjectProps, _, dirKeys, ['top', 'bottom', 'left', 'right'])
// ])(LineChart);

// export default LineChartResolved;

//export default resolveXYScales(LineChart);

// import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
//
// export default onlyUpdateForKeys(['data', 'getValue'], LineChart);
//
export default LineChart;
