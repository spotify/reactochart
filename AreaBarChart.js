"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

var _RangeRect = _interopRequireDefault(require("./RangeRect"));

var CustomPropTypes = _interopRequireWildcard(require("./utils/CustomPropTypes"));

var _Data = require("./utils/Data");

var _Scale = require("./utils/Scale");

var _xyPropsEqual = _interopRequireDefault(require("./utils/xyPropsEqual"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * `AreaBarChart` is a variation on the standard bar chart. Just like a normal bar chart, each bar represents a single
 * value on the *dependent* axis (Y axis for vertical bars), and the bar stretches from zero to this value.
 * However, on the *independent* axis, each bar represents a *range* (min/max) of values,
 * rather than being centered on a specific value.
 * In other words, the bar *lengths* act the same way as standard bar chart bars,
 * but their *thicknesses* are variable and meaningful.
 * `AreaBarChart`s are the correct way to display histograms with variable bin sizes.
 * They are so named because, in cases like these histograms, since both the bar thickness and length are meaningful,
 * so too is the bar's total *area*, unlike in other bar charts.
 */
class AreaBarChart extends _react.default.Component {
  shouldComponentUpdate(nextProps, nextState) {
    const shouldUpdate = !(0, _xyPropsEqual.default)(this.props, nextProps, ["barStyle"]); // console.log('should areabarchart update?', shouldUpdate);

    return shouldUpdate;
  }

  static getDomain(props) {
    const {
      xScaleType,
      yScaleType,
      horizontal,
      data
    } = props; // only have to specify range axis domain, other axis uses default domainFromData
    // for area bar chart, the independent variable is the range
    // ie. the range controls the thickness of the bar

    const rangeAxis = horizontal ? "y" : "x";
    const rangeDataType = (0, _Scale.dataTypeFromScaleType)(rangeAxis === "x" ? xScaleType : yScaleType); // make accessor functions from getX|Y and getX|YEnd

    const rangeStartAccessor = (0, _Data.makeAccessor2)(props["".concat(rangeAxis)]);
    const rangeEndAccessor = (0, _Data.makeAccessor2)(props["".concat(rangeAxis, "End")]);
    return {
      [rangeAxis + "Domain"]: (0, _Data.domainFromRangeData)(data, rangeStartAccessor, rangeEndAccessor, rangeDataType)
    };
  }

  render() {
    const {
      xScale,
      yScale,
      data,
      horizontal,
      x,
      xEnd,
      y,
      yEnd,
      barClassName,
      barStyle
    } = this.props;
    return _react.default.createElement("g", null, data.map((d, i) => {
      const [onMouseEnter, onMouseMove, onMouseLeave] = ["onMouseEnterBar", "onMouseMoveBar", "onMouseLeaveBar"].map(eventName => {
        // partially apply this bar's data point as 2nd callback argument
        const callback = _lodash.default.get(this.props, eventName);

        return _lodash.default.isFunction(callback) ? _lodash.default.partial(callback, _lodash.default, d) : null;
      });
      return _react.default.createElement(_RangeRect.default, {
        xScale,
        yScale,
        className: "rct-chart-area-bar ".concat((0, _Data.getValue)(barClassName, d, i)),
        style: (0, _Data.getValue)(barStyle, d, i),
        x: horizontal ? 0 : (0, _Data.getValue)(x, d, i),
        xEnd: horizontal ? (0, _Data.getValue)(x, d, i) : (0, _Data.getValue)(xEnd, d, i),
        y: !horizontal ? 0 : (0, _Data.getValue)(y, d, i),
        yEnd: !horizontal ? (0, _Data.getValue)(y, d, i) : (0, _Data.getValue)(yEnd, d, i),
        key: "rct-chart-area-bar-".concat(i),
        onMouseEnter,
        onMouseMove,
        onMouseLeave
      });
    }));
  }

}

exports.default = AreaBarChart;

_defineProperty(AreaBarChart, "propTypes", {
  /**
   * D3 scale for X axis - provided by XYPlot
   */
  xScale: _propTypes.default.func,

  /**
   * D3 scale for Y axis - provided by XYPlot
   */
  yScale: _propTypes.default.func,

  /**
   * Array of data to be plotted. One bar will be rendered per datum in this array.
   */
  data: _propTypes.default.array,

  /**
   * Boolean which determines whether the chart will use horizontal or vertical bars.
   * When `true`, bars will be horizontal, ie. the X-axis will be treated as the dependent axis.
   */
  horizontal: _propTypes.default.bool,

  /**
   * Accessor function for bar X values, called once per bar (datum), or a single value to be used for all bars.
   * If `horizontal` is `false`, this gets the start (min value) of the *independent* variable range, spanned by the bar's thickness.
   * If `horizontal` is `true`, this gets the *dependent* variable value, the end of the bar's length
   */
  x: CustomPropTypes.valueOrAccessor,

  /**
   * Accessor function for the end (max X value) of the *independent* variable range, spanned by the bar's thickness.
   * Should only be passed when `horizontal` is `false` (ignored otherwise).
   */
  xEnd: CustomPropTypes.valueOrAccessor,

  /**
   * Accessor function for bar Y values, called once per bar (datum), or a single value to be used for all bars.
   * If `horizontal` is `true`, this gets the start (min value) of the *independent* variable range which is spanned by the bar's thickness.
   * If `horizontal` is `false`, this gets the *dependent* variable value, the end of the bar's length
   */
  y: CustomPropTypes.valueOrAccessor,

  /**
   * Accessor function for the end (max Y value) of the *independent* variable range, spanned by the bar's thickness.
   * Should only be passed when `horizontal` is `true` (ignored otherwise).
   */
  yEnd: CustomPropTypes.valueOrAccessor,

  /**
   * Class attribute to be applied to each bar.
   * or accessor function which returns a class;
   */
  barClassName: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),

  /**
   * Inline style object to be applied to each bar,
   * or accessor function which returns a style object;
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

_defineProperty(AreaBarChart, "defaultProps", {
  data: [],
  horizontal: false,
  barClassName: "",
  barStyle: {}
});
//# sourceMappingURL=AreaBarChart.js.map