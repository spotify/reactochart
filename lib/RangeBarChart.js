'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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
      var _this2 = this;

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
          barStyle = _props.barStyle,
          getClass = _props.getClass;

      (0, _invariant2.default)((0, _Scale.hasXYScales)(scale), 'RangeBarChart.props.scale.x and scale.y must both be valid d3 scales');
      // invariant(hasOneOfTwo(getXEnd, getYEnd), `RangeBarChart expects a getXEnd *or* getYEnd prop, but not both.`);

      var accessors = { x: (0, _Data.makeAccessor)(getX), y: (0, _Data.makeAccessor)(getY) };
      var endAccessors = { x: (0, _Data.makeAccessor)(getXEnd), y: (0, _Data.makeAccessor)(getYEnd) };

      return _react2.default.createElement(
        'g',
        null,
        data.map(function (d, i) {
          var _map = ['onMouseEnterBar', 'onMouseMoveBar', 'onMouseLeaveBar'].map(function (eventName) {

            // partially apply this bar's data point as 2nd callback argument
            var callback = _.get(_this2.props, eventName);
            return _.isFunction(callback) ? _.partial(callback, _, d) : null;
          }),
              _map2 = _slicedToArray(_map, 3),
              onMouseEnter = _map2[0],
              onMouseMove = _map2[1],
              onMouseLeave = _map2[2];

          var barProps = {
            scale: scale,
            thickness: barThickness,
            className: 'chart-bar ' + barClassName + ' ' + (getClass ? getClass(d) : ''),
            style: barStyle
          };

          var thisBarProps = _extends({
            xValue: accessors.x(d),
            yValue: accessors.y(d),
            key: 'chart-bar-' + i,
            onMouseEnter: onMouseEnter,
            onMouseMove: onMouseMove,
            onMouseLeave: onMouseLeave
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
  }, {
    key: 'getSpacing',
    value: function getSpacing(props) {
      var barThickness = props.barThickness,
          horizontal = props.horizontal,
          scale = props.scale,
          data = props.data,
          domain = props.domain;

      var dataDomain = (0, _Data.getDataDomainByAxis)(props);
      var P = barThickness / 2; //padding
      var k = horizontal ? 'y' : 'x';
      //find the edges of the tick domain, and map them through the scale function

      var _$map$sortBy = _([_.first(domain[k]), _.last(domain[k])]).map(scale[k]).sortBy(),
          _$map$sortBy2 = _slicedToArray(_$map$sortBy, 2),
          domainHead = _$map$sortBy2[0],
          domainTail = _$map$sortBy2[1]; //sort the pixel values return by the domain extents
      //find the edges of the data domain, and map them through the scale function


      var _$map$sortBy3 = _([_.first(dataDomain[k]), _.last(dataDomain[k])]).map(scale[k]).sortBy(),
          _$map$sortBy4 = _slicedToArray(_$map$sortBy3, 2),
          dataDomainHead = _$map$sortBy4[0],
          dataDomainTail = _$map$sortBy4[1]; //sort the pixel values return by the domain extents
      //find the neccessary spacing (based on bar width) to push the bars completely inside the tick domain


      var _ref2 = [_.clamp(P - (domainTail - dataDomainTail), 0, P), _.clamp(P - (dataDomainHead - domainHead), 0, P)],
          spacingTail = _ref2[0],
          spacingHead = _ref2[1];

      if (horizontal) {
        return { top: spacingHead, right: 0, bottom: spacingTail, left: 0 };
      } else {
        return { top: 0, right: spacingTail, bottom: 0, left: spacingHead };
      }
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
  barStyle: _react2.default.PropTypes.object,
  getClass: CustomPropTypes.getter,

  onMouseEnterBar: _react2.default.PropTypes.func,
  onMouseMoveBar: _react2.default.PropTypes.func,
  onMouseLeaveBar: _react2.default.PropTypes.func
};
RangeBarChart.defaultProps = {
  data: [],
  horizontal: false,
  barThickness: 8,
  barClassName: '',
  barStyle: {}
};
exports.default = RangeBarChart;