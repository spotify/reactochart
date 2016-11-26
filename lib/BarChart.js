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

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _RangeBarChart = require('./RangeBarChart');

var _RangeBarChart2 = _interopRequireDefault(_RangeBarChart);

var _CustomPropTypes = require('./utils/CustomPropTypes');

var CustomPropTypes = _interopRequireWildcard(_CustomPropTypes);

var _Scale = require('./utils/Scale');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// BarChart represents a basic "Value/Value" bar chart,
// where each bar represents a single independent variable value and a single dependent value,
// with bars that are centered horizontally on x-value and extend from 0 to y-value,
// (or centered vertically on their y-value and extend from 0 to the x-value, in the case of horizontal chart variant)
// eg. http://www.snapsurveys.com/wp-content/uploads/2012/10/bar_2d8.png

// For other bar chart types, see RangeBarChart and AreaBarChart

function makeRangeBarChartProps(barChartProps) {
  // this component is a simple wrapper around RangeBarChart,
  // passing accessors to make range bars which span from zero to the data value
  var horizontal = barChartProps.horizontal,
      getX = barChartProps.getX,
      getY = barChartProps.getY;

  var getZero = _lodash2.default.constant(0);

  return _extends({}, barChartProps, {
    getX: horizontal ? getZero : getX,
    getY: horizontal ? getY : getZero,
    getXEnd: horizontal ? getX : undefined,
    getYEnd: horizontal ? undefined : getY
  });
}

var BarChart = function (_React$Component) {
  _inherits(BarChart, _React$Component);

  function BarChart() {
    _classCallCheck(this, BarChart);

    return _possibleConstructorReturn(this, (BarChart.__proto__ || Object.getPrototypeOf(BarChart)).apply(this, arguments));
  }

  _createClass(BarChart, [{
    key: 'render',
    value: function render() {
      (0, _invariant2.default)((0, _Scale.hasXYScales)(this.props.scale), 'BarChart.props.scale.x and scale.y must both be valid d3 scales');

      var rangeBarChartProps = makeRangeBarChartProps(this.props);

      return _react2.default.createElement(_RangeBarChart2.default, rangeBarChartProps);
    }
  }], [{
    key: 'getDomain',


    // todo: static getDomain
    value: function getDomain(props) {
      return _RangeBarChart2.default.getDomain(makeRangeBarChartProps(props));
    }
  }]);

  return BarChart;
}(_react2.default.Component);

BarChart.propTypes = {
  scale: CustomPropTypes.xyObjectOf(_react2.default.PropTypes.func.isRequired),
  data: _react2.default.PropTypes.array,
  getX: CustomPropTypes.getter,
  getY: CustomPropTypes.getter,
  horizontal: _react2.default.PropTypes.bool,

  barThickness: _react2.default.PropTypes.number,
  barClassName: _react2.default.PropTypes.string,
  barStyle: _react2.default.PropTypes.object
};
BarChart.defaultProps = {
  data: [],
  horizontal: false,
  barThickness: 8,
  barClassName: '',
  barStyle: {}
};
exports.default = BarChart;