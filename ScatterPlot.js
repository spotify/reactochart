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

var _xyPropsEqual = _interopRequireDefault(require("./utils/xyPropsEqual"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * `ScatterPlot` displays its data as a collection of points. Each point represents
 * the relationship between two variables, one plotted along the x-axis and the other on the y-axis.
 */
class ScatterPlot extends _react.default.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "onMouseEnterPoint", (e, d) => {
      this.props.onMouseEnterPoint(e, d);
    });

    _defineProperty(this, "onMouseMovePoint", (e, d) => {
      this.props.onMouseMovePoint(e, d);
    });

    _defineProperty(this, "onMouseLeavePoint", (e, d) => {
      this.props.onMouseLeavePoint(e, d);
    });

    _defineProperty(this, "renderPoint", (d, i) => {
      const [onMouseEnter, onMouseMove, onMouseLeave] = ["onMouseEnterPoint", "onMouseMovePoint", "onMouseLeavePoint"].map(eventName => {
        // partially apply this bar's data point as 2nd callback argument
        const callback = (0, _util.methodIfFuncProp)(eventName, this.props, this);
        return _lodash.default.isFunction(callback) ? _lodash.default.partial(callback, _lodash.default, d) : null;
      });
      const {
        xScale,
        yScale,
        x,
        y,
        pointRadius,
        pointOffset,
        pointStyle,
        pointClassName
      } = this.props;
      let {
        pointSymbol
      } = this.props;
      const className = "rct-chart-scatterplot-point ".concat((0, _Data.getValue)(pointClassName, d, i));
      const style = (0, _Data.getValue)(pointStyle, d, i);
      let symbolProps = {
        className,
        onMouseEnter,
        onMouseMove,
        onMouseLeave,
        key: "scatter-point-".concat(i)
      }; // resolve symbol-generating functions into real symbols

      if (_lodash.default.isFunction(pointSymbol)) pointSymbol = pointSymbol(d, i); // wrap string/number symbols in <text> container

      if (_lodash.default.isString(pointSymbol) || _lodash.default.isNumber(pointSymbol)) pointSymbol = _react.default.createElement("text", null, pointSymbol); // use props.pointRadius for circle radius

      if (pointSymbol.type === "circle" && _lodash.default.isUndefined(pointSymbol.props.r)) symbolProps.r = pointRadius; // x,y coords of center of symbol

      const cx = xScale((0, _Data.getValue)(x, d, i)) + pointOffset[0];
      const cy = yScale((0, _Data.getValue)(y, d, i)) + pointOffset[1]; // set positioning attributes based on symbol type

      if (pointSymbol.type === "circle" || pointSymbol.type === "ellipse") {
        _lodash.default.assign(symbolProps, {
          cx,
          cy,
          style: _objectSpread({}, style)
        });
      } else if (pointSymbol.type === "text") {
        _lodash.default.assign(symbolProps, {
          x: cx,
          y: cy,
          style: _objectSpread({
            textAnchor: "middle",
            dominantBaseline: "central"
          }, style)
        });
      } else {
        _lodash.default.assign(symbolProps, {
          x: cx,
          y: cy,
          style: _objectSpread({}, style)
        });
      }

      return _react.default.cloneElement(pointSymbol, symbolProps);
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const shouldUpdate = !(0, _xyPropsEqual.default)(this.props, nextProps, ["pointStyle"]);
    return shouldUpdate;
  }

  render() {
    return _react.default.createElement("g", null, this.props.data.map(this.renderPoint));
  }

}

exports.default = ScatterPlot;

_defineProperty(ScatterPlot, "propTypes", {
  /**
   * Array of data to be plotted.
   */
  data: _propTypes.default.array.isRequired,

  /**
   * Accessor function for plot X values, called once per datum, or a single value to be used for all points.
   */
  x: CustomPropTypes.valueOrAccessor,

  /**
   * Accessor function for plot Y values, called once per datum, or a single value to be used for all points.
   */
  y: CustomPropTypes.valueOrAccessor,

  /**
   * D3 scale for X axis - provided by XYPlot.
   */
  xScale: _propTypes.default.func,

  /**
   * D3 scale for Y axis - provided by XYPlot.
   */
  yScale: _propTypes.default.func,

  /**
   * Used with the default point symbol (circle), defines the circle radius.
   */
  pointRadius: _propTypes.default.number,

  /**
   * Text or SVG node to use as custom point symbol, or function which returns text/SVG.
   */
  pointSymbol: _propTypes.default.oneOfType([_propTypes.default.node, _propTypes.default.func]),

  /**
   * Manual x and y offset applied to the point to center it, for custom point symbols which can't be auto-centered.
   */
  pointOffset: _propTypes.default.arrayOf(_propTypes.default.number),

  /**
   * Inline style object to be applied to each point,
   * or accessor function which returns a style object.
   */
  pointStyle: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.func]),

  /**
   * Class attribute to be applied to each point,
   * or accessor function which returns a class.
   */
  pointClassName: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),

  /**
   * `mouseenter` event handler callback, called when user's mouse enters a point.
   */
  onMouseEnterPoint: _propTypes.default.func,

  /**
   * `mousemove` event handler callback, called when user's mouse moves within a point.
   */
  onMouseMovePoint: _propTypes.default.func,

  /**
   * `mouseleave` event handler callback, called when user's mouse leaves a point.
   */
  onMouseLeavePoint: _propTypes.default.func
});

_defineProperty(ScatterPlot, "defaultProps", {
  pointRadius: 3,
  pointSymbol: _react.default.createElement("circle", null),
  pointOffset: [0, 0],
  pointStyle: {},
  pointClassName: ""
});
//# sourceMappingURL=ScatterPlot.js.map