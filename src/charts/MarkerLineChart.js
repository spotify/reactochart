import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';

import {accessor, AccessorPropType} from '../util.js';

// BarTickChart is like a bar chart,
// except that it just draws a line at the data value, rather than a full bar
// If the independent variable is a range, the length of the line will represent that range
// Otherwise all lines will be the same length.
// The dependent variable must be a single value, not a range.

function getTickType(props) {
    const {getXEnd, getYEnd, orientation} = props;
    const isVertical = (orientation === 'vertical');
    // warn if a range is passed for the dependent variable, which is expected to be a value
    if((isVertical && !_.isUndefined(getYEnd)) || (!isVertical && !_.isUndefined(getXEnd)))
        console.warn("Warning: BarTickChart can only show the independent variable as a range, not the dependent variable.");

    if((isVertical && !_.isUndefined(getXEnd)) || (!isVertical && !_.isUndefined(getYEnd)))
        return "RangeValue";
    return "ValueValue";
}

function rangeAxisDomain(data, rangeStartAccessor, rangeEndAccessor, scaleType) {
    switch(scaleType) {
        case 'number':
        case 'time':
            return d3.extent(_.flatten([
                d3.extent(data, (d) => +rangeStartAccessor(d)),
                d3.extent(data, (d) => +rangeEndAccessor(d))
            ]));
        case 'ordinal':
            return _.uniq(_.flatten([data.map(rangeStartAccessor), data.map(rangeEndAccessor)]));
    }
    return [];
}

const MarkerLineChart = React.createClass({
    propTypes: {
        // the array of data objects
        data: PropTypes.array.isRequired,
        // accessor for X & Y coordinates
        getX: AccessorPropType,
        getY: AccessorPropType,

        orientation: PropTypes.oneOf(['vertical', 'horizontal']),
        lineLength: PropTypes.number,

        // x & y scale types
        xType: PropTypes.oneOf(['number', 'time', 'ordinal']),
        yType: PropTypes.oneOf(['number', 'time', 'ordinal']),
        xScale: PropTypes.func,
        yScale: PropTypes.func
    },
    getDefaultProps() {
        return {
            orientation: 'vertical',
            lineLength: 10
        }
    },
    statics: {
        getDomain(props, xType, yType) {
            const {data, getX, getY, getXEnd, getYEnd, orientation} = props;
            const tickType = getTickType(props);
            const isVertical = (orientation === 'vertical');
            const accessors = {x: accessor(getX), y: accessor(getY)};
            const rangeEndAccessors = {x: accessor(getXEnd), y: accessor(getYEnd)};
            const axisTypes = {x: xType, y: yType};
            let domains = {x: null, y: null};

            if(tickType === 'RangeValue') {
                let rangeAxis = isVertical ? 'x' : 'y';
                domains[rangeAxis] = rangeAxisDomain(data, accessors[rangeAxis], rangeEndAccessors[rangeAxis], axisTypes[rangeAxis]);
            }
            // value axis/axes use default domain

            return domains;
        }
    },
    render() {
        const tickType = getTickType(this.props);
        return <g className="bar-tick-chart">
            {tickType === 'RangeValue' ?
                this.props.data.map(this.renderRangeValueLine) :
                this.props.data.map(this.renderValueValueLine)
            }
        </g>
    },
    renderRangeValueLine(d) {
        const {getX, getY, getXEnd, getYEnd, orientation, xScale, yScale} = this.props;
        const isVertical = (orientation === 'vertical');
        const xVal = xScale(accessor(getX)(d));
        const yVal = yScale(accessor(getY)(d));
        const xEndVal = _.isUndefined(getXEnd) ? 0 : xScale(accessor(getXEnd)(d));
        const yEndVal = _.isUndefined(getYEnd) ? 0 : yScale(accessor(getYEnd)(d));
        const [x1, y1] = [xVal, yVal];
        const x2 = isVertical ? xEndVal : xVal;
        const y2 = isVertical ? yVal : yEndVal;

        return <line className="bar-tick-line" {...{x1, x2, y1, y2}}></line>
    },
    renderValueValueLine(d) {
        const {getX, getY, orientation, lineLength, xScale, yScale} = this.props;
        const isVertical = (orientation === 'vertical');
        const xVal = xScale(accessor(getX)(d));
        const yVal = yScale(accessor(getY)(d));
        const x1 = isVertical ? xVal - (lineLength / 2) : xVal;
        const x2 = isVertical ? xVal + (lineLength / 2) : xVal;
        const y1 = isVertical ? yVal : yVal - (lineLength / 2);
        const y2 = isVertical ? yVal : yVal + (lineLength / 2);

        return <line className="bar-tick-line" {...{x1, x2, y1, y2}} />;
    }
});

export default MarkerLineChart;
