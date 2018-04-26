"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _d = require("d3");

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _xyPropsEqual = require("./utils/xyPropsEqual");

var _xyPropsEqual2 = _interopRequireDefault(_xyPropsEqual);

var _AreaBarChart = require("./AreaBarChart");

var _AreaBarChart2 = _interopRequireDefault(_AreaBarChart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// todo make histogram work horizontally *or* vertically
var Histogram = function (_React$Component) {
  _inherits(Histogram, _React$Component);

  function Histogram() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Histogram);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Histogram.__proto__ || Object.getPrototypeOf(Histogram)).call.apply(_ref, [this].concat(args))), _this), _this.state = { histogramData: null }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Histogram, [{
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps, nextState) {
      var shouldUpdate = !(0, _xyPropsEqual2.default)(this.props, nextProps, []);
      return shouldUpdate;
    }
  }, {
    key: "render",
    value: function render() {
      var _props = this.props,
          value = _props.value,
          data = _props.data,
          thresholds = _props.thresholds,
          binDomain = _props.binDomain,
          nice = _props.nice;


      var bins = Histogram.computeHistogram(data, thresholds, value, binDomain, nice);

      if (!bins) return _react2.default.createElement("g", null);

      return _react2.default.createElement(_AreaBarChart2.default, _extends({}, this.props, {
        data: bins,
        x: getX0,
        xEnd: getX1,
        y: getLength
      }));
    }
  }], [{
    key: "getScaleType",
    value: function getScaleType() {
      // TODO make histogram work with ordinal scale
      return { xScaleType: "linear", yScaleType: "linear" };
    }
  }, {
    key: "getDomain",
    value: function getDomain(props) {
      var data = props.data,
          value = props.value,
          thresholds = props.thresholds,
          binDomain = props.binDomain,
          nice = props.nice;


      var bins = Histogram.computeHistogram(data, thresholds, value, binDomain, nice);

      var domains = {
        xDomain: [_lodash2.default.first(bins).x0, _lodash2.default.last(bins).x1],
        yDomain: [0, _lodash2.default.maxBy(bins, function (bin) {
          return bin.length;
        }).length]
      };

      return domains;
    }
  }, {
    key: "computeHistogram",
    value: function computeHistogram(data, thresholds, accessor, binDomain, nice) {
      var makeHistogram = (0, _d.histogram)().value(accessor).thresholds(thresholds);

      if (binDomain) {
        // Throw warning if nice = true and binDomain is defined
        if (nice) {
          console.warn("Warning: if binDomain is defined and nice = true, histogram prioritizes binDomain and disregards nice.");
        }

        // Use user's passed in binDomain to makeHistogram
        makeHistogram = makeHistogram.domain(binDomain);
      } else if (nice) {
        // Create a linear scale to nice values
        var scale = (0, _d.scaleLinear)().domain((0, _d.extent)(data)).nice();

        // Nicely round domain given temp bins
        var niceBinDomain = scale.ticks();

        // Set nicely rounded domain as domain for makeHistogram
        makeHistogram = makeHistogram.domain([_lodash2.default.first(niceBinDomain), _lodash2.default.last(niceBinDomain)]);
      }

      var bins = makeHistogram(data);

      return bins;
    }
  }]);

  return Histogram;
}(_react2.default.Component);

Histogram.propTypes = {
  /**
   * The array of data objects for the histogram.
   * These should be individual "samples" or "facts", not an array of bins -
   * this component will count and bin the samples for you. If you have data that is already binned,
   * use the `<AreaBarChart>` component.
   */
  data: _propTypes2.default.array.isRequired,
  /**
   * Data value accessor function, called once per datum, which returns the values to bin and plot in the histogram.
   * If `data` is just an array of numbers, this may be the identity function (`function(d) { return d }`).
   */
  value: _propTypes2.default.func,
  /**
   * D3 scale for X axis - provided by XYPlot
   */
  xScale: _propTypes2.default.func,
  /**
   * D3 scale for Y axis - provided by XYPlot
   */
  yScale: _propTypes2.default.func,
  /**
   * Following [d3's thresholds documentation](https://github.com/d3/d3-array#histogram_thresholds) ...
   *
   * If a number `count`  is specified, then the domain will be uniformly divided into approximately `count` bins.
   *
   * If an array `[x0, x1 ... xN]` is specified, then any value less than `x0` will be placed in the first bin; any value greater than
   * or equal to `x0` but less than `x1` will be placed in the second bin; and so on. The generated histogram will have `array.length` + 1 bins.
   */
  thresholds: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.array]).isRequired,
  /**
   * The domain over which your data will be binned. Defined as an array `[min, max]`.
   * If not provided, binDomain will be the domain of your data values by default.
   *
   * Warning: This prop takes priority if `nice = true`.
   */
  binDomain: _propTypes2.default.array,
  /**
   * If true, nicely rounds the start and end values of your bins.
   * Implemented using [d3's ticks nicing logic](https://github.com/d3/d3-array#ticks).
   */
  nice: _propTypes2.default.bool,
  /**
   * Class attribute to be applied to each bar,
   * or accessor function which returns a class.
   */
  barClassName: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]),
  /**
   * Inline style object to be applied to each bar,
   * or accessor function which returns a style object.
   */
  barStyle: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.func]),
  /**
   * `mousemove` event handler callback, called when user's mouse moves within a bar.
   */
  onMouseMoveBar: _propTypes2.default.func,
  /**
   * `mouseenter` event handler callback, called when user's mouse enters a bar.
   */
  onMouseEnterBar: _propTypes2.default.func,
  /**
   * `mouseleave` event handler callback, called when user's mouse leaves a bar.
   */
  onMouseLeaveBar: _propTypes2.default.func
};
Histogram.defaultProps = { data: [], thresholds: 30, nice: false };
exports.default = Histogram;


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