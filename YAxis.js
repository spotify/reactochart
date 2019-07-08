"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

var _Axis = require("./utils/Axis");

var _Margin = require("./utils/Margin");

var _Scale = require("./utils/Scale");

var _xyPropsEqual = _interopRequireDefault(require("./utils/xyPropsEqual"));

var _YAxisLabels = _interopRequireDefault(require("./YAxisLabels"));

var _YAxisTitle = _interopRequireDefault(require("./YAxisTitle"));

var _YGrid = _interopRequireDefault(require("./YGrid"));

var _YTicks = _interopRequireDefault(require("./YTicks"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const getMouseOptions = _Axis.getMouseAxisOptions.bind(null, "y");
/**
 * `YAxis` is the vertical axis of the chart. `YAxis` is a wrapper around `YGrid`, `YTicks`,
 * `YAxisLabels`, and `YAxisTitle`. See their respective docs for prop documentation.
 */


class YAxis extends _react.default.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "handleOnMouseMove", event => {
      const {
        onMouseMoveAxis,
        yScale
      } = this.props;

      if (!_lodash.default.isFunction(onMouseMoveAxis)) {
        return;
      }

      const options = getMouseOptions(event, yScale);
      onMouseMoveAxis(options);
    });

    _defineProperty(this, "handleOnMouseEnter", event => {
      const {
        onMouseEnterAxis,
        yScale
      } = this.props;

      if (!_lodash.default.isFunction(onMouseEnterAxis)) {
        return;
      }

      const options = getMouseOptions(event, yScale);
      onMouseEnterAxis(options);
    });

    _defineProperty(this, "handleOnMouseLeave", event => {
      const {
        onMouseLeaveAxis,
        yScale
      } = this.props;

      if (!_lodash.default.isFunction(onMouseLeaveAxis)) {
        return;
      }

      const options = getMouseOptions(event, yScale);
      onMouseLeaveAxis(options);
    });

    _defineProperty(this, "handleOnClick", event => {
      const {
        onMouseClickAxis,
        yScale
      } = this.props;

      if (!_lodash.default.isFunction(onMouseClickAxis)) {
        return;
      }

      const options = getMouseOptions(event, yScale);
      onMouseClickAxis(options);
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !(0, _xyPropsEqual.default)(this.props, nextProps);
  }

  static getTickDomain(props) {
    if (!props.yScale) return;
    props = _lodash.default.defaults({}, props, YAxis.defaultProps);
    return {
      yTickDomain: (0, _Scale.getTickDomain)(props.yScale, props)
    };
  }

  static getMargin(props) {
    const {
      ticksProps,
      labelsProps,
      titleProps
    } = (0, _Axis.getAxisChildProps)(props);
    let margins = [];
    if (props.showTicks) margins.push(_YTicks.default.getMargin(ticksProps));
    if (props.showTitle && props.title) margins.push(_YAxisTitle.default.getMargin(titleProps));
    if (props.showLabels) margins.push(_YAxisLabels.default.getMargin(labelsProps));
    return (0, _Margin.sumMargins)(margins, "margin");
  }

  render() {
    const {
      width,
      height,
      position,
      tickLength,
      titleDistance,
      labelDistance,
      showTitle,
      showLabels,
      showTicks,
      showGrid,
      spacingTop,
      spacingBottom,
      spacingLeft,
      spacingRight,
      showLine,
      lineStyle
    } = this.props;
    const {
      ticksProps,
      gridProps,
      labelsProps,
      titleProps
    } = (0, _Axis.getAxisChildProps)(this.props);
    labelsProps.distance = labelDistance + (showTicks ? tickLength : 0);

    if (showTitle && showLabels) {
      // todo optimize so we don't generate labels twice
      const labelsMargin = _YAxisLabels.default.getMargin(labelsProps);

      titleProps.distance = titleDistance + labelsMargin["margin".concat(_lodash.default.upperFirst(position))];
    } else if (showTitle && showTicks) {
      titleProps.distance = titleDistance + tickLength;
    }

    const axisLineX = position === "left" ? -spacingLeft : width + spacingRight;
    return _react.default.createElement("g", {
      className: "rct-chart-axis rct-chart-axis-y",
      onMouseMove: this.handleOnMouseMove,
      onMouseEnter: this.handleOnMouseEnter,
      onMouseLeave: this.handleOnMouseLeave,
      onClick: this.handleOnClick
    }, showGrid ? _react.default.createElement(_YGrid.default, gridProps) : null, showTicks ? _react.default.createElement(_YTicks.default, ticksProps) : null, showLabels ? _react.default.createElement(_YAxisLabels.default, labelsProps) : null, showTitle ? _react.default.createElement(_YAxisTitle.default, titleProps) : null, showLine ? _react.default.createElement("line", {
      className: "rct-chart-axis-line rct-chart-axis-line-y",
      x1: axisLineX,
      x2: axisLineX,
      y1: -spacingTop,
      y2: height + spacingBottom,
      style: lineStyle
    }) : null);
  }

}

exports.default = YAxis;

_defineProperty(YAxis, "propTypes", {
  yScale: _propTypes.default.func,
  width: _propTypes.default.number,
  height: _propTypes.default.number,
  position: _propTypes.default.string,
  placement: _propTypes.default.string,

  /**
   * Extends the y domain to start and end on rounded values,
   * guaranteeing the original domain will be covered.
   * See d3 docs for more information
   */
  nice: _propTypes.default.bool,
  ticks: _propTypes.default.array,
  tickCount: _propTypes.default.number,

  /**
   * Internal top spacing of YAxis, in pixels.
   */
  spacingTop: _propTypes.default.number,

  /**
   * Internal bottom spacing of YAxis, in pixels.
   */
  spacingBottom: _propTypes.default.number,

  /**
   * Internal left spacing of YAxis, in pixels.
   */
  spacingLeft: _propTypes.default.number,

  /**
   * Internal right spacing of YAxis, in pixels.
   */
  spacingRight: _propTypes.default.number,
  showTitle: _propTypes.default.bool,
  showLabels: _propTypes.default.bool,
  showTicks: _propTypes.default.bool,
  showGrid: _propTypes.default.bool,
  title: _propTypes.default.string,
  titleDistance: _propTypes.default.number,
  titleAlign: _propTypes.default.string,
  titleRotate: _propTypes.default.bool,
  titleStyle: _propTypes.default.object,
  labelDistance: _propTypes.default.number,
  labelClassName: _propTypes.default.string,
  labelStyle: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object]),
  labelFormat: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),
  labelFormats: _propTypes.default.array,
  labels: _propTypes.default.array,

  /**
   * Adds vertical offset (along the YAxis) to the labels
   */
  labelOffset: _propTypes.default.number,
  tickLength: _propTypes.default.number,
  tickClassName: _propTypes.default.string,
  tickStyle: _propTypes.default.object,
  gridLineClassName: _propTypes.default.string,
  gridLineStyle: _propTypes.default.object,
  onMouseClickLabel: _propTypes.default.func,
  onMouseEnterLabel: _propTypes.default.func,
  onMouseMoveLabel: _propTypes.default.func,
  onMouseLeaveLabel: _propTypes.default.func,

  /**
   * `mouseenter` event handler callback, called when user's mouse enters the y axis.
   */
  onMouseEnterAxis: _propTypes.default.func,

  /**
   * `mouseleave` event handler callback, called when user's mouse leaves the y axis.
   */
  onMouseLeaveAxis: _propTypes.default.func,

  /**
   * `mousemove` event handler callback, called when user's mouse moves within the y axis.
   */
  onMouseMoveAxis: _propTypes.default.func,

  /**
   * `click` event handler callback, called when user's mouse clicks on the y axis.
   */
  onMouseClickAxis: _propTypes.default.func,

  /**
   * Show Y Axis line
   */
  showLine: _propTypes.default.bool,

  /**
   * Inline style object to be applied to the Y Axis line
   */
  lineStyle: _propTypes.default.object
});

_defineProperty(YAxis, "defaultProps", {
  width: 400,
  height: 250,
  position: "left",
  nice: true,
  showTitle: true,
  showLabels: true,
  showTicks: true,
  showGrid: true,
  tickLength: 5,
  labelDistance: 3,
  titleDistance: 5,
  spacingTop: 0,
  spacingBottom: 0,
  spacingLeft: 0,
  spacingRight: 0,
  showLine: true,
  lineStyle: {}
});
//# sourceMappingURL=YAxis.js.map