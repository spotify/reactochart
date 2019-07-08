"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _d3Hierarchy = require("d3-hierarchy");

var _lodash = _interopRequireDefault(require("lodash"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

var CustomPropTypes = _interopRequireWildcard(require("./utils/CustomPropTypes"));

var _Data = require("./utils/Data");

var _TreeMapNode = _interopRequireDefault(require("./TreeMapNode"));

var _TreeMapNodeLabel = _interopRequireDefault(require("./TreeMapNodeLabel"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * `TreeMap` displays hierarchical data where a leaf node's rectangle has an area proportional to a specified dimension of the data.
 */
class TreeMap extends _react.default.Component {
  componentWillMount() {
    const {
      data
    } = this.props; // initialize the layout function

    this._tree = getTree(this.props); // clone the data because d3 mutates it!

    this._rootNode = getRootNode(_lodash.default.cloneDeep(data), this.props);
  }

  componentWillReceiveProps(newProps) {
    const {
      width,
      height,
      data,
      sticky
    } = this.props; // if height, width, or the data changes, or if the treemap is not sticky, re-initialize the layout function
    // todo reevaluate this logic

    if (!sticky || width != newProps.width || height != newProps.height || JSON.stringify(data) != JSON.stringify(newProps.data)) {
      this._tree = getTree(newProps);
      this._rootNode = getRootNode(_lodash.default.cloneDeep(newProps.data), this.props);
    }
  }

  render() {
    const {
      width,
      height,
      nodeStyle,
      labelStyle,
      getLabel,
      minLabelWidth,
      minLabelHeight,
      onClickNode,
      onMouseEnterNode,
      onMouseLeaveNode,
      onMouseMoveNode,
      NodeComponent,
      NodeLabelComponent
    } = this.props;
    const nodes = initTreemap(this._rootNode, this._tree, this.props);
    const style = {
      position: "relative",
      width,
      height
    };

    const parentNames = _lodash.default.uniq(_lodash.default.map(nodes, "parent.data.name"));

    return _react.default.createElement("div", _extends({
      className: "rct-tree-map"
    }, {
      style
    }), nodes.map((node, i) => _react.default.createElement(NodeComponent, {
      node,
      nodeStyle,
      minLabelWidth,
      minLabelHeight,
      labelStyle,
      getLabel,
      parentNames,
      NodeLabelComponent,
      onClickNode,
      onMouseEnterNode,
      onMouseLeaveNode,
      onMouseMoveNode,
      key: "node-".concat(i)
    })));
  }

}

_defineProperty(TreeMap, "propTypes", {
  width: _propTypes.default.number.isRequired,
  height: _propTypes.default.number.isRequired,
  data: _propTypes.default.object.isRequired,

  /**
   * Key or accessor to retrieve value of data point
   */
  getValue: CustomPropTypes.getter,

  /**
   * Key or accessor to retrieve children of data point
   */
  getChildren: CustomPropTypes.getter,

  /**
   * Key or accessor to retrieve label for given Node
   */
  getLabel: CustomPropTypes.getter,

  /**
   * Function passed in to sort nodes
   */
  sort: _propTypes.default.func,
  // options for d3 treemap layout - see d3 docs

  /**
   * See d3 docs for treemap - Adds outer and inner padding to tree
   */
  padding: _propTypes.default.number,

  /**
   * See d3 docs for treemap - Enables or disables rounding
   */
  round: _propTypes.default.bool,

  /**
   * If sticky, on data change the TreeMap will not force a recreation of the tree and animate data changes.
   * Otherwise we recreate the tree given its new props
   */
  sticky: _propTypes.default.bool,

  /**
   * Sets the desired aspect ratio of the generated rectangles
   */
  ratio: _propTypes.default.number,

  /**
   * Inline style object applied to each Node,
   * or accessor function which returns a style object
   */
  nodeStyle: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object]),

  /**
   * Inline style object applied to each Label,
   * or accessor function which returns a style object
   */
  labelStyle: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object]),
  minLabelWidth: _propTypes.default.number,
  minLabelHeight: _propTypes.default.number,

  /**
   * `onClick` event handler callback, called when user clicks a NodeComponent.
   */
  onClickNode: _propTypes.default.func,

  /**
   * `mouseenter` event handler callback, called when user's mouse enters a NodeComponent.
   */
  onMouseEnterNode: _propTypes.default.func,

  /**
   * `mouseleave` event handler callback, called when user's mouse leaves a NodeComponent.
   */
  onMouseLeaveNode: _propTypes.default.func,

  /**
   * `mousemove` event handler callback, called when user's mouse moves within a NodeComponent.
   */
  onMouseMoveNode: _propTypes.default.func,

  /**
   * Optional treemap node, otherwise we default to our TreeMapNode component
   */
  NodeComponent: _propTypes.default.func,

  /**
   * Optional treemap node label, otherwise we default to our TreeMapNodeLabel component
   */
  NodeLabelComponent: _propTypes.default.func
});

_defineProperty(TreeMap, "defaultProps", {
  getValue: "value",
  getChildren: "children",
  getLabel: "name",
  minLabelWidth: 0,
  minLabelHeight: 0,
  NodeComponent: _TreeMapNode.default,
  NodeLabelComponent: _TreeMapNodeLabel.default
});

function getRootNode(data, options) {
  const {
    getChildren
  } = options;
  return (0, _d3Hierarchy.hierarchy)(data, (0, _Data.makeAccessor)(getChildren));
}

function getTree(options) {
  const {
    width,
    height,
    ratio,
    round,
    padding
  } = options;
  const tiling = !_lodash.default.isUndefined(ratio) ? _d3Hierarchy.treemapResquarify.ratio(ratio) : _d3Hierarchy.treemapResquarify;
  const tree = (0, _d3Hierarchy.treemap)().tile(tiling).size([width, height]);
  if (!_lodash.default.isUndefined(padding)) tree.paddingOuter(padding);
  if (!_lodash.default.isUndefined(round)) tree.round(round);
  return tree;
}

function initTreemap(rootNode, tree, options) {
  // create a d3 treemap layout function,
  // and configure it with the given options
  const {
    getValue,
    sort
  } = options;
  const treeRoot = rootNode.sum(d => {
    if (_lodash.default.isFunction(getValue)) return getValue(d);else if (_lodash.default.isString(getValue)) return d[getValue];else return 0;
  });
  return tree(sort ? treeRoot.sort(sort) : treeRoot).descendants();
}

var _default = TreeMap;
exports.default = _default;
//# sourceMappingURL=TreeMap.js.map