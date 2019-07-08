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
 * `LineChart` displays data a series of points connected by straight line segments.
 */
class LineChart extends _react.default.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "getHovered", (x, y) => {
      const closestDataIndex = this.state.bisectX(this.props.data, x);
      return this.props.data[closestDataIndex];
    });
  }

  componentWillMount() {
    this.initBisector(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.initBisector(nextProps);
  }

  shouldComponentUpdate(nextProps) {
    return !(0, _xyPropsEqual.default)(this.props, nextProps, ["lineStyle", "lineClassName"]);
  }

  initBisector(props) {
    this.setState({
      bisectX: (0, _d.bisector)(d => (0, _Data.getValue)(props.x, d)).left
    });
  }

  render() {
    const {
      data,
      xScale,
      yScale,
      x,
      y,
      curve,
      lineStyle,
      lineClassName
    } = this.props;
    const pathStr = (0, _d.line)().curve(curve).x((d, i) => xScale((0, _Data.getValue)(x, d, i))).y((d, i) => yScale((0, _Data.getValue)(y, d, i)))(data);
    return _react.default.createElement("g", {
      className: "rct-line-chart ".concat(lineClassName)
    }, _react.default.createElement("path", {
      className: "rct-line-path",
      d: pathStr,
      style: lineStyle
    }));
  }

}

exports.default = LineChart;

_defineProperty(LineChart, "propTypes", {
  /**
   * Array of data objects
   */
  data: _propTypes.default.array.isRequired,

  /**
   * Accessor function for line X values, called once per datum, or a single value to be used for the entire line.
   */
  x: CustomPropTypes.valueOrAccessor,

  /**
   * Accessor function for line Y values, called once per datum, or a single value to be used for the entire line.
   */
  y: CustomPropTypes.valueOrAccessor,

  /**
   * Inline style object to be applied to the line path.
   */
  lineStyle: _propTypes.default.object,

  /**
   * Class attribute to be applied to the line path.
   */
  lineClassName: _propTypes.default.string,

  /**
   * D3 scale for X axis - provided by XYPlot.
   */
  xScale: _propTypes.default.func,

  /**
   * D3 scale for Y axis - provided by XYPlot.
   */
  yScale: _propTypes.default.func,

  /**
   * D3 curve for path generation
   */
  curve: _propTypes.default.func
});

_defineProperty(LineChart, "defaultProps", {
  lineStyle: {},
  lineClassName: "",
  curve: _d.curveLinear
});
//# sourceMappingURL=LineChart.js.map