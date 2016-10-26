'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _CustomPropTypes = require('./utils/CustomPropTypes');

var CustomPropTypes = _interopRequireWildcard(_CustomPropTypes);

var _Scale = require('./utils/Scale');

var _Data = require('./utils/Data');

var _RangeRect = require('./RangeRect');

var _RangeRect2 = _interopRequireDefault(_RangeRect);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AreaBarChart = function (_React$Component) {
  _inherits(AreaBarChart, _React$Component);

  function AreaBarChart() {
    _classCallCheck(this, AreaBarChart);

    return _possibleConstructorReturn(this, (AreaBarChart.__proto__ || Object.getPrototypeOf(AreaBarChart)).apply(this, arguments));
  }

  _createClass(AreaBarChart, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          scale = _props.scale,
          data = _props.data,
          horizontal = _props.horizontal,
          getX = _props.getX,
          getXEnd = _props.getXEnd,
          getY = _props.getY,
          getYEnd = _props.getYEnd,
          barClassName = _props.barClassName,
          barStyle = _props.barStyle;

      (0, _invariant2.default)((0, _Scale.hasXYScales)(scale), 'AreaBarChart.props.scale.x and scale.y must both be valid d3 scales');

      var barProps = {
        scale: scale,
        className: 'chart-area-bar ' + barClassName,
        style: barStyle
      };
      var getZero = _lodash2.default.constant(0);

      return _react2.default.createElement(
        'g',
        null,
        data.map(function (d, i) {
          return _react2.default.createElement(_RangeRect2.default, _extends({
            datum: d,
            getX: horizontal ? getZero : getX,
            getXEnd: horizontal ? getX : getXEnd,
            getY: !horizontal ? getZero : getY,
            getYEnd: !horizontal ? getY : getYEnd,
            key: 'chart-area-bar-' + i
          }, barProps));
        })
      );
    }
  }], [{
    key: 'getDomain',
    value: function getDomain(props) {
      var scaleType = props.scaleType,
          horizontal = props.horizontal,
          data = props.data;

      // only have to specify range axis domain, other axis uses default domainFromData
      // for area bar chart, the independent variable is the range
      // ie. the range controls the thickness of the bar

      var rangeAxis = horizontal ? 'y' : 'x';
      var rangeDataType = (0, _Scale.dataTypeFromScaleType)(scaleType[rangeAxis]);
      // make accessor functions from getX|Y and getX|YEnd
      var rangeStartAccessor = (0, _Data.makeAccessor)(props['get' + rangeAxis.toUpperCase()]);
      var rangeEndAccessor = (0, _Data.makeAccessor)(props['get' + rangeAxis.toUpperCase() + 'End']);

      return _defineProperty({}, rangeAxis, (0, _Data.domainFromRangeData)(data, rangeStartAccessor, rangeEndAccessor, rangeDataType));
    }
  }]);

  return AreaBarChart;
}(_react2.default.Component);

AreaBarChart.propTypes = {
  scale: CustomPropTypes.xyObjectOf(_react2.default.PropTypes.func.isRequired),
  data: _react2.default.PropTypes.array,
  horizontal: _react2.default.PropTypes.bool,

  getX: CustomPropTypes.getter,
  getXEnd: CustomPropTypes.getter,
  getY: CustomPropTypes.getter,
  getYEnd: CustomPropTypes.getter,

  barClassName: _react2.default.PropTypes.string,
  barStyle: _react2.default.PropTypes.object
};
AreaBarChart.defaultProps = {
  data: [],
  horizontal: false,
  barClassName: '',
  barStyle: {}
};
exports.default = AreaBarChart;