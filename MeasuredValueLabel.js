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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class MeasuredValueLabel extends _react.default.Component {
  static getLabel(props) {
    const {
      value,
      format
    } = props;

    const style = _lodash.default.defaults(props.style, MeasuredValueLabel.defaultProps.style);

    const labelStr = format(value);
    const measured = (0, _measureText.default)(_lodash.default.assign({
      text: labelStr
    }, style));
    return {
      value: props.value,
      text: measured.text,
      height: measured.height.value,
      width: measured.width.value
    };
  }

  render() {
    const {
      value,
      format
    } = this.props;

    const passedProps = _lodash.default.omit(this.props, ["value", "format"]);

    return _react.default.createElement("text", passedProps, _react.default.Children.count(this.props.children) ? this.props.children : format(value));
  }

}

exports.default = MeasuredValueLabel;

_defineProperty(MeasuredValueLabel, "propTypes", {
  value: _propTypes.default.any
});

_defineProperty(MeasuredValueLabel, "defaultProps", {
  format: _lodash.default.identity,
  style: {
    fontFamily: "Helvetica, sans-serif",
    fontSize: "20px",
    lineHeight: 1,
    textAnchor: "middle"
  }
});
//# sourceMappingURL=MeasuredValueLabel.js.map