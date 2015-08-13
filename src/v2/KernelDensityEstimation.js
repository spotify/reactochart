import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';


import {accessor, AccessorPropType} from './util.js';
import BarChart from './BarChart.js';
import LineChart from './LineChart.js';


const KernelDensityEstimation = React.createClass({
    getInitialState() {
        return {

        }
    },
    componentWillMount() {
    },

    statics: {
        getExtent(data, getX, getY) {
            return {
                x: d3.extent(data, accessor(getX)),
                y: [0,100]
                //y: d3.extent(d3.extent(data, accessor(getY)).concat(0))
            }
        }
    },
    getHovered() {

    },
    render() {
        const {name, xScale, yScale, innerWidth, innerHeight} = this.props;

        return <svg><text>Hello!</text></svg>
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