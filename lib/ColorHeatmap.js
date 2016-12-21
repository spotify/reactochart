'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d = require('d3');

var _d2 = _interopRequireDefault(_d);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _CustomPropTypes = require('./utils/CustomPropTypes');

var CustomPropTypes = _interopRequireWildcard(_CustomPropTypes);

var _Data = require('./utils/Data');

var _Scale = require('./utils/Scale');

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
      return _d2.default.interpolateHcl;
    case 'hsl':
      return _d2.default.interpolateHsl;
    case 'lab':
      return _d2.default.interpolateLab;
    case 'rgb':
      return _d2.default.interpolateRgb;
    default:
      return _d2.default.interpolateHsl;
  }
}

function makeColorScale(domain, colors, interpolator) {
  (0, _invariant2.default)(domain.length == colors.length, 'makeColorScale: domain.length should equal colors.length');

  if (_lodash2.default.isString(interpolator)) interpolator = interpolatorFromType(interpolator);

  return _d2.default.scale.linear().domain(domain).range(colors).interpolate(interpolator);
}

var ColorHeatmap = function (_React$Component) {
  _inherits(ColorHeatmap, _React$Component);

  function ColorHeatmap() {
    _classCallCheck(this, ColorHeatmap);

    return _possibleConstructorReturn(this, (ColorHeatmap.__proto__ || Object.getPrototypeOf(ColorHeatmap)).apply(this, arguments));
  }

  _createClass(ColorHeatmap, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          data = _props.data,
          scale = _props.scale,
          getValue = _props.getValue,
          getX = _props.getX,
          getXEnd = _props.getXEnd,
          getY = _props.getY,
          getYEnd = _props.getYEnd,
          interpolator = _props.interpolator;

      var valueAccessor = (0, _Data.makeAccessor)(getValue);
      var colorScale = void 0;

      if (this.props.colorScale) colorScale = this.props.colorScale;else {
        var valueDomain = this.props.valueDomain || (0, _Data.domainFromData)(data, valueAccessor);
        var colors = this.props.colors || (valueDomain.length == 2 ? ['#000000', '#ffffff'] : _lodash2.default.times(valueDomain.length, _d2.default.scale.category10().domain(_lodash2.default.range(10))));
        colorScale = makeColorScale(valueDomain, colors, interpolator);
      }

      return _react2.default.createElement(
        'g',
        { className: 'color-heatmap-chart' },
        data.map(function (datum, i) {
          var color = colorScale(valueAccessor(datum));
          var style = { fill: color };
          var key = 'heatmap-rect-' + i;
          return _react2.default.createElement(_RangeRect2.default, { datum: datum, scale: scale, getX: getX, getXEnd: getXEnd, getY: getY, getYEnd: getYEnd, style: style, key: key });
        })
      );
    }
  }], [{
    key: 'getDomain',
    value: function getDomain(props) {
      var scaleType = props.scaleType,
          data = props.data,
          getX = props.getX,
          getXEnd = props.getXEnd,
          getY = props.getY,
          getYEnd = props.getYEnd;

      return {
        x: (0, _Data.domainFromRangeData)(data, (0, _Data.makeAccessor)(getX), (0, _Data.makeAccessor)(getXEnd), (0, _Scale.dataTypeFromScaleType)(scaleType.x)),
        y: (0, _Data.domainFromRangeData)(data, (0, _Data.makeAccessor)(getY), (0, _Data.makeAccessor)(getYEnd), (0, _Scale.dataTypeFromScaleType)(scaleType.y))
      };
    }
  }]);

  return ColorHeatmap;
}(_react2.default.Component);

ColorHeatmap.propTypes = {
  // passed from xyplot
  scale: CustomPropTypes.xyObjectOf(_react2.default.PropTypes.func.isRequired),

  // data array - should be 1D array of all grid values
  // (if you have a 2D array, _.flatten it)
  data: _react2.default.PropTypes.array.isRequired,

  // data getters
  getValue: CustomPropTypes.getter,
  getX: CustomPropTypes.getter,
  getXEnd: CustomPropTypes.getter,
  getY: CustomPropTypes.getter,
  getYEnd: CustomPropTypes.getter,

  // a custom d3 color scale may be passed...
  colorScale: _react2.default.PropTypes.func,
  // ...or else one will be constructed from colors, colorStops and interpolator
  colors: _react2.default.PropTypes.array,
  valueDomain: _react2.default.PropTypes.array,
  interpolator: _react2.default.PropTypes.string
};
ColorHeatmap.defaultProps = {
  interpolator: 'lab'
};
exports.default = ColorHeatmap;