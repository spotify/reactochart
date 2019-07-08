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

class YTicks extends _react.default.Component {
  static getTickDomain(props) {
    if (!props.yScale) return;
    props = _lodash.default.defaults({}, props, YTicks.defaultProps);
    return {
      yTickDomain: (0, _Scale.getTickDomain)(props.yScale, props)
    };
  }

  static getMargin(props) {
    const {
      tickLength,
      position
    } = _lodash.default.defaults({}, props, YTicks.defaultProps);

    const placement = props.placement || (position === "left" ? "before" : "after");
    const zeroMargin = {
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0
    };
    if (position === "left" && placement === "after" || position === "right" && placement === "before") return zeroMargin;
    return _lodash.default.defaults({
      ["margin".concat(_lodash.default.capitalize(position))]: tickLength || 0
    }, zeroMargin);
  }

  render() {
    const {
      width,
      yScale,
      tickCount,
      position,
      tickLength,
      tickStyle,
      tickClassName,
      spacingLeft,
      spacingRight
    } = this.props;
    const placement = this.props.placement || (position === "left" ? "before" : "after");
    const ticks = this.props.ticks || (0, _Scale.getScaleTicks)(yScale, null, tickCount);
    const className = "rct-chart-tick rct-chart-tick-y ".concat(tickClassName || "");
    const transform = position === "right" ? "translate(".concat(width + (spacingRight || 0), ", 0)") : "translate(".concat(-spacingLeft || 0, ", 0)");
    return _react.default.createElement("g", {
      className: "rct-chart-ticks-y",
      transform: transform
    }, ticks.map((tick, i) => {
      const y1 = yScale(tick);
      const x2 = placement === "before" ? -tickLength : tickLength;
      return _react.default.createElement("line", {
        x1: 0,
        x2,
        y1,
        y2: y1,
        className,
        style: tickStyle,
        key: "tick-".concat(i)
      });
    }));
  }

}

exports.default = YTicks;

_defineProperty(YTicks, "propTypes", {
  /**
   * D3 scale for Y axis - provided by XYPlot.
   */
  yScale: _propTypes.default.func,

  /**
   * Position of y ticks. Accepted options are "left" or "right".
   */
  position: _propTypes.default.oneOf(["left", "right"]),

  /**
   * Placement of ticks in regards to the y axis. Accepted options are "before" or "after".
   */
  placement: _propTypes.default.oneOf(["before", "after"]),

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
   * Inline style object to be applied to each tick.
   */
  tickStyle: _propTypes.default.object,

  /**
   * Class attribute to be applied to each tick.
   */
  tickClassName: _propTypes.default.string,

  /**
   * Spacing - provided by XYPlot and used to determine the placement of the ticks given spacingLeft.
   */
  spacingLeft: _propTypes.default.number,

  /**
   * Spacing - provided by XYPlot and used to determine the placement of the ticks given spacingRight.
   */
  spacingRight: _propTypes.default.number,

  /**
   * Round ticks to capture extent of given y domain from XYPlot.
   */
  nice: _propTypes.default.bool
});

_defineProperty(YTicks, "defaultProps", {
  position: "left",
  nice: true,
  tickLength: 5,
  tickStyle: {}
});
//# sourceMappingURL=YTicks.js.map