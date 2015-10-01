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

var _BarChartJs = require('./BarChart.js');

var _BarChartJs2 = _interopRequireDefault(_BarChartJs);

var _utilJs = require('../util.js');

var PropTypes = _react2['default'].PropTypes;

var Histogram = _react2['default'].createClass({
    displayName: 'Histogram',

    propTypes: {
        // the array of data objects
        data: PropTypes.array.isRequired,
        // accessor for X & Y coordinates
        getX: _utilJs.AccessorPropType,
        getY: _utilJs.AccessorPropType,

        // x & y scale types
        xType: PropTypes.oneOf(['number', 'time', 'ordinal']),
        yType: PropTypes.oneOf(['number', 'time', 'ordinal']),

        xScale: PropTypes.func,
        yScale: PropTypes.func
    },
    getDefaultProps: function getDefaultProps() {
        return {};
    },
    getInitialState: function getInitialState() {
        return {
            histogramData: null
        };
    },
    componentWillMount: function componentWillMount() {
        var histogramData = _d32['default'].layout.histogram().bins(30)(this.props.data);
        //console.log('histogram', this.props.data, histogramData);
        this.setState({ histogramData: histogramData });
    },

    statics: {
        getOptions: function getOptions(props) {
            var getX = props.getX;
            var getY = props.getY;

            return {
                // todo: real x domain
                xDomain: _d32['default'].extent(data, (0, _utilJs.accessor)(getX)),
                // todo: real y domain
                yDomain: [0, 200]
            };
        }
    },
    getHovered: function getHovered() {},
    render: function render() {
        if (!this.state.histogramData) return _react2['default'].createElement('g', null);
        var _props = this.props;
        var name = _props.name;
        var xScale = _props.xScale;
        var yScale = _props.yScale;
        var xType = _props.xType;
        var yType = _props.yType;
        var innerWidth = _props.innerWidth;
        var innerHeight = _props.innerHeight;

        return _react2['default'].createElement(_BarChartJs2['default'], _extends({
            data: this.state.histogramData,
            getX: 'x',
            getY: 'y',
            getXEnd: function (d) {
                return d.x + d.dx;
            }
        }, { name: name, xScale: xScale, yScale: yScale, xType: xType, yType: yType, innerWidth: innerWidth, innerHeight: innerHeight }));
    }
});

exports['default'] = Histogram;
module.exports = exports['default'];