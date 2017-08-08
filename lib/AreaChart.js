'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d = require('d3');

var _Data = require('./utils/Data');

var _xyPropsEqual = require('./utils/xyPropsEqual');

var _xyPropsEqual2 = _interopRequireDefault(_xyPropsEqual);

var _CustomPropTypes = require('./utils/CustomPropTypes');

var CustomPropTypes = _interopRequireWildcard(_CustomPropTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// AreaChart represents a simple bivariate area chart,
// a filled path drawn between two lines (datasets).

// todo horizontal prop, for filling area horizontally?
// todo support categorical data?
// todo build StackedAreaChart that composes multiple AreaCharts

var AreaChart = function (_React$Component) {
  _inherits(AreaChart, _React$Component);

  function AreaChart() {
    _classCallCheck(this, AreaChart);

    return _possibleConstructorReturn(this, (AreaChart.__proto__ || Object.getPrototypeOf(AreaChart)).apply(this, arguments));
  }

  _createClass(AreaChart, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      var shouldUpdate = !(0, _xyPropsEqual2.default)(this.props, nextProps, ['pathStyle', 'pathStylePositive', 'pathStyleNegative']);
      return shouldUpdate;
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          name = _props.name,
          data = _props.data,
          getX = _props.getX,
          getY = _props.getY,
          getYEnd = _props.getYEnd,
          scale = _props.scale,
          isDifference = _props.isDifference,
          pathStyle = _props.pathStyle,
          pathStylePositive = _props.pathStylePositive,
          pathStyleNegative = _props.pathStyleNegative,
          shouldShowGaps = _props.shouldShowGaps,
          isDefined = _props.isDefined;

      var accessors = { x: (0, _Data.makeAccessor)(getX), y: (0, _Data.makeAccessor)(getY), yEnd: (0, _Data.makeAccessor)(getYEnd) };

      // create d3 area path generator
      var areaGenerator = (0, _d.area)();

      // if gaps in data should be shown, use `props.isDefined` function as the `defined` param for d3's area generator;
      // but wrap it & pass in accessors as well, so that the function can easily access the relevant data values
      if (shouldShowGaps) {
        areaGenerator.defined(function (d, i) {
          return isDefined(d, i, accessors);
        });
      }

      areaGenerator.x(function (d, i) {
        return scale.x(accessors.x(d, i));
      }).y0(function (d, i) {
        return scale.y(accessors.y(d, i));
      }).y1(function (d, i) {
        return scale.y(accessors.yEnd(d, i));
      });

      var areaPathStr = areaGenerator(data);

      if (isDifference) {
        // difference chart - create 2 clip paths, one which clips to only show path where YEnd > Y, and other vice versa
        areaGenerator.y0(this.props.height);
        var clipBelowPathStr = areaGenerator(data);
        areaGenerator.y0(0);
        var clipAbovePathStr = areaGenerator(data);

        // make sure we have a unique ID for this chart, so clip path IDs don't affect other charts
        var chartId = name || _lodash2.default.uniqueId();
        var clipAboveId = 'clip-above-area-' + chartId;
        var clipBelowId = 'clip-below-area-' + chartId;
        var pathStyleAbove = pathStylePositive || pathStyle || {};
        var pathStyleBelow = pathStyleNegative || pathStyle || {};

        return _react2.default.createElement(
          'g',
          { className: name + ' area-chart' },
          _react2.default.createElement(
            'clipPath',
            { id: clipAboveId },
            _react2.default.createElement('path', { d: clipAbovePathStr })
          ),
          _react2.default.createElement(
            'clipPath',
            { id: clipBelowId },
            _react2.default.createElement('path', { d: clipBelowPathStr })
          ),
          _react2.default.createElement('path', { className: 'area-chart-path', d: areaPathStr, clipPath: 'url(#' + clipAboveId + ')', style: pathStyleAbove }),
          _react2.default.createElement('path', { className: 'area-chart-path', d: areaPathStr, clipPath: 'url(#' + clipBelowId + ')', style: pathStyleBelow })
        );
      } else {
        return _react2.default.createElement(
          'g',
          { className: name + ' area-chart' },
          _react2.default.createElement('path', { className: 'area-chart-path', d: areaPathStr, style: pathStyle || {} })
        );
      }
    }
  }], [{
    key: 'getDomain',
    value: function getDomain(props) {
      // custom Y domain - the total (union) extent of getY and getYEnd combined
      var data = props.data,
          getX = props.getX,
          getY = props.getY,
          getYEnd = props.getYEnd;

      var accessors = { x: (0, _Data.makeAccessor)(getX), y: (0, _Data.makeAccessor)(getY), yEnd: (0, _Data.makeAccessor)(getYEnd) };
      return {
        y: (0, _Data.combineDomains)([(0, _Data.domainFromData)(data, accessors.y), (0, _Data.domainFromData)(data, accessors.yEnd)])
      };
    }
  }]);

  return AreaChart;
}(_react2.default.Component);

AreaChart.propTypes = {
  /**
   * the array of data objects
   */
  data: _propTypes2.default.array.isRequired,
  /**
   * data getter for X coordinates
   */
  getX: CustomPropTypes.getter,
  /**
   * data getter for Y coordinates
   */
  getY: CustomPropTypes.getter,
  /**
   * data getter for Y end coordinates
   */
  getYEnd: CustomPropTypes.getter,
  /**
   * style applied to path element
   */
  pathStyle: _propTypes2.default.object,
  /**
   * if isDifference is true, AreaChart generates a "difference chart" with two area paths instead of one:
   * one path which shows when YEnd > Y, and one vice versa, allowing them to be styled differently (eg red/green)
   */
  isDifference: _propTypes2.default.bool,
  /**
   * when isDifference is true, pathStylePositive and pathStyleNegative can be passed to give 2 different inline
   * styles to the two different paths which are generated.
   * Ignored if isDifference is false.
   */
  pathStylePositive: _propTypes2.default.object,
  pathStyleNegative: _propTypes2.default.object,

  scaleType: _propTypes2.default.object,
  scale: _propTypes2.default.object,
  /**
   * if true, will show gaps in the shaded area for data where props.isDefined(datum) returns false
   */
  shouldShowGaps: _propTypes2.default.bool,
  /**
   * if shouldShowGaps is true, isDefined function describes when a datum should be considered "defined" vs. when to show gap
   * by default, shows gap if either y or yEnd are undefined
   */
  isDefined: _propTypes2.default.func
};
AreaChart.defaultProps = {
  shouldShowGaps: true,
  isDefined: function isDefined(d, i, accessors) {
    return !_lodash2.default.isUndefined(accessors.y(d, i)) && !_lodash2.default.isUndefined(accessors.yEnd(d, i));
  }
};
exports.default = AreaChart;
//# sourceMappingURL=AreaChart.js.map