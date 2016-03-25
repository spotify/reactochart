import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';

import {accessor, AccessorPropType, InterfaceMixin} from '../util.js';
import BarChart from './BarChart.js';
import LineChart from './../LineChart.js';

const KernelDensityEstimation = React.createClass({
    mixins: [InterfaceMixin('XYChart')],
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
    getDefaultProps() {
        return {
            getValue: null, // null accessor = _.identity
            bandwidth: 0.5,
            sampleCount: null, // null = auto-determined based on width
            name: ''
        }
    },
    getInitialState() {
        return {
            kdeData: null
        }
    },
    statics: {
        getOptions(props) {
            return {
                domain: {
                    // todo: real x domain
                    x: null,
                    // todo: real y domain
                    y: [0,200]
                }
            }
        }
    },

    componentWillMount() {
        this.initKDE(this.props);
    },
    componentWillReceiveProps(newProps) {
        this.initKDE(newProps);
    },
    initKDE(props) {
        const {data, bandwidth, sampleCount, scale, scaleWidth} = props;
        const kernel = epanechnikovKernel(bandwidth);
        const samples = scale.x.ticks(sampleCount || Math.ceil(scaleWidth / 2));
        this.setState({kdeData: kernelDensityEstimator(kernel, samples)(data)});
    },


    getHovered() {

    },
    render() {
        const {name, scale, scaleWidth, scaleHeight, plotWidth, plotHeight} = this.props;
        const {kdeData} = this.state;

        return <LineChart
            data={kdeData}
            getValue={{x: 0, y: d => d[1] * 500}}
            {...{name, scale, scaleWidth, scaleHeight, plotWidth, plotHeight}}
        />;
    }
});

function kernelDensityEstimator(kernel, x) {
    return function(sample) {
        return x.map(function(x) {
            return [x, d3.mean(sample, function(v) { return kernel(x - v); })];
        });
    };
}

function epanechnikovKernel(scale) {
    return function(u) {
        return Math.abs(u /= scale) <= 1 ? .75 * (1 - u * u) / scale : 0;
    };
}

export default KernelDensityEstimation;