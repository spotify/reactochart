import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';

const AccessorPropType = PropTypes.oneOfType(PropTypes.string, PropTypes.number, PropTypes.array, PropTypes.func);

function accessor(key) {
    return _.isFunction(key) ? key: _.property(key);
}

const LineChart = React.createClass({
    propTypes: {
        // the array of data objects
        data: PropTypes.arrayOf(PropTypes.object).isRequired,
        // accessor for X & Y coordinates
        getX: AccessorPropType,
        getY: AccessorPropType,

        xScale: PropTypes.object,
        yScale: PropTypes.object
    },
    statics: {
        getExtent(data) {
            //
        }
    },
    render() {
        const {data, getX, getY, xScale, yScale} = this.props;
        const points = _.map(data, d => [xScale(accessor(getX)(d)), yScale(accessor(getY)(d))]);
        console.log('points', points);
        const pathStr = pointsToPathStr(points);

        return <g>
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