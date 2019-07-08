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

var _xyPropsEqual = _interopRequireDefault(require("./utils/xyPropsEqual"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * `AreaChart` represents a simple bivariate area chart,
 * a filled path drawn between two lines (datasets).
 */
// todo horizontal prop, for filling area horizontally?
// todo support ordinal (like days of the week) data?
// todo build StackedAreaChart that composes multiple AreaCharts
class AreaChart extends _react.default.Component {
  static getDomain(props) {
    // custom Y domain - the total (union) extent of getY and getYEnd combined
    const {
      data,
      x,
      y,
      yEnd
    } = props;
    const accessors = {
      x: (0, _Data.makeAccessor2)(x),
      y: (0, _Data.makeAccessor2)(y),
      yEnd: (0, _Data.makeAccessor2)(yEnd)
    };
    return {
      yDomain: (0, _Data.combineDomains)([(0, _Data.domainFromData)(data, accessors.y), (0, _Data.domainFromData)(data, accessors.yEnd)])
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const shouldUpdate = !(0, _xyPropsEqual.default)(this.props, nextProps, ["pathStyle", "pathStylePositive", "pathStyleNegative"]);
    return shouldUpdate;
  }

  render() {
    const {
      data,
      x,
      y,
      yEnd,
      xScale,
      yScale,
      isDifference,
      pathStyle,
      pathStylePositive,
      pathStyleNegative,
      shouldShowGaps,
      pathClassName,
      isDefined,
      curve
    } = this.props;
    const accessors = {
      x: (0, _Data.makeAccessor2)(x),
      y: (0, _Data.makeAccessor2)(y),
      yEnd: (0, _Data.makeAccessor2)(yEnd)
    }; // create d3 area path generator

    const areaGenerator = (0, _d.area)(); // if gaps in data should be shown, use `props.isDefined` function as the `defined` param for d3's area generator;
    // but wrap it & pass in accessors as well, so that the function can easily access the relevant data values

    if (shouldShowGaps) {
      areaGenerator.defined((d, i) => isDefined(d, i, accessors));
    }

    areaGenerator.x((d, i) => xScale(accessors.x(d, i))).y0((d, i) => yScale(accessors.y(d, i))).y1((d, i) => yScale(accessors.yEnd(d, i)));

    if (curve) {
      areaGenerator.curve(curve);
    }

    const areaPathStr = areaGenerator(data);

    if (isDifference) {
      // difference chart - create 2 clip paths, one which clips to only show path where YEnd > Y, and other vice versa
      areaGenerator.y0(this.props.height);
      const clipBelowPathStr = areaGenerator(data);
      areaGenerator.y0(0);
      const clipAbovePathStr = areaGenerator(data); // make sure we have a unique ID for this chart, so clip path IDs don't affect other charts

      const chartId = _lodash.default.uniqueId();

      const clipAboveId = "clip-above-area-".concat(chartId);
      const clipBelowId = "clip-below-area-".concat(chartId);
      const pathStyleAbove = pathStylePositive || pathStyle || {};
      const pathStyleBelow = pathStyleNegative || pathStyle || {};
      return _react.default.createElement("g", {
        className: "rct-area-chart--difference"
      }, _react.default.createElement("clipPath", {
        id: clipAboveId
      }, _react.default.createElement("path", {
        className: "rct-area-chart-path",
        d: clipAbovePathStr
      })), _react.default.createElement("clipPath", {
        id: clipBelowId
      }, _react.default.createElement("path", {
        className: "rct-area-chart-path",
        d: clipBelowPathStr
      })), _react.default.createElement("path", {
        className: "rct-area-chart-path ".concat(pathClassName),
        d: areaPathStr,
        clipPath: "url(#".concat(clipAboveId, ")"),
        style: pathStyleAbove
      }), _react.default.createElement("path", {
        className: "rct-area-chart-path ".concat(pathClassName),
        d: areaPathStr,
        clipPath: "url(#".concat(clipBelowId, ")"),
        style: pathStyleBelow
      }));
    } else {
      return _react.default.createElement("g", {
        className: "rct-area-chart"
      }, _react.default.createElement("path", {
        className: "rct-area-chart-path ".concat(pathClassName),
        d: areaPathStr,
        style: pathStyle || {}
      }));
    }
  }

}

exports.default = AreaChart;

_defineProperty(AreaChart, "propTypes", {
  /**
   * the array of data objects
   */
  data: _propTypes.default.array.isRequired,

  /**
   * Accessor function for area X values, called once per datum,
   * or a single Y value to be used for the entire line.
   */
  x: CustomPropTypes.valueOrAccessor,

  /**
   * Accessor function for area's starting (minimum) Y values, called once per datum,
   * or a single Y value to be used for the entire line.
   * Should return the minimum of the Y range spanned by the area at this point.
   */
  y: CustomPropTypes.valueOrAccessor,

  /**
   * Accessor function for area's ending (maximum) Y values, called once per datum,
   * or a single Y value to be used for the entire line.
   * Should return the maximum of the Y range spanned by the area at this point.
   */
  yEnd: CustomPropTypes.valueOrAccessor,

  /**
   * Class attribute to be applied to area path element.
   */
  pathClassName: _propTypes.default.string,

  /**
   * Inline style object to be applied to area path element.
   */
  pathStyle: _propTypes.default.object,

  /**
   * If isDifference is true, AreaChart generates a "difference chart" with two area paths instead of one:
   * one path which shows when YEnd > Y, and one vice versa, allowing them to be styled differently (eg red/green).
   */
  isDifference: _propTypes.default.bool,

  /**
   * When isDifference is true, pathStylePositive and pathStyleNegative can be passed to give 2 different inline
   * styles to the two different paths which are generated.
   * Ignored if isDifference is false.
   */
  pathStylePositive: _propTypes.default.object,
  pathStyleNegative: _propTypes.default.object,

  /**
   * If true, will show gaps in the shaded area for data where props.isDefined(datum) returns false.
   */
  shouldShowGaps: _propTypes.default.bool,

  /**
   * If shouldShowGaps is true, isDefined function describes when a datum should be considered "defined" vs. when to show gap
   * by default, shows gap if either y or yEnd are undefined.
   */
  isDefined: _propTypes.default.func,

  /**
   * D3 scale for X axis - provided by XYPlot.
   */
  xScale: _propTypes.default.func,

  /**
   * D3 scale for Y axis - provided by XYPlot.
   */
  yScale: _propTypes.default.func,

  /**
   * Type of X scale - provided by XYPlot.
   */
  xScaleType: _propTypes.default.string,

  /**
   * Type of Y scale - provided by XYPlot.
   */
  yScaleType: _propTypes.default.string,

  /**
   * D3 curve for path generation
   */
  curve: _propTypes.default.func
});

_defineProperty(AreaChart, "defaultProps", {
  shouldShowGaps: true,
  isDefined: (d, i, accessors) => {
    return !_lodash.default.isUndefined(accessors.y(d, i)) && !_lodash.default.isUndefined(accessors.yEnd(d, i));
  },
  pathClassName: ""
});
//# sourceMappingURL=AreaChart.js.map