'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d3 = require('d3');

var _d32 = _interopRequireDefault(_d3);

var _utilJs = require('../util.js');

// BarTickChart is like a bar chart,
// except that it just draws a line at the data value, rather than a full bar
// If the independent variable is a range, the length of the line will represent that range
// Otherwise all lines will be the same length.
// The dependent variable must be a single value, not a range.

var PropTypes = _react2['default'].PropTypes;
function getTickType(props) {
    var getXEnd = props.getXEnd;
    var getYEnd = props.getYEnd;
    var orientation = props.orientation;

    var isVertical = orientation === 'vertical';
    // warn if a range is passed for the dependent variable, which is expected to be a value
    if (isVertical && !_lodash2['default'].isUndefined(getYEnd) || !isVertical && !_lodash2['default'].isUndefined(getXEnd)) console.warn("Warning: BarTickChart can only show the independent variable as a range, not the dependent variable.");

    if (isVertical && !_lodash2['default'].isUndefined(getXEnd) || !isVertical && !_lodash2['default'].isUndefined(getYEnd)) return "RangeValue";
    return "ValueValue";
}

function rangeAxisDomain(data, rangeStartAccessor, rangeEndAccessor, scaleType) {
    switch (scaleType) {
        case 'number':
        case 'time':
            return _d32['default'].extent(_lodash2['default'].flatten([_d32['default'].extent(data, function (d) {
                return +rangeStartAccessor(d);
            }), _d32['default'].extent(data, function (d) {
                return +rangeEndAccessor(d);
            })]));
        case 'ordinal':
            return _lodash2['default'].uniq(_lodash2['default'].flatten([data.map(rangeStartAccessor), data.map(rangeEndAccessor)]));
    }
    return [];
}

var MarkerLineChart = _react2['default'].createClass({
    displayName: 'MarkerLineChart',

    propTypes: {
        // the array of data objects
        data: PropTypes.array.isRequired,
        // accessor for X & Y coordinates
        getX: _utilJs.AccessorPropType,
        getY: _utilJs.AccessorPropType,

        orientation: PropTypes.oneOf(['vertical', 'horizontal']),
        lineLength: PropTypes.number,

        // x & y scale types
        xType: PropTypes.oneOf(['number', 'time', 'ordinal']),
        yType: PropTypes.oneOf(['number', 'time', 'ordinal']),
        xScale: PropTypes.func,
        yScale: PropTypes.func
    },
    getDefaultProps: function getDefaultProps() {
        return {
            orientation: 'vertical',
            lineLength: 10
        };
    },
    statics: {
        getDomain: function getDomain(props, xType, yType) {
            var data = props.data;
            var getX = props.getX;
            var getY = props.getY;
            var getXEnd = props.getXEnd;
            var getYEnd = props.getYEnd;
            var orientation = props.orientation;

            var tickType = getTickType(props);
            var isVertical = orientation === 'vertical';
            var accessors = { x: (0, _utilJs.accessor)(getX), y: (0, _utilJs.accessor)(getY) };
            var rangeEndAccessors = { x: (0, _utilJs.accessor)(getXEnd), y: (0, _utilJs.accessor)(getYEnd) };
            var axisTypes = { x: xType, y: yType };
            var domains = { x: null, y: null };

            if (tickType === 'RangeValue') {
                var rangeAxis = isVertical ? 'x' : 'y';
                domains[rangeAxis] = rangeAxisDomain(data, accessors[rangeAxis], rangeEndAccessors[rangeAxis], axisTypes[rangeAxis]);
            }
            // value axis/axes use default domain

            return domains;
        }
    },
    render: function render() {
        var tickType = getTickType(this.props);
        return _react2['default'].createElement(
            'g',
            { className: 'bar-tick-chart' },
            tickType === 'RangeValue' ? this.props.data.map(this.renderRangeValueLine) : this.props.data.map(this.renderValueValueLine)
        );
    },
    renderRangeValueLine: function renderRangeValueLine(d) {
        var _props = this.props;
        var getX = _props.getX;
        var getY = _props.getY;
        var getXEnd = _props.getXEnd;
        var getYEnd = _props.getYEnd;
        var orientation = _props.orientation;
        var xScale = _props.xScale;
        var yScale = _props.yScale;

        var isVertical = orientation === 'vertical';
        var xVal = xScale((0, _utilJs.accessor)(getX)(d));
        var yVal = yScale((0, _utilJs.accessor)(getY)(d));
        var xEndVal = _lodash2['default'].isUndefined(getXEnd) ? 0 : xScale((0, _utilJs.accessor)(getXEnd)(d));
        var yEndVal = _lodash2['default'].isUndefined(getYEnd) ? 0 : yScale((0, _utilJs.accessor)(getYEnd)(d));
        var x1 = xVal;
        var y1 = yVal;

        var x2 = isVertical ? xEndVal : xVal;
        var y2 = isVertical ? yVal : yEndVal;

        return _react2['default'].createElement('line', _extends({ className: 'bar-tick-line' }, { x1: x1, x2: x2, y1: y1, y2: y2 }));
    },
    renderValueValueLine: function renderValueValueLine(d) {
        var _props2 = this.props;
        var getX = _props2.getX;
        var getY = _props2.getY;
        var orientation = _props2.orientation;
        var lineLength = _props2.lineLength;
        var xScale = _props2.xScale;
        var yScale = _props2.yScale;

        var isVertical = orientation === 'vertical';
        var xVal = xScale((0, _utilJs.accessor)(getX)(d));
        var yVal = yScale((0, _utilJs.accessor)(getY)(d));
        var x1 = isVertical ? xVal - lineLength / 2 : xVal;
        var x2 = isVertical ? xVal + lineLength / 2 : xVal;
        var y1 = isVertical ? yVal : yVal - lineLength / 2;
        var y2 = isVertical ? yVal : yVal + lineLength / 2;

        return _react2['default'].createElement('line', _extends({ className: 'bar-tick-line' }, { x1: x1, x2: x2, y1: y1, y2: y2 }));
    }
});

exports['default'] = MarkerLineChart;
module.exports = exports['default'];