import React from 'react';
import _ from 'lodash';
import {bisector} from 'd3-array';
import shallowEqual from './utils/shallowEqual';

import {makeAccessor} from './utils/Data';
import {scaleEqual} from './utils/Scale';
import xyPropsEqual from './utils/xyPropsEqual';


export default class LineChart extends React.Component {
  static propTypes = {
    // the array of data objects
    data: React.PropTypes.array.isRequired,
    // accessor for X & Y coordinates
    getX: React.PropTypes.any,
    getY: React.PropTypes.any,
    // inline style object to be applied to the path
    lineStyle: React.PropTypes.object,
    // props from XYPlot
    scale: React.PropTypes.object
  };
  static defaultProps = {
    lineStyle: {}
  };

  componentWillMount() {
    this.initBisector(this.props);
  }
  componentWillReceiveProps(nextProps) {
    this.initBisector(nextProps);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !xyPropsEqual(this.props, nextProps);
  }
  // shouldComponentUpdate(nextProps, nextState) {
  //   // const start = performance.now();
  //   const deepishProps = ['margin', 'scaleType'];
  //   const deeperProps = ['domain'];
  //   const deepProps = deepishProps.concat(deeperProps).concat('scale');
  //
  //   const isEqual =
  //     shallowEqual(_.omit(this.props, deepProps), _.omit(nextProps, deepProps)) &&
  //     _.every(deepishProps, (key) => shallowEqual(this.props[key], nextProps[key])) &&
  //     _.every(deeperProps, (key) => _.isEqual(this.props[key], nextProps[key])) &&
  //     _.every(['x', 'y'], (key) => scaleEqual(this.props.scale[key], nextProps.scale[key]));
  //
  //   // console.log('isEqual', isEqual);
  //   // console.log('took', performance.now() - start);
  //   return !isEqual;
  // }

  initBisector(props) {
    this.setState({bisectX: bisector(d => makeAccessor(props.getX)(d)).left});
  }

  getHovered = (x, y) => {
    const closestDataIndex = this.state.bisectX(this.props.data, x);
    //console.log(closestDataIndex, this.props.data[closestDataIndex]);
    return this.props.data[closestDataIndex];
  };

  render() {
    const {data, scale, getX, getY, lineStyle} = this.props;
    const accessors = {x: makeAccessor(getX), y: makeAccessor(getY)};
    const points = _.map(data, d => [scale.x(accessors.x(d)), scale.y(accessors.y(d))]);
    const pathStr = pointsToPathStr(points);

    return <g className={this.props.name}>
      <path d={pathStr} style={lineStyle}/>
    </g>;
  }
}

function pointsToPathStr(points) {
  // takes array of points in [[x, y], [x, y]... ] format
  // returns SVG path string in "M X Y L X Y" format
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#Line_commands
  return _.map(points, ([x, y], i) => {
    const command = (i === 0) ? 'M' : 'L';
    return `${command} ${x} ${y}`;
  }).join(' ');
}
