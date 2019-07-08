"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

var CustomPropTypes = _interopRequireWildcard(require("./utils/CustomPropTypes"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

const TreeMapNode = props => {
  const {
    node,
    getLabel,
    nodeStyle,
    labelStyle,
    minLabelWidth,
    minLabelHeight,
    NodeLabelComponent,
    parentNames
  } = props;
  const {
    depth,
    parent,
    x0,
    y0,
    x1,
    y1
  } = node;

  var parentName = _lodash.default.get(parent, "data.name");

  const nodeGroupClass = parent ? "node-group-".concat(_lodash.default.kebabCase(parentName), " node-group-i-").concat(parentNames.indexOf(parentName)) : "";
  const className = "rct-tree-map-node node-depth-".concat(depth, " ").concat(nodeGroupClass);
  let style = {
    position: "absolute",
    width: x1 - x0,
    height: y1 - y0,
    top: y0,
    left: x0,
    transition: "all .2s"
  };
  const customStyle = _lodash.default.isFunction(nodeStyle) ? nodeStyle(node) : _lodash.default.isObject(nodeStyle) ? nodeStyle : {};

  _lodash.default.assign(style, customStyle);

  let handlers = ["onClick", "onMouseEnter", "onMouseLeave", "onMouseMove"].reduce((handlers, eventName) => {
    const handler = props["".concat(eventName, "Node")];
    if (handler) handlers[eventName] = handler.bind(null, node);
    return handlers;
  }, {});
  return _react.default.createElement("div", _extends({
    className,
    style
  }, handlers), x1 - x0 > minLabelWidth && y1 - y0 > minLabelHeight ? // show label if node is big enough
  _react.default.createElement(NodeLabelComponent, {
    node,
    getLabel,
    labelStyle
  }) : null);
};

TreeMapNode.propTypes = {
  node: _propTypes.default.shape({
    parent: _propTypes.default.object,
    children: _propTypes.default.array,
    value: _propTypes.default.number,
    depth: _propTypes.default.number,
    x: _propTypes.default.number,
    y: _propTypes.default.number,
    dx: _propTypes.default.number,
    dy: _propTypes.default.number
  }),
  nodeStyle: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object]),
  minLabelWidth: _propTypes.default.number,
  minLabelHeight: _propTypes.default.number,
  getLabel: CustomPropTypes.getter,
  labelStyle: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object]),
  NodeLabelComponent: _propTypes.default.func
};
TreeMapNode.defaultProps = {
  minLabelWidth: 0,
  minLabelHeight: 0
};
var _default = TreeMapNode;
exports.default = _default;
//# sourceMappingURL=TreeMapNode.js.map