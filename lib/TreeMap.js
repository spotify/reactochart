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

var _d = require('d3');

var _d2 = _interopRequireDefault(_d);

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
      var x = node.x,
          y = node.y,
          dx = node.dx,
          dy = node.dy,
          depth = node.depth,
          parent = node.parent;


      var nodeGroupClass = parent ? 'node-group-' + _lodash2.default.kebabCase(parent.name) + ' node-group-i-' + parentNames.indexOf(parent.name) : '';
      var className = 'tree-map-node node-depth-' + depth + ' ' + nodeGroupClass;

      var style = { position: 'absolute', width: dx, height: dy, top: y, left: x };
      var customStyle = _lodash2.default.isFunction(nodeStyle) ? nodeStyle(node) : _lodash2.default.isObject(nodeStyle) ? nodeStyle : {};
      _lodash2.default.assign(style, customStyle);

      var handlers = ['onClick', 'onMouseEnter', 'onMouseLeave', 'onMouseMove'].reduce(function (handlers, eventName) {
        var handler = _this2.props[eventName + 'Node'];
        if (handler) handlers[eventName] = handler.bind(null, node);
        return handlers;
      }, {});

      return _react2.default.createElement(
        'div',
        _extends({ className: className, style: style }, handlers),
        dx > minLabelWidth && dy > minLabelHeight ? // show label if node is big enough
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
      var x = node.x,
          y = node.y,
          dx = node.dx,
          dy = node.dy;


      var style = { width: dx };
      var customStyle = _lodash2.default.isFunction(labelStyle) ? labelStyle(node) : _lodash2.default.isObject(labelStyle) ? labelStyle : {};
      _lodash2.default.assign(style, customStyle);

      return _react2.default.createElement(
        'div',
        _extends({ className: 'node-label' }, { style: style }),
        (0, _Data.makeAccessor)(getLabel)(node)
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
    key: 'render',
    value: function render() {
      var _props3 = this.props,
          width = _props3.width,
          height = _props3.height,
          nodeStyle = _props3.nodeStyle,
          labelStyle = _props3.labelStyle,
          getLabel = _props3.getLabel,
          minLabelWidth = _props3.minLabelWidth,
          minLabelHeight = _props3.minLabelHeight,
          onClickNode = _props3.onClickNode,
          onMouseEnterNode = _props3.onMouseEnterNode,
          onMouseLeaveNode = _props3.onMouseLeaveNode,
          onMouseMoveNode = _props3.onMouseMoveNode,
          NodeComponent = _props3.NodeComponent,
          NodeLabelComponent = _props3.NodeLabelComponent;

      // clone the data because d3 mutates it!

      var data = _lodash2.default.cloneDeep(this.props.data);
      // initialize the layout function
      var treemap = initTreemapLayout(this.props);
      // run the layout function with our data to create treemap layout
      var nodes = treemap.nodes(data);

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


function initTreemapLayout(options) {
  // create a d3 treemap layout function,
  // and configure it with the given options
  var width = options.width,
      height = options.height,
      getValue = options.getValue,
      getChildren = options.getChildren,
      sort = options.sort,
      padding = options.padding,
      round = options.round,
      sticky = options.sticky,
      mode = options.mode,
      ratio = options.ratio;


  var treemap = _d2.default.layout.treemap().size([width, height]).value((0, _Data.makeAccessor)(getValue));

  if (!_lodash2.default.isUndefined(getChildren)) treemap.children((0, _Data.makeAccessor)(getChildren));
  if (!_lodash2.default.isUndefined(sort)) treemap.sort(sort);
  if (!_lodash2.default.isUndefined(padding)) treemap.padding(padding);
  if (!_lodash2.default.isUndefined(round)) treemap.round(round);
  if (!_lodash2.default.isUndefined(sticky)) treemap.sticky(sticky);
  if (!_lodash2.default.isUndefined(mode)) treemap.mode(mode);
  if (!_lodash2.default.isUndefined(ratio)) treemap.ratio(ratio);

  return treemap;
}

exports.default = TreeMap;