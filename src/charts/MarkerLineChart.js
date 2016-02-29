import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';

import {accessor, AccessorPropType, InterfaceMixin, methodIfFuncProp} from '../util.js';

// MarkerLine is similar to a bar chart,
// except that it just draws a line at the data value, rather than a full bar
// If the independent variable is a range, the length of the line will represent that range
// Otherwise all lines will be the same length.
// The dependent variable must be a single value, not a range.

function getTickType(props) {
    const {getEndValue, orientation} = props;
    const isVertical = (orientation === 'vertical');
    // warn if a range is passed for the dependent variable, which is expected to be a value
    if((isVertical && !_.isUndefined(getEndValue.y)) || (!isVertical && !_.isUndefined(getEndValue.x)))
        console.warn("Warning: MarkerLineChart can only show the independent variable as a range, not the dependent variable.");

    if((isVertical && !_.isUndefined(getEndValue.x)) || (!isVertical && !_.isUndefined(getEndValue.y)))
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
    mixins: [InterfaceMixin('XYChart')],
    propTypes: {
        // the array of data objects
        data: PropTypes.array.isRequired,
        // accessor for X & Y coordinates
        getValue: PropTypes.object,
        getEndValue: PropTypes.object,

        orientation: PropTypes.oneOf(['vertical', 'horizontal']),
        lineLength: PropTypes.number,

        // x & y scale types
        axisType: PropTypes.object,
        scale: PropTypes.object,

        onMouseEnterLine: PropTypes.func,
        onMouseMoveLine: PropTypes.func,
        onMouseLeaveLine: PropTypes.func
    },
    getDefaultProps() {
        return {
            orientation: 'vertical',
            lineLength: 10,
            getValue: {},
            getEndValue: {}
        }
    },
    statics: {
        getOptions(props) {
            const {data, axisType, getValue, getEndValue, orientation, lineLength} = props;
            const tickType = getTickType(props);
            const isVertical = (orientation === 'vertical');
            const accessors = _.mapValues(getValue, accessor);
            const endAccessors = _.mapValues(getEndValue, accessor);

            let options = {domain: {}, spacing: {}};

            if(tickType === 'RangeValue') { // set range domain for range type
                let rangeAxis = isVertical ? 'x' : 'y';
                options.domain[rangeAxis] =
                    rangeAxisDomain(data, accessors[rangeAxis], endAccessors[rangeAxis], axisType[rangeAxis]);
            } else {
                // the value, and therefore the center of the marker line, may fall exactly on the axis min or max,
                // therefore marker lines need (0.5*lineLength) spacing so they don't hang over the edge of the chart
                const halfLine = Math.ceil(0.5 * lineLength);
                options.spacing = isVertical ? {left: halfLine, right: halfLine} : {top: halfLine, bottom: halfLine};
            }

            return options;
        }
    },
    onMouseEnterLine(e, d) {
        this.props.onMouseEnterLine(e, d);
    },
    onMouseMoveLine(e, d) {
        this.props.onMouseMoveLine(e, d);
    },
    onMouseLeaveLine(e, d) {
        this.props.onMouseLeaveLine(e, d);
    },
    render() {
        const tickType = getTickType(this.props);
        return <g className="marker-line-chart">
            {tickType === 'RangeValue' ?
                this.props.data.map(this.renderRangeValueLine) :
                this.props.data.map(this.renderValueValueLine)
            }
        </g>
    },
    renderRangeValueLine(d, i) {
        const [onMouseEnter, onMouseMove, onMouseLeave] =
            ['onMouseEnterLine', 'onMouseMoveLine', 'onMouseLeaveLine'].map(eventName => {
                // partially apply this bar's data point as 2nd callback argument
                const callback = methodIfFuncProp(eventName, this.props, this);
                return _.isFunction(callback) ? _.partial(callback, _, d) : null;
            });

        const {getValue, getEndValue, orientation, scale} = this.props;
        const isVertical = (orientation === 'vertical');
        const xVal = scale.x(accessor(getValue.x)(d));
        const yVal = scale.y(accessor(getValue.y)(d));
        const xEndVal = _.isUndefined(getEndValue.x) ? 0 : scale.x(accessor(getEndValue.x)(d));
        const yEndVal = _.isUndefined(getEndValue.y) ? 0 : scale.y(accessor(getEndValue.y)(d));
        const [x1, y1] = [xVal, yVal];
        const x2 = isVertical ? xEndVal : xVal;
        const y2 = isVertical ? yVal : yEndVal;
        const key = `marker-line-${i}`;

        if(!_.all([x1, x2, y1, y2], _.isFinite)) return null;
        return <line className="marker-line" {...{x1, x2, y1, y2, key, onMouseEnter, onMouseMove, onMouseLeave}} />
    },
    renderValueValueLine(d, i) {
        const [onMouseEnter, onMouseMove, onMouseLeave] =
            ['onMouseEnterLine', 'onMouseMoveLine', 'onMouseLeaveLine'].map(eventName => {
                // partially apply this bar's data point as 2nd callback argument
                const callback = methodIfFuncProp(eventName, this.props, this);
                return _.isFunction(callback) ? _.partial(callback, _, d) : null;
            });

        const {getValue, orientation, lineLength, scale} = this.props;
        const isVertical = (orientation === 'vertical');
        const xVal = scale.x(accessor(getValue.x)(d));
        const yVal = scale.y(accessor(getValue.y)(d));
        const x1 = isVertical ? xVal - (lineLength / 2) : xVal;
        const x2 = isVertical ? xVal + (lineLength / 2) : xVal;
        const y1 = isVertical ? yVal : yVal - (lineLength / 2);
        const y2 = isVertical ? yVal : yVal + (lineLength / 2);
        const key = `marker-line-${i}`;

        if(!_.all([x1, x2, y1, y2], _.isFinite)) return null;
        return <line className="marker-line" {...{x1, x2, y1, y2, key, onMouseEnter, onMouseMove, onMouseLeave}} />;
    }
});

export default MarkerLineChart;
