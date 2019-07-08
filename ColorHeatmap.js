"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _d = require("d3");

var _lodash = _interopRequireDefault(require("lodash"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

var _RangeRect = _interopRequireDefault(require("./RangeRect"));

var CustomPropTypes = _interopRequireWildcard(require("./utils/CustomPropTypes"));

var _Data = require("./utils/Data");

var _Scale = require("./utils/Scale");

var _xyPropsEqual = _interopRequireDefault(require("./utils/xyPropsEqual"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function interpolatorFromType(type) {
  switch (type.toLowerCase()) {
    case "hcl":
      return _d.interpolateHcl;

    case "hsl":
      return _d.interpolateHsl;

    case "lab":
      return _d.interpolateLab;

    case "rgb":
      return _d.interpolateRgb;

    default:
      return _d.interpolateLab;
  }
}

function makeColorScale(domain, colors, interpolator) {
  // invariant(domain.length === colors.length, 'ColorHeatmap makeColorScale: domain.length should equal colors.length');
  if (_lodash.default.isString(interpolator)) interpolator = interpolatorFromType(interpolator);
  return (0, _d.scaleLinear)().domain(domain).range(colors).interpolate(interpolator);
}
/**
 * `ColorHeatmap` can be used to represent individual values contained in a matrix through colors.
 */


class ColorHeatmap extends _react.default.Component {
  static getDomain(props) {
    const {
      xScaleType,
      yScaleType,
      data,
      x,
      xEnd,
      y,
      yEnd
    } = props;
    return {
      x: (0, _Data.domainFromRangeData)(data, (0, _Data.makeAccessor2)(x), (0, _Data.makeAccessor2)(xEnd), (0, _Scale.dataTypeFromScaleType)(xScaleType)),
      y: (0, _Data.domainFromRangeData)(data, (0, _Data.makeAccessor2)(y), (0, _Data.makeAccessor2)(yEnd), (0, _Scale.dataTypeFromScaleType)(yScaleType))
    };
  }

  shouldComponentUpdate(nextProps) {
    const shouldUpdate = !(0, _xyPropsEqual.default)(this.props, nextProps, ["colors", "valueDomain"]);
    return shouldUpdate;
  }

  render() {
    const {
      data,
      xScale,
      yScale,
      value,
      x,
      xEnd,
      y,
      yEnd,
      interpolator,
      rectStyle,
      rectClassName
    } = this.props;
    const valueAccessor = (0, _Data.makeAccessor2)(value);
    let colorScale;

    if (this.props.colorScale) {
      colorScale = this.props.colorScale;
    } else {
      const valueDomain = this.props.valueDomain || (0, _Data.domainFromData)(data, valueAccessor);
      const colors = this.props.colors || (valueDomain.length === 2 ? ["#000000", "#ffffff"] : _lodash.default.times(valueDomain.length, scale.schemeCategory10().domain(_lodash.default.range(10))));
      colorScale = makeColorScale(valueDomain, colors, interpolator);
    }

    return _react.default.createElement("g", {
      className: "rct-color-heatmap-chart"
    }, data.map((d, i) => {
      const color = colorScale(valueAccessor(d));

      const style = _objectSpread({}, (0, _Data.getValue)(rectStyle, d, i), {
        fill: color
      });

      const className = "".concat((0, _Data.getValue)(rectClassName, d, i));
      const key = "heatmap-rect-".concat(i);
      return _react.default.createElement(_RangeRect.default, _extends({
        x: (0, _Data.getValue)(x, d, i),
        xEnd: (0, _Data.getValue)(xEnd, d, i),
        y: (0, _Data.getValue)(y, d, i),
        yEnd: (0, _Data.getValue)(yEnd, d, i)
      }, {
        xScale,
        yScale,
        style,
        className,
        key
      }));
    }));
  }

}

exports.default = ColorHeatmap;

_defineProperty(ColorHeatmap, "propTypes", {
  /**
   * Array of data to be plotted - should be 1D array of all grid values
   */
  data: _propTypes.default.array.isRequired,
  value: CustomPropTypes.valueOrAccessor,

  /**
   * Accessor function for x values, called once per datum.
   */
  x: CustomPropTypes.valueOrAccessor,

  /**
   * Accessor function for x end values, called once per datum.
   */
  xEnd: CustomPropTypes.valueOrAccessor,

  /**
   * Accessor function for y values, called once per datum.
   */
  y: CustomPropTypes.valueOrAccessor,

  /**
   * Accessor function for y end values, called once per datum.
   */
  yEnd: CustomPropTypes.valueOrAccessor,

  /**
   * D3 scale for X axis - provided by XYPlot
   */
  xScale: _propTypes.default.func,

  /**
   * D3 scale for Y axis - provided by XYPlot
   */
  yScale: _propTypes.default.func,

  /**
   * a custom d3 color scale may be passed...
   */
  colorScale: _propTypes.default.func,

  /**
   * ...or else one will be constructed from colors, valueDomain and interpolator
   */
  colors: _propTypes.default.array,

  /**
   * Custom domain of the passed in data.
   * Otherwise it will be the extent of your data.
   */
  valueDomain: _propTypes.default.array,

  /**
   * Interpolator for colors. Possible options include "hcl", "hsl", "lab" and "rgb"
   */
  interpolator: _propTypes.default.string,

  /**
   * Inline style object to be applied to each rect,
   * or accessor function which returns a style object.
   */
  rectStyle: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.func]),

  /**
   * Class attribute to be applied to each rect,
   * or accessor function which returns a class.
   */
  rectClassName: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func])
});

_defineProperty(ColorHeatmap, "defaultProps", {
  interpolator: "lab",
  rectStyle: {},
  rectClassName: ""
});
//# sourceMappingURL=ColorHeatmap.js.map