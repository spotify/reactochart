"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

var _util = require("./util");

var _Margin = require("./utils/Margin");

var _resolveXYScales = _interopRequireDefault(require("./utils/resolveXYScales"));

var _Scale = require("./utils/Scale");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function getMouseOptions(event, {
  xScale,
  yScale,
  height,
  width,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight
}) {
  const chartBB = event.currentTarget.getBoundingClientRect();
  const outerX = Math.round(event.clientX - chartBB.left);
  const outerY = Math.round(event.clientY - chartBB.top);
  const innerX = outerX - (marginLeft || 0);
  const innerY = outerY - (marginTop || 0);
  const chartSize = (0, _Margin.innerSize)({
    width,
    height
  }, {
    top: marginTop,
    bottom: marginBottom,
    left: marginLeft,
    right: marginRight
  });
  const xScaleType = (0, _Scale.inferScaleType)(xScale);
  const yScaleType = (0, _Scale.inferScaleType)(yScale);
  const xValue = !_lodash.default.inRange(innerX, 0, chartSize.width) ? null : xScaleType === "ordinal" ? (0, _Scale.invertPointScale)(xScale, innerX) : xScale.invert(innerX);
  const yValue = !_lodash.default.inRange(innerY, 0, chartSize.height) ? null : yScaleType === "ordinal" ? (0, _Scale.invertPointScale)(yScale, innerY) : yScale.invert(innerY);
  return {
    event,
    outerX,
    outerY,
    innerX,
    innerY,
    xValue,
    yValue,
    xScale,
    yScale,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight
  };
}

class XYPlot extends _react.default.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "onXYMouseEvent", (callbackKey, event) => {
      const callback = this.props[callbackKey];
      if (!_lodash.default.isFunction(callback)) return;
      const options = getMouseOptions(event, this.props);
      callback(options);
    });

    _defineProperty(this, "onMouseMove", _lodash.default.partial(this.onXYMouseEvent, "onMouseMove"));

    _defineProperty(this, "onMouseDown", _lodash.default.partial(this.onXYMouseEvent, "onMouseDown"));

    _defineProperty(this, "onMouseUp", _lodash.default.partial(this.onXYMouseEvent, "onMouseUp"));

    _defineProperty(this, "onClick", _lodash.default.partial(this.onXYMouseEvent, "onClick"));

    _defineProperty(this, "onMouseEnter", event => this.props.onMouseEnter({
      event
    }));

    _defineProperty(this, "onMouseLeave", event => this.props.onMouseLeave({
      event
    }));
  }

  render() {
    const {
      width,
      height,
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      spacingTop,
      spacingBottom,
      spacingLeft,
      spacingRight,
      style,
      xyPlotStyle,
      xyPlotClassName,
      // Passed in as prop from resolveXYScales
      xScale,
      yScale
    } = this.props; // subtract margin + spacing from width/height to obtain inner width/height of panel & chart area
    // panelSize is the area including chart + spacing but NOT margin
    // chartSize is smaller, chart *only*, not including margin or spacing

    const panelSize = (0, _Margin.innerSize)({
      width,
      height
    }, {
      top: marginTop,
      bottom: marginBottom,
      left: marginLeft,
      right: marginRight
    });
    const chartSize = (0, _Margin.innerSize)(panelSize, {
      top: spacingTop,
      bottom: spacingBottom,
      left: spacingLeft,
      right: spacingRight
    });
    const handlerNames = ["onMouseMove", "onMouseEnter", "onMouseLeave", "onMouseDown", "onMouseUp", "onClick"];

    const handlers = _lodash.default.fromPairs(handlerNames.map(n => [n, (0, _util.methodIfFuncProp)(n, this.props, this)]));

    const scales = {
      xScale,
      yScale
    }; // Props to omit since we don't want them to override child props
    // TODO for v2: Namespace these props to be specific to XYPlot,
    // but will be an incompatible API change

    const omittedProps = ["style", "onMouseMove", "onMouseEnter", "onMouseLeave"];
    const xyPlotPropKeys = Object.keys(XYPlot.propTypes).filter(k => omittedProps.indexOf(k) === -1);

    const propsToPass = _lodash.default.omit(_objectSpread({}, _lodash.default.pick(this.props, xyPlotPropKeys), chartSize, scales), omittedProps);

    const className = "rct-xy-plot ".concat(xyPlotClassName);
    return _react.default.createElement("svg", _extends({
      width,
      height,
      className,
      style
    }, handlers), _react.default.createElement("rect", _extends({
      className: "rct-chart-background"
    }, {
      width,
      height
    })), _react.default.createElement("g", {
      transform: "translate(".concat(marginLeft + spacingLeft, ", ").concat(marginTop + spacingTop, ")"),
      className: "rct-chart-inner"
    }, _react.default.createElement("rect", _extends({
      transform: "translate(".concat(-spacingLeft, ", ").concat(-spacingTop, ")"),
      className: "rct-plot-background",
      style: xyPlotStyle
    }, panelSize)), _react.default.Children.map(this.props.children, child => {
      return _lodash.default.isNull(child) || _lodash.default.isUndefined(child) ? null : _react.default.cloneElement(child, propsToPass);
    })));
  }

}

_defineProperty(XYPlot, "propTypes", {
  /**
   * (outer) width of the chart (SVG element).
   */
  width: _propTypes.default.number,

  /**
   * (outer) width of the chart (SVG element).
   */
  height: _propTypes.default.number,

  /**
   * The X domain of the data as an array.
   * For numerical scales, this is represented as [min, max] of the data;
   * for ordinal/categorical scales it is an array of known values ie. ['a', 'b', 'c'].
   * Automatically determined from data if not passed.
   */
  xDomain: _propTypes.default.array,

  /**
   * The Y domain of the data as an array.
   * For numerical scales, this is represented as [min, max] of the data;
   * for ordinal/categorical scales it is an array of known values ie. ['a', 'b', 'c'].
   * Automatically determined from data if not passed.
   */
  yDomain: _propTypes.default.array,
  xScaleType: _propTypes.default.string,
  yScaleType: _propTypes.default.string,

  /**
   * Whether or not to invert the x scale
   */
  invertXScale: _propTypes.default.bool,

  /**
   * Whether or not to invert the y scale
   */
  invertYScale: _propTypes.default.bool,

  /**
   * Whether or not to coerce 0 into your x domain
   */
  includeXZero: _propTypes.default.bool,

  /**
   * Whether or not to coerce 0 into your y domain
   */
  includeYZero: _propTypes.default.bool,

  /**
   * Internal top margin, in pixels.
   */
  marginTop: _propTypes.default.number,

  /**
   * Internal bottom margin, in pixels.
   */
  marginBottom: _propTypes.default.number,

  /**
   * Internal left margin, in pixels.
   */
  marginLeft: _propTypes.default.number,

  /**
   * Internal right margin, in pixels.
   */
  marginRight: _propTypes.default.number,

  /**
   * Internal top spacing of XYPlot, in pixels.
   */
  spacingTop: _propTypes.default.number,

  /**
   * Internal bottom spacing of XYPlot, in pixels.
   */
  spacingBottom: _propTypes.default.number,

  /**
   * Internal left spacing of XYPlot, in pixels.
   */
  spacingLeft: _propTypes.default.number,

  /**
   * Internal right spacing of XYPlot, in pixels.
   */
  spacingRight: _propTypes.default.number,

  /**
   * Inline style object to be applied to the parent SVG element.
   */
  style: _propTypes.default.object,

  /**
   * Inline style object to be applied to the plot.
   * This is the inner rect DOM element where the graphs are rendered within the axes.
   */
  xyPlotStyle: _propTypes.default.object,
  // todo implement padding (helper for spacing)
  // paddingTop: PropTypes.number,
  // paddingBottom: PropTypes.number,
  // paddingLeft: PropTypes.number,
  // paddingRight: PropTypes.number,
  onMouseMove: _propTypes.default.func,
  onMouseEnter: _propTypes.default.func,
  onMouseLeave: _propTypes.default.func,
  onMouseDown: _propTypes.default.func,
  onMouseUp: _propTypes.default.func,

  /**
   * Class attribute applied to xy plot
   */
  xyPlotClassName: _propTypes.default.string
});

_defineProperty(XYPlot, "defaultProps", {
  width: 400,
  height: 250,
  invertXScale: false,
  invertYScale: false,
  includeXZero: false,
  includeYZero: false,
  style: {},
  xyPlotStyle: {},
  xyPlotClassName: ""
});

const XYPlotResolved = (0, _resolveXYScales.default)(XYPlot);
var _default = XYPlotResolved;
exports.default = _default;
//# sourceMappingURL=XYPlot.js.map