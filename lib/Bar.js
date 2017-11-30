'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _isUndefined = require('lodash/isUndefined');

var _isUndefined2 = _interopRequireDefault(_isUndefined);

var _util = require('./util');

var _Scale = require('./utils/Scale');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Bar is a low-level component to be used in XYPlot-type charts (namely BarChart).
 * It is specified in terms of a range (min & max) of values on one axis (the bar's long axis)
 * and a single value on the other axis.
 * Passing props `x`, `xEnd` and `y` specifies a horizontal bar,
 * centered on `y` and spanning from `x` to `xEnd`;
 * passing props `x`, `y`, and `yEnd' specifies a vertical bar.
 */

var Bar = function (_React$Component) {
  _inherits(Bar, _React$Component);

  function Bar() {
    _classCallCheck(this, Bar);

    return _possibleConstructorReturn(this, (Bar.__proto__ || Object.getPrototypeOf(Bar)).apply(this, arguments));
  }

  _createClass(Bar, [{
    key: 'render',
    value: function render() {
      //  x/y are values in the *data* domain, not pixel domain
      var _props = this.props,
          xScale = _props.xScale,
          yScale = _props.yScale,
          x = _props.x,
          xEnd = _props.xEnd,
          y = _props.y,
          yEnd = _props.yEnd,
          thickness = _props.thickness,
          style = _props.style,
          onMouseEnter = _props.onMouseEnter,
          onMouseMove = _props.onMouseMove,
          onMouseLeave = _props.onMouseLeave;


      (0, _invariant2.default)((0, _util.hasOneOfTwo)(xEnd, yEnd), 'Bar expects an xEnd *or* yEnd prop, but not both.');

      var orientation = (0, _isUndefined2.default)(xEnd) ? 'vertical' : 'horizontal';
      var className = 'chart-bar chart-bar-' + orientation + ' ' + (this.props.className || '');

      var rectX = void 0,
          rectY = void 0,
          width = void 0,
          height = void 0;
      if (orientation === 'horizontal') {
        rectY = yScale(y) - thickness / 2;
        var x0 = xScale(x);
        var x1 = xScale(xEnd);
        rectX = Math.min(x0, x1);
        width = Math.abs(x1 - x0);
        height = thickness;
      } else {
        // vertical
        rectX = xScale(x) - thickness / 2;
        var y0 = yScale(y);
        var y1 = yScale(yEnd);
        rectY = Math.min(y0, y1);
        height = Math.abs(y1 - y0);
        width = thickness;
      }

      return _react2.default.createElement('rect', {
        x: rectX, y: rectY,
        width: width, height: height, className: className, style: style,
        onMouseEnter: onMouseEnter, onMouseMove: onMouseMove, onMouseLeave: onMouseLeave
      });
    }
  }]);

  return Bar;
}(_react2.default.Component);

Bar.propTypes = {

  /**
   * For a vertical bar, `x` represents the X data value on which the bar is centered.
   * For a horizontal bar, represents the *starting* X value of the bar, ie. the minimum of the range it spans
   */
  x: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.string, _propTypes2.default.instanceOf(Date)]),
  /**
   * For a horizontal bar, `y` represents the Y data value on which the bar is centered.
   * For a vertical bar, represents the *starting* Y value of the bar, ie. the minimum of the range it spans
   */
  y: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.string, _propTypes2.default.instanceOf(Date)]),
  /**
   * For a horizontal bar, `xEnd` represents the *ending* X data value of the bar, ie. the maximum of the range it spans.
   * Should be undefined if the bar is vertical.
   */
  xEnd: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.string, _propTypes2.default.instanceOf(Date)]),
  /**
   * For a vertical bar, `yEnd` represents the *ending* Y data value of the bar, ie. the maximum of the range it spans.
   * Should be undefined if the bar is horizontal.
   */
  yEnd: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.string, _propTypes2.default.instanceOf(Date)]),

  /**
   * The thickness of the bar, in pixels. (width of vertical bar, or height of horizontal bar)
   */
  thickness: _propTypes2.default.number,
  /**
   * Class name(s) to be included on the bar's <rect> element
   */
  className: _propTypes2.default.string,
  /**
   * Inline style object to be included on the bar's <rect> element
   */
  style: _propTypes2.default.object,
  /**
   * onMouseMove event handler callback, called when user's mouse moves within the bar.
   */
  onMouseMove: _propTypes2.default.func,
  /**
   * onMouseEnter event handler callback, called when user's mouse enters the bar.
   */
  onMouseEnter: _propTypes2.default.func,
  /**
   * onMouseLeave event handler callback, called when user's mouse leaves the bar.
   */
  onMouseLeave: _propTypes2.default.func,
  /**
   * D3 scale for X axis - provided by XYPlot
   */
  xScale: _propTypes2.default.func,
  /**
   * D3 scale for Y axis - provided by XYPlot
   */
  yScale: _propTypes2.default.func
};
Bar.defaultProps = {
  x: 0,
  y: 0,
  thickness: 8,
  className: '',
  style: {}
};
exports.default = Bar;
//# sourceMappingURL=Bar.js.map