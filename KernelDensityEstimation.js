"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _d = require("d3");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

var _LineChart = _interopRequireDefault(require("./LineChart.js"));

var CustomPropTypes = _interopRequireWildcard(require("./utils/CustomPropTypes"));

var _xyPropsEqual = _interopRequireDefault(require("./utils/xyPropsEqual"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Kernel Density Estimation is still undergoing experimental changes!
 * We do not consider this chart to be production ready but
 * encourage you to try it out and contribute to any of its missing features.
 */
class KernelDensityEstimation extends _react.default.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "state", {
      kdeData: null
    });
  }

  static getDomain() {
    // todo implement real static getDomain method
    return {
      yDomain: [0, 200]
    };
  }

  shouldComponentUpdate(nextProps) {
    const shouldUpdate = !(0, _xyPropsEqual.default)(this.props, nextProps, []);
    return shouldUpdate;
  }

  componentWillMount() {
    this.initKDE(this.props);
  }

  componentWillReceiveProps(newProps) {
    this.initKDE(newProps);
  }

  initKDE(props) {
    const {
      data,
      bandwidth,
      sampleCount,
      xScale,
      width
    } = props;
    const kernel = epanechnikovKernel(bandwidth);
    const samples = xScale.ticks(sampleCount || Math.ceil(width / 2));
    this.setState({
      kdeData: kernelDensityEstimator(kernel, samples)(data)
    });
  }

  render() {
    const {
      kdeData
    } = this.state;
    return _react.default.createElement(_LineChart.default, _extends({}, this.props, {
      data: kdeData,
      x: d => d[0],
      y: d => d[1] * 500
    }));
  }

}

_defineProperty(KernelDensityEstimation, "propTypes", {
  /**
   * Array of data objects.
   */
  data: _propTypes.default.array.isRequired,

  /**
   * Kernel bandwidth for kernel density estimator.
   * High bandwidth => oversmoothing & underfitting; low bandwidth => undersmoothing & overfitting
   */
  bandwidth: _propTypes.default.number,

  /**
   * Number of samples to take from the KDE,
   * ie. the resolution/smoothness of the KDE line - more samples => higher resolution, smooth line.
   * Defaults to null, which causes it to be auto-determined based on width.
   */
  sampleCount: _propTypes.default.number,

  /**
   * Inline style object to be applied to the line path.
   */
  lineStyle: _propTypes.default.object,

  /**
   * Class attribute to be applied to the line path.
   */
  lineClassName: _propTypes.default.string,

  /**
   * Accessor function for bar X values, called once per bar (datum).
   */
  x: CustomPropTypes.valueOrAccessor,

  /**
   * D3 scale for X axis - provided by XYPlot.
   */
  xScale: _propTypes.default.func,

  /**
   * D3 scale for Y axis - provided by XYPlot.
   */
  yScale: _propTypes.default.func
});

_defineProperty(KernelDensityEstimation, "defaultProps", {
  bandwidth: 0.5,
  sampleCount: null // null = auto-determined based on width

});

function kernelDensityEstimator(kernel, x) {
  return function (sample) {
    return x.map(function (x) {
      return [x, (0, _d.mean)(sample, function (v) {
        return kernel(x - v);
      })];
    });
  };
}

function epanechnikovKernel(scale) {
  return function (u) {
    return Math.abs(u /= scale) <= 1 ? 0.75 * (1 - u * u) / scale : 0;
  };
}

var _default = KernelDensityEstimation;
exports.default = _default;
//# sourceMappingURL=KernelDensityEstimation.js.map