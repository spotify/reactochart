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

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _CustomPropTypes = require('./utils/CustomPropTypes');

var CustomPropTypes = _interopRequireWildcard(_CustomPropTypes);

var _Scale = require('./utils/Scale');

var _Data = require('./utils/Data');

var _xyPropsEqual = require('./utils/xyPropsEqual');

var _xyPropsEqual2 = _interopRequireDefault(_xyPropsEqual);

var _Bar = require('./Bar');

var _Bar2 = _interopRequireDefault(_Bar);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 *
 * `RangeBarChart` is a variation on the standard bar chart. Just like a normal bar chart, each bar represents a single
 * value on the *independent* axis (X axis for vertical bars), and is centered on this value.
 * However, on the *dependent* axis, each bar represents a *range* (min/max) of values,
 * rather than always starting at zero.
 */

var RangeBarChart = function (_React$Component) {
  _inherits(RangeBarChart, _React$Component);

  function RangeBarChart() {
    _classCallCheck(this, RangeBarChart);

    return _possibleConstructorReturn(this, (RangeBarChart.__proto__ || Object.getPrototypeOf(RangeBarChart)).apply(this, arguments));
  }

  _createClass(RangeBarChart, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      var shouldUpdate = !(0, _xyPropsEqual2.default)(this.props, nextProps, ['barStyle']);
      return shouldUpdate;
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          xScale = _props.xScale,
          yScale = _props.yScale,
          data = _props.data,
          horizontal = _props.horizontal,
          x = _props.x,
          xEnd = _props.xEnd,
          y = _props.y,
          yEnd = _props.yEnd,
          barThickness = _props.barThickness,
          barClassName = _props.barClassName,
          barStyle = _props.barStyle;
      // invariant(hasOneOfTwo(xEnd, yEnd), `RangeBarChart expects a xEnd *or* yEnd prop, but not both.`);

      return _react2.default.createElement(
        'g',
        null,
        data.map(function (d, i) {
          var _map = ['onMouseEnterBar', 'onMouseMoveBar', 'onMouseLeaveBar'].map(function (eventName) {
            // partially apply this bar's data point as 2nd callback argument
            var callback = _lodash2.default.get(_this2.props, eventName);
            return _lodash2.default.isFunction(callback) ? _lodash2.default.partial(callback, _lodash2.default, d) : null;
          }),
              _map2 = _slicedToArray(_map, 3),
              onMouseEnter = _map2[0],
              onMouseMove = _map2[1],
              onMouseLeave = _map2[2];

          var barProps = {
            x: (0, _Data.getValue)(x, d, i),
            y: (0, _Data.getValue)(y, d, i),
            xEnd: horizontal ? (0, _Data.getValue)(xEnd, d, i) : undefined,
            yEnd: horizontal ? undefined : (0, _Data.getValue)(yEnd, d, i),
            xScale: xScale, yScale: yScale,
            key: 'chart-bar-' + i,
            onMouseEnter: onMouseEnter,
            onMouseMove: onMouseMove,
            onMouseLeave: onMouseLeave,
            thickness: barThickness,
            className: 'chart-bar ' + ((0, _Data.getValue)(barClassName, d, i) || ''),
            style: (0, _Data.getValue)(barStyle, d, i)
          };

          return _react2.default.createElement(_Bar2.default, barProps);

          // console.log('xEnd yEnd value', getValue(xEnd, d), getValue(yEnd, d), horizontal);
          return horizontal ? _react2.default.createElement(_Bar2.default, _extends({ xEnd: (0, _Data.getValue)(xEnd, d, i) }, barProps)) : _react2.default.createElement(_Bar2.default, _extends({ yEnd: (0, _Data.getValue)(yEnd, d, i) }, barProps));
        })
      );
    }
  }], [{
    key: 'getDomain',
    value: function getDomain(props) {
      var xScaleType = props.xScaleType,
          yScaleType = props.yScaleType,
          horizontal = props.horizontal,
          data = props.data,
          x = props.x,
          xEnd = props.xEnd,
          y = props.y,
          yEnd = props.yEnd;

      // only have to specify range axis domain, other axis uses default domainFromData

      var rangeAxis = horizontal ? 'x' : 'y';
      var rangeStartAccessor = horizontal ? (0, _Data.makeAccessor2)(x) : (0, _Data.makeAccessor2)(y);
      var rangeEndAccessor = horizontal ? (0, _Data.makeAccessor2)(xEnd) : (0, _Data.makeAccessor2)(yEnd);
      var rangeScaleType = horizontal ? xScaleType : yScaleType;
      var rangeDataType = (0, _Scale.dataTypeFromScaleType)(rangeScaleType);

      return _defineProperty({}, rangeAxis + 'Domain', (0, _Data.domainFromRangeData)(data, rangeStartAccessor, rangeEndAccessor, rangeDataType));
    }
  }, {
    key: 'getSpacing',
    value: function getSpacing(props) {
      var barThickness = props.barThickness,
          horizontal = props.horizontal,
          x = props.x,
          y = props.y,
          xScale = props.xScale,
          yScale = props.yScale,
          data = props.data,
          xDomain = props.xDomain,
          yDomain = props.yDomain;

      var P = barThickness / 2; //padding
      var barsDomain = horizontal ? yDomain : xDomain;
      var barsScale = horizontal ? yScale : xScale;
      var barsAccessor = horizontal ? (0, _Data.makeAccessor2)(y) : (0, _Data.makeAccessor2)(x);
      var barsDataDomain = (0, _Data.domainFromData)(data, barsAccessor);

      // todo refactor/add better comments to clarify
      //find the edges of the tick domain, and map them through the scale function

      var _$map$sortBy = (0, _lodash2.default)([_lodash2.default.first(barsDomain), _lodash2.default.last(barsDomain)]).map(barsScale).sortBy(),
          _$map$sortBy2 = _slicedToArray(_$map$sortBy, 2),
          domainHead = _$map$sortBy2[0],
          domainTail = _$map$sortBy2[1]; //sort the pixel values return by the domain extents
      //find the edges of the data domain, and map them through the scale function


      var _$map$sortBy3 = (0, _lodash2.default)([_lodash2.default.first(barsDataDomain), _lodash2.default.last(barsDataDomain)]).map(barsScale).sortBy(),
          _$map$sortBy4 = _slicedToArray(_$map$sortBy3, 2),
          dataDomainHead = _$map$sortBy4[0],
          dataDomainTail = _$map$sortBy4[1]; //sort the pixel values return by the domain extents
      //find the necessary spacing (based on bar width) to push the bars completely inside the tick domain


      var _ref2 = [_lodash2.default.clamp(P - (domainTail - dataDomainTail), 0, P), _lodash2.default.clamp(P - (dataDomainHead - domainHead), 0, P)],
          spacingTail = _ref2[0],
          spacingHead = _ref2[1];

      if (horizontal) {
        return { spacingTop: spacingHead, spacingBottom: spacingTail, spacingLeft: 0, spacingRight: 0 };
      } else {
        return { spacingTop: 0, spacingBottom: 0, spacingLeft: spacingHead, spacingRight: spacingTail };
      }
    }
  }]);

  return RangeBarChart;
}(_react2.default.Component);

RangeBarChart.propTypes = {
  /**
   * Array of data to be plotted. One bar will be rendered per datum in this array.
   */
  data: _propTypes2.default.array,
  /**
   * Boolean which determines whether the chart will use horizontal or vertical bars.
   * When `true`, bars will be horizontal, ie. the X-axis will be treated as the dependent axis.
   */
  horizontal: _propTypes2.default.bool,

  /**
   * Accessor function for bar X values, called once per bar (datum), or a single value to be used for all bars.
   * If `horizontal` is `false`, this gets the *independent* variable value on which the bar is centered.
   * If `horizontal` is `true`, this gets the start (minimum value) of the *dependent* variable range which is spanned by the bar's length.
   */
  x: CustomPropTypes.valueOrAccessor,
  /**
   * Accessor function for the end (maximum X values) of the *dependent* variable range which is spanned by the bar's length,
   * or a single value to be used for all bars.
   * Should only be passed when `horizontal` is `true` (ignored otherwise).
   */
  xEnd: CustomPropTypes.valueOrAccessor,
  /**
   * Accessor function for bar Y values, called once per bar (datum), or a single value to be used for all bars.
   * If `horizontal` is `false`, this gets the start (minimum value) of the *dependent* variable range which is spanned by the bar's length.
   * If `horizontal` is `true`, this gets the *independent* variable value on which the bar is centered.
   */
  y: CustomPropTypes.valueOrAccessor,
  /**
   * Accessor function for the end (maximum Y-value) of the *dependent* variable range which is spanned by the bar's length,
   * or a single value to be used for all bars.
   * Should only be passed when `horizontal` is `false` (ignored otherwise).
   */
  yEnd: CustomPropTypes.valueOrAccessor,
  /**
   * D3 scale for X axis - provided by XYPlot
   */
  xScale: _propTypes2.default.func,
  /**
   * D3 scale for Y axis - provided by XYPlot
   */
  yScale: _propTypes2.default.func,
  /**
   * Thickness (in pixels) of each bar (ie. bar height if `horizontal` is `true`, otherwise bar width),
   */
  barThickness: _propTypes2.default.number,
  // barThickness: PropTypes.oneOfType([PropTypes.number, PropTypes.func]), // todo

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
RangeBarChart.defaultProps = {
  data: [],
  horizontal: false,
  barThickness: 8,
  barClassName: '',
  barStyle: {}
};
exports.default = RangeBarChart;
//# sourceMappingURL=RangeBarChart.js.map