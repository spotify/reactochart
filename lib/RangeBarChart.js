'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _CustomPropTypes = require('./utils/CustomPropTypes');

var CustomPropTypes = _interopRequireWildcard(_CustomPropTypes);

var _Scale = require('./utils/Scale');

var _Data = require('./utils/Data');

var _Bar = require('./Bar');

var _Bar2 = _interopRequireDefault(_Bar);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RangeBarChart = function (_React$Component) {
  _inherits(RangeBarChart, _React$Component);

  function RangeBarChart() {
    _classCallCheck(this, RangeBarChart);

    return _possibleConstructorReturn(this, (RangeBarChart.__proto__ || Object.getPrototypeOf(RangeBarChart)).apply(this, arguments));
  }

  _createClass(RangeBarChart, [{
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
          barThickness = _props.barThickness,
          barClassName = _props.barClassName,
          barStyle = _props.barStyle;

      (0, _invariant2.default)((0, _Scale.hasXYScales)(scale), 'RangeBarChart.props.scale.x and scale.y must both be valid d3 scales');
      // invariant(hasOneOfTwo(getXEnd, getYEnd), `RangeBarChart expects a getXEnd *or* getYEnd prop, but not both.`);

      var accessors = { x: (0, _Data.makeAccessor)(getX), y: (0, _Data.makeAccessor)(getY) };
      var endAccessors = { x: (0, _Data.makeAccessor)(getXEnd), y: (0, _Data.makeAccessor)(getYEnd) };
      var barProps = {
        scale: scale,
        thickness: barThickness,
        className: 'chart-bar ' + barClassName,
        style: barStyle
      };

      return _react2.default.createElement(
        'g',
        null,
        data.map(function (d, i) {
          var thisBarProps = _extends({
            xValue: accessors.x(d),
            yValue: accessors.y(d),
            key: 'chart-bar-' + i
          }, barProps);

          return horizontal ? _react2.default.createElement(_Bar2.default, _extends({ xEndValue: endAccessors.x(d) }, thisBarProps)) : _react2.default.createElement(_Bar2.default, _extends({ yEndValue: endAccessors.y(d) }, thisBarProps));
        })
      );
    }
  }], [{
    key: 'getDomain',
    value: function getDomain(props) {
      var scaleType = props.scaleType,
          horizontal = props.horizontal,
          data = props.data,
          getX = props.getX,
          getXEnd = props.getXEnd,
          getY = props.getY,
          getYEnd = props.getYEnd;

      // only have to specify range axis domain, other axis uses default domainFromData

      var rangeAxis = horizontal ? 'x' : 'y';
      var rangeStartAccessor = horizontal ? (0, _Data.makeAccessor)(getX) : (0, _Data.makeAccessor)(getY);
      var rangeEndAccessor = horizontal ? (0, _Data.makeAccessor)(getXEnd) : (0, _Data.makeAccessor)(getYEnd);
      var rangeDataType = (0, _Scale.dataTypeFromScaleType)(scaleType[rangeAxis]);

      return _defineProperty({}, rangeAxis, (0, _Data.domainFromRangeData)(data, rangeStartAccessor, rangeEndAccessor, rangeDataType));
    }
  }]);

  return RangeBarChart;
}(_react2.default.Component);

RangeBarChart.propTypes = {
  scale: CustomPropTypes.xyObjectOf(_react2.default.PropTypes.func.isRequired),
  data: _react2.default.PropTypes.array,
  horizontal: _react2.default.PropTypes.bool,

  getX: CustomPropTypes.getter,
  getXEnd: CustomPropTypes.getter,
  getY: CustomPropTypes.getter,
  getYEnd: CustomPropTypes.getter,

  barThickness: _react2.default.PropTypes.number,
  barClassName: _react2.default.PropTypes.string,
  barStyle: _react2.default.PropTypes.object
};
RangeBarChart.defaultProps = {
  data: [],
  horizontal: false,
  barThickness: 8,
  barClassName: '',
  barStyle: {}
};
exports.default = RangeBarChart;