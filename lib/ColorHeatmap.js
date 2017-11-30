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

var _d = require('d3');

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _CustomPropTypes = require('./utils/CustomPropTypes');

var CustomPropTypes = _interopRequireWildcard(_CustomPropTypes);

var _Data = require('./utils/Data');

var _Scale = require('./utils/Scale');

var _xyPropsEqual = require('./utils/xyPropsEqual');

var _xyPropsEqual2 = _interopRequireDefault(_xyPropsEqual);

var _RangeRect = require('./RangeRect');

var _RangeRect2 = _interopRequireDefault(_RangeRect);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function interpolatorFromType(type) {
  switch (type.toLowerCase()) {
    case 'hcl':
      return _d.interpolateHcl;
    case 'hsl':
      return _d.interpolateHsl;
    case 'lab':
      return _d.interpolateLab;
    case 'rgb':
      return _d.interpolateRgb;
    default:
      return _d.interpolateHsl;
  }
}

function makeColorScale(domain, colors, interpolator) {
  (0, _invariant2.default)(domain.length === colors.length, 'ColorHeatmap makeColorScale: domain.length should equal colors.length');

  if (_lodash2.default.isString(interpolator)) interpolator = interpolatorFromType(interpolator);

  return (0, _d.scaleLinear)().domain(domain).range(colors).interpolate(interpolator);
}

var ColorHeatmap = function (_React$Component) {
  _inherits(ColorHeatmap, _React$Component);

  function ColorHeatmap() {
    _classCallCheck(this, ColorHeatmap);

    return _possibleConstructorReturn(this, (ColorHeatmap.__proto__ || Object.getPrototypeOf(ColorHeatmap)).apply(this, arguments));
  }

  _createClass(ColorHeatmap, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      var shouldUpdate = !(0, _xyPropsEqual2.default)(this.props, nextProps, ['colors', 'valueDomain']);
      return shouldUpdate;
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          data = _props.data,
          xScale = _props.xScale,
          yScale = _props.yScale,
          value = _props.value,
          x = _props.x,
          xEnd = _props.xEnd,
          y = _props.y,
          yEnd = _props.yEnd,
          interpolator = _props.interpolator,
          rectStyle = _props.rectStyle,
          rectClassName = _props.rectClassName;

      var valueAccessor = (0, _Data.makeAccessor2)(value);
      var colorScale = void 0;

      if (this.props.colorScale) colorScale = this.props.colorScale;else {
        var valueDomain = this.props.valueDomain || (0, _Data.domainFromData)(data, valueAccessor);
        var colors = this.props.colors || (valueDomain.length === 2 ? ['#000000', '#ffffff'] : _lodash2.default.times(valueDomain.length, scale.schemeCategory10().domain(_lodash2.default.range(10))));
        colorScale = makeColorScale(valueDomain, colors, interpolator);
      }

      return _react2.default.createElement(
        'g',
        { className: 'color-heatmap-chart' },
        data.map(function (d, i) {
          var color = colorScale(valueAccessor(d));
          var style = _extends({}, (0, _Data.getValue)(rectStyle, d, i), { fill: color });
          var className = 'heatmap-rect ' + (0, _Data.getValue)(rectClassName, d, i);
          var key = 'heatmap-rect-' + i;
          return _react2.default.createElement(_RangeRect2.default, _extends({
            x: (0, _Data.getValue)(x, d, i),
            xEnd: (0, _Data.getValue)(xEnd, d, i),
            y: (0, _Data.getValue)(y, d, i),
            yEnd: (0, _Data.getValue)(yEnd, d, i)
          }, { xScale: xScale, yScale: yScale, style: style, className: className, key: key }));
        })
      );
    }
  }], [{
    key: 'getDomain',
    value: function getDomain(props) {
      var xScaleType = props.xScaleType,
          yScaleType = props.yScaleType,
          data = props.data,
          x = props.x,
          xEnd = props.xEnd,
          y = props.y,
          yEnd = props.yEnd;

      return {
        x: (0, _Data.domainFromRangeData)(data, (0, _Data.makeAccessor2)(x), (0, _Data.makeAccessor2)(xEnd), (0, _Scale.dataTypeFromScaleType)(xScaleType)),
        y: (0, _Data.domainFromRangeData)(data, (0, _Data.makeAccessor2)(y), (0, _Data.makeAccessor2)(yEnd), (0, _Scale.dataTypeFromScaleType)(yScaleType))
      };
    }
  }]);

  return ColorHeatmap;
}(_react2.default.Component);

ColorHeatmap.propTypes = {
  /**
   * data array - should be 1D array of all grid values
   * (if you have a 2D array, _.flatten it)
   */
  data: _propTypes2.default.array.isRequired,
  value: CustomPropTypes.valueOrAccessor,
  x: CustomPropTypes.valueOrAccessor,
  xEnd: CustomPropTypes.valueOrAccessor,
  y: CustomPropTypes.valueOrAccessor,
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
   * a custom d3 color scale may be passed...
   */
  colorScale: _propTypes2.default.func,
  /**
   * ...or else one will be constructed from colors, colorStops and interpolator
   */
  colors: _propTypes2.default.array,
  valueDomain: _propTypes2.default.array,
  interpolator: _propTypes2.default.string,
  rectStyle: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.func]),
  rectClassName: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func])
};
ColorHeatmap.defaultProps = {
  interpolator: 'lab',
  rectStyle: {},
  rectClassName: ''
};
exports.default = ColorHeatmap;
//# sourceMappingURL=ColorHeatmap.js.map