'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d2 = require('d3');

var _d3 = _interopRequireDefault(_d2);

var _util = require('./util.js');

var _CustomPropTypes = require('./utils/CustomPropTypes');

var CustomPropTypes = _interopRequireWildcard(_CustomPropTypes);

var _Scale = require('./utils/Scale');

var _Data = require('./utils/Data');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PropTypes = _react2.default.PropTypes;


// MarkerLine is similar to a bar chart,
// except that it just draws a line at the data value, rather than a full bar
// If the independent variable is a range, the length of the line will represent that range
// Otherwise all lines will be the same length.
// The dependent variable must be a single value, not a range.

function getTickType(props) {
  var getXEnd = props.getXEnd,
      getYEnd = props.getYEnd,
      horizontal = props.horizontal;
  // warn if a range is passed for the dependent variable, which is expected to be a value

  if (!horizontal && !_lodash2.default.isUndefined(getYEnd) || horizontal && !_lodash2.default.isUndefined(getXEnd)) console.warn("Warning: MarkerLineChart can only show the independent variable as a range, not the dependent variable.");

  if (!horizontal && !_lodash2.default.isUndefined(getXEnd) || horizontal && !_lodash2.default.isUndefined(getYEnd)) return "RangeValue";

  return "ValueValue";
}

var MarkerLineChart = function (_React$Component) {
  _inherits(MarkerLineChart, _React$Component);

  function MarkerLineChart() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, MarkerLineChart);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = MarkerLineChart.__proto__ || Object.getPrototypeOf(MarkerLineChart)).call.apply(_ref, [this].concat(args))), _this), _this.onMouseEnterLine = function (e, d) {
      _this.props.onMouseEnterLine(e, d);
    }, _this.onMouseMoveLine = function (e, d) {
      _this.props.onMouseMoveLine(e, d);
    }, _this.onMouseLeaveLine = function (e, d) {
      _this.props.onMouseLeaveLine(e, d);
    }, _this.renderRangeValueLine = function (d, i) {
      var _map = ['onMouseEnterLine', 'onMouseMoveLine', 'onMouseLeaveLine'].map(function (eventName) {
        // partially apply this bar's data point as 2nd callback argument
        var callback = (0, _util.methodIfFuncProp)(eventName, _this.props, _this);
        return _lodash2.default.isFunction(callback) ? _lodash2.default.partial(callback, _lodash2.default, d) : null;
      }),
          _map2 = _slicedToArray(_map, 3),
          onMouseEnter = _map2[0],
          onMouseMove = _map2[1],
          onMouseLeave = _map2[2];

      var _this$props = _this.props,
          getX = _this$props.getX,
          getXEnd = _this$props.getXEnd,
          getY = _this$props.getY,
          getYEnd = _this$props.getYEnd,
          horizontal = _this$props.horizontal,
          scale = _this$props.scale;

      var xVal = scale.x((0, _Data.makeAccessor)(getX)(d));
      var yVal = scale.y((0, _Data.makeAccessor)(getY)(d));
      var xEndVal = _lodash2.default.isUndefined(getXEnd) ? 0 : scale.x((0, _Data.makeAccessor)(getXEnd)(d));
      var yEndVal = _lodash2.default.isUndefined(getYEnd) ? 0 : scale.y((0, _Data.makeAccessor)(getYEnd)(d));
      var x1 = xVal,
          y1 = yVal;

      var x2 = horizontal ? xVal : xEndVal;
      var y2 = horizontal ? yEndVal : yVal;
      var key = 'marker-line-' + i;

      if (!_lodash2.default.every([x1, x2, y1, y2], _lodash2.default.isFinite)) return null;
      return _react2.default.createElement('line', _extends({ className: 'marker-line' }, { x1: x1, x2: x2, y1: y1, y2: y2, key: key, onMouseEnter: onMouseEnter, onMouseMove: onMouseMove, onMouseLeave: onMouseLeave }));
    }, _this.renderValueValueLine = function (d, i) {
      var _map3 = ['onMouseEnterLine', 'onMouseMoveLine', 'onMouseLeaveLine'].map(function (eventName) {
        // partially apply this bar's data point as 2nd callback argument
        var callback = (0, _util.methodIfFuncProp)(eventName, _this.props, _this);
        return _lodash2.default.isFunction(callback) ? _lodash2.default.partial(callback, _lodash2.default, d) : null;
      }),
          _map4 = _slicedToArray(_map3, 3),
          onMouseEnter = _map4[0],
          onMouseMove = _map4[1],
          onMouseLeave = _map4[2];

      var _this$props2 = _this.props,
          getX = _this$props2.getX,
          getY = _this$props2.getY,
          horizontal = _this$props2.horizontal,
          lineLength = _this$props2.lineLength,
          scale = _this$props2.scale;

      var xVal = scale.x((0, _Data.makeAccessor)(getX)(d));
      var yVal = scale.y((0, _Data.makeAccessor)(getY)(d));
      var x1 = !horizontal ? xVal - lineLength / 2 : xVal;
      var x2 = !horizontal ? xVal + lineLength / 2 : xVal;
      var y1 = !horizontal ? yVal : yVal - lineLength / 2;
      var y2 = !horizontal ? yVal : yVal + lineLength / 2;
      var key = 'marker-line-' + i;

      if (!_lodash2.default.every([x1, x2, y1, y2], _lodash2.default.isFinite)) return null;
      return _react2.default.createElement('line', _extends({ className: 'marker-line' }, { x1: x1, x2: x2, y1: y1, y2: y2, key: key, onMouseEnter: onMouseEnter, onMouseMove: onMouseMove, onMouseLeave: onMouseLeave }));
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(MarkerLineChart, [{
    key: 'render',
    value: function render() {
      var tickType = getTickType(this.props);
      return _react2.default.createElement(
        'g',
        { className: 'marker-line-chart' },
        tickType === 'RangeValue' ? this.props.data.map(this.renderRangeValueLine) : this.props.data.map(this.renderValueValueLine)
      );
    }
  }], [{
    key: 'getDomain',


    // todo reimplement padding/spacing
    /*
    static getOptions(props) {
      const {data, getX, getXEnd, getY, getYEnd, scaleType, orientation, lineLength} = props;
      const tickType = getTickType(props);
      const isVertical = (orientation === 'vertical');
      const accessors = {x: makeAccessor(getX), y: makeAccessor(getY)};
      const endAccessors = {x: makeAccessor(getXEnd), y: makeAccessor(getYEnd)};
       let options = {domain: {}, spacing: {}};
       if(tickType === 'RangeValue') { // set range domain for range type
        let rangeAxis = isVertical ? 'x' : 'y';
        options.domain[rangeAxis] =
          rangeAxisDomain(data, accessors[rangeAxis], endAccessors[rangeAxis], scaleType[rangeAxis]);
      } else {
        // the value, and therefore the center of the marker line, may fall exactly on the axis min or max,
        // therefore marker lines need (0.5*lineLength) spacing so they don't hang over the edge of the chart
        const halfLine = Math.ceil(0.5 * lineLength);
        options.spacing = isVertical ? {left: halfLine, right: halfLine} : {top: halfLine, bottom: halfLine};
      }
       return options;
    }
    */

    value: function getDomain(props) {
      if (getTickType(props) === 'RangeValue') {
        // set range domain for range type
        var data = props.data,
            getX = props.getX,
            getXEnd = props.getXEnd,
            getY = props.getY,
            getYEnd = props.getYEnd,
            scaleType = props.scaleType,
            horizontal = props.horizontal;

        // only have to specify range axis domain, other axis uses default domainFromData
        // in this chart type, the range axis, if there is one, is always the *independent* variable

        var rangeAxis = horizontal ? 'y' : 'x';
        var rangeStartAccessor = horizontal ? (0, _Data.makeAccessor)(getY) : (0, _Data.makeAccessor)(getX);
        var rangeEndAccessor = horizontal ? (0, _Data.makeAccessor)(getYEnd) : (0, _Data.makeAccessor)(getXEnd);
        var rangeDataType = (0, _Scale.dataTypeFromScaleType)(scaleType[rangeAxis]);

        return _defineProperty({}, rangeAxis, (0, _Data.domainFromRangeData)(data, rangeStartAccessor, rangeEndAccessor, rangeDataType));
      }
    }
  }]);

  return MarkerLineChart;
}(_react2.default.Component);

MarkerLineChart.propTypes = {
  // the array of data objects
  data: PropTypes.array.isRequired,
  // accessor for X & Y coordinates
  getX: CustomPropTypes.getter,
  getY: CustomPropTypes.getter,
  getXEnd: CustomPropTypes.getter,
  getYEnd: CustomPropTypes.getter,

  horizontal: _react2.default.PropTypes.bool,
  lineLength: PropTypes.number,

  // x & y scale types
  scaleType: PropTypes.object,
  scale: PropTypes.object,

  onMouseEnterLine: PropTypes.func,
  onMouseMoveLine: PropTypes.func,
  onMouseLeaveLine: PropTypes.func
};
MarkerLineChart.defaultProps = {
  horizontal: false,
  lineLength: 10
};
exports.default = MarkerLineChart;