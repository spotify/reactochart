"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _measureText = _interopRequireDefault(require("./utils/measureText"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class YAxisTitle extends _react.default.Component {
  static getMargin(props) {
    props = _lodash.default.defaults({}, props, YAxisTitle.defaultProps);
    const {
      distance,
      position,
      rotate
    } = props;
    const placement = props.placement || (position === "left" ? "before" : "after");
    const zeroMargin = {
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0
    };
    if (position === "left" && placement === "after" || position === "right" && placement === "before") return zeroMargin;
    const title = props.title || props.children;

    const style = _lodash.default.defaults(props.style, YAxisTitle.defaultProps.style);

    const measured = (0, _measureText.default)(_lodash.default.assign({
      text: title
    }, style));
    const marginValue = distance + Math.ceil(rotate ? measured.height.value : measured.width.value);
    return position === "left" ? _objectSpread({}, zeroMargin, {
      marginLeft: marginValue
    }) : _objectSpread({}, zeroMargin, {
      marginRight: marginValue
    });
  }

  render() {
    const {
      height,
      width,
      distance,
      position,
      alignment,
      style,
      spacingLeft,
      spacingRight
    } = this.props;
    const title = this.props.title || this.props.children;
    const placement = this.props.placement || (position === "left" ? "before" : "after");
    const rotate = this.props.rotate ? -90 : 0;
    const posX = position === "right" ? width + spacingRight : -spacingLeft;
    const translateX = posX + (placement === "before" ? -distance : distance);
    const translateY = alignment === "middle" ? height / 2 : alignment === "bottom" ? height : 0;
    const textAnchor = rotate && alignment === "top" ? "end" : rotate && alignment === "middle" ? "middle" : rotate && alignment === "bottom" ? "start" : placement === "before" ? "end" : "start";
    const dy = rotate && placement == "before" ? "-0.2em" : rotate ? "0.8em" : alignment === "top" ? "0.8em" : alignment === "middle" ? "0.3em" : null;
    return _react.default.createElement("g", {
      transform: "translate(".concat(translateX, ",").concat(translateY, ")")
    }, _react.default.createElement("text", {
      style: _objectSpread({}, style, {
        textAnchor
      }),
      transform: "rotate(".concat(rotate, ")"),
      dy: dy
    }, title));
  }

}

exports.default = YAxisTitle;

_defineProperty(YAxisTitle, "propTypes", {
  height: _propTypes.default.number,
  width: _propTypes.default.number,

  /**
   * Title distance from Y Axis
   */
  distance: _propTypes.default.number,

  /**
   * Position of title in regards to the y axis. Accepted options are "left" or "right"
   */
  position: _propTypes.default.oneOf(["left", "right"]),
  alignment: _propTypes.default.oneOf(["top", "middle", "bottom"]),

  /**
   * Placement of title in regards to the y axis. Accepted options are "before" or "after"
   */
  placement: _propTypes.default.oneOf(["before", "after"]),
  rotate: _propTypes.default.bool,

  /**
   * Object declaring styles for label.
   *
   * Disclaimer: style will merge its defaults with the given style prop
   * in order to ensure that our collision library measureText is able to calculate the
   * smallest amount of possible collisions along the axis. It's therefore dependent on
   * fontFamily, size and fontStyle to always be passed in. If you're looking to have a centralized
   * stylesheet, we suggest creating a styled title component that wraps YAxisTitle with your preferred styles.
   */
  style: _propTypes.default.object,

  /**
   * Spacing - provided by XYPlot
   */
  spacingLeft: _propTypes.default.number,

  /**
   * Spacing - provided by XYPlot
   */
  spacingRight: _propTypes.default.number
});

_defineProperty(YAxisTitle, "defaultProps", {
  height: 250,
  width: 400,
  distance: 5,
  position: "left",
  alignment: "middle",
  placement: undefined,
  rotate: true,
  style: {
    fontFamily: "Helvetica, sans-serif",
    fontSize: "24px",
    fontWeight: "bold",
    lineHeight: 1
  },
  spacingLeft: 0,
  spacingRight: 0
});
//# sourceMappingURL=YAxisTitle.js.map