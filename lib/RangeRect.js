'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _CustomPropTypes = require('./utils/CustomPropTypes');

var CustomPropTypes = _interopRequireWildcard(_CustomPropTypes);

var _Scale = require('./utils/Scale');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * RangeRect is a low-level component to be used in XYPlot-type charts (namely AreaBarChart).
 * It is a rectangle which represents a range (min & max) of values on both (X & Y) axes.
 * It takes a single datum object, and getters which specify how to retrieve the range values from it.
 */

var RangeRect = function (_React$Component) {
  _inherits(RangeRect, _React$Component);

  function RangeRect() {
    _classCallCheck(this, RangeRect);

    return _possibleConstructorReturn(this, (RangeRect.__proto__ || Object.getPrototypeOf(RangeRect)).apply(this, arguments));
  }

  _createClass(RangeRect, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          xScale = _props.xScale,
          yScale = _props.yScale,
          x = _props.x,
          xEnd = _props.xEnd,
          y = _props.y,
          yEnd = _props.yEnd,
          style = _props.style,
          onMouseEnter = _props.onMouseEnter,
          onMouseMove = _props.onMouseMove,
          onMouseLeave = _props.onMouseLeave;


      (0, _invariant2.default)((0, _Scale.isValidScale)(xScale), 'RangeRect.props.xScale is not a valid d3 scale');
      (0, _invariant2.default)((0, _Scale.isValidScale)(yScale), 'RangeRect.props.yScale is not a valid d3 scale');

      var className = 'chart-range-rect ' + (this.props.className || '');
      var x0 = xScale(x);
      var x1 = xScale(xEnd);
      var y0 = yScale(y);
      var y1 = yScale(yEnd);
      var rectX = Math.min(x0, x1);
      var rectY = Math.min(y0, y1);
      var width = Math.abs(x1 - x0);
      var height = Math.abs(y1 - y0);

      return _react2.default.createElement('rect', { x: rectX, y: rectY, width: width, height: height, className: className, style: style, onMouseEnter: onMouseEnter, onMouseMove: onMouseMove, onMouseLeave: onMouseLeave });
    }
  }]);

  return RangeRect;
}(_react2.default.Component);

RangeRect.propTypes = {
  /**
   * D3 scale for the X (horizontal) axis.
   */
  xScale: _propTypes2.default.func,
  /**
   * D3 scale for the Y (vertical) axis.
   */
  yScale: _propTypes2.default.func,
  /**
   * Starting (minimum) X value (left edge, usually) of the rectangle range
   */
  x: _propTypes2.default.oneOfType(CustomPropTypes.datumValueTypes).isRequired,
  /**
   * Ending (maximum) X value (right edge, usually) of the rectangle range
   */
  xEnd: _propTypes2.default.oneOfType(CustomPropTypes.datumValueTypes).isRequired,
  /**
   * Starting (minimum) Y value (bottom edge, usually) of the rectangle range
   */
  y: _propTypes2.default.oneOfType(CustomPropTypes.datumValueTypes).isRequired,
  /**
   * Ending (maximum) Y value (top edge, usually) of the rectangle range
   */
  yEnd: _propTypes2.default.oneOfType(CustomPropTypes.datumValueTypes).isRequired,
  /**
   * Class attribute to be applied to the rectangle element
   */
  className: _propTypes2.default.string,
  /**
   * Inline style object to be applied to the rectangle element
   */
  style: _propTypes2.default.object,
  /**
   * `mousemove` event handler callback, called when user's mouse moves within the rectangle.
   */
  onMouseMove: _propTypes2.default.func,
  /**
   * `mouseenter` event handler callback, called when user's mouse enters the rectangle.
   */
  onMouseEnter: _propTypes2.default.func,
  /**
   * `mouseleave` event handler callback, called when user's mouse leaves the rectangle.
   */
  onMouseLeave: _propTypes2.default.func
};
RangeRect.defaultProps = {
  className: '',
  style: {}
};
exports.default = RangeRect;
//# sourceMappingURL=RangeRect.js.map