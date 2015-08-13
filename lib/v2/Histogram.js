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

var _utilJs = require('./util.js');

var PropTypes = _react2['default'].PropTypes;

var Histogram = _react2['default'].createClass({
    displayName: 'Histogram',

    getInitialState: function getInitialState() {
        return {
            histogramData: null
        };
    },
    componentWillMount: function componentWillMount() {
        var histogramData = _d32['default'].layout.histogram().bins(30)(this.props.data);
        console.log('histogram', this.props.data, histogramData);
        this.setState({ histogramData: histogramData });
    },

    statics: {
        getExtent: function getExtent(data, getX, getY) {
            return {
                x: _d32['default'].extent(data, (0, _utilJs.accessor)(getX)),
                y: [0, 200]
                //y: d3.extent(d3.extent(data, accessor(getY)).concat(0))
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
        var innerWidth = _props.innerWidth;
        var innerHeight = _props.innerHeight;

        return _react2['default'].createElement(_BarChartJs2['default'], _extends({
            data: this.state.histogramData,
            getX: 'x', getY: 'y'
        }, { name: name, xScale: xScale, yScale: yScale, innerWidth: innerWidth, innerHeight: innerHeight }));

        return _react2['default'].createElement(
            'svg',
            null,
            _react2['default'].createElement(
                'text',
                null,
                'Hello!'
            )
        );
    }
});

exports['default'] = Histogram;
module.exports = exports['default'];