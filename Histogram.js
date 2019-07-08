"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _d = require("d3");

var _lodash = _interopRequireDefault(require("lodash"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

var _AreaBarChart = _interopRequireDefault(require("./AreaBarChart"));

var _xyPropsEqual = _interopRequireDefault(require("./utils/xyPropsEqual"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * `Histogram` is used to represent the distribution of numerical data. Histograms, only relate
 * to one variable, where data is typically "binned" and counted.
 */
// todo make histogram work horizontally *or* vertically
// todo make histogram work with ordinal scale
class Histogram extends _react.default.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "state", {
      histogramData: null
    });
  }

  static getScaleType() {
    return {
      xScaleType: "linear",
      yScaleType: "linear"
    };
  }

  static getDomain(props) {
    const {
      data,
      value,
      thresholds,
      binDomain,
      nice
    } = props;
    const bins = Histogram.computeHistogram(data, thresholds, value, binDomain, nice);
    const domains = {
      xDomain: [_lodash.default.first(bins).x0, _lodash.default.last(bins).x1],
      yDomain: [0, _lodash.default.maxBy(bins, bin => bin.length).length]
    };
    return domains;
  }

  static computeHistogram(data, thresholds, accessor, binDomain, nice) {
    let makeHistogram = (0, _d.histogram)().value(accessor).thresholds(thresholds);

    if (binDomain) {
      // Throw warning if nice = true and binDomain is defined
      if (nice) {
        console.warn("Warning: if binDomain is defined and nice = true, histogram prioritizes binDomain and disregards nice.");
      } // Use user's passed in binDomain to makeHistogram


      makeHistogram = makeHistogram.domain(binDomain);
    } else if (nice) {
      // Create a linear scale to nice values
      const scale = (0, _d.scaleLinear)().domain((0, _d.extent)(data)).nice(); // Nicely round domain given temp bins

      const niceBinDomain = scale.ticks(); // Set nicely rounded domain as domain for makeHistogram

      makeHistogram = makeHistogram.domain([_lodash.default.first(niceBinDomain), _lodash.default.last(niceBinDomain)]);
    }

    const bins = makeHistogram(data);
    return bins;
  }

  shouldComponentUpdate(nextProps) {
    const shouldUpdate = !(0, _xyPropsEqual.default)(this.props, nextProps, []);
    return shouldUpdate;
  }

  render() {
    const {
      value,
      data,
      thresholds,
      binDomain,
      nice
    } = this.props;
    const bins = Histogram.computeHistogram(data, thresholds, value, binDomain, nice);
    if (!bins) return _react.default.createElement("g", null);
    return _react.default.createElement(_AreaBarChart.default, _extends({}, this.props, {
      data: bins,
      x: getX0,
      xEnd: getX1,
      y: getLength
    }));
  }

}

exports.default = Histogram;

_defineProperty(Histogram, "propTypes", {
  /**
   * The array of data objects for the histogram.
   * These should be individual "samples" or "facts", not an array of bins -
   * this component will count and bin the samples for you. If you have data that is already binned,
   * use the `<AreaBarChart>` component.
   */
  data: _propTypes.default.array.isRequired,

  /**
   * Data value accessor function, called once per datum, which returns the values to bin and plot in the histogram.
   * If `data` is just an array of numbers, this may be the identity function (`function(d) { return d }`).
   */
  value: _propTypes.default.func,

  /**
   * D3 scale for X axis - provided by XYPlot.
   */
  xScale: _propTypes.default.func,

  /**
   * D3 scale for Y axis - provided by XYPlot.
   */
  yScale: _propTypes.default.func,

  /**
   * Following [d3's thresholds documentation](https://github.com/d3/d3-array#histogram_thresholds) ...
   *
   * If a number `count`  is specified, then the domain will be uniformly divided into approximately `count` bins.
   *
   * If an array `[x0, x1 ... xN]` is specified, then any value less than `x0` will be placed in the first bin; any value greater than
   * or equal to `x0` but less than `x1` will be placed in the second bin; and so on. The generated histogram will have `array.length` + 1 bins.
   */
  thresholds: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.array]).isRequired,

  /**
   * The domain over which your data will be binned. Defined as an array `[min, max]`.
   * If not provided, binDomain will be the domain of your data values by default.
   *
   * Warning: This prop takes priority if `nice = true`.
   */
  binDomain: _propTypes.default.array,

  /**
   * If true, nicely rounds the start and end values of your bins.
   * Implemented using [d3's ticks nicing logic](https://github.com/d3/d3-array#ticks).
   */
  nice: _propTypes.default.bool,

  /**
   * Class attribute to be applied to each bar,
   * or accessor function which returns a class.
   */
  barClassName: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),

  /**
   * Inline style object to be applied to each bar,
   * or accessor function which returns a style object.
   */
  barStyle: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.func]),

  /**
   * `mousemove` event handler callback, called when user's mouse moves within a bar.
   */
  onMouseMoveBar: _propTypes.default.func,

  /**
   * `mouseenter` event handler callback, called when user's mouse enters a bar.
   */
  onMouseEnterBar: _propTypes.default.func,

  /**
   * `mouseleave` event handler callback, called when user's mouse leaves a bar.
   */
  onMouseLeaveBar: _propTypes.default.func
});

_defineProperty(Histogram, "defaultProps", {
  data: [],
  thresholds: 30,
  nice: false
});

function getX0(d) {
  return d.x0;
}

function getX1(d) {
  return d.x1;
}

function getLength(d) {
  return d.length;
}
//# sourceMappingURL=Histogram.js.map