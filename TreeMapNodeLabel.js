"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

var CustomPropTypes = _interopRequireWildcard(require("./utils/CustomPropTypes"));

var _Data = require("./utils/Data");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

const TreeMapNodeLabel = props => {
  const {
    node,
    getLabel,
    labelStyle
  } = props;
  const {
    x1,
    x0
  } = node;
  let style = {
    width: x1 - x0
  };
  const customStyle = _lodash.default.isFunction(labelStyle) ? labelStyle(node) : _lodash.default.isObject(labelStyle) ? labelStyle : {};

  _lodash.default.assign(style, customStyle);

  return _react.default.createElement("div", _extends({
    className: "rct-node-label"
  }, {
    style
  }), (0, _Data.makeAccessor)(getLabel)(node));
};

TreeMapNodeLabel.propTypes = {
  node: _propTypes.default.object,
  getLabel: CustomPropTypes.getter,
  labelStyle: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object]),
  minLabelWidth: _propTypes.default.number,
  minLabelHeight: _propTypes.default.number
};
var _default = TreeMapNodeLabel;
exports.default = _default;
//# sourceMappingURL=TreeMapNodeLabel.js.map