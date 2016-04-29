import React from 'react';
import _ from 'lodash';
import d3 from 'd3';

import {makeAccessor} from './utils/Data';

export default class LineChart extends React.Component {
  static propTypes = {
    // the array of data objects
    data: React.PropTypes.array.isRequired,
    // accessor for X & Y coordinates
    getX: React.PropTypes.any,
    getY: React.PropTypes.any,
    // props from XYPlot
    scale: React.PropTypes.object
  };

  componentWillMount() {
    this.initBisector(this.props);
  }
  componentWillReceiveProps(newProps) {
    this.initBisector(newProps);
  }

  initBisector(props) {
    this.setState({bisectX: d3.bisector(d => makeAccessor(props.getX)(d)).left});
  }

  getHovered = (x, y) => {
    const closestDataIndex = this.state.bisectX(this.props.data, x);
    //console.log(closestDataIndex, this.props.data[closestDataIndex]);
    return this.props.data[closestDataIndex];
  };

  render() {
    const {data, scale, getX, getY} = this.props;
    const accessors = {x: makeAccessor(getX), y: makeAccessor(getY)};
    const points = _.map(data, d => [scale.x(accessors.x(d)), scale.y(accessors.y(d))]);
    const pathStr = pointsToPathStr(points);

    return <g className={this.props.name}>
      <path d={pathStr} />
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
