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

    return _possibleConstructorReturn(this, Object.getPrototypeOf(TreeMapNode).apply(this, arguments));
  }

  _createClass(TreeMapNode, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props;
      var node = _props.node;
      var getLabel = _props.getLabel;
      var nodeStyle = _props.nodeStyle;
      var labelStyle = _props.labelStyle;
      var minLabelWidth = _props.minLabelWidth;
      var minLabelHeight = _props.minLabelHeight;
      var NodeLabelComponent = _props.NodeLabelComponent;
      var parentNames = _props.parentNames;
      var x = node.x;
      var y = node.y;
      var dx = node.dx;
      var dy = node.dy;
      var depth = node.depth;
      var parent = node.parent;


      var nodeGroupClass = parent ? 'node-group-' + _lodash2.default.kebabCase(parent.name) + ' node-group-i-' + parentNames.indexOf(parent.name) : '';
      var className = 'tree-map-node node-depth-' + depth + ' ' + nodeGroupClass;

      var style = { position: 'absolute', width: dx, height: dy, top: y, left: x, transition: "all .2s" };
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

    return _possibleConstructorReturn(this, Object.getPrototypeOf(TreeMapNodeLabel).apply(this, arguments));
  }

  _createClass(TreeMapNodeLabel, [{
    key: 'render',
    value: function render() {
      var _props2 = this.props;
      var node = _props2.node;
      var getLabel = _props2.getLabel;
      var labelStyle = _props2.labelStyle;
      var x = node.x;
      var y = node.y;
      var dx = node.dx;
      var dy = node.dy;


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

    return _possibleConstructorReturn(this, Object.getPrototypeOf(TreeMap).apply(this, arguments));
  }

  _createClass(TreeMap, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      // initialize the layout function
      this._treemap = initTreemapLayout(this.props);
      // clone the data because d3 mutates it!
      this._data = _lodash2.default.cloneDeep(this.props.data);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(newProps) {
      var _props3 = this.props;
      var width = _props3.width;
      var height = _props3.height;
      var data = _props3.data;
      var sticky = _props3.sticky;

      //if height, width, or the data changes, or if the treemap is not sticky, re-initialize the layout function
      // if(!sticky || width != newProps.width || height != newProps.height || JSON.stringify(data) != JSON.stringify(newProps.data))
      // {
      this._data = _lodash2.default.cloneDeep(newProps.data);
      this._treemap = initTreemapLayout(newProps);
      //}
    }
  }, {
    key: 'render',
    value: function render() {
      var _props4 = this.props;
      var width = _props4.width;
      var height = _props4.height;
      var nodeStyle = _props4.nodeStyle;
      var labelStyle = _props4.labelStyle;
      var getLabel = _props4.getLabel;
      var minLabelWidth = _props4.minLabelWidth;
      var minLabelHeight = _props4.minLabelHeight;
      var onClickNode = _props4.onClickNode;
      var onMouseEnterNode = _props4.onMouseEnterNode;
      var onMouseLeaveNode = _props4.onMouseLeaveNode;
      var onMouseMoveNode = _props4.onMouseMoveNode;
      var NodeComponent = _props4.NodeComponent;
      var NodeLabelComponent = _props4.NodeLabelComponent;
      var getValue = _props4.getValue;

      // run the layout function with our data to create treemap layout

      var nodes = this._treemap.value((0, _Data.makeAccessor)(getValue)).nodes(this._data);

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
  var width = options.width;
  var height = options.height;
  var getValue = options.getValue;
  var getChildren = options.getChildren;
  var sort = options.sort;
  var padding = options.padding;
  var round = options.round;
  var sticky = options.sticky;
  var mode = options.mode;
  var ratio = options.ratio;


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