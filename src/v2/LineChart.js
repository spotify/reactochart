import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';

import {accessor, AccessorPropType} from './util.js';

const LineChart = React.createClass({
    propTypes: {
        // the array of data objects
        data: PropTypes.array.isRequired,
        // accessor for X & Y coordinates
        getX: AccessorPropType,
        getY: AccessorPropType,

        xScale: PropTypes.func,
        yScale: PropTypes.func
    },

    statics: {
        getExtent(data, getX, getY) {
            return {
                x: d3.extent(data, accessor(getX)),
                y: d3.extent(data, accessor(getY))
            }
        }
    },

    componentWillMount() {
        this.initBisector(this.props);
    },
    componentWillReceiveProps(newProps) {
        this.initBisector(newProps);
    },
    initBisector(props) {
        this.setState({bisectX: d3.bisector(d => accessor(this.props.getX)(d)).left});
    },

    getHovered(x, y) {
        const closestDataIndex = this.state.bisectX(this.props.data, x);
        console.log(closestDataIndex, this.props.data[closestDataIndex]);
        return this.props.data[closestDataIndex];
    },

    render() {
        const {data, getX, getY, xScale, yScale} = this.props;
        const points = _.map(data, d => [xScale(accessor(getX)(d)), yScale(accessor(getY)(d))]);
        const pathStr = pointsToPathStr(points);

        return <g className={this.props.name}>
            <path d={pathStr} />
        </g>;

        return <rect x={_.random(200)} y={20} width={50} height={80} opacity={0.5}></rect>
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

export default LineChart;
