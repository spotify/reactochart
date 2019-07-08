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
 * `YLine` is a horizontal line rendered on the y axis
 */
class YLine extends _react.default.Component {
  render() {
    const {
      yScale,
      value,
      width,
      spacingLeft,
      spacingRight,
      style
    } = this.props;
    const className = "rct-chart-line-y ".concat(this.props.className || "");
    const lineY = yScale(value);
    return _react.default.createElement("line", {
      x1: -spacingLeft,
      x2: width + spacingRight,
      y1: lineY,
      y2: lineY,
      className,
      style
    });
  }

}

exports.default = YLine;

_defineProperty(YLine, "propTypes", {
  /**
   * D3 scale for Y axis - provided by XYPlot
   */
  yScale: _propTypes.default.func,
  value: _propTypes.default.any.isRequired,

  /**
   * Spacing left - provided by XYPlot
   */
  spacingLeft: _propTypes.default.number,

  /**
   * Spacing right - provided by XYPlot
   */
  spacingRight: _propTypes.default.number,

  /**
   * Inline style object to be applied to the line
   */
  style: _propTypes.default.object,

  /**
   * Class attribute to be applied to the line
   */
  className: _propTypes.default.string
});

_defineProperty(YLine, "defaultProps", {
  style: {},
  className: "",
  spacingLeft: 0,
  spacingRight: 0
});
//# sourceMappingURL=YLine.js.map