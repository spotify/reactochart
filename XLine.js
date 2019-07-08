"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * `XLine` is a vertical line rendered on the x axis
 */
class XLine extends _react.default.Component {
  render() {
    const {
      xScale,
      value,
      height,
      style,
      spacingTop,
      spacingBottom
    } = this.props;
    const className = "rct-chart-line-x ".concat(this.props.className);
    const lineX = xScale(value);
    return _react.default.createElement("line", {
      x1: lineX,
      x2: lineX,
      y1: -spacingTop,
      y2: height + spacingBottom,
      className,
      style
    });
  }

}

exports.default = XLine;

_defineProperty(XLine, "propTypes", {
  /**
   * D3 scale for X axis - provided by XYPlot
   */
  xScale: _propTypes.default.func,
  value: _propTypes.default.any.isRequired,

  /**
   * Spacing top - provided by XYPlot
   */
  spacingTop: _propTypes.default.number,

  /**
   * Spacing bottom - provided by XYPlot
   */
  spacingBottom: _propTypes.default.number,

  /**
   * Inline style object to be applied to the line
   */
  style: _propTypes.default.object,

  /**
   * Class attribute to be applied to the line
   */
  className: _propTypes.default.string
});

_defineProperty(XLine, "defaultProps", {
  style: {},
  className: "",
  spacingTop: 0,
  spacingBottom: 0
});
//# sourceMappingURL=XLine.js.map