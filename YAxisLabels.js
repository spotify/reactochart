"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

var _MeasuredValueLabel = _interopRequireDefault(require("./MeasuredValueLabel"));

var _Label = require("./utils/Label");

var _Data = require("./utils/Data");

var _Scale = require("./utils/Scale");

var _xyPropsEqual = _interopRequireDefault(require("./utils/xyPropsEqual"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function resolveYLabelsForValues(scale, values, formats, style, force = true) {
  // given a set of Y-values to label, and a list of formatters to try,
  // find the first formatter that produces a set of labels which are distinct
  // since we currently do not support rotated axis value labels,
  // we do not check if they fit on the axis (unlike X labels), since all Y labels will have the same height
  // returns the formatter and the generated labels
  let labels;
  let attempts = [];

  const goodFormat = _lodash.default.find(formats, format => {
    const testLabels = values.map((value, i) => _MeasuredValueLabel.default.getLabel({
      value,
      format,
      style: _lodash.default.defaults((0, _Data.getValue)(style.labelStyle, {
        value
      }, i), style.defaultStyle)
    }));
    const areLabelsDistinct = (0, _Label.checkLabelsDistinct)(testLabels);

    if (!areLabelsDistinct) {
      // console.log('labels are not distinct', _.map(testLabels, 'text'));
      attempts.push({
        labels: testLabels,
        format,
        areLabelsDistinct
      });
      return false;
    }

    labels = testLabels;
    return true;
  });

  if (!_lodash.default.isUndefined(goodFormat)) {
    // found labels which work, return them
    return {
      labels,
      format: goodFormat,
      areLabelsDistinct: true,
      collisionCount: 0
    };
  } else {
    // none of the sets of labels are good
    // if we're not forced to decide, return all the labels we tried (let someone else decide)
    if (!force) return {
      attempts
    }; // forced to decide, choose the least bad option
    // super bad, we don't have any label sets with distinct labels. return the last attempt.

    return _lodash.default.last(attempts);
  }
}

class YAxisLabels extends _react.default.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return !(0, _xyPropsEqual.default)(this.props, nextProps);
  }

  static getTickDomain(props) {
    if (!props.yScale) return;
    props = _lodash.default.defaults({}, props, YAxisLabels.defaultProps);
    return {
      yTickDomain: (0, _Scale.getTickDomain)(props.yScale, props)
    };
  }

  static getMargin(props) {
    props = _lodash.default.defaults({}, props, YAxisLabels.defaultProps);
    const {
      yScale,
      position,
      placement,
      distance
    } = props;
    const labels = props.labels || YAxisLabels.getLabels(props);
    const zeroMargin = {
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0
    };
    if (position === "left" && placement === "after" || position === "right" && placement === "before") return zeroMargin;

    const marginX = _lodash.default.max(labels.map(label => Math.ceil(distance + label.width)));

    const [marginTop, marginBottom] = (0, _Label.getLabelsYOverhang)(yScale, labels, "middle");
    return _lodash.default.defaults({
      ["margin".concat(_lodash.default.capitalize(position))]: marginX,
      marginTop,
      marginBottom
    }, zeroMargin);
  }

  static getDefaultFormats(scaleType) {
    const timeFormatStrs = ["YYYY", "'YY", "MMM YYYY", "M/YY"];
    const numberFormatStrs = ["0.[00]a", "0,0", "0.[0]", "0.[00]", "0.[0000]", "0.[000000]"];
    return scaleType === "ordinal" ? [_lodash.default.identity] : scaleType === "time" ? timeFormatStrs : numberFormatStrs;
  }

  static getLabels(props) {
    const {
      tickCount,
      labelStyle,
      yScale
    } = _lodash.default.defaults(props, {}, YAxisLabels.defaultProps);

    const ticks = props.ticks || (0, _Scale.getScaleTicks)(yScale, null, tickCount);
    const style = {
      labelStyle,
      defaultStyle: YAxisLabels.defaultProps.labelStyle
    };
    const scaleType = (0, _Scale.inferScaleType)(yScale);
    const propsFormats = props.format ? [props.format] : props.formats;
    const formatStrs = _lodash.default.isArray(propsFormats) && propsFormats.length ? propsFormats : YAxisLabels.getDefaultFormats(scaleType);
    const formats = (0, _Label.makeLabelFormatters)(formatStrs, scaleType); // todo resolve ticks also
    // if there are so many ticks that no combination of labels can fit on the axis,
    // nudge down the tickCount and try again
    // doing this will require communicating the updated ticks/tickCount back to the parent element...

    const {
      labels
    } = resolveYLabelsForValues(yScale, ticks, formats, style); // console.log('resolveYLabelsForValues took ', performance.now() - start);
    // console.log('found labels', labels);

    return labels;
  }

  render() {
    // todo: position: 'zero' prop to position along the zero line
    const {
      width,
      yScale,
      position,
      distance,
      labelStyle,
      labelClassName,
      spacingLeft,
      spacingRight,
      offset
    } = this.props;
    const placement = this.props.placement || (position === "left" ? "before" : "after");
    const className = "rct-chart-value-label rct-chart-value-label-y ".concat(labelClassName);
    const textAnchor = placement === "before" ? "end" : "start";
    const labels = this.props.labels || YAxisLabels.getLabels(this.props);
    const transform = position === "left" ? "translate(".concat(-spacingLeft, ", 0)") : "translate(".concat(width + spacingRight, ", 0)");
    return _react.default.createElement("g", {
      className: "rct-chart-value-labels-y",
      transform: transform
    }, labels.map((label, i) => {
      const y = yScale(label.value) + offset;
      const x = placement === "before" ? -distance : distance;
      const [onMouseEnter, onMouseMove, onMouseLeave, onClick] = ["onMouseEnterLabel", "onMouseMoveLabel", "onMouseLeaveLabel", "onMouseClickLabel"].map(eventName => {
        // partially apply this bar's data point as 2nd callback argument
        const callback = _lodash.default.get(this.props, eventName);

        return _lodash.default.isFunction(callback) ? _lodash.default.partial(callback, _lodash.default, label.value) : null;
      });

      const style = _lodash.default.defaults({
        textAnchor
      }, (0, _Data.getValue)(labelStyle, _objectSpread({
        x,
        y
      }, label), i), YAxisLabels.defaultProps.labelStyle);

      return _react.default.createElement("g", _extends({
        key: "x-axis-label-".concat(i)
      }, {
        onMouseEnter,
        onMouseMove,
        onMouseLeave,
        onClick
      }), _react.default.createElement(_MeasuredValueLabel.default, _extends({
        value: label.value
      }, {
        x,
        y,
        className,
        dy: "0.35em",
        style
      }), label.text));
    }));
  }

}

_defineProperty(YAxisLabels, "propTypes", {
  /**
   * D3 scale for Y axis - provided by XYPlot.
   */
  yScale: _propTypes.default.func,
  height: _propTypes.default.number,
  width: _propTypes.default.number,

  /**
   * Position of y axis labels. Accepted options are "left" or "right".
   */
  position: _propTypes.default.oneOf(["left", "right"]),

  /**
   * Placement of labels in regards to the y axis. Accepted options are "before" or "after".
   */
  placement: _propTypes.default.oneOf(["before", "after"]),

  /**
   * Label distance from Y Axis.
   */
  distance: _propTypes.default.number,

  /**
   * Round ticks to capture extent of given y domain from XYPlot.
   */
  nice: _propTypes.default.bool,

  /**
   * Number of ticks on axis.
   */
  tickCount: _propTypes.default.number,

  /**
   * Custom ticks to display.
   */
  ticks: _propTypes.default.array,

  /**
   * Inline style object applied to each label,
   * or accessor function which returns a style object
   *
   * Disclaimer: labelStyle will merge its defaults with the given labelStyle prop
   * in order to ensure that our collision library measureText is able to calculate the
   * smallest amount of possible collisions along the axis. It's therefore dependent on
   * fontFamily, size and fontStyle to always be passed in. If you're looking to have a centralized
   * stylesheet, we suggest creating a styled label component that wraps YAxisLabels with your preferred styles.
   */
  labelStyle: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object]),
  labelClassName: _propTypes.default.string,

  /**
   * Spacing - provided by XYPlot and used to determine the placement of the label given spacingLeft
   */
  spacingLeft: _propTypes.default.number,

  /**
   * Spacing - provided by XYPlot and used to determine the placement of the label given spacingRight
   */
  spacingRight: _propTypes.default.number,

  /**
   * `mouseenter` event handler callback, called when user's mouse enters the label.
   */
  onMouseEnterLabel: _propTypes.default.func,

  /**
   * `mousemove` event handler callback, called when user's mouse moves within the label.
   */
  onMouseMoveLabel: _propTypes.default.func,

  /**
   * `mouseleave` event handler callback, called when user's mouse leaves the label.
   */
  onMouseLeaveLabel: _propTypes.default.func,

  /**
   * `mouseclick` event handler callback, called when user's mouse clicks the label.
   */
  onMouseClickLabel: _propTypes.default.func,

  /**
   * Format to use for the labels or accessor that returns the updated label.
   *
   * For example, given labels with real numbers one can pass in 0.[0] to round to the first significant digit.
   */
  format: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),

  /**
   * Formats to use for the labels in priority order. XAxisLabels will try to be smart about which format
   * to use that keeps the labels distinct and provides the least amount of collisions when rendered.
   *
   * For example, given labels with real numbers one can pass in 0.[0] to round to the first significant digit
   */
  formats: _propTypes.default.array,

  /**
   * Custom labels provided. Note that each object in the array has to be of shape.
   * `{
   *  value,
   *  text,
   *  height,
   *  width
   * }`
   * value - value you'd like this label to be aligned with
   * text - text you'd like displayed
   * height - height of the given label
   * width - width of the given label
   */
  labels: _propTypes.default.array,

  /**
   * Adds vertical offset (along the YAxis) to the labels.
   */
  offset: _propTypes.default.number
});

_defineProperty(YAxisLabels, "defaultProps", {
  offset: 0,
  height: 250,
  width: 400,
  position: "left",
  distance: 4,
  nice: true,
  tickCount: 10,
  ticks: null,
  labelClassName: "",
  labelStyle: {
    fontFamily: "Helvetica, sans-serif",
    fontSize: "14px",
    lineHeight: 1,
    textAnchor: "end"
  }
});

class YAxisLabelDebugRect extends _react.default.Component {
  render() {
    const {
      x,
      y,
      label,
      style
    } = this.props;
    const xAdj = style.textAnchor === "end" ? x - label.width : x;
    return _react.default.createElement("rect", {
      x: xAdj,
      y: y - label.height / 2,
      width: label.width,
      height: label.height,
      fill: "orange"
    });
  }

}

var _default = YAxisLabels;
exports.default = _default;
//# sourceMappingURL=YAxisLabels.js.map