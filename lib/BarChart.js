'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _RangeBarChart = require('./RangeBarChart');

var _RangeBarChart2 = _interopRequireDefault(_RangeBarChart);

var _CustomPropTypes = require('./utils/CustomPropTypes');

var CustomPropTypes = _interopRequireWildcard(_CustomPropTypes);

var _xyPropsEqual = require('./utils/xyPropsEqual');

var _xyPropsEqual2 = _interopRequireDefault(_xyPropsEqual);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function makeRangeBarChartProps(barChartProps) {
  // this component is a simple wrapper around RangeBarChart,
  // passing accessors to make range bars which span from zero to the data value
  var horizontal = barChartProps.horizontal,
      x = barChartProps.x,
      y = barChartProps.y;


  return _extends({}, barChartProps, {
    x: horizontal ? 0 : x,
    y: horizontal ? y : 0,
    xEnd: horizontal ? x : undefined,
    yEnd: horizontal ? undefined : y
  });
}

/**
 * BarChart represents a basic "Value/Value" bar chart,
 * where each bar represents a single independent variable value and a single dependent value,
 * with bars that are centered horizontally on x-value and extend from 0 to y-value,
 * (or centered vertically on their y-value and extend from 0 to the x-value, in the case of horizontal chart variant)
 * eg. http://www.snapsurveys.com/wp-content/uploads/2012/10/bar_2d8.png
 *
 * For other bar chart types, see RangeBarChart and AreaBarChart
 */

var BarChart = function (_React$Component) {
  _inherits(BarChart, _React$Component);

  function BarChart() {
    _classCallCheck(this, BarChart);

    return _possibleConstructorReturn(this, (BarChart.__proto__ || Object.getPrototypeOf(BarChart)).apply(this, arguments));
  }

  _createClass(BarChart, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      var shouldUpdate = !(0, _xyPropsEqual2.default)(this.props, nextProps, ['barStyle']);
      return shouldUpdate;
    }
  }, {
    key: 'render',
    value: function render() {
      // todo: throw an error if dependent axis is not a number axis

      var rangeBarChartProps = makeRangeBarChartProps(this.props);

      return _react2.default.createElement(_RangeBarChart2.default, rangeBarChartProps);
    }
  }], [{
    key: 'getDomain',


    // gets data domain of independent variable
    value: function getDomain(props) {
      return _RangeBarChart2.default.getDomain(makeRangeBarChartProps(props));
    }
  }, {
    key: 'getSpacing',
    value: function getSpacing(props) {
      return _RangeBarChart2.default.getSpacing(makeRangeBarChartProps(props));
    }
  }]);

  return BarChart;
}(_react2.default.Component);

BarChart.propTypes = {
  /**
   * Array of data to be plotted. One bar will be rendered per datum in the array.
   */
  data: _propTypes2.default.array,

  x: CustomPropTypes.valueOrAccessor,
  y: CustomPropTypes.valueOrAccessor,
  /**
   * D3 scale for X axis - provided by XYPlot
   */
  xScale: _propTypes2.default.func,
  /**
   * D3 scale for Y axis - provided by XYPlot
   */
  yScale: _propTypes2.default.func,
  /**
   * Boolean which determines whether the chart will use horizontal or vertical bars.
   * When `true`, bars will be horizontal, ie. the X-axis will be treated as the dependent axis.
   */
  horizontal: _propTypes2.default.bool,

  /**
   * Thickness (in pixels) of each bar (ie. bar height if `horizontal` is `true`, otherwise bar width).
   */
  barThickness: _propTypes2.default.number,
  /**
   * Inline style object to be applied to each bar,
   * or accessor function which returns a style object;
   */
  barStyle: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.func]),
  /**
   * Class attribute to be applied to each bar.
   * or accessor function which returns a class;
   */
  barClassName: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]),

  /**
   * `mousemove` event handler callback, called when user's mouse moves within a bar.
   */
  onMouseMoveBar: _propTypes2.default.func,
  /**
   * `mouseenter` event handler callback, called when user's mouse enters a bar.
   */
  onMouseEnterBar: _propTypes2.default.func,
  /**
   * `mouseleave` event handler callback, called when user's mouse leaves a bar.
   */
  onMouseLeaveBar: _propTypes2.default.func
};
BarChart.defaultProps = {
  data: [],
  horizontal: false,
  barThickness: 8,
  barClassName: '',
  barStyle: {}
};
exports.default = BarChart;
//# sourceMappingURL=BarChart.js.map