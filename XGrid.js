"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _lodash = _interopRequireDefault(require("lodash"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _Scale = require("./utils/Scale");

var _XLine = _interopRequireDefault(require("./XLine"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class XGrid extends _react.default.Component {
  static getTickDomain(props) {
    if (!props.xScale) return;
    props = _lodash.default.defaults({}, props, XGrid.defaultProps);
    return {
      xTickDomain: (0, _Scale.getTickDomain)(props.xScale, props)
    };
  }

  render() {
    const {
      height,
      xScale,
      tickCount,
      lineClassName,
      lineStyle,
      spacingTop,
      spacingBottom,
      spacingLeft,
      spacingRight
    } = this.props;
    const ticks = this.props.ticks || (0, _Scale.getScaleTicks)(xScale, null, tickCount);
    const className = "rct-chart-grid-line ".concat(lineClassName || "");
    return _react.default.createElement("g", {
      className: "rct-chart-grid-x"
    }, ticks.map((tick, i) => {
      return _react.default.createElement(_XLine.default, {
        height,
        xScale,
        className,
        spacingTop,
        spacingBottom,
        spacingLeft,
        spacingRight,
        value: tick,
        style: lineStyle,
        key: "grid-x-line-".concat(i)
      });
    }));
  }

}

exports.default = XGrid;

_defineProperty(XGrid, "propTypes", {
  width: _propTypes.default.number,
  height: _propTypes.default.number,
  xScale: _propTypes.default.func,
  spacingTop: _propTypes.default.number,
  spacingBottom: _propTypes.default.number,
  spacingLeft: _propTypes.default.number,
  spacingRight: _propTypes.default.number,
  nice: _propTypes.default.bool,
  ticks: _propTypes.default.array,
  tickCount: _propTypes.default.number,
  lineClassName: _propTypes.default.string,
  lineStyle: _propTypes.default.object
});

_defineProperty(XGrid, "defaultProps", {
  nice: true,
  lineStyle: {}
});
//# sourceMappingURL=XGrid.js.map