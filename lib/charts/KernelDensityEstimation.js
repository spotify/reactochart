'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d = require('d3');

var _d2 = _interopRequireDefault(_d);

var _util = require('../util.js');

var _BarChart = require('./BarChart.js');

var _BarChart2 = _interopRequireDefault(_BarChart);

var _LineChart = require('./../LineChart.js');

var _LineChart2 = _interopRequireDefault(_LineChart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PropTypes = _react2.default.PropTypes;


var KernelDensityEstimation = _react2.default.createClass({
    displayName: 'KernelDensityEstimation',

    mixins: [(0, _util.InterfaceMixin)('XYChart')],
    propTypes: {
        // the array of data objects
        data: PropTypes.array.isRequired,

        // kernel bandwidth for kernel density estimator
        // https://en.wikipedia.org/wiki/Kernel_density_estimation#Bandwidth_selection
        // high bandwidth => oversmoothing & underfitting; low bandwidth => undersmoothing & overfitting
        bandwidth: PropTypes.number,
        // number of samples to take from the KDE
        // ie. the resolution/smoothness of the KDE line - more samples => higher resolution, smooth line
        sampleCount: PropTypes.number,

        // common props from XYPlot
        // accessor for data values
        getValue: PropTypes.object,
        name: PropTypes.string,
        axisType: PropTypes.object,
        scale: PropTypes.object,
        scaleWidth: PropTypes.number,
        scaleHeight: PropTypes.number
    },
    getDefaultProps: function getDefaultProps() {
        return {
            getValue: null, // null accessor = _.identity
            bandwidth: 0.5,
            sampleCount: null, // null = auto-determined based on width
            name: ''
        };
    },
    getInitialState: function getInitialState() {
        return {
            kdeData: null
        };
    },

    statics: {
        getOptions: function getOptions(props) {
            return {
                domain: {
                    // todo: real x domain
                    x: null,
                    // todo: real y domain
                    y: [0, 200]
                }
            };
        }
    },

    componentWillMount: function componentWillMount() {
        this.initKDE(this.props);
    },
    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
        this.initKDE(newProps);
    },
    initKDE: function initKDE(props) {
        var data = props.data;
        var bandwidth = props.bandwidth;
        var sampleCount = props.sampleCount;
        var scale = props.scale;
        var scaleWidth = props.scaleWidth;

        var kernel = epanechnikovKernel(bandwidth);
        var samples = scale.x.ticks(sampleCount || Math.ceil(scaleWidth / 2));
        this.setState({ kdeData: kernelDensityEstimator(kernel, samples)(data) });
    },
    getHovered: function getHovered() {},
    render: function render() {
        var _props = this.props;
        var name = _props.name;
        var scale = _props.scale;
        var scaleWidth = _props.scaleWidth;
        var scaleHeight = _props.scaleHeight;
        var plotWidth = _props.plotWidth;
        var plotHeight = _props.plotHeight;
        var kdeData = this.state.kdeData;


        return _react2.default.createElement(_LineChart2.default, _extends({
            data: kdeData,
            getValue: { x: 0, y: function y(d) {
                    return d[1] * 500;
                } }
        }, { name: name, scale: scale, scaleWidth: scaleWidth, scaleHeight: scaleHeight, plotWidth: plotWidth, plotHeight: plotHeight }));
    }
});

function kernelDensityEstimator(kernel, x) {
    return function (sample) {
        return x.map(function (x) {
            return [x, _d2.default.mean(sample, function (v) {
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

exports.default = KernelDensityEstimation;