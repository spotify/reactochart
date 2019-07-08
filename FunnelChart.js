"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _d = require("d3");

var _lodash = _interopRequireDefault(require("lodash"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

var CustomPropTypes = _interopRequireWildcard(require("./utils/CustomPropTypes"));

var _Data = require("./utils/Data");

var _Scale = require("./utils/Scale");

var _xyPropsEqual = _interopRequireDefault(require("./utils/xyPropsEqual"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * `FunnelChart` is used to visualize the progressive reduction of data as it passes
 * from one phase to another.
 */
class FunnelChart extends _react.default.Component {
  static getDomain(props) {
    const {
      data,
      xScaleType,
      yScaleType,
      x,
      y,
      horizontal
    } = props;
    const [xAccessor, yAccessor] = [(0, _Data.makeAccessor2)(x), (0, _Data.makeAccessor2)(y)];
    const [xDataType, yDataType] = [(0, _Scale.dataTypeFromScaleType)(xScaleType), (0, _Scale.dataTypeFromScaleType)(yScaleType)];
    return horizontal ? {
      xDomain: (0, _Data.combineDomains)([(0, _Data.domainFromData)(data, xAccessor, xDataType), (0, _Data.domainFromData)(data, (d, i) => -xAccessor(d, i), xDataType)]),
      yDomain: (0, _Data.domainFromData)(data, yAccessor, yDataType)
    } : {
      xDomain: (0, _Data.domainFromData)(data, xAccessor, xDataType),
      yDomain: (0, _Data.combineDomains)([(0, _Data.domainFromData)(data, yAccessor, yDataType), (0, _Data.domainFromData)(data, (d, i) => -yAccessor(d, i), yDataType)])
    };
  }

  shouldComponentUpdate(nextProps) {
    const shouldUpdate = !(0, _xyPropsEqual.default)(this.props, nextProps, []);
    return shouldUpdate;
  }

  render() {
    const {
      data,
      xScale,
      yScale,
      color,
      pathStyle,
      x,
      y,
      horizontal,
      pathClassName
    } = this.props;
    const funnelArea = (0, _d.area)();

    if (horizontal) {
      funnelArea.x0((d, i) => xScale(-(0, _Data.getValue)(x, d, i))).x1((d, i) => xScale((0, _Data.getValue)(x, d, i))).y((d, i) => yScale((0, _Data.getValue)(y, d, i)));
    } else {
      funnelArea.x((d, i) => xScale((0, _Data.getValue)(x, d, i))).y0((d, i) => yScale(-(0, _Data.getValue)(y, d, i))).y1((d, i) => yScale((0, _Data.getValue)(y, d, i)));
    }

    const colors = (0, _d.scaleOrdinal)(_d.schemeCategory10).domain(_lodash.default.range(10));
    return _react.default.createElement("g", {
      className: "rct-funnel-chart"
    }, data.map((d, i) => {
      if (i === 0) return null;
      const pathStr = funnelArea([data[i - 1], d]);
      const fill = color ? (0, _Data.getValue)(color, d, i) : colors(i - 1);
      let style = pathStyle ? (0, _Data.getValue)(pathStyle, d, i) : {};
      style = _lodash.default.defaults({}, style, {
        fill,
        stroke: "transparent"
      });
      return _react.default.createElement("path", {
        d: pathStr,
        className: "".concat((0, _Data.getValue)(pathClassName, d, i) || ""),
        style: style,
        key: i
      });
    }));
  }

}

exports.default = FunnelChart;

_defineProperty(FunnelChart, "propTypes", {
  /**
   * Array of data to be plotted.
   */
  data: _propTypes.default.array.isRequired,

  /**
   * Accessor function for X values, called once per datum, or a single value to be used for all datums.
   */
  x: CustomPropTypes.valueOrAccessor,

  /**
   * Accessor function for Y values, called once per datum, or a single value to be used for all datums.
   */
  y: CustomPropTypes.valueOrAccessor,

  /**
   * Color applied to the path element,
   * or accessor function which returns a class.
   *
   * Note that the first datum's color would not be applied since it fills in the area of the path
   */
  color: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),
  horizontal: _propTypes.default.bool,

  /**
   * Classname applied to each path element,
   * or accessor function which returns a class.
   */
  pathClassName: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),

  /**
   * Style applied to each path element,
   * or accessor function which returns a style object.
   */
  pathStyle: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.func]),

  /**
   * D3 scale for X axis - provided by XYPlot.
   */
  xScale: _propTypes.default.func,

  /**
   * D3 scale for Y axis - provided by XYPlot.
   */
  yScale: _propTypes.default.func
});

_defineProperty(FunnelChart, "defaultProps", {
  pathClassName: ""
});
//# sourceMappingURL=FunnelChart.js.map