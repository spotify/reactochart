"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

var _Scale = require("./utils/Scale");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class XTicks extends _react.default.Component {
  static getTickDomain(props) {
    if (!props.xScale) return;
    props = _lodash.default.defaults({}, props, XTicks.defaultProps);
    return {
      xTickDomain: (0, _Scale.getTickDomain)(props.xScale, props)
    };
  }

  static getMargin(props) {
    const {
      tickLength,
      position
    } = _lodash.default.defaults({}, props, XTicks.defaultProps);

    const placement = props.placement || (position === "top" ? "above" : "below");
    const zeroMargin = {
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0
    };
    if (position === "bottom" && placement === "above" || position === "top" && placement === "below") return zeroMargin;
    return _lodash.default.defaults({
      ["margin".concat(_lodash.default.capitalize(position))]: tickLength || 0
    }, zeroMargin);
  }

  render() {
    const {
      height,
      xScale,
      tickCount,
      position,
      tickLength,
      tickStyle,
      tickClassName,
      spacingTop,
      spacingBottom
    } = this.props;
    const placement = this.props.placement || (position === "top" ? "above" : "below");
    const ticks = this.props.ticks || (0, _Scale.getScaleTicks)(xScale, null, tickCount);
    const className = "rct-chart-tick rct-chart-tick-x ".concat(tickClassName || "");
    const transform = position === "bottom" ? "translate(0, ".concat(height + (spacingBottom || 0), ")") : "translate(0, ".concat(-spacingTop || 0, ")");
    return _react.default.createElement("g", {
      className: "rct-chart-ticks-x",
      transform: transform
    }, ticks.map((tick, i) => {
      const x1 = xScale(tick);
      const y2 = placement === "above" ? -tickLength : tickLength;
      return _react.default.createElement("line", {
        x1,
        x2: x1,
        y1: 0,
        y2,
        className,
        style: tickStyle,
        key: "tick-".concat(i)
      });
    }));
  }

}

exports.default = XTicks;

_defineProperty(XTicks, "propTypes", {
  /**
   * D3 scale for X axis - provided by XYPlot.
   */
  xScale: _propTypes.default.func,

  /**
   * Position of x ticks. Accepted options are "bottom" or "top".
   */
  position: _propTypes.default.oneOf(["bottom", "top"]),

  /**
   * Placement of ticks in regards to the x axis. Accepted options are "above" or "below".
   */
  placement: _propTypes.default.oneOf(["above", "below"]),

  /**
   * Custom ticks to display.
   */
  ticks: _propTypes.default.array,

  /**
   * Number of ticks on axis.
   */
  tickCount: _propTypes.default.number,
  tickLength: _propTypes.default.number,

  /**
   * Inline style object applied to each tick.
   */
  tickStyle: _propTypes.default.object,

  /**
   * Class attribute to be applied to each tick.
   */
  tickClassName: _propTypes.default.string,

  /**
   * Spacing - provided by XYPlot and used to determine the placement of the ticks given spacingTop.
   */
  spacingTop: _propTypes.default.number,

  /**
   * Spacing - provided by XYPlot and used to determine the placement of the ticks given spacingBottom.
   */
  spacingBottom: _propTypes.default.number,

  /**
   * Round ticks to capture extent of given x domain from XYPlot.
   */
  nice: _propTypes.default.bool
});

_defineProperty(XTicks, "defaultProps", {
  position: "bottom",
  nice: true,
  tickLength: 5,
  tickStyle: {},
  tickClassName: ""
});
//# sourceMappingURL=XTicks.js.map