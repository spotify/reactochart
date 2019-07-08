"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

var _RangeBarChart = _interopRequireDefault(require("./RangeBarChart"));

var CustomPropTypes = _interopRequireWildcard(require("./utils/CustomPropTypes"));

var _xyPropsEqual = _interopRequireDefault(require("./utils/xyPropsEqual"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function makeRangeBarChartProps(barChartProps) {
  // this component is a simple wrapper around RangeBarChart,
  // passing accessors to make range bars which span from zero to the data value
  const {
    horizontal,
    x,
    y
  } = barChartProps;
  return _objectSpread({}, barChartProps, {
    x: horizontal ? 0 : x,
    y: horizontal ? y : 0,
    xEnd: horizontal ? x : undefined,
    yEnd: horizontal ? undefined : y
  });
}
/**
 * `BarChart` represents a basic "Value/Value" bar chart,
 * where each bar represents a single independent variable value and a single dependent value,
 * with bars that are centered horizontally on x-value and extend from 0 to y-value,
 * (or centered vertically on their y-value and extend from 0 to the x-value, in the case of horizontal chart variant)
 * eg. http://www.snapsurveys.com/wp-content/uploads/2012/10/bar_2d8.png
 *
 * For other bar chart types, see RangeBarChart and AreaBarChart
 */


class BarChart extends _react.default.Component {
  // gets data domain of independent variable
  static getDomain(props) {
    return _RangeBarChart.default.getDomain(makeRangeBarChartProps(props));
  }

  static getSpacing(props) {
    return _RangeBarChart.default.getSpacing(makeRangeBarChartProps(props));
  }

  shouldComponentUpdate(nextProps, nextState) {
    const shouldUpdate = !(0, _xyPropsEqual.default)(this.props, nextProps, ["barStyle"]);
    return shouldUpdate;
  }

  render() {
    // todo: throw an error if dependent axis is not a number axis
    const rangeBarChartProps = makeRangeBarChartProps(this.props);
    return _react.default.createElement(_RangeBarChart.default, rangeBarChartProps);
  }

}

exports.default = BarChart;

_defineProperty(BarChart, "propTypes", {
  /**
   * Array of data to be plotted. One bar will be rendered per datum in the array.
   */
  data: _propTypes.default.array,

  /**
   * Accessor function for bar X values, called once per bar (datum), or a single value to be used for all bars.
   * If `horizontal` is `true`, this becomes 0.
   * If `horizontal` is `false`, this gets the *dependent* variable value, the end of the bar's length.
   */
  x: CustomPropTypes.valueOrAccessor,

  /**
   * Accessor function for bar Y values, called once per bar (datum), or a single value to be used for all bars.
   * If `horizontal` is `false`, this becomes 0.
   * If `horizontal` is `true`, this gets the *dependent* variable value, the end of the bar's length.
   */
  y: CustomPropTypes.valueOrAccessor,

  /**
   * D3 scale for X axis - provided by XYPlot.
   */
  xScale: _propTypes.default.func,

  /**
   * D3 scale for Y axis - provided by XYPlot.
   */
  yScale: _propTypes.default.func,

  /**
   * Boolean which determines whether the chart will use horizontal or vertical bars.
   * When `true`, bars will be horizontal, ie. the X-axis will be treated as the dependent axis.
   */
  horizontal: _propTypes.default.bool,

  /**
   * Thickness (in pixels) of each bar (ie. bar height if `horizontal` is `true`, otherwise bar width).
   */
  barThickness: _propTypes.default.number,

  /**
   * Inline style object to be applied to each bar,
   * or accessor function which returns a style object.
   */
  barStyle: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.func]),

  /**
   * Class attribute to be applied to each bar,
   * or accessor function which returns a class.
   */
  barClassName: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),

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

_defineProperty(BarChart, "defaultProps", {
  data: [],
  horizontal: false,
  barThickness: 8,
  barClassName: "",
  barStyle: {}
});
//# sourceMappingURL=BarChart.js.map