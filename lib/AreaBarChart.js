'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var _RangeRect = require('./RangeRect');

var _RangeRect2 = _interopRequireDefault(_RangeRect);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * `AreaBarChart` is a variation on the standard bar chart. Just like a normal bar chart, each bar represents a single
 * value on the *dependent* axis (Y axis for vertical bars), and the bar stretches from zero to this value.
 * However, on the *independent* axis, each bar represents a *range* (min/max) of values,
 * rather than being centered on a specific value.
 * In other words, the bar *lengths* act the same way as standard bar chart bars,
 * but their *thicknesses* are variable and meaningful.
 * `AreaBarChart`s are the correct way to display histograms with variable bin sizes.
 * They are so named because, in cases like these histograms, since both the bar thickness and length are meaningful,
 * so too is the bar's total *area*, unlike in other bar charts.
 */

var AreaBarChart = function (_React$Component) {
  _inherits(AreaBarChart, _React$Component);

  function AreaBarChart() {
    _classCallCheck(this, AreaBarChart);

    return _possibleConstructorReturn(this, (AreaBarChart.__proto__ || Object.getPrototypeOf(AreaBarChart)).apply(this, arguments));
  }

  _createClass(AreaBarChart, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      var shouldUpdate = !(0, _xyPropsEqual2.default)(this.props, nextProps, ['barStyle']);
      // console.log('should areabarchart update?', shouldUpdate);
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
          barClassName = _props.barClassName,
          barStyle = _props.barStyle;


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

          return _react2.default.createElement(_RangeRect2.default, {
            xScale: xScale, yScale: yScale,
            className: 'chart-area-bar ' + (0, _Data.getValue)(barClassName, d, i),
            style: (0, _Data.getValue)(barStyle, d, i),
            x: horizontal ? 0 : (0, _Data.getValue)(x, d, i),
            xEnd: horizontal ? (0, _Data.getValue)(x, d, i) : (0, _Data.getValue)(xEnd, d, i),
            y: !horizontal ? 0 : (0, _Data.getValue)(y, d, i),
            yEnd: !horizontal ? (0, _Data.getValue)(y, d, i) : (0, _Data.getValue)(yEnd, d, i),
            key: 'chart-area-bar-' + i,
            onMouseEnter: onMouseEnter, onMouseMove: onMouseMove, onMouseLeave: onMouseLeave
          });
        })
      );
    }
  }], [{
    key: 'getDomain',
    value: function getDomain(props) {
      var xScaleType = props.xScaleType,
          yScaleType = props.yScaleType,
          horizontal = props.horizontal,
          data = props.data;

      // only have to specify range axis domain, other axis uses default domainFromData
      // for area bar chart, the independent variable is the range
      // ie. the range controls the thickness of the bar

      var rangeAxis = horizontal ? 'y' : 'x';
      var rangeDataType = (0, _Scale.dataTypeFromScaleType)(rangeAxis === 'x' ? xScaleType : yScaleType);
      // make accessor functions from getX|Y and getX|YEnd
      var rangeStartAccessor = (0, _Data.makeAccessor2)(props['' + rangeAxis]);
      var rangeEndAccessor = (0, _Data.makeAccessor2)(props[rangeAxis + 'End']);

      return _defineProperty({}, rangeAxis + 'Domain', (0, _Data.domainFromRangeData)(data, rangeStartAccessor, rangeEndAccessor, rangeDataType));
    }
  }]);

  return AreaBarChart;
}(_react2.default.Component);

AreaBarChart.propTypes = {
  /**
   * D3 scale for X axis - provided by XYPlot
   */
  xScale: _propTypes2.default.func,
  /**
   * D3 scale for Y axis - provided by XYPlot
   */
  yScale: _propTypes2.default.func,
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
   * Accessor function for bar X values, called once per bar (datum).
   * If `horizontal` is `false`, this gets the start (min value) of the *independent* variable range, spanned by the bar's thickness.
   * If `horizontal` is `true`, this gets the *dependent* variable value, the end of the bar's length
   */
  x: CustomPropTypes.valueOrAccessor,
  /**
   * Accessor function for the end (max X value) of the *independent* variable range, spanned by the bar's thickness.
   * Should only be passed when `horizontal` is `false` (ignored otherwise).
   */
  xEnd: CustomPropTypes.valueOrAccessor,
  /**
   * Accessor function for bar Y values, called once per bar (datum).
   * If `horizontal` is `true`, this gets the start (min value) of the *independent* variable range which is spanned by the bar's thickness.
   * If `horizontal` is `false`, this gets the *dependent* variable value, the end of the bar's length
   */
  y: CustomPropTypes.valueOrAccessor,
  /**
   * Accessor function for the end (max Y value) of the *independent* variable range, spanned by the bar's thickness.
   * Should only be passed when `horizontal` is `true` (ignored otherwise).
   */
  yEnd: CustomPropTypes.valueOrAccessor,

  /**
   * Class attribute to be applied to each bar.
   * or accessor function which returns a class;
   */
  barClassName: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]),
  /**
   * Inline style object to be applied to each bar,
   * or accessor function which returns a style object;
   */
  barStyle: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.func]),

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
AreaBarChart.defaultProps = {
  data: [],
  horizontal: false,
  barClassName: '',
  barStyle: {}
};
exports.default = AreaBarChart;
//# sourceMappingURL=AreaBarChart.js.map