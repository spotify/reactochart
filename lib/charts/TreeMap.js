'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d = require('d3');

var _d2 = _interopRequireDefault(_d);

var _util = require('../util.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PropTypes = _react2.default.PropTypes;

var TreeMapNode = _react2.default.createClass({
    displayName: 'TreeMapNode',

    propTypes: {
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

        getLabel: PropTypes.func,
        labelStyle: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
        NodeLabelComponent: PropTypes.func
    },
    getDefaultProps: function getDefaultProps() {
        return {
            minLabelWidth: 0,
            minLabelHeight: 0
        };
    },
    render: function render() {
        var _this = this;

        var _props = this.props;
        var node = _props.node;
        var getLabel = _props.getLabel;
        var nodeStyle = _props.nodeStyle;
        var labelStyle = _props.labelStyle;
        var minLabelWidth = _props.minLabelWidth;
        var minLabelHeight = _props.minLabelHeight;
        var NodeLabelComponent = _props.NodeLabelComponent;
        var x = node.x;
        var y = node.y;
        var dx = node.dx;
        var dy = node.dy;
        var depth = node.depth;
        var parent = node.parent;

        var nodeGroupClass = parent ? 'node-group-' + _lodash2.default.kebabCase(parent.name) : '';
        var className = 'tree-map-node node-depth-' + depth + ' ' + nodeGroupClass;

        var style = { position: 'absolute', width: dx, height: dy, top: y, left: x };
        var customStyle = _lodash2.default.isFunction(nodeStyle) ? nodeStyle(node) : _lodash2.default.isObject(nodeStyle) ? nodeStyle : {};
        _lodash2.default.assign(style, customStyle);

        var handlers = ['onClick', 'onMouseEnter', 'onMouseLeave', 'onMouseMove'].reduce(function (handlers, eventName) {
            var handler = _this.props[eventName + 'Node'];
            if (handler) handlers[eventName] = handler.bind(null, node);
            return handlers;
        }, {});

        return _react2.default.createElement(
            'div',
            _extends({ className: className, style: style }, handlers, {
                __source: {
                    fileName: '../../../src/charts/TreeMap.js',
                    lineNumber: 50
                }
            }),
            dx > minLabelWidth && dy > minLabelHeight ? // show label if node is big enough
            _react2.default.createElement(NodeLabelComponent, _extends({ node: node, getLabel: getLabel, labelStyle: labelStyle }, {
                __source: {
                    fileName: '../../../src/charts/TreeMap.js',
                    lineNumber: 52
                }
            })) : null
        );
    }
});

var TreeMapNodeLabel = _react2.default.createClass({
    displayName: 'TreeMapNodeLabel',

    propTypes: {
        node: PropTypes.object,
        getLabel: PropTypes.func,
        labelStyle: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
        minLabelWidth: PropTypes.number,
        minLabelHeight: PropTypes.number
    },
    render: function render() {
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
            _extends({ className: 'node-label' }, { style: style }, {
                __source: {
                    fileName: '../../../src/charts/TreeMap.js',
                    lineNumber: 75
                }
            }),
            getLabel(node)
        );
    }
});

var TreeMap = _react2.default.createClass({
    displayName: 'TreeMap',

    propTypes: {
        data: PropTypes.object.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        getValue: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
        getLabel: PropTypes.func,
        nodeStyle: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
        labelStyle: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
        minLabelWidth: PropTypes.number,
        minLabelHeight: PropTypes.number,

        getChildren: PropTypes.func,
        sort: PropTypes.func,
        padding: PropTypes.number,
        round: PropTypes.bool,
        sticky: PropTypes.bool,
        mode: PropTypes.string,
        ratio: PropTypes.number,

        onClickNode: PropTypes.func,
        onMouseEnterNode: PropTypes.func,
        onMouseLeaveNode: PropTypes.func,
        onMouseMoveNode: PropTypes.func,

        NodeComponent: PropTypes.func,
        NodeLabelComponent: PropTypes.func
    },
    getDefaultProps: function getDefaultProps() {
        return {
            NodeComponent: TreeMapNode,
            NodeLabelComponent: TreeMapNodeLabel,
            minLabelWidth: 0,
            minLabelHeight: 0
        };
    },
    _initTreemap: function _initTreemap(props) {
        var width = props.width;
        var height = props.height;
        var getValue = props.getValue;
        var getChildren = props.getChildren;
        var sort = props.sort;
        var padding = props.padding;
        var round = props.round;
        var sticky = props.sticky;
        var mode = props.mode;
        var ratio = props.ratio;

        var treemap = _d2.default.layout.treemap().size([width, height]).value((0, _util.accessor)(getValue));

        if (!_lodash2.default.isUndefined(getChildren)) treemap.children(getChildren);
        if (!_lodash2.default.isUndefined(sort)) treemap.sort(sort);
        if (!_lodash2.default.isUndefined(padding)) treemap.padding(padding);
        if (!_lodash2.default.isUndefined(round)) treemap.round(round);
        if (!_lodash2.default.isUndefined(sticky)) treemap.sticky(sticky);
        if (!_lodash2.default.isUndefined(mode)) treemap.mode(mode);
        if (!_lodash2.default.isUndefined(ratio)) treemap.ratio(ratio);

        return treemap;
    },
    render: function render() {
        var _props3 = this.props;
        var width = _props3.width;
        var height = _props3.height;
        var nodeStyle = _props3.nodeStyle;
        var labelStyle = _props3.labelStyle;
        var getLabel = _props3.getLabel;
        var minLabelWidth = _props3.minLabelWidth;
        var minLabelHeight = _props3.minLabelHeight;
        var onClickNode = _props3.onClickNode;
        var onMouseEnterNode = _props3.onMouseEnterNode;
        var onMouseLeaveNode = _props3.onMouseLeaveNode;
        var onMouseMoveNode = _props3.onMouseMoveNode;
        var NodeComponent = _props3.NodeComponent;
        var NodeLabelComponent = _props3.NodeLabelComponent;

        // clone the data because d3 mutates it!

        var data = _lodash2.default.cloneDeep(this.props.data);
        // initialize the layout function
        var treemap = this._initTreemap(this.props);
        // run the layout function with our data to create treemap layout
        var nodes = treemap.nodes(data);

        var style = { position: 'relative', width: width, height: height };

        return _react2.default.createElement(
            'div',
            _extends({ className: 'tree-map' }, { style: style }, {
                __source: {
                    fileName: '../../../src/charts/TreeMap.js',
                    lineNumber: 149
                }
            }),
            nodes.map(function (node) {
                return _react2.default.createElement(NodeComponent, _extends({
                    node: node, nodeStyle: nodeStyle, minLabelWidth: minLabelWidth, minLabelHeight: minLabelHeight, labelStyle: labelStyle, getLabel: getLabel, NodeLabelComponent: NodeLabelComponent,
                    onClickNode: onClickNode, onMouseEnterNode: onMouseEnterNode, onMouseLeaveNode: onMouseLeaveNode, onMouseMoveNode: onMouseMoveNode
                }, {
                    __source: {
                        fileName: '../../../src/charts/TreeMap.js',
                        lineNumber: 150
                    }
                }));
            })
        );
    }
});

exports.default = TreeMap;