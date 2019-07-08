"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _invariant = _interopRequireDefault(require("invariant"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var CustomPropTypes = _interopRequireWildcard(require("./utils/CustomPropTypes"));

var _Scale = require("./utils/Scale");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * RangeRect is a low-level component to be used in XYPlot-type charts (namely AreaBarChart).
 * It is a rectangle which represents a range (min & max) of values on both (X & Y) axes.
 * It takes a single datum object, and getters which specify how to retrieve the range values from it.
 */
class RangeRect extends _react.default.Component {
  render() {
    const {
      xScale,
      yScale,
      x,
      xEnd,
      y,
      yEnd,
      style,
      onMouseEnter,
      onMouseMove,
      onMouseLeave,
      className
    } = this.props;
    (0, _invariant.default)((0, _Scale.isValidScale)(xScale), "RangeRect.props.xScale is not a valid d3 scale");
    (0, _invariant.default)((0, _Scale.isValidScale)(yScale), "RangeRect.props.yScale is not a valid d3 scale");
    const x0 = xScale(x);
    const x1 = xScale(xEnd);
    const y0 = yScale(y);
    const y1 = yScale(yEnd);
    const rectX = Math.min(x0, x1);
    const rectY = Math.min(y0, y1);
    const width = Math.abs(x1 - x0);
    const height = Math.abs(y1 - y0);
    return _react.default.createElement("rect", {
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
  }

}

exports.default = RangeRect;

_defineProperty(RangeRect, "propTypes", {
  /**
   * D3 scale for the X (horizontal) axis.
   */
  xScale: _propTypes.default.func,

  /**
   * D3 scale for the Y (vertical) axis.
   */
  yScale: _propTypes.default.func,

  /**
   * Starting (minimum) X value (left edge, usually) of the rectangle range
   */
  x: _propTypes.default.oneOfType(CustomPropTypes.datumValueTypes).isRequired,

  /**
   * Ending (maximum) X value (right edge, usually) of the rectangle range
   */
  xEnd: _propTypes.default.oneOfType(CustomPropTypes.datumValueTypes).isRequired,

  /**
   * Starting (minimum) Y value (bottom edge, usually) of the rectangle range
   */
  y: _propTypes.default.oneOfType(CustomPropTypes.datumValueTypes).isRequired,

  /**
   * Ending (maximum) Y value (top edge, usually) of the rectangle range
   */
  yEnd: _propTypes.default.oneOfType(CustomPropTypes.datumValueTypes).isRequired,

  /**
   * Class attribute to be applied to the rectangle element
   */
  className: _propTypes.default.string,

  /**
   * Inline style object to be applied to the rectangle element
   */
  style: _propTypes.default.object,

  /**
   * `mousemove` event handler callback, called when user's mouse moves within the rectangle.
   */
  onMouseMove: _propTypes.default.func,

  /**
   * `mouseenter` event handler callback, called when user's mouse enters the rectangle.
   */
  onMouseEnter: _propTypes.default.func,

  /**
   * `mouseleave` event handler callback, called when user's mouse leaves the rectangle.
   */
  onMouseLeave: _propTypes.default.func
});

_defineProperty(RangeRect, "defaultProps", {
  className: "",
  style: {}
});
//# sourceMappingURL=RangeRect.js.map