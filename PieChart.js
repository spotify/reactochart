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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// default height/width, used only if height & width & radius are all undefined
const DEFAULT_SIZE = 150;
/**
 * `PieChart` is a circular graphic that is divided into slices to illustrate proportions or percentages.
 */

class PieChart extends _react.default.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "onMouseEnterSlice", (e, d) => {
      this.props.onMouseEnterSlice(e, d);
    });

    _defineProperty(this, "onMouseMoveSlice", (e, d) => {
      this.props.onMouseMoveSlice(e, d);
    });

    _defineProperty(this, "onMouseLeaveSlice", (e, d) => {
      this.props.onMouseLeaveSlice(e, d);
    });

    _defineProperty(this, "onMouseEnterLine", (e, d) => {
      this.props.onMouseEnterLine(e, d);
    });

    _defineProperty(this, "onMouseMoveLine", (e, d) => {
      this.props.onMouseMoveLine(e, d);
    });

    _defineProperty(this, "onMouseLeaveLine", (e, d) => {
      this.props.onMouseLeaveLine(e, d);
    });
  }

  render() {
    const {
      marginLeft,
      marginRight,
      marginTop,
      marginBottom,
      holeRadius
    } = this.props; // sizes fallback based on provided info: given dimension -> radius + margin -> other dimension -> default

    const width = this.props.width || (this.props.radius ? this.props.radius * 2 + marginLeft + marginRight : this.props.height) || DEFAULT_SIZE;
    const height = this.props.height || (this.props.radius ? this.props.radius * 2 + marginTop + marginBottom : this.props.width) || DEFAULT_SIZE;
    const radius = this.props.radius || Math.min((width - (marginLeft + marginRight)) / 2, (height - (marginTop + marginBottom)) / 2);
    const center = {
      x: marginLeft + radius,
      y: marginTop + radius
    };
    const {
      markerLineValue,
      pieSliceClassName,
      markerLineOverhangInner,
      markerLineOverhangOuter
    } = this.props;
    const valueAccessor = (0, _Data.makeAccessor)(this.props.getValue);

    const sum = _lodash.default.sumBy(this.props.data, valueAccessor);

    const total = this.props.total || sum;
    const markerLinePercent = _lodash.default.isFinite(markerLineValue) ? markerLineValue / total : null;
    let startPercent = 0;
    const slices = this.props.data.map((d, i) => {
      const slicePercent = valueAccessor(d) / total;
      const slice = {
        start: startPercent,
        end: startPercent + slicePercent
      };
      startPercent += slicePercent;
      return slice;
    });
    return _react.default.createElement("svg", _extends({
      className: "rct-pie-chart"
    }, {
      width,
      height
    }), this.props.data.map((d, i) => {
      const [onMouseEnter, onMouseMove, onMouseLeave] = ["onMouseEnterSlice", "onMouseMoveSlice", "onMouseLeaveSlice"].map(eventName => {
        // partially apply this bar's data point as 2nd callback argument
        const callback = (0, _util.methodIfFuncProp)(eventName, this.props, this);
        return _lodash.default.isFunction(callback) ? _lodash.default.partial(callback, _lodash.default, d) : null;
      });
      const className = "rct-pie-slice rct-pie-slice-".concat(i, " ").concat((0, _Data.getValue)(pieSliceClassName, d, i) || "");
      const slice = slices[i];
      const pathStr = pieSlicePath(slice.start, slice.end, center, radius, holeRadius);
      const key = "pie-slice-".concat(i);
      return _react.default.createElement("path", {
        className,
        d: pathStr,
        onMouseEnter,
        onMouseMove,
        onMouseLeave,
        key
      });
    }), sum < total ? // draw empty slice if the sum of slices is less than expected total
    _react.default.createElement("path", {
      className: "rct-pie-slice rct-pie-slice-empty",
      d: pieSlicePath(startPercent, 1, center, radius, holeRadius),
      key: "pie-slice-empty"
    }) : null, _lodash.default.isFinite(markerLinePercent) ? this.renderMarkerLine(markerLine(markerLinePercent, center, radius, holeRadius, markerLineOverhangOuter, markerLineOverhangInner)) : null, this.props.centerLabel ? this.renderCenterLabel(center) : null, this.props.getPieSliceLabel ? this.props.data.map((d, i) => this.renderSliceLabel(d, slices[i], center, radius, i)) : null);
  }

  renderMarkerLine(pathData) {
    const {
      markerLineClassName,
      markerLineStyle
    } = this.props;
    const lineD = {
      value: this.props.markerLineValue
    };
    const [onMouseEnter, onMouseMove, onMouseLeave] = ["onMouseEnterLine", "onMouseMoveLine", "onMouseLeaveLine"].map(eventName => {
      // partially apply this bar's data point as 2nd callback argument
      const callback = (0, _util.methodIfFuncProp)(eventName, this.props, this);
      return _lodash.default.isFunction(callback) ? _lodash.default.partial(callback, _lodash.default, lineD) : null;
    });
    return _react.default.createElement("path", _extends({
      style: markerLineStyle,
      className: "rct-marker-line ".concat(markerLineClassName),
      d: pathData
    }, {
      onMouseEnter,
      onMouseMove,
      onMouseLeave
    }));
  }

  renderSliceLabel(value, slice, center, radius, index) {
    const {
      getPieSliceLabel,
      pieSliceLabelStyle,
      pieSliceLabelDistance
    } = this.props;
    const labelPercent = (slice.end - slice.start) / 2 + slice.start;
    const style = {
      textAnchor: "middle",
      dominantBaseline: "central"
    };

    if (pieSliceLabelStyle) {
      Object.assign(style, (0, _Data.getValue)(pieSliceLabelStyle, value));
    }

    const r = pieSliceLabelDistance ? radius + (0, _Data.getValue)(pieSliceLabelDistance, value) : radius;
    const x = center.x + Math.sin(2 * Math.PI / (1 / labelPercent)) * r;
    const y = center.y - Math.cos(2 * Math.PI / (1 / labelPercent)) * r;
    return _react.default.createElement("text", {
      key: index,
      x: x,
      y: y,
      style: style
    }, getPieSliceLabel(value));
  }

  renderCenterLabel(center) {
    const {
      centerLabelStyle,
      centerLabelClassName,
      centerLabel
    } = this.props;
    const {
      x,
      y
    } = center;
    const style = Object.assign({}, {
      textAnchor: "middle",
      dominantBaseline: "central"
    }, centerLabelStyle);
    return _react.default.createElement("text", _extends({
      className: "rct-pie-label-center ".concat(centerLabelClassName)
    }, {
      x,
      y,
      style
    }), centerLabel);
  }

}

_defineProperty(PieChart, "propTypes", {
  /**
   * Array of data to plot with pie chart.
   */
  data: _propTypes.default.array.isRequired,

  /**
   * Accessor for getting the values plotted on the pie chart.
   * If not provided, just uses the value itself at given index.
   */
  getValue: CustomPropTypes.getter,

  /**
   * Total expected sum of all the pie slice values.
   * If provided && slices don't add up to total, an "empty" slice will be rendered for the rest
   * If not provided, will be the sum of all values (ie. all values will always add up to 100%)
   */
  total: _propTypes.default.number,

  /**
   * Optional width of the SVG
   * if not passed in and height is passed in, same # is used for both (ie. width=100 means height=100 also)
   * if neither is passed, but radius is, radius+margins is used
   * if neither is passed, and radius isn't either, 150 is used
   */
  width: _propTypes.default.number,

  /**
   * Optional height of the SVG
   * if not passed in and width is passed in, same # is used for both (ie. width=100 means height=100 also)
   * if neither is passed, but radius is, radius+margins is used
   * if neither is passed, and radius isn't either, 150 is used
   */
  height: _propTypes.default.number,

  /**
   * Optional radius of the pie chart, inferred from margin/width/height if not provided.
   */
  radius: _propTypes.default.number,
  marginTop: _propTypes.default.number,
  marginBottom: _propTypes.default.number,
  marginLeft: _propTypes.default.number,
  marginRight: _propTypes.default.number,

  /**
   * Optional radius of the "donut hole" circle drawn on top of the pie chart to turn it into a donut chart.
   */
  holeRadius: _propTypes.default.number,

  /**
   * Optional label text to display in the middle of the pie/donut.
   */
  centerLabel: _propTypes.default.string,

  /**
   * Class attribute to be applied to center label.
   */
  centerLabelClassName: _propTypes.default.string,

  /**
   * Inline style object to be applied to center label.
   */
  centerLabelStyle: _propTypes.default.object,

  /**
   * Accessor for getting labels that are rendered outside each slice of the pie chart.
   * If not provided no labels will be rendered.
   */
  getPieSliceLabel: _propTypes.default.func,

  /**
   * Inline style object applied to each slice label.
   * When a function is provided it will receive the value for the slice and should return the
   * style object for that slice's label.
   * Used along with `getPieSliceLabel`.
   */
  pieSliceLabelStyle: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.func]),

  /**
   * Distance to render the label from the outer edge of the pie chart. Positive numbers will
   * move away from the center and negative numbers will move toward the center.
   * When a function is provided it will receive the value for the slice and should return the
   * distance for that slice's label.
   * Used along with `getPieSliceLabel`.
   */
  pieSliceLabelDistance: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.func]),

  /**
   * Class attribute to be applied to each pie slice,
   * or accessor function which returns a class.
   */
  pieSliceClassName: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),

  /**
   * Value for where to place markerline.
   */
  markerLineValue: _propTypes.default.number,

  /**
   * Class attribute to be applied to marker line.
   */
  markerLineClassName: _propTypes.default.string,

  /**
   * Inline style object to be applied to marker line.
   */
  markerLineStyle: _propTypes.default.object,

  /**
   * Number of pixels marker line hangs inside the pie chart.
   */
  markerLineOverhangInner: _propTypes.default.number,

  /**
   * Number of pixels marker line hangs outside the pie chart.
   */
  markerLineOverhangOuter: _propTypes.default.number,

  /**
   * `mouseenter` event handler callback, called when user's mouse enters the marker line.
   */
  onMouseEnterLine: _propTypes.default.func,

  /**
   * `mousemove` event handler callback, called when user's mouse moves within the marker line.
   */
  onMouseMoveLine: _propTypes.default.func,

  /**
   * `mouseleave` event handler callback, called when user's mouse leaves the marker line.
   */
  onMouseLeaveLine: _propTypes.default.func,

  /**
   * `mouseenter` event handler callback, called when user's mouse enters a pie slice.
   */
  onMouseEnterSlice: _propTypes.default.func,

  /**
   * `mousemove` event handler callback, called when user's mouse moves within a pie slice.
   */
  onMouseMoveSlice: _propTypes.default.func,

  /**
   * `mouseleave` event handler callback, called when user's mouse leaves a pie slice.
   */
  onMouseLeaveSlice: _propTypes.default.func
});

_defineProperty(PieChart, "defaultProps", {
  getValue: null,
  centerLabelClassName: "",
  centerLabelStyle: {},
  pieSliceClassName: "",
  markerLineClassName: "",
  markerLineOverhangInner: 2,
  markerLineOverhangOuter: 2,
  markerLineStyle: {},
  marginTop: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0
});

function markerLine(percentValue, center, radius, holeRadius = 0, overhangOuter = 0, overhangInner = 0) {
  if (percentValue == 1) endPercent = 0.9999999; // arc cannot be a full circle

  const startX = Math.sin(2 * Math.PI / (1 / percentValue));
  const startY = Math.cos(2 * Math.PI / (1 / percentValue));
  const [c, r, rH, x0, y0] = [center, radius, holeRadius, startX, startY];
  const [r0, r1] = [Math.max(rH - overhangInner, 0), r + overhangOuter];
  return [// construct a string representing the marker line
  "M ".concat(c.x + x0 * r0, ",").concat(c.y - y0 * r0), // start at edge of inner (hole) circle, or center if no hole
  "L ".concat(c.x + x0 * r1, ",").concat(c.y - y0 * r1, " z") // straight line to outer circle, along radius
  ].join(" ");
}

function pieSlicePath(startPercent, endPercent, center, radius, holeRadius = 0) {
  if (endPercent == 1) endPercent = 0.9999999; // arc cannot be a full circle

  const startX = Math.sin(2 * Math.PI / (1 / startPercent));
  const startY = Math.cos(2 * Math.PI / (1 / startPercent));
  const endX = Math.sin(2 * Math.PI / (1 / endPercent));
  const endY = Math.cos(2 * Math.PI / (1 / endPercent));
  const largeArc = endPercent - startPercent <= 0.5 ? 0 : 1;
  const [c, r, rH, x0, x1, y0, y1] = [center, radius, holeRadius, startX, endX, startY, endY];
  return [// construct a string representing the pie slice path
  "M ".concat(c.x + x0 * rH, ",").concat(c.y - y0 * rH), // start at edge of inner (hole) circle, or center if no hole
  "L ".concat(c.x + x0 * r, ",").concat(c.y - y0 * r), // straight line to outer circle, along radius
  "A ".concat(r, ",").concat(r, " 0 ").concat(largeArc, " 1 ").concat(c.x + x1 * r, ",").concat(c.y - y1 * r) // outer arc
  ].concat(holeRadius ? [// if we have an inner (donut) hole, draw an inner arc too, otherwise we're done
  "L ".concat(c.x + x1 * rH, ",").concat(c.y - y1 * rH), // straight line to inner (hole) circle, along radius
  "A ".concat(rH, ",").concat(rH, " 0 ").concat(largeArc, " 0 ").concat(c.x + x0 * rH, ",").concat(c.y - y0 * rH, " z") // inner arc
  ] : "z").join(" ");
}

var _default = PieChart;
exports.default = _default;
//# sourceMappingURL=PieChart.js.map