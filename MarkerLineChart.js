"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

var _util = require("./util.js");

var CustomPropTypes = _interopRequireWildcard(require("./utils/CustomPropTypes"));

var _Data = require("./utils/Data");

var _Scale = require("./utils/Scale");

var _xyPropsEqual = _interopRequireDefault(require("./utils/xyPropsEqual"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function getTickType(props) {
  const {
    xEnd,
    yEnd,
    horizontal
  } = props; // warn if a range is passed for the dependent variable, which is expected to be a value

  if (!horizontal && !_lodash.default.isUndefined(yEnd) || horizontal && !_lodash.default.isUndefined(xEnd)) console.warn("Warning: MarkerLineChart can only show the independent variable as a range, not the dependent variable.");
  if (!horizontal && !_lodash.default.isUndefined(xEnd) || horizontal && !_lodash.default.isUndefined(yEnd)) return "RangeValue";
  return "ValueValue";
}
/**
 * `MarkerLineChart` is similar to a bar chart,
 * except that it just draws a line at the data value, rather than a full bar.
 * If the independent variable is a range, the length of the line will represent that range,
 * otherwise all lines will be the same length.
 * The dependent variable must be a single value, not a range.
 */


class MarkerLineChart extends _react.default.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "onMouseEnterLine", (e, d) => {
      this.props.onMouseEnterLine(e, d);
    });

    _defineProperty(this, "onMouseMoveLine", (e, d) => {
      this.props.onMouseMoveLine(e, d);
    });

    _defineProperty(this, "onMouseLeaveLine", (e, d) => {
      this.props.onMouseLeaveLine(e, d);
    });

    _defineProperty(this, "renderRangeValueLine", (d, i) => {
      const [onMouseEnter, onMouseMove, onMouseLeave] = ["onMouseEnterLine", "onMouseMoveLine", "onMouseLeaveLine"].map(eventName => {
        // partially apply this bar's data point as 2nd callback argument
        const callback = (0, _util.methodIfFuncProp)(eventName, this.props, this);
        return _lodash.default.isFunction(callback) ? _lodash.default.partial(callback, _lodash.default, d) : null;
      });
      const {
        x,
        xEnd,
        y,
        yEnd,
        horizontal,
        xScale,
        yScale,
        lineClassName,
        lineStyle
      } = this.props;
      const xVal = xScale((0, _Data.makeAccessor2)(x)(d));
      const yVal = yScale((0, _Data.makeAccessor2)(y)(d));
      const xEndVal = _lodash.default.isUndefined(xEnd) ? 0 : xScale((0, _Data.makeAccessor2)(xEnd)(d));
      const yEndVal = _lodash.default.isUndefined(yEnd) ? 0 : yScale((0, _Data.makeAccessor2)(yEnd)(d));
      const [x1, y1] = [xVal, yVal];
      const x2 = horizontal ? xVal : xEndVal;
      const y2 = horizontal ? yEndVal : yVal;
      const key = "marker-line-".concat(i);
      if (!_lodash.default.every([x1, x2, y1, y2], _lodash.default.isFinite)) return null;
      return _react.default.createElement("line", _extends({
        className: "".concat((0, _Data.getValue)(lineClassName, d, i)),
        style: (0, _Data.getValue)(lineStyle, d, i)
      }, {
        x1,
        x2,
        y1,
        y2,
        key,
        onMouseEnter,
        onMouseMove,
        onMouseLeave
      }));
    });

    _defineProperty(this, "renderValueValueLine", (d, i) => {
      const [onMouseEnter, onMouseMove, onMouseLeave] = ["onMouseEnterLine", "onMouseMoveLine", "onMouseLeaveLine"].map(eventName => {
        // partially apply this bar's data point as 2nd callback argument
        const callback = (0, _util.methodIfFuncProp)(eventName, this.props, this);
        return _lodash.default.isFunction(callback) ? _lodash.default.partial(callback, _lodash.default, d) : null;
      });
      const {
        x,
        y,
        horizontal,
        lineLength,
        xScale,
        yScale,
        lineClassName,
        lineStyle
      } = this.props;
      const xVal = xScale((0, _Data.makeAccessor2)(x)(d));
      const yVal = yScale((0, _Data.makeAccessor2)(y)(d));
      const x1 = !horizontal ? xVal - lineLength / 2 : xVal;
      const x2 = !horizontal ? xVal + lineLength / 2 : xVal;
      const y1 = !horizontal ? yVal : yVal - lineLength / 2;
      const y2 = !horizontal ? yVal : yVal + lineLength / 2;
      const key = "marker-line-".concat(i);
      if (!_lodash.default.every([x1, x2, y1, y2], _lodash.default.isFinite)) return null;
      return _react.default.createElement("line", _extends({
        className: "".concat((0, _Data.getValue)(lineClassName, d, i)),
        style: (0, _Data.getValue)(lineStyle, d, i)
      }, {
        x1,
        x2,
        y1,
        y2,
        key,
        onMouseEnter,
        onMouseMove,
        onMouseLeave
      }));
    });
  }

  static getSpacing(props) {
    const tickType = getTickType(props); //no spacing for rangeValue marker charts since line start and end are set explicitly

    if (tickType === "RangeValue") return {
      spacingTop: 0,
      spacingRight: 0,
      spacingBottom: 0,
      spacingLeft: 0
    };
    const {
      lineLength,
      horizontal,
      data,
      xDomain,
      yDomain,
      xScale,
      yScale,
      x,
      y
    } = props;
    const P = lineLength / 2; //padding

    const markDomain = horizontal ? yDomain : xDomain;
    const markScale = horizontal ? yScale : xScale;
    const markAccessor = horizontal ? (0, _Data.makeAccessor2)(y) : (0, _Data.makeAccessor2)(x);
    const markDataDomain = (0, _Data.domainFromData)(data, markAccessor); // todo refactor/add better comments to clarify
    // find the edges of the tick domain, and map them through the scale function

    const [domainHead, domainTail] = (0, _lodash.default)([_lodash.default.first(markDomain), _lodash.default.last(markDomain)]).map(markScale).sortBy(); //sort the pixel values return by the domain extents
    // find the edges of the data domain, and map them through the scale function

    const [dataDomainHead, dataDomainTail] = (0, _lodash.default)([_lodash.default.first(markDataDomain), _lodash.default.last(markDataDomain)]).map(markScale).sortBy(); //sort the pixel values return by the domain extents
    // find the necessary spacing (based on bar width) to push the bars completely inside the tick domain

    const [spacingTail, spacingHead] = [_lodash.default.clamp(P - (domainTail - dataDomainTail), 0, P), _lodash.default.clamp(P - (dataDomainHead - domainHead), 0, P)];

    if (horizontal) {
      return {
        spacingTop: spacingHead,
        spacingBottom: spacingTail,
        spacingLeft: 0,
        spacingRight: 0
      };
    } else {
      return {
        spacingTop: 0,
        spacingBottom: 0,
        spacingLeft: spacingHead,
        spacingRight: spacingTail
      };
    }
  }

  static getDomain(props) {
    if (getTickType(props) === "RangeValue") {
      // set range domain for range type
      const {
        data,
        x,
        xEnd,
        y,
        yEnd,
        xScaleType,
        yScaleType,
        horizontal
      } = props; // only have to specify range axis domain, other axis uses default domainFromData
      // in this chart type, the range axis, if there is one, is always the *independent* variable

      const rangeAxis = horizontal ? "y" : "x";
      const rangeStartAccessor = horizontal ? (0, _Data.makeAccessor2)(y) : (0, _Data.makeAccessor2)(x);
      const rangeEndAccessor = horizontal ? (0, _Data.makeAccessor2)(yEnd) : (0, _Data.makeAccessor2)(xEnd);
      const rangeDataType = (0, _Scale.dataTypeFromScaleType)(horizontal ? yScaleType : xScaleType);
      return {
        ["".concat(rangeAxis, "Domain")]: (0, _Data.domainFromRangeData)(data, rangeStartAccessor, rangeEndAccessor, rangeDataType)
      };
    } else {
      return {};
    }
  }

  shouldComponentUpdate(nextProps) {
    const shouldUpdate = !(0, _xyPropsEqual.default)(this.props, nextProps, []);
    return shouldUpdate;
  }

  render() {
    const tickType = getTickType(this.props);
    return _react.default.createElement("g", {
      className: "rct-marker-line-chart"
    }, tickType === "RangeValue" ? this.props.data.map(this.renderRangeValueLine) : this.props.data.map(this.renderValueValueLine));
  }

}

exports.default = MarkerLineChart;

_defineProperty(MarkerLineChart, "propTypes", {
  /**
   * Array of data objects. One marker line will be rendered per datum in the array.
   */
  data: _propTypes.default.array.isRequired,

  /**
   * Accessor function for marker line's X values, called once per line (datum), or a single value to be used for all marker lines.
   * If `horizontal` is `false`, this gets the *independent* variable value on which the line is centered.
   * If `horizontal` is `true`, this gets the start (minimum value) of the *dependent* variable.
   */
  x: CustomPropTypes.valueOrAccessor,

  /**
   * Accessor function for marker line's Y values, called once per line (datum), or a single value to be used for all marker lines.
   * If `horizontal` is `false`, this gets the start (minimum value) of the *dependent* variable.
   * If `horizontal` is `true`, this gets the *independent* variable value on which the line is centered.
   */
  y: CustomPropTypes.valueOrAccessor,

  /**
   * Accessor function for the end (maximum X-values) of the *dependent* variable, which is where the marker line is rendered,
   * or a single value to be used for all marker lines.
   * Should only be passed when `horizontal` is `true` (ignored otherwise).
   */
  xEnd: CustomPropTypes.valueOrAccessor,

  /**
   * Accessor function for the end (maximum Y-values) of the *dependent* variable range which is where the marker line is rendered,
   * or a single value to be used for all marker lines.
   * Should only be passed when `horizontal` is `false` (ignored otherwise).
   */
  yEnd: CustomPropTypes.valueOrAccessor,

  /**
   * Boolean which determines whether the chart will be horizontal.
   * When `true` the X-axis will be treated as the dependent axis.
   */
  horizontal: _propTypes.default.bool,
  lineLength: _propTypes.default.number,

  /**
   * D3 scale type for X axis - provided by XYPlot.
   */
  xScaleType: _propTypes.default.string,

  /**
   * D3 scale type for Y axis - provided by XYPlot.
   */
  yScaleType: _propTypes.default.string,

  /**
   * D3 scale for X axis - provided by XYPlot.
   */
  xScale: _propTypes.default.func,

  /**
   * D3 scale for Y axis - provided by XYPlot.
   */
  yScale: _propTypes.default.func,

  /**
   * Class attribute to be applied to the line path,
   * or accessor function which returns a class.
   */
  lineClassName: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),

  /**
   * Inline style object to be applied to each marker line,
   * or accessor function which returns a style object.
   */
  lineStyle: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.func]),

  /**
   * `mouseenter` event handler callback, called when user's mouse enters a marker line.
   */
  onMouseEnterLine: _propTypes.default.func,

  /**
   * `mousemove` event handler callback, called when user's mouse moves within a marker line.
   */
  onMouseMoveLine: _propTypes.default.func,

  /**
   * `mouseleave` event handler callback, called when user's mouse leaves a marker line.
   */
  onMouseLeaveLine: _propTypes.default.func
});

_defineProperty(MarkerLineChart, "defaultProps", {
  horizontal: false,
  lineLength: 10,
  lineClassName: "",
  lineStyle: {}
});
//# sourceMappingURL=MarkerLineChart.js.map