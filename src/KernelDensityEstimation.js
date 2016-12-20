import React from 'react';
import _ from 'lodash';
import * as d3 from 'd3';

import * as CustomPropTypes from './utils/CustomPropTypes';
import LineChart from './LineChart.js';

class KernelDensityEstimation extends React.Component {
  static propTypes = {
    // the array of data objects
    data: React.PropTypes.array.isRequired,

    // kernel bandwidth for kernel density estimator
    // https://en.wikipedia.org/wiki/Kernel_density_estimation#Bandwidth_selection
    // high bandwidth => oversmoothing & underfitting; low bandwidth => undersmoothing & overfitting
    bandwidth: React.PropTypes.number,
    // number of samples to take from the KDE
    // ie. the resolution/smoothness of the KDE line - more samples => higher resolution, smooth line
    sampleCount: React.PropTypes.number,

    // common props from XYPlot
    // accessor for data values
    getX: CustomPropTypes.getter,
    getY: CustomPropTypes.getter,
    name: React.PropTypes.string,
    scale: React.PropTypes.object,
    axisType: React.PropTypes.object,
    scaleWidth: React.PropTypes.number,
    scaleHeight: React.PropTypes.number
  };
  static defaultProps = {
    bandwidth: 0.5,
    sampleCount: null, // null = auto-determined based on width
    name: ''
  };

  state = {
    kdeData: null
  };

  static getDomain() {
    // todo implement real static getDomain method
    return {
      x: null,
      y: [0,200]
    }
  }

  componentWillMount() {
    this.initKDE(this.props);
  }
  componentWillReceiveProps(newProps) {
    this.initKDE(newProps);
  }
  initKDE(props) {
    const {data, bandwidth, sampleCount, scale, width} = props;
    const kernel = epanechnikovKernel(bandwidth);
    const samples = scale.x.ticks(sampleCount || Math.ceil(width / 2));
    this.setState({kdeData: kernelDensityEstimator(kernel, samples)(data)});
  }

  render() {
    const {name, scale, width, height, plotWidth, plotHeight} = this.props;
    const {kdeData} = this.state;

    return <LineChart
      data={kdeData}
      getX={0}
      getY={d => d[1] * 500}
      {...{name, scale, width, height, plotWidth, plotHeight}}
    />;
  }
}

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
