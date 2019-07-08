"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _lodash = _interopRequireDefault(require("lodash"));

var _measureText = _interopRequireDefault(require("./utils/measureText"));

var _propTypes = _interopRequireDefault(require("prop-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class XAxisTitle extends _react.default.Component {
  static getMargin(props) {
    props = _lodash.default.defaults({}, props, XAxisTitle.defaultProps);
    const {
      distance,
      position,
      rotate
    } = props;
    const placement = props.placement || (position === "bottom" ? "below" : "above");
    const zeroMargin = {
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0
    };
    if (position === "bottom" && placement === "above" || position === "top" && placement === "below") return zeroMargin;
    const title = props.title || props.children;

    const style = _lodash.default.defaults(props.style, XAxisTitle.defaultProps.style);

    const measured = (0, _measureText.default)(_lodash.default.assign({
      text: title
    }, style));
    const marginValue = distance + Math.ceil(rotate ? measured.width.value : measured.height.value);
    return position === "bottom" ? _objectSpread({}, zeroMargin, {
      marginBottom: marginValue
    }) : _objectSpread({}, zeroMargin, {
      marginTop: marginValue
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
      spacingTop,
      spacingBottom
    } = this.props;
    const title = this.props.title || this.props.children;
    const placement = this.props.placement || (position === "bottom" ? "below" : "above");
    const rotate = this.props.rotate ? -90 : 0;
    const posY = position === "bottom" ? height + spacingBottom : -spacingTop;
    const translateY = posY + (placement === "above" ? -distance : distance);
    const translateX = alignment === "center" ? width / 2 : alignment === "right" ? width : 0;
    const textAnchor = rotate && placement === "above" ? "start" : rotate && placement === "below" ? "end" : alignment === "left" ? "start" : alignment === "right" ? "end" : "middle";
    const dy = rotate && alignment === "right" ? "-0.2em" : rotate && alignment === "center" ? "0.3em" : rotate ? "0.8em" : placement === "below" ? "0.8em" : "-0.2em";
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

exports.default = XAxisTitle;

_defineProperty(XAxisTitle, "propTypes", {
  height: _propTypes.default.number,
  width: _propTypes.default.number,

  /**
   * Title distance from X Axis
   */
  distance: _propTypes.default.number,

  /**
   * Position of title in regards to the x axis. Accepted options are "top" or "bottom"
   */
  position: _propTypes.default.oneOf(["top", "bottom"]),

  /**
   * Placement of title in regards to the x axis. Accepted options are "above" or "below"
   */
  placement: _propTypes.default.oneOf(["above", "below"]),
  alignment: _propTypes.default.oneOf(["left", "center", "right"]),
  rotate: _propTypes.default.bool,

  /**
   * Object declaring styles for label.
   *
   * Disclaimer: labelStyle will merge its defaults with the given labelStyle prop
   * in order to ensure that our collision library measureText is able to calculate the
   * smallest amount of possible collisions along the axis. It's therefore dependent on
   * fontFamily, size and fontStyle to always be passed in. If you're looking to have a centralized
   * stylesheet, we suggest creating a styled title component that wraps XAxisTitle with your preferred styles.
   */
  style: _propTypes.default.object,

  /**
   * Spacing - provided by XYPlot
   */
  spacingTop: _propTypes.default.number,

  /**
   * Spacing - provided by XYPlot
   */
  spacingBottom: _propTypes.default.number
});

_defineProperty(XAxisTitle, "defaultProps", {
  height: 250,
  width: 400,
  distance: 5,
  position: "bottom",
  placement: undefined,
  alignment: "center",
  rotate: false,
  style: {
    fontFamily: "Helvetica, sans-serif",
    fontSize: "24px",
    fontWeight: "bold",
    lineHeight: 1
  },
  spacingTop: 0,
  spacingBottom: 0
});
//# sourceMappingURL=XAxisTitle.js.map