"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

var _Bar = _interopRequireDefault(require("./Bar"));

var CustomPropTypes = _interopRequireWildcard(require("./utils/CustomPropTypes"));

var _Data = require("./utils/Data");

var _Scale = require("./utils/Scale");

var _xyPropsEqual = _interopRequireDefault(require("./utils/xyPropsEqual"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * `RangeBarChart` is a variation on the standard bar chart. Just like a normal bar chart, each bar represents a single
 * value on the *independent* axis (X axis for vertical bars), and is centered on this value.
 * However, on the *dependent* axis, each bar represents a *range* (min/max) of values,
 * rather than always starting at zero.
 */
class RangeBarChart extends _react.default.Component {
  static getDomain(props) {
    const {
      xScaleType,
      yScaleType,
      horizontal,
      data,
      x,
      xEnd,
      y,
      yEnd
    } = props; // only have to specify range axis domain, other axis uses default domainFromData

    const rangeAxis = horizontal ? "x" : "y";
    const rangeStartAccessor = horizontal ? (0, _Data.makeAccessor2)(x) : (0, _Data.makeAccessor2)(y);
    const rangeEndAccessor = horizontal ? (0, _Data.makeAccessor2)(xEnd) : (0, _Data.makeAccessor2)(yEnd);
    const rangeScaleType = horizontal ? xScaleType : yScaleType;
    const rangeDataType = (0, _Scale.dataTypeFromScaleType)(rangeScaleType);
    return {
      ["".concat(rangeAxis, "Domain")]: (0, _Data.domainFromRangeData)(data, rangeStartAccessor, rangeEndAccessor, rangeDataType)
    };
  }

  static getSpacing(props) {
    const {
      barThickness,
      horizontal,
      x,
      y,
      xScale,
      yScale,
      data,
      xDomain,
      yDomain
    } = props;
    const P = barThickness / 2; //padding

    const barsDomain = horizontal ? yDomain : xDomain;
    const barsScale = horizontal ? yScale : xScale;
    const barsAccessor = horizontal ? (0, _Data.makeAccessor2)(y) : (0, _Data.makeAccessor2)(x);
    const barsDataDomain = (0, _Data.domainFromData)(data, barsAccessor); // todo refactor/add better comments to clarify
    //find the edges of the tick domain, and map them through the scale function

    const [domainHead, domainTail] = (0, _lodash.default)([_lodash.default.first(barsDomain), _lodash.default.last(barsDomain)]).map(barsScale).sortBy(); //sort the pixel values return by the domain extents
    //find the edges of the data domain, and map them through the scale function

    const [dataDomainHead, dataDomainTail] = (0, _lodash.default)([_lodash.default.first(barsDataDomain), _lodash.default.last(barsDataDomain)]).map(barsScale).sortBy(); //sort the pixel values return by the domain extents
    //find the necessary spacing (based on bar width) to push the bars completely inside the tick domain

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

  shouldComponentUpdate(nextProps) {
    const shouldUpdate = !(0, _xyPropsEqual.default)(this.props, nextProps, ["barStyle"]);
    return shouldUpdate;
  }

  render() {
    const {
      xScale,
      yScale,
      data,
      horizontal,
      x,
      xEnd,
      y,
      yEnd,
      barThickness,
      barClassName,
      barStyle,
      showLabels,
      barLabelFormat,
      labelDistance,
      labelClassName
    } = this.props; // invariant(hasOneOfTwo(xEnd, yEnd), `RangeBarChart expects a xEnd *or* yEnd prop, but not both.`);

    return _react.default.createElement("g", null, data.map((d, i) => {
      const [onMouseEnter, onMouseMove, onMouseLeave] = ["onMouseEnterBar", "onMouseMoveBar", "onMouseLeaveBar"].map(eventName => {
        // partially apply this bar's data point as 2nd callback argument
        const callback = _lodash.default.get(this.props, eventName);

        return _lodash.default.isFunction(callback) ? _lodash.default.partial(callback, _lodash.default, d) : null;
      });
      const barProps = {
        x: (0, _Data.getValue)(x, d, i),
        y: (0, _Data.getValue)(y, d, i),
        xEnd: horizontal ? (0, _Data.getValue)(xEnd, d, i) : undefined,
        yEnd: horizontal ? undefined : (0, _Data.getValue)(yEnd, d, i),
        xScale,
        yScale,
        key: "chart-bar-".concat(i),
        onMouseEnter,
        onMouseMove,
        onMouseLeave,
        thickness: barThickness,
        showLabel: showLabels,
        labelFormat: barLabelFormat,
        labelDistance,
        labelClassName: (0, _Data.getValue)(labelClassName, d, i),
        className: "rct-chart-bar ".concat((0, _Data.getValue)(barClassName, d, i) || ""),
        style: (0, _Data.getValue)(barStyle, d, i)
      };
      return _react.default.createElement(_Bar.default, barProps);
    }));
  }

}

exports.default = RangeBarChart;

_defineProperty(RangeBarChart, "propTypes", {
  /**
   * Array of data to be plotted. One bar will be rendered per datum in this array.
   */
  data: _propTypes.default.array,

  /**
   * Boolean which determines whether the chart will use horizontal or vertical bars.
   * When `true`, bars will be horizontal, ie. the X-axis will be treated as the dependent axis.
   */
  horizontal: _propTypes.default.bool,

  /**
   * Accessor function for bar X values, called once per bar (datum), or a single value to be used for all bars.
   * If `horizontal` is `false`, this gets the *independent* variable value on which the bar is centered.
   * If `horizontal` is `true`, this gets the start (minimum value) of the *dependent* variable range which is spanned by the bar's length.
   */
  x: CustomPropTypes.valueOrAccessor,

  /**
   * Accessor function for the end (maximum X-values) of the *dependent* variable range which is spanned by the bar's length,
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
   * Accessor function for the end (maximum Y-values) of the *dependent* variable range which is spanned by the bar's length,
   * or a single value to be used for all bars.
   * Should only be passed when `horizontal` is `false` (ignored otherwise).
   */
  yEnd: CustomPropTypes.valueOrAccessor,

  /**
   * D3 scale for X axis - provided by XYPlot.
   */
  xScale: _propTypes.default.func,

  /**
   * D3 scale for Y axis - provided by XYPlot.
   */
  yScale: _propTypes.default.func,

  /**
   * Thickness (in pixels) of each bar (ie. bar height if `horizontal` is `true`, otherwise bar width),
   */
  barThickness: _propTypes.default.number,
  // barThickness: PropTypes.oneOfType([PropTypes.number, PropTypes.func]), // todo

  /**
   * Inline style object to be applied to each bar,
   * or accessor function which returns a style object.
   */
  barStyle: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.func]),

  /**
   * Class attribute to be applied to each bar,
   * or accessor function which returns a class.
   */
  barClassName: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),

  /**
   * `mousemove` event handler callback, called when user's mouse moves within a bar.
   */
  onMouseMoveBar: _propTypes.default.func,

  /**
   * `mouseenter` event handler callback, called when user's mouse enters a bar.
   */
  onMouseEnterBar: _propTypes.default.func,

  /**
   * `mouseleave` event handler callback, called when user's mouse leaves a bar.
   */
  onMouseLeaveBar: _propTypes.default.func,

  /**
   * Conditional if column should display values above/beside each bar.
   */
  showLabels: _propTypes.default.bool,

  /**
   * Format to use for the values or accessor that returns the updated value on each bar.
   */
  barLabelFormat: _propTypes.default.func,

  /**
   * The distance from the column the text appears in pixels - default is 24.
   */
  labelDistance: _propTypes.default.number,

  /**
   * Class name(s) to be included on each bar's <text> element.
   */
  labelClassName: _propTypes.default.string
});

_defineProperty(RangeBarChart, "defaultProps", {
  data: [],
  horizontal: false,
  barThickness: 8,
  barClassName: "",
  barStyle: {}
});
//# sourceMappingURL=RangeBarChart.js.map