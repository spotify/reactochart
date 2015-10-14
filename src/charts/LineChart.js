import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';

import {accessor, AccessorPropType, InterfaceMixin} from '../util.js';

const LineChart = React.createClass({
    mixins: [InterfaceMixin('XYChart')],
    propTypes: {
        // the array of data objects
        data: PropTypes.array.isRequired,
        // accessor for X & Y coordinates
        getValue: PropTypes.object,

        axisType: PropTypes.object,
        scale: PropTypes.object
    },

    componentWillMount() {
        this.initBisector(this.props);
    },
    componentWillReceiveProps(newProps) {
        this.initBisector(newProps);
    },
    initBisector(props) {
        this.setState({bisectX: d3.bisector(d => accessor(this.props.getValue.x)(d)).left});
    },

    getHovered(x, y) {
        const closestDataIndex = this.state.bisectX(this.props.data, x);
        //console.log(closestDataIndex, this.props.data[closestDataIndex]);
        return this.props.data[closestDataIndex];
    },

    render() {
        const {data, getValue, scale} = this.props;
        const accessors = _.mapValues(getValue, accessor);
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

export default LineChart;
