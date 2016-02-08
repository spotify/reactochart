'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d = require('d3');

var _d2 = _interopRequireDefault(_d);

var _util = require('../util.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PropTypes = _react2.default.PropTypes;

// MarkerLine is similar to a bar chart,
// except that it just draws a line at the data value, rather than a full bar
// If the independent variable is a range, the length of the line will represent that range
// Otherwise all lines will be the same length.
// The dependent variable must be a single value, not a range.

function getTickType(props) {
    var getEndValue = props.getEndValue;
    var orientation = props.orientation;

    var isVertical = orientation === 'vertical';
    // warn if a range is passed for the dependent variable, which is expected to be a value
    if (isVertical && !_lodash2.default.isUndefined(getEndValue.y) || !isVertical && !_lodash2.default.isUndefined(getEndValue.x)) console.warn("Warning: MarkerLineChart can only show the independent variable as a range, not the dependent variable.");

    if (isVertical && !_lodash2.default.isUndefined(getEndValue.x) || !isVertical && !_lodash2.default.isUndefined(getEndValue.y)) return "RangeValue";
    return "ValueValue";
}

function rangeAxisDomain(data, rangeStartAccessor, rangeEndAccessor, scaleType) {
    switch (scaleType) {
        case 'number':
        case 'time':
            return _d2.default.extent(_lodash2.default.flatten([_d2.default.extent(data, function (d) {
                return +rangeStartAccessor(d);
            }), _d2.default.extent(data, function (d) {
                return +rangeEndAccessor(d);
            })]));
        case 'ordinal':
            return _lodash2.default.uniq(_lodash2.default.flatten([data.map(rangeStartAccessor), data.map(rangeEndAccessor)]));
    }
    return [];
}

var MarkerLineChart = _react2.default.createClass({
    displayName: 'MarkerLineChart',

    mixins: [(0, _util.InterfaceMixin)('XYChart')],
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
        scale: PropTypes.object
    },
    getDefaultProps: function getDefaultProps() {
        return {
            orientation: 'vertical',
            lineLength: 10,
            getValue: {},
            getEndValue: {}
        };
    },

    statics: {
        getOptions: function getOptions(props) {
            var data = props.data;
            var axisType = props.axisType;
            var getValue = props.getValue;
            var getEndValue = props.getEndValue;
            var orientation = props.orientation;
            var lineLength = props.lineLength;

            var tickType = getTickType(props);
            var isVertical = orientation === 'vertical';
            var accessors = _lodash2.default.mapValues(getValue, _util.accessor);
            var endAccessors = _lodash2.default.mapValues(getEndValue, _util.accessor);

            var options = { domain: {}, spacing: {} };

            if (tickType === 'RangeValue') {
                // set range domain for range type
                var rangeAxis = isVertical ? 'x' : 'y';
                options.domain[rangeAxis] = rangeAxisDomain(data, accessors[rangeAxis], endAccessors[rangeAxis], axisType[rangeAxis]);
            } else {
                // the value, and therefore the center of the marker line, may fall exactly on the axis min or max,
                // therefore marker lines need (0.5*lineLength) spacing so they don't hang over the edge of the chart
                var halfLine = Math.ceil(0.5 * lineLength);
                options.spacing = isVertical ? { left: halfLine, right: halfLine } : { top: halfLine, bottom: halfLine };
            }

            return options;
        }
    },
    render: function render() {
        var tickType = getTickType(this.props);
        return _react2.default.createElement(
            'g',
            { className: 'marker-line-chart' },
            tickType === 'RangeValue' ? this.props.data.map(this.renderRangeValueLine) : this.props.data.map(this.renderValueValueLine)
        );
    },
    renderRangeValueLine: function renderRangeValueLine(d, i) {
        var _props = this.props;
        var getValue = _props.getValue;
        var getEndValue = _props.getEndValue;
        var orientation = _props.orientation;
        var scale = _props.scale;

        var isVertical = orientation === 'vertical';
        var xVal = scale.x((0, _util.accessor)(getValue.x)(d));
        var yVal = scale.y((0, _util.accessor)(getValue.y)(d));
        var xEndVal = _lodash2.default.isUndefined(getEndValue.x) ? 0 : scale.x((0, _util.accessor)(getEndValue.x)(d));
        var yEndVal = _lodash2.default.isUndefined(getEndValue.y) ? 0 : scale.y((0, _util.accessor)(getEndValue.y)(d));
        var x1 = xVal;
        var y1 = yVal;

        var x2 = isVertical ? xEndVal : xVal;
        var y2 = isVertical ? yVal : yEndVal;
        var key = 'marker-line-' + i;

        if (!_lodash2.default.all([x1, x2, y1, y2], _lodash2.default.isFinite)) return null;
        return _react2.default.createElement('line', _extends({ className: 'marker-line' }, { x1: x1, x2: x2, y1: y1, y2: y2, key: key }));
    },
    renderValueValueLine: function renderValueValueLine(d, i) {
        var _props2 = this.props;
        var getValue = _props2.getValue;
        var orientation = _props2.orientation;
        var lineLength = _props2.lineLength;
        var scale = _props2.scale;

        var isVertical = orientation === 'vertical';
        var xVal = scale.x((0, _util.accessor)(getValue.x)(d));
        var yVal = scale.y((0, _util.accessor)(getValue.y)(d));
        var x1 = isVertical ? xVal - lineLength / 2 : xVal;
        var x2 = isVertical ? xVal + lineLength / 2 : xVal;
        var y1 = isVertical ? yVal : yVal - lineLength / 2;
        var y2 = isVertical ? yVal : yVal + lineLength / 2;
        var key = 'marker-line-' + i;

        if (!_lodash2.default.all([x1, x2, y1, y2], _lodash2.default.isFinite)) return null;
        return _react2.default.createElement('line', _extends({ className: 'marker-line' }, { x1: x1, x2: x2, y1: y1, y2: y2, key: key }));
    }
});

exports.default = MarkerLineChart;