import React from 'react';
import _ from 'lodash';
import {bisector} from 'd3';
import shallowEqual from './utils/shallowEqual';
import PropTypes from 'prop-types';

import {makeAccessor} from './utils/Data';
import xyPropsEqual from './utils/xyPropsEqual';
// import {xyPropsEqualDebug} from './utils/xyPropsEqual';


export default class LineChart extends React.Component {
  static propTypes = {
    // the array of data objects
    data: PropTypes.array.isRequired,
    // accessor for X & Y coordinates
    getX: PropTypes.any,
    getY: PropTypes.any,
    // inline style object to be applied to the path
    lineStyle: PropTypes.object,
    // props from XYPlot
    scale: PropTypes.object
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

  initBisector(props) {
    this.setState({bisectX: bisector(d => makeAccessor(props.getX)(d)).left});
  }

  getHovered = (x, y) => {
    const closestDataIndex = this.state.bisectX(this.props.data, x);
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
