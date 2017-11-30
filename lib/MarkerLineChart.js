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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _util = require('./util.js');

var _CustomPropTypes = require('./utils/CustomPropTypes');

var CustomPropTypes = _interopRequireWildcard(_CustomPropTypes);

var _Scale = require('./utils/Scale');

var _Data = require('./utils/Data');

var _xyPropsEqual = require('./utils/xyPropsEqual');

var _xyPropsEqual2 = _interopRequireDefault(_xyPropsEqual);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * MarkerLine is similar to a bar chart,
 * except that it just draws a line at the data value, rather than a full bar.
 * If the independent variable is a range, the length of the line will represent that range,
 * otherwise all lines will be the same length.
 * The dependent variable must be a single value, not a range.
 */

function getTickType(props) {
  var xEnd = props.xEnd,
      yEnd = props.yEnd,
      horizontal = props.horizontal;
  // warn if a range is passed for the dependent variable, which is expected to be a value

  if (!horizontal && !_lodash2.default.isUndefined(yEnd) || horizontal && !_lodash2.default.isUndefined(xEnd)) console.warn("Warning: MarkerLineChart can only show the independent variable as a range, not the dependent variable.");

  if (!horizontal && !_lodash2.default.isUndefined(xEnd) || horizontal && !_lodash2.default.isUndefined(yEnd)) return "RangeValue";

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
          x = _this$props.x,
          xEnd = _this$props.xEnd,
          y = _this$props.y,
          yEnd = _this$props.yEnd,
          horizontal = _this$props.horizontal,
          xScale = _this$props.xScale,
          yScale = _this$props.yScale;

      var xVal = xScale((0, _Data.makeAccessor2)(x)(d));
      var yVal = yScale((0, _Data.makeAccessor2)(y)(d));
      var xEndVal = _lodash2.default.isUndefined(xEnd) ? 0 : xScale((0, _Data.makeAccessor2)(xEnd)(d));
      var yEndVal = _lodash2.default.isUndefined(yEnd) ? 0 : yScale((0, _Data.makeAccessor2)(yEnd)(d));
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
          x = _this$props2.x,
          y = _this$props2.y,
          horizontal = _this$props2.horizontal,
          lineLength = _this$props2.lineLength,
          xScale = _this$props2.xScale,
          yScale = _this$props2.yScale;

      var xVal = xScale((0, _Data.makeAccessor2)(x)(d));
      var yVal = yScale((0, _Data.makeAccessor2)(y)(d));
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
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      var shouldUpdate = !(0, _xyPropsEqual2.default)(this.props, nextProps, []);
      return shouldUpdate;
    }
  }, {
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
    key: 'getSpacing',


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

    value: function getSpacing(props) {
      var tickType = getTickType(props);
      //no spacing for rangeValue marker charts since line start and end are set explicitly
      if (tickType === 'RangeValue') return { spacingTop: 0, spacingRight: 0, spacingBottom: 0, spacingLeft: 0 };

      var lineLength = props.lineLength,
          horizontal = props.horizontal,
          data = props.data,
          xDomain = props.xDomain,
          yDomain = props.yDomain,
          xScale = props.xScale,
          yScale = props.yScale,
          x = props.x,
          y = props.y;

      var P = lineLength / 2; //padding
      var markDomain = horizontal ? yDomain : xDomain;
      var markScale = horizontal ? yScale : xScale;
      var markAccessor = horizontal ? (0, _Data.makeAccessor2)(y) : (0, _Data.makeAccessor2)(x);
      var markDataDomain = (0, _Data.domainFromData)(data, markAccessor);

      // todo refactor/add better comments to clarify
      // find the edges of the tick domain, and map them through the scale function

      var _$map$sortBy = (0, _lodash2.default)([_lodash2.default.first(markDomain), _lodash2.default.last(markDomain)]).map(markScale).sortBy(),
          _$map$sortBy2 = _slicedToArray(_$map$sortBy, 2),
          domainHead = _$map$sortBy2[0],
          domainTail = _$map$sortBy2[1]; //sort the pixel values return by the domain extents
      // find the edges of the data domain, and map them through the scale function


      var _$map$sortBy3 = (0, _lodash2.default)([_lodash2.default.first(markDataDomain), _lodash2.default.last(markDataDomain)]).map(markScale).sortBy(),
          _$map$sortBy4 = _slicedToArray(_$map$sortBy3, 2),
          dataDomainHead = _$map$sortBy4[0],
          dataDomainTail = _$map$sortBy4[1]; //sort the pixel values return by the domain extents
      // find the necessary spacing (based on bar width) to push the bars completely inside the tick domain


      var _ref2 = [_lodash2.default.clamp(P - (domainTail - dataDomainTail), 0, P), _lodash2.default.clamp(P - (dataDomainHead - domainHead), 0, P)],
          spacingTail = _ref2[0],
          spacingHead = _ref2[1];


      if (horizontal) {
        return { spacingTop: spacingHead, spacingBottom: spacingTail, spacingLeft: 0, spacingRight: 0 };
      } else {
        return { spacingTop: 0, spacingBottom: 0, spacingLeft: spacingHead, spacingRight: spacingTail };
      }
    }
  }, {
    key: 'getDomain',
    value: function getDomain(props) {
      if (getTickType(props) === 'RangeValue') {
        // set range domain for range type
        var data = props.data,
            x = props.x,
            xEnd = props.xEnd,
            y = props.y,
            yEnd = props.yEnd,
            xScaleType = props.xScaleType,
            yScaleType = props.yScaleType,
            horizontal = props.horizontal;

        // only have to specify range axis domain, other axis uses default domainFromData
        // in this chart type, the range axis, if there is one, is always the *independent* variable

        var rangeAxis = horizontal ? 'y' : 'x';
        var rangeStartAccessor = horizontal ? (0, _Data.makeAccessor2)(y) : (0, _Data.makeAccessor2)(x);
        var rangeEndAccessor = horizontal ? (0, _Data.makeAccessor2)(yEnd) : (0, _Data.makeAccessor2)(xEnd);
        var rangeDataType = (0, _Scale.dataTypeFromScaleType)(horizontal ? yScaleType : xScaleType);

        return _defineProperty({}, rangeAxis + 'Domain', (0, _Data.domainFromRangeData)(data, rangeStartAccessor, rangeEndAccessor, rangeDataType));
      } else {
        return {};
      }
    }
  }]);

  return MarkerLineChart;
}(_react2.default.Component);

MarkerLineChart.propTypes = {
  // the array of data objects
  data: _propTypes2.default.array.isRequired,
  // accessor for X & Y coordinates
  x: CustomPropTypes.valueOrAccessor,
  y: CustomPropTypes.valueOrAccessor,
  xEnd: CustomPropTypes.valueOrAccessor,
  yEnd: CustomPropTypes.valueOrAccessor,

  horizontal: _propTypes2.default.bool,
  lineLength: _propTypes2.default.number,

  // x & y scale types
  xScaleType: _propTypes2.default.string,
  yScaleType: _propTypes2.default.string,
  xScale: _propTypes2.default.func,
  yScale: _propTypes2.default.func,

  onMouseEnterLine: _propTypes2.default.func,
  onMouseMoveLine: _propTypes2.default.func,
  onMouseLeaveLine: _propTypes2.default.func
};
MarkerLineChart.defaultProps = {
  horizontal: false,
  lineLength: 10
};
exports.default = MarkerLineChart;
//# sourceMappingURL=MarkerLineChart.js.map