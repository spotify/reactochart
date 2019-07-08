"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _d = require("d3");

var _lodash = _interopRequireDefault(require("lodash"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

var _util = require("./util.js");

var CustomPropTypes = _interopRequireWildcard(require("./utils/CustomPropTypes"));

var _Data = require("./utils/Data");

var _xyPropsEqual = _interopRequireDefault(require("./utils/xyPropsEqual"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * `AreaHeatmap` is still undergoing experimental changes!
 * We do not consider this chart to be production ready as it does not support categorical data.
 */
// todo support categorical data
class AreaHeatmap extends _react.default.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "onMouseEnter", e => {
      this.props.onMouseEnter(e);
    });

    _defineProperty(this, "onMouseLeave", e => {
      this.props.onMouseLeave(e);
    });

    _defineProperty(this, "onMouseMove", e => {
      const {
        xScale,
        yScale,
        onMouseMove
      } = this.props;
      if (!_lodash.default.isFunction(onMouseMove)) return;
      const boundBox = this.refs.background.getBoundingClientRect();
      if (!boundBox) return;
      const [x, y] = [e.clientX - (boundBox.left || 0), e.clientY - (boundBox.top || 0)];
      const [xVal, yVal] = [xScale.invert(x), yScale.invert(y)];
      onMouseMove(e, {
        xVal,
        yVal
      });
    });
  }

  static getDomain(props) {
    const {
      data,
      x,
      xEnd,
      y,
      yEnd
    } = props;
    return {
      x: (0, _d.extent)(_lodash.default.flatten([data.map((0, _Data.makeAccessor2)(x)), data.map((0, _Data.makeAccessor2)(xEnd))])),
      y: (0, _d.extent)(_lodash.default.flatten([data.map((0, _Data.makeAccessor2)(y)), data.map((0, _Data.makeAccessor2)(yEnd))]))
    };
  }

  shouldComponentUpdate(nextProps) {
    const shouldUpdate = !(0, _xyPropsEqual.default)(this.props, nextProps, ["rectStyle"]);
    return shouldUpdate;
  }

  render() {
    const {
      data,
      area,
      x,
      xEnd,
      y,
      yEnd,
      xScale,
      yScale,
      scaleWidth,
      scaleHeight,
      rectClassName,
      rectStyle
    } = this.props;
    const [areaAccessor, xAccessor, xEndAccessor, yAccessor, yEndAccessor] = [area, x, xEnd, y, yEnd].map(_Data.makeAccessor2); // to determine how many data units are represented by 1 square pixel of area,
    // find the bin that would require the highest unit-per-pixel scale if its rectangle filled the whole container

    const unitsPerPixel = this.props.unitsPerPixel || Math.max.apply(this, data.map((d, i) => {
      // ratio of this bin's area (in data units) to the entire area of its container rectangle (in pixels)
      return (0, _Data.getValue)(area, d, i) / Math.abs((xScale((0, _Data.getValue)(xEnd, d, i)) - xScale((0, _Data.getValue)(x, d, i))) * (yScale((0, _Data.getValue)(yEnd, d, i)) - yScale((0, _Data.getValue)(y, d, i))));
    }));
    const handlers = {
      onMouseMove: (0, _util.methodIfFuncProp)("onMouseMove", this.props, this),
      onMouseEnter: (0, _util.methodIfFuncProp)("onMouseEnter", this.props, this),
      onMouseLeave: (0, _util.methodIfFuncProp)("onMouseLeave", this.props, this)
    };
    return _react.default.createElement("g", _extends({
      className: "rct-area-heatmap-chart"
    }, handlers), _react.default.createElement("rect", {
      x: "0",
      y: "0",
      width: scaleWidth,
      height: scaleHeight,
      ref: "background",
      fill: "transparent"
    }), data.map((d, i) => {
      const [xVal, xEndVal, yVal, yEndVal, areaVal] = [x, xEnd, y, yEnd, area].map(getter => (0, _Data.getValue)(getter, d, i)); // full width and height of the containing rectangle

      const fullWidth = Math.abs(xScale(xEndVal) - xScale(xVal));
      const fullHeight = Math.abs(yScale(yEndVal) - yScale(yVal)); // x / y position of top left of the containing rectangle

      const fullRectX = Math.min(xScale(xEndVal), xScale(xVal));
      const fullRectY = Math.min(yScale(yEndVal), yScale(yVal)); // we know two facts:
      // 1. the (pixel) area of the rect will be the data value divided by the # of data units per pixel
      //    ie. area = height * width = areaVal / unitsPerPixel

      const pixelArea = areaVal / unitsPerPixel; // 2. all rectangles, regardless of size, have the same shape (are congruent), so the ratio
      //    of the rect's width to the full width is equal to the ratio of its height to the full height.
      //    ie. (height / fullHeight) = (width / fullWidth)
      // solve for height and width to get...

      const width = Math.sqrt(pixelArea * (fullWidth / fullHeight));
      const height = Math.sqrt(pixelArea * (fullHeight / fullWidth)); // center the data rect in the containing rectangle

      const rectX = fullRectX + (fullWidth - width) / 2;
      const rectY = fullRectY + (fullHeight - height) / 2;
      if (!_lodash.default.every([rectX, rectY, width, height], _lodash.default.isFinite)) return null;
      const className = "rct-area-heatmap-rect ".concat((0, _Data.getValue)(rectClassName, d, i));
      const style = (0, _Data.getValue)(rectStyle, d, i);
      const key = "rect-".concat(i);
      return _react.default.createElement("rect", {
        x: rectX,
        y: rectY,
        width,
        height,
        className,
        style,
        key
      });
    }));
  }

}

exports.default = AreaHeatmap;

_defineProperty(AreaHeatmap, "propTypes", {
  /**
   * Array of data objects.
   */
  data: _propTypes.default.array.isRequired,
  x: CustomPropTypes.valueOrAccessor,
  xEnd: CustomPropTypes.valueOrAccessor,
  y: CustomPropTypes.valueOrAccessor,
  yEnd: CustomPropTypes.valueOrAccessor,
  area: CustomPropTypes.valueOrAccessor,
  unitsPerPixel: _propTypes.default.number,

  /**
   * Class attribute to be applied to each rect
   * or accessor function which returns a class
   */
  rectClassName: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),

  /**
   * Inline style object to be applied to each rect,
   * or accessor function which returns a style object.
   */
  rectStyle: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.func]),

  /**
   * D3 scale for X axis - provided by XYPlot
   */
  xScale: _propTypes.default.func,

  /**
   * D3 scale for Y axis - provided by XYPlot
   */
  yScale: _propTypes.default.func
});

_defineProperty(AreaHeatmap, "defaultProps", {
  rectClassName: "",
  rectStyle: {}
});
//# sourceMappingURL=AreaHeatmap.js.map