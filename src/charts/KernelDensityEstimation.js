import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';

import {accessor, AccessorPropType} from '../util.js';
import BarChart from './BarChart.js';
import LineChart from './LineChart.js';

const KernelDensityEstimation = React.createClass({
    propTypes: {
        // the array of data objects
        data: PropTypes.array.isRequired,
        // accessor for data values
        getValue: AccessorPropType,

        // kernel bandwidth for kernel density estimator
        // https://en.wikipedia.org/wiki/Kernel_density_estimation#Bandwidth_selection
        // high bandwidth => oversmoothing & underfitting; low bandwidth => undersmoothing & overfitting
        bandwidth: PropTypes.number,
        // number of samples to take from the KDE
        // ie. the resolution/smoothness of the KDE line - more samples => higher resolution, smooth line
        sampleCount: PropTypes.number,

        // common props from XYPlot
        name: PropTypes.string,
        xScale: PropTypes.func,
        yScale: PropTypes.func,
        innerWidth: PropTypes.number,
        innerHeight: PropTypes.number
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
                // todo: real x domain
                xDomain: null,
                // todo: real y domain
                yDomain: [0,200]
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
        const {data, bandwidth, sampleCount, xScale, innerWidth} = props;
        const kernel = epanechnikovKernel(bandwidth);
        const samples = xScale.ticks(sampleCount || Math.ceil(innerWidth / 2));
        this.setState({kdeData: kernelDensityEstimator(kernel, samples)(data)});
    },


    getHovered() {

    },
    render() {
        const {name, xScale, yScale, innerWidth, innerHeight} = this.props;
        const {kdeData} = this.state;

        return <LineChart
            data={kdeData}
            getX={0} getY={d => d[1] * 500}
            {...{name, xScale, yScale, innerWidth, innerHeight}}
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