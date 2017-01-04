'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d3Hierarchy = require('d3-hierarchy');

var _Data = require('./utils/Data');

var _CustomPropTypes = require('./utils/CustomPropTypes');

var CustomPropTypes = _interopRequireWildcard(_CustomPropTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PropTypes = _react2.default.PropTypes;

var TreeMapNode = function (_React$Component) {
  _inherits(TreeMapNode, _React$Component);

  function TreeMapNode() {
    _classCallCheck(this, TreeMapNode);

    return _possibleConstructorReturn(this, (TreeMapNode.__proto__ || Object.getPrototypeOf(TreeMapNode)).apply(this, arguments));
  }

  _createClass(TreeMapNode, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          node = _props.node,
          getLabel = _props.getLabel,
          nodeStyle = _props.nodeStyle,
          labelStyle = _props.labelStyle,
          minLabelWidth = _props.minLabelWidth,
          minLabelHeight = _props.minLabelHeight,
          NodeLabelComponent = _props.NodeLabelComponent,
          parentNames = _props.parentNames;
      var depth = node.depth,
          parent = node.parent,
          x0 = node.x0,
          y0 = node.y0,
          x1 = node.x1,
          y1 = node.y1;


      var nodeGroupClass = parent ? 'node-group-' + _lodash2.default.kebabCase(parent.name) + ' node-group-i-' + parentNames.indexOf(parent.name) : '';
      var className = 'tree-map-node node-depth-' + depth + ' ' + nodeGroupClass;

      var style = { position: 'absolute', width: x1 - x0, height: y1 - y0, top: y0, left: x0, transition: "all .2s" };
      var customStyle = _lodash2.default.isFunction(nodeStyle) ? nodeStyle(node.data) : _lodash2.default.isObject(nodeStyle) ? nodeStyle : {};
      _lodash2.default.assign(style, customStyle);

      var handlers = ['onClick', 'onMouseEnter', 'onMouseLeave', 'onMouseMove'].reduce(function (handlers, eventName) {
        var handler = _this2.props[eventName + 'Node'];
        if (handler) handlers[eventName] = handler.bind(null, node);
        return handlers;
      }, {});

      return _react2.default.createElement(
        'div',
        _extends({ className: className, style: style }, handlers),
        x1 - x0 > minLabelWidth && y1 - y0 > minLabelHeight ? // show label if node is big enough
        _react2.default.createElement(NodeLabelComponent, { node: node, getLabel: getLabel, labelStyle: labelStyle }) : null
      );
    }
  }]);

  return TreeMapNode;
}(_react2.default.Component);

TreeMapNode.propTypes = {
  node: PropTypes.shape({
    parent: PropTypes.object,
    children: PropTypes.array,
    value: PropTypes.number,
    depth: PropTypes.number,
    x: PropTypes.number,
    y: PropTypes.number,
    dx: PropTypes.number,
    dy: PropTypes.number
  }),
  nodeStyle: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  minLabelWidth: PropTypes.number,
  minLabelHeight: PropTypes.number,

  getLabel: CustomPropTypes.getter,
  labelStyle: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  NodeLabelComponent: PropTypes.func
};
TreeMapNode.defaultProps = {
  minLabelWidth: 0,
  minLabelHeight: 0
};

var TreeMapNodeLabel = function (_React$Component2) {
  _inherits(TreeMapNodeLabel, _React$Component2);

  function TreeMapNodeLabel() {
    _classCallCheck(this, TreeMapNodeLabel);

    return _possibleConstructorReturn(this, (TreeMapNodeLabel.__proto__ || Object.getPrototypeOf(TreeMapNodeLabel)).apply(this, arguments));
  }

  _createClass(TreeMapNodeLabel, [{
    key: 'render',
    value: function render() {
      var _props2 = this.props,
          node = _props2.node,
          getLabel = _props2.getLabel,
          labelStyle = _props2.labelStyle;
      var x1 = node.x1,
          x0 = node.x0;

      var style = { width: x1 - x0 };
      var customStyle = _lodash2.default.isFunction(labelStyle) ? labelStyle(node) : _lodash2.default.isObject(labelStyle) ? labelStyle : {};
      _lodash2.default.assign(style, customStyle);

      return _react2.default.createElement(
        'div',
        _extends({ className: 'node-label' }, { style: style }),
        (0, _Data.makeAccessor)(getLabel)(node.data)
      );
    }
  }]);

  return TreeMapNodeLabel;
}(_react2.default.Component);

TreeMapNodeLabel.propTypes = {
  node: PropTypes.object,
  getLabel: CustomPropTypes.getter,
  labelStyle: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  minLabelWidth: PropTypes.number,
  minLabelHeight: PropTypes.number
};

var TreeMap = function (_React$Component3) {
  _inherits(TreeMap, _React$Component3);

  function TreeMap() {
    _classCallCheck(this, TreeMap);

    return _possibleConstructorReturn(this, (TreeMap.__proto__ || Object.getPrototypeOf(TreeMap)).apply(this, arguments));
  }

  _createClass(TreeMap, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      var data = this.props.data;
      // initialize the layout function

      this._tree = getTree(this.props);
      // clone the data because d3 mutates it!
      this._rootNode = getRootNode(_lodash2.default.cloneDeep(data), this.props);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(newProps) {
      var _props3 = this.props,
          width = _props3.width,
          height = _props3.height,
          data = _props3.data,
          sticky = _props3.sticky;

      // if height, width, or the data changes, or if the treemap is not sticky, re-initialize the layout function

      if (!sticky || width != newProps.width || height != newProps.height || JSON.stringify(data) != JSON.stringify(newProps.data)) {
        this._tree = getTree(newProps);
        this._rootNode = getRootNode(_lodash2.default.cloneDeep(newProps.data), this.props);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props4 = this.props,
          width = _props4.width,
          height = _props4.height,
          nodeStyle = _props4.nodeStyle,
          labelStyle = _props4.labelStyle,
          getLabel = _props4.getLabel,
          minLabelWidth = _props4.minLabelWidth,
          minLabelHeight = _props4.minLabelHeight,
          onClickNode = _props4.onClickNode,
          onMouseEnterNode = _props4.onMouseEnterNode,
          onMouseLeaveNode = _props4.onMouseLeaveNode,
          onMouseMoveNode = _props4.onMouseMoveNode,
          NodeComponent = _props4.NodeComponent,
          NodeLabelComponent = _props4.NodeLabelComponent,
          getValue = _props4.getValue;


      var nodes = initTreemap(this._rootNode, this._tree, this.props);

      var style = { position: 'relative', width: width, height: height };

      var parentNames = _lodash2.default.uniq(_lodash2.default.map(nodes, 'parent.name'));

      return _react2.default.createElement(
        'div',
        _extends({ className: 'tree-map' }, { style: style }),
        nodes.map(function (node, i) {
          return _react2.default.createElement(NodeComponent, {
            node: node, nodeStyle: nodeStyle, minLabelWidth: minLabelWidth, minLabelHeight: minLabelHeight, labelStyle: labelStyle, getLabel: getLabel, parentNames: parentNames,
            NodeLabelComponent: NodeLabelComponent, onClickNode: onClickNode, onMouseEnterNode: onMouseEnterNode, onMouseLeaveNode: onMouseLeaveNode, onMouseMoveNode: onMouseMoveNode,
            key: 'node-' + i
          });
        })
      );
    }
  }]);

  return TreeMap;
}(_react2.default.Component);

TreeMap.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,

  data: PropTypes.object.isRequired,
  getValue: CustomPropTypes.getter,
  getChildren: CustomPropTypes.getter,
  getLabel: CustomPropTypes.getter,

  // options for d3 treemap layout - see d3 docs
  sort: PropTypes.func,
  padding: PropTypes.number,
  round: PropTypes.bool,
  sticky: PropTypes.bool,
  mode: PropTypes.string,
  ratio: PropTypes.number,

  nodeStyle: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  labelStyle: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  minLabelWidth: PropTypes.number,
  minLabelHeight: PropTypes.number,

  onClickNode: PropTypes.func,
  onMouseEnterNode: PropTypes.func,
  onMouseLeaveNode: PropTypes.func,
  onMouseMoveNode: PropTypes.func,

  NodeComponent: PropTypes.func,
  NodeLabelComponent: PropTypes.func
};
TreeMap.defaultProps = {
  getValue: 'value',
  getChildren: 'children',
  getLabel: 'name',
  minLabelWidth: 0,
  minLabelHeight: 0,
  NodeComponent: TreeMapNode,
  NodeLabelComponent: TreeMapNodeLabel
};


function getRootNode(data, options) {
  var getChildren = options.getChildren;

  return (0, _d3Hierarchy.hierarchy)(data, (0, _Data.makeAccessor)(getChildren));
}

function getTree(options) {
  var width = options.width,
      height = options.height,
      ratio = options.ratio,
      round = options.round,
      padding = options.padding;

  var tiling = !_lodash2.default.isUndefined(ratio) ? _d3Hierarchy.treemapResquarify.ratio(ratio) : _d3Hierarchy.treemapResquarify;
  var tree = (0, _d3Hierarchy.treemap)().tile(tiling).size([width, height]);
  if (!_lodash2.default.isUndefined(padding)) tree.padding(padding);
  if (!_lodash2.default.isUndefined(round)) tree.round(round);
  return tree;
}

function initTreemap(rootNode, tree, options) {
  // create a d3 treemap layout function,
  // and configure it with the given options
  var getValue = options.getValue,
      sort = options.sort;

  rootNode.sum(function (d) {
    return d[getValue] || 0;
  });
  if (!_lodash2.default.isUndefined(sort)) rootNode.sort(sort);
  return tree(rootNode).descendants();
}

exports.default = TreeMap;