'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d3 = require('d3');

var _d32 = _interopRequireDefault(_d3);

var _utilJs = require('./util.js');

var _BarChartJs = require('./BarChart.js');

var _BarChartJs2 = _interopRequireDefault(_BarChartJs);

var _LineChartJs = require('./LineChart.js');

var _LineChartJs2 = _interopRequireDefault(_LineChartJs);

var PropTypes = _react2['default'].PropTypes;

var KernelDensityEstimation = _react2['default'].createClass({
    displayName: 'KernelDensityEstimation',

    getInitialState: function getInitialState() {
        return {};
    },
    componentWillMount: function componentWillMount() {},

    statics: {
        getExtent: function getExtent(data, getX, getY) {
            return {
                x: _d32['default'].extent(data, (0, _utilJs.accessor)(getX)),
                y: [0, 100]
                //y: d3.extent(d3.extent(data, accessor(getY)).concat(0))
            };
        }
    },
    getHovered: function getHovered() {},
    render: function render() {
        var _props = this.props;
        var name = _props.name;
        var xScale = _props.xScale;
        var yScale = _props.yScale;
        var innerWidth = _props.innerWidth;
        var innerHeight = _props.innerHeight;

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

function kernelDensityEstimator(kernel, x) {
    return function (sample) {
        return x.map(function (x) {
            return [x, _d32['default'].mean(sample, function (v) {
                return kernel(x - v);
            })];
        });
    };
}

function epanechnikovKernel(scale) {
    return function (u) {
        return Math.abs(u /= scale) <= 1 ? .75 * (1 - u * u) / scale : 0;
    };
}

exports['default'] = KernelDensityEstimation;
module.exports = exports['default'];