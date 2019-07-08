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

function resolveXLabelsForValues(scale, values, formats, style, force = true) {
  // given a set of values to label, and a list of formatters to try,
  // find the first formatter that produces a set of labels
  // which are A) distinct and B) fit on the axis without colliding with each other
  // returns the formatter and the generated labels
  let labels;
  let attempts = [];

  const goodFormat = _lodash.default.find(formats, format => {
    const testLabels = values.map((value, i) => {
      return _MeasuredValueLabel.default.getLabel({
        value,
        format,
        style: _lodash.default.defaults((0, _Data.getValue)(style.labelStyle, {
          value
        }, i), style.defaultStyle)
      });
    });
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

    const labelXRanges = testLabels.map(label => (0, _Label.getLabelXRange)(scale, label, style.textAnchor || "middle"));
    const collisionCount = (0, _Label.countRangeOverlaps)(labelXRanges);

    if (collisionCount) {
      // console.log(`labels do not fit on X axis, ${collisionCount} collisions`, _.map(testLabels, 'text'));
      attempts.push({
        labels: testLabels,
        format,
        areLabelsDistinct,
        collisionCount
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
    if (!force) // if we're not forced to decide, return all the labels we tried (let someone else decide)
      return {
        attempts
      }; // forced to decide, choose the least bad option
    // todo warn that we couldn't find good labels

    const distinctAttempts = attempts.filter(attempt => attempt.areLabelsDistinct);
    return distinctAttempts.length === 0 ? // super bad, we don't have any label sets with distinct labels. return the last attempt.
    _lodash.default.last(attempts) : // return the attempt with the fewest collisions between distinct labels
    _lodash.default.minBy(distinctAttempts, "collisionCount");
  }
}

class XAxisLabels extends _react.default.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return !(0, _xyPropsEqual.default)(this.props, nextProps);
  }

  static getTickDomain(props) {
    if (!props.xScale) return;
    props = _lodash.default.defaults({}, props, XAxisLabels.defaultProps);
    return {
      xTickDomain: (0, _Scale.getTickDomain)(props.xScale, props)
    };
  }

  static getMargin(props) {
    props = _lodash.default.defaults({}, props, XAxisLabels.defaultProps);
    const {
      xScale,
      position,
      placement,
      distance
    } = props;
    const labels = props.labels || XAxisLabels.getLabels(props);
    const zeroMargin = {
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0
    };
    if (position === "bottom" && placement === "above" || position === "top" && placement === "below") return zeroMargin;

    const marginY = _lodash.default.max(labels.map(label => Math.ceil(distance + label.height)));

    const [marginLeft, marginRight] = (0, _Label.getLabelsXOverhang)(xScale, labels, "middle");
    return _lodash.default.defaults({
      ["margin".concat(_lodash.default.capitalize(position))]: marginY,
      marginLeft,
      marginRight
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
      xScale
    } = _lodash.default.defaults(props, {}, XAxisLabels.defaultProps);

    const ticks = props.ticks || (0, _Scale.getScaleTicks)(xScale, null, tickCount);
    const style = {
      labelStyle,
      defaultStyle: XAxisLabels.defaultProps.labelStyle
    };
    const scaleType = (0, _Scale.inferScaleType)(xScale);
    const propsFormats = props.format ? [props.format] : props.formats;
    const formatStrs = _lodash.default.isArray(propsFormats) && propsFormats.length ? propsFormats : XAxisLabels.getDefaultFormats(scaleType);
    const formats = (0, _Label.makeLabelFormatters)(formatStrs, scaleType); // todo resolve ticks also
    // if there are so many ticks that no combination of labels can fit on the axis,
    // nudge down the tickCount and try again
    // doing this will require communicating the updated ticks/tickCount back to the parent element...

    const {
      labels
    } = resolveXLabelsForValues(xScale, ticks, formats, style);
    return labels;
  }

  render() {
    const {
      height,
      xScale,
      position,
      distance,
      labelStyle,
      labelClassName,
      spacingTop,
      spacingBottom,
      offset
    } = this.props;
    const labels = this.props.labels || XAxisLabels.getLabels(this.props);
    const placement = this.props.placement || (position === "top" ? "above" : "below");
    const className = "rct-chart-value-label rct-chart-value-label-x ".concat(labelClassName);
    const transform = position === "bottom" ? "translate(0, ".concat(height + spacingBottom, ")") : "translate(0, ".concat(-spacingTop, ")"); // todo: position: 'zero' to position along the zero line
    // example include having both positive and negative areas and youd like labels just on zero line

    return _react.default.createElement("g", {
      className: "rct-chart-value-labels-x",
      transform: transform
    }, labels.map((label, i) => {
      const x = xScale(label.value) + offset;
      const y = placement === "above" ? -label.height - distance : distance;
      const [onMouseEnter, onMouseMove, onMouseLeave, onClick] = ["onMouseEnterLabel", "onMouseMoveLabel", "onMouseLeaveLabel", "onMouseClickLabel"].map(eventName => {
        // partially apply this label's data point as 2nd callback argument
        const callback = _lodash.default.get(this.props, eventName);

        return _lodash.default.isFunction(callback) ? _lodash.default.partial(callback, _lodash.default, label.value) : null;
      });

      const style = _lodash.default.defaults({
        textAnchor: "middle"
      }, (0, _Data.getValue)(labelStyle, _objectSpread({
        x,
        y
      }, label), i), XAxisLabels.defaultProps.labelStyle);

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
        dy: "0.8em",
        style
      }), label.text));
    }));
  }

}

_defineProperty(XAxisLabels, "propTypes", {
  height: _propTypes.default.number,

  /***
   * Position of x axis labels. Accepted options are "top" or "bottom".
   */
  position: _propTypes.default.oneOf(["top", "bottom"]),

  /**
   * Placement of labels in regards to the x axis. Accepted options are "above" or "below".
   */
  placement: _propTypes.default.oneOf(["below", "above"]),

  /**
   * D3 scale for X axis - provided by XYPlot.
   */
  xScale: _propTypes.default.func,

  /**
   * Spacing - provided by XYPlot and used to determine the placement of the label given spacingTop.
   */
  spacingTop: _propTypes.default.number,

  /**
   * Spacing - provided by XYPlot and used to determine the placement of the label given spacingBottom.
   */
  spacingBottom: _propTypes.default.number,

  /**
   * Label distance from X Axis.
   */
  distance: _propTypes.default.number,

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
   * smallest amount of possible collissions along the axis. It's therefore dependent on
   * fontFamily, size and fontStyle to always be passed in. If you're looking to have a centralized
   * stylesheet, we suggest creating a styled label component that wraps XAxisLabels with your preferred styles.
   */
  labelStyle: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object]),
  labelClassName: _propTypes.default.string,

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
   * For example, given labels with real numbers one can pass in 0.[0] to round to the first significant digit.
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
   * Round ticks to capture extent of given x domain from XYPlot.
   */
  nice: _propTypes.default.bool,

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
   * Adds horizontal offset (along the XAxis) to the labels
   */
  offset: _propTypes.default.number
});

_defineProperty(XAxisLabels, "defaultProps", {
  offset: 0,
  height: 250,
  position: "bottom",
  placement: undefined,
  distance: 4,
  nice: true,
  tickCount: 10,
  ticks: null,
  labelClassName: "",
  labelStyle: {
    fontFamily: "Helvetica, sans-serif",
    fontSize: "14px",
    lineHeight: 1,
    textAnchor: "middle"
  },
  format: undefined,
  formats: undefined,
  labels: undefined
});

class XAxisLabelDebugRect extends _react.default.Component {
  render() {
    const {
      x,
      y,
      label
    } = this.props;
    return _react.default.createElement("rect", {
      x: x - label.width / 2,
      y: y,
      width: label.width,
      height: label.height,
      fill: "orange"
    });
  }

}

var _default = XAxisLabels;
exports.default = _default;
//# sourceMappingURL=XAxisLabels.js.map