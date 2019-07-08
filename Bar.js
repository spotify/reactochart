"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _invariant = _interopRequireDefault(require("invariant"));

var _isUndefined = _interopRequireDefault(require("lodash/isUndefined"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Bar is a low-level component to be used in XYPlot-type charts (namely BarChart).
 * It is specified in terms of a range (min & max) of values on one axis (the bar's long axis)
 * and a single value on the other axis.
 * Passing props `x`, `xEnd` and `y` specifies a horizontal bar,
 * centered on `y` and spanning from `x` to `xEnd`;
 * passing props `x`, `y`, and `yEnd' specifies a vertical bar.
 */
class Bar extends _react.default.Component {
  render() {
    // x/y are values in the *data* domain, not pixel domain
    const {
      xScale,
      yScale,
      x,
      xEnd,
      y,
      yEnd,
      thickness,
      style,
      onMouseEnter,
      onMouseMove,
      onMouseLeave,
      showLabel,
      labelFormat,
      labelDistance,
      labelClassName
    } = this.props;
    (0, _invariant.default)((0, _util.hasOneOfTwo)(xEnd, yEnd), "Bar expects an xEnd *or* yEnd prop, but not both.");
    const orientation = (0, _isUndefined.default)(xEnd) ? "vertical" : "horizontal";
    const className = "rct-chart-bar rct-chart-bar-".concat(orientation, " ").concat(this.props.className || "");
    const labelClass = "rct-chart-bar-label ".concat(this.props.labelClassName || "");
    let rectX, rectY, width, height, xText, yText, textAnchor, textValue;

    if (orientation === "horizontal") {
      rectY = yScale(y) - thickness / 2;
      const x0 = xScale(x);
      const x1 = xScale(xEnd);
      rectX = Math.min(x0, x1);
      width = Math.abs(x1 - x0);
      height = thickness; // horizontal text formatting to right of bar

      xText = Math.max(x0, x1) + labelDistance;
      yText = rectY + thickness / 2 + 5;
      textAnchor = "";
      textValue = xEnd;
    } else {
      // vertical
      rectX = xScale(x) - thickness / 2;
      const y0 = yScale(y);
      const y1 = yScale(yEnd);
      rectY = Math.min(y0, y1);
      height = Math.abs(y1 - y0);
      width = thickness; // vertical text formatting

      xText = rectX + thickness / 2;
      yText = rectY - labelDistance;
      textAnchor = "middle";
      textValue = yEnd;
    }

    const rect = _react.default.createElement("rect", {
      x: rectX,
      y: rectY,
      width,
      height,
      className,
      style,
      onMouseEnter,
      onMouseMove,
      onMouseLeave
    });

    const text = _react.default.createElement("text", {
      textAnchor,
      x: xText,
      y: yText,
      className: labelClass
    }, labelFormat ? labelFormat(textValue) : textValue);

    if (showLabel) {
      return _react.default.createElement("g", null, rect, text);
    }

    return rect;
  }

}

exports.default = Bar;

_defineProperty(Bar, "propTypes", {
  /**
   * For a vertical bar, `x` represents the X data value on which the bar is centered.
   * For a horizontal bar, represents the *starting* X value of the bar, ie. the minimum of the range it spans
   */
  x: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.string, _propTypes.default.instanceOf(Date)]),

  /**
   * For a horizontal bar, `y` represents the Y data value on which the bar is centered.
   * For a vertical bar, represents the *starting* Y value of the bar, ie. the minimum of the range it spans
   */
  y: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.string, _propTypes.default.instanceOf(Date)]),

  /**
   * For a horizontal bar, `xEnd` represents the *ending* X data value of the bar, ie. the maximum of the range it spans.
   * Should be undefined if the bar is vertical.
   */
  xEnd: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.string, _propTypes.default.instanceOf(Date)]),

  /**
   * For a vertical bar, `yEnd` represents the *ending* Y data value of the bar, ie. the maximum of the range it spans.
   * Should be undefined if the bar is horizontal.
   */
  yEnd: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.string, _propTypes.default.instanceOf(Date)]),

  /**
   * The thickness of the bar, in pixels. (width of vertical bar, or height of horizontal bar).
   */
  thickness: _propTypes.default.number,

  /**
   * Class name(s) to be included on the bar's <rect> element.
   */
  className: _propTypes.default.string,

  /**
   * Inline style object to be included on the bar's <rect> element.
   */
  style: _propTypes.default.object,

  /**
   * `mousemove` event handler callback, called when user's mouse moves within the bar.
   */
  onMouseMove: _propTypes.default.func,

  /**
   * `mouseenter` event handler callback, called when user's mouse enters the bar.
   */
  onMouseEnter: _propTypes.default.func,

  /**
   * `mouseleave` event handler callback, called when user's mouse leaves the bar.
   */
  onMouseLeave: _propTypes.default.func,

  /**
   * D3 scale for X axis - provided by XYPlot.
   */
  xScale: _propTypes.default.func,

  /**
   * D3 scale for Y axis - provided by XYPlot.
   */
  yScale: _propTypes.default.func,

  /**
   * Conditional if column should display values above/beside bar.
   */
  showLabel: _propTypes.default.bool,

  /**
   * Format to use for the values or accessor that returns the updated value.
   */
  labelFormat: _propTypes.default.func,

  /**
   * The distance from the column the label appears in pixels - default is 24.
   */
  labelDistance: _propTypes.default.number,

  /**
   * Class name(s) to be included on the bar's <text> element.
   */
  labelClassName: _propTypes.default.string
});

_defineProperty(Bar, "defaultProps", {
  x: 0,
  y: 0,
  thickness: 8,
  className: "",
  style: {},
  labelDistance: 24
});
//# sourceMappingURL=Bar.js.map