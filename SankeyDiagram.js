"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _numeral = require("numeral");

var _numeral2 = _interopRequireDefault(_numeral);

var _d3Sankey = require("d3-sankey");

var _Data = require("./utils/Data");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SankeyNode = function SankeyNode(props) {
  var graph = props.graph,
      node = props.node,
      nodeClassName = props.nodeClassName,
      nodeStyle = props.nodeStyle;
  // create partial functions for handlers - callbacks with the current node/graph arguments attached

  var makeHandler = function makeHandler(origHandler) {
    return _lodash2.default.isFunction(origHandler) ? _lodash2.default.partial(origHandler, _lodash2.default, { node: node, graph: graph }) : null;
  };

  return _react2.default.createElement("rect", {
    x: node.x0,
    y: node.y0,
    width: Math.abs(node.x1 - node.x0),
    height: Math.abs(node.y1 - node.y0),
    className: "sankey-node " + (0, _Data.getValue)(nodeClassName, node, graph),
    style: (0, _Data.getValue)(nodeStyle, node, graph),
    onMouseEnter: makeHandler(props.onMouseEnterNode),
    onMouseLeave: makeHandler(props.onMouseLeaveNode),
    onMouseMove: makeHandler(props.onMouseMoveNode),
    onMouseDown: makeHandler(props.onMouseDownNode),
    onMouseUp: makeHandler(props.onMouseUpNode),
    onClick: makeHandler(props.onClickNode)
  });
};

var SankeyLink = function SankeyLink(props) {
  var graph = props.graph,
      link = props.link,
      linkPath = props.linkPath,
      linkClassName = props.linkClassName,
      linkStyle = props.linkStyle;
  // create partial functions for handlers - callbacks with the current graph/link arguments attached

  var makeHandler = function makeHandler(origHandler) {
    return _lodash2.default.isFunction(origHandler) ? _lodash2.default.partial(origHandler, _lodash2.default, { link: link, graph: graph }) : null;
  };

  return _react2.default.createElement("path", {
    d: linkPath,
    className: "sankey-link " + (0, _Data.getValue)(linkClassName, link, graph),
    style: _extends({}, (0, _Data.getValue)(linkStyle, link, graph), {
      strokeWidth: link.width
    }),
    onMouseEnter: makeHandler(props.onMouseEnterLink),
    onMouseLeave: makeHandler(props.onMouseLeaveLink),
    onMouseMove: makeHandler(props.onMouseMoveLink),
    onMouseDown: makeHandler(props.onMouseDownLink),
    onMouseUp: makeHandler(props.onMouseUpLink),
    onClick: makeHandler(props.onClickLink)
  });
};

var SankeyNodeTerminal = function SankeyNodeTerminal(props) {
  var node = props.node,
      graph = props.graph;

  if (!node.terminalValue) return null;
  var makeHandler = function makeHandler(origHandler) {
    return _lodash2.default.isFunction(origHandler) ? _lodash2.default.partial(origHandler, _lodash2.default, { node: node, graph: graph, props: props }) : null;
  };
  var getWithNode = function getWithNode(accessor) {
    return (0, _Data.getValue)(accessor, node, graph, props);
  };
  var width = getWithNode(props.nodeTerminalWidth) || 0;
  var distance = getWithNode(props.nodeTerminalDistance) || 0;
  var nodeHeight = Math.abs(node.y1 - node.y0) || 0;
  var height = (nodeHeight * node.terminalValue || 0) / (node.value || 0) || 0;
  var style = getWithNode(props.nodeTerminalStyle);
  var className = "sankey-node-terminal " + getWithNode(props.nodeTerminalClassName);
  var attributes = getWithNode(props.nodeTerminalAttributes);

  return _react2.default.createElement("rect", _extends({
    x: node.x1 + distance,
    y: node.y0 + (nodeHeight - height)
  }, { width: width, height: height, style: style, className: className }, attributes, {
    onMouseEnter: makeHandler(props.onMouseEnterNodeTerminal),
    onMouseLeave: makeHandler(props.onMouseLeaveNodeTerminal),
    onMouseMove: makeHandler(props.onMouseMoveNodeTerminal),
    onMouseDown: makeHandler(props.onMouseDownNodeTerminal),
    onMouseUp: makeHandler(props.onMouseUpNodeTerminal),
    onClick: makeHandler(props.onClickNodeTerminal)
  }));
};

var SankeyNodeLabel = function SankeyNodeLabel(props) {
  var node = props.node,
      graph = props.graph,
      nodeLabelText = props.nodeLabelText,
      nodeId = props.nodeId;

  var getWithNode = function getWithNode(accessor) {
    return (0, _Data.getValue)(accessor, node, graph, props);
  };
  var getLabelText = _lodash2.default.isFunction(nodeLabelText) ? nodeLabelText : nodeId;
  var placement = getWithNode(props.nodeLabelPlacement);
  var distance = getWithNode(props.nodeLabelDistance) || 0;
  var labelContent = getWithNode(getLabelText);
  // don't render empty labels
  if (_lodash2.default.isNull(labelContent) || _lodash2.default.isUndefined(labelContent) || labelContent === false || labelContent === "") {
    return null;
  }

  // if `labelContent` is a string or number, it is rendered as text within a SVG <text> element
  // otherwise, it is rendered as arbitrary SVG content
  // allows users to render components inside a node label (eg. to add icon or link)
  var isTextLabel = _lodash2.default.isString(labelContent) || _lodash2.default.isNumber(labelContent);
  if (!isTextLabel) {
    return labelContent;
  }

  var baseClassName = "sankey-node-label " + getWithNode(props.nodeLabelClassName);
  var baseStyle = getWithNode(props.nodeLabelStyle);
  var position = void 0;
  var textStyle = void 0;

  // use placement prop to determine x, y, alignmentBaseline and textAnchor
  if (placement === "above") {
    // render label above node, centered horizontally
    textStyle = _extends({
      alignmentBaseline: "baseline",
      textAnchor: "middle"
    }, baseStyle);
    position = {
      x: node.x0 + Math.abs(node.x1 - node.x0) / 2,
      y: node.y0 - distance
    };
  } else if (placement === "below") {
    // render label above node, centered horizontally
    textStyle = _extends({
      alignmentBaseline: "hanging",
      textAnchor: "middle"
    }, baseStyle);
    position = {
      x: node.x0 + Math.abs(node.x1 - node.x0) / 2,
      y: node.y1 + distance
    };
  } else if (placement === "before") {
    // render label before (to left of) node, centered vertically
    textStyle = _extends({
      alignmentBaseline: "middle",
      textAnchor: "end"
    }, baseStyle);
    position = {
      x: node.x0 - distance,
      y: node.y0 + Math.abs(node.y1 - node.y0) / 2
    };
  } else {
    if (!_lodash2.default.isUndefined(placement) && placement !== "after") console.warn(placement + " is not a valid value for nodeLabelPlacement - defaulting to \"after\"");
    // render label after (to right of) node, centered vertically
    textStyle = _extends({
      alignmentBaseline: "middle",
      textAnchor: "start"
    }, baseStyle);
    position = {
      x: node.x1 + distance,
      y: node.y0 + Math.abs(node.y1 - node.y0) / 2
    };
  }

  var className = baseClassName + " sankey-node-label-text";
  return _react2.default.createElement(
    "text",
    _extends({}, position, { className: className, style: textStyle }),
    labelContent
  );
};

var SankeyLinkLabel = function SankeyLinkLabel(props) {
  var link = props.link,
      graph = props.graph;

  var getWithLink = function getWithLink(accessor) {
    return (0, _Data.getValue)(accessor, link, graph, props);
  };
  var className = "sankey-link-label " + getWithLink(props.linkLabelClassName || "");
  var style = getWithLink(props.linkLabelStyle || {});
  var attributes = getWithLink(props.linkLabelAttributes || {});
  var startOffset = getWithLink(props.linkLabelStartOffset || 0);

  return _react2.default.createElement(
    "text",
    _extends({ className: className, style: style }, attributes),
    _react2.default.createElement(
      "textPath",
      { startOffset: startOffset, xlinkHref: "#" + props.linkPathId },
      getWithLink(props.linkLabelText)
    )
  );
};

var SVGContainer = function SVGContainer(props) {
  var otherProps = _lodash2.default.omit(props, ["standalone"]);
  if (props.standalone) {
    return _react2.default.createElement("svg", otherProps);
  }
  return _react2.default.createElement("g", otherProps);
};

/**
 * Enhance the graph object created by d3-sankey by adding some additional useful properties.
 * Adds `maxDepth` (max of node `depth` properties)
 * and `node.terminalValue` (value of node's terminal, sum of all 'out' nodes minus sum of 'in' nodes)
 */
function enhanceGraph(graph) {
  graph.nodes.forEach(function (node) {
    var sourceLinksSum = (node.sourceLinks || []).reduce(function (sum, link) {
      return sum + link.value;
    }, 0);
    node.terminalValue = Math.max(node.value - sourceLinksSum, 0);
  });
  graph.links.forEach(function (link) {
    link.valueSourceRelative = (link.value || 0) / _lodash2.default.get(link, "source.value", 0);
    link.valueTargetRelative = (link.value || 0) / _lodash2.default.get(link, "target.value", 0);
  });

  graph.maxDepth = _lodash2.default.maxBy(graph.nodes, "depth");
  graph.maxDepth = graph.nodes.reduce(function (max, node) {
    return Math.max(node.depth || 0, max);
  }, 0);
  return graph;
}

function getLinkId(link, nodeId) {
  return "link-" + nodeId(link.source) + "-to-" + nodeId(link.target);
}

var nodeAlignmentsByName = {
  left: _d3Sankey.sankeyLeft,
  right: _d3Sankey.sankeyRight,
  center: _d3Sankey.sankeyCenter,
  justify: _d3Sankey.sankeyJustify
};

/**
 * A Sankey diagram is a type of flow diagram which visualizes directed flow between nodes
 * of a network graph. Currently only *acyclic* networks are supported.
 */

var SankeyDiagram = function (_React$Component) {
  _inherits(SankeyDiagram, _React$Component);

  function SankeyDiagram() {
    _classCallCheck(this, SankeyDiagram);

    return _possibleConstructorReturn(this, (SankeyDiagram.__proto__ || Object.getPrototypeOf(SankeyDiagram)).apply(this, arguments));
  }

  _createClass(SankeyDiagram, [{
    key: "_makeSankeyGraph",
    value: function _makeSankeyGraph() {
      var innerWidth = this.props.width - (this.props.marginLeft + this.props.marginRight);
      var innerHeight = this.props.height - (this.props.marginTop + this.props.marginBottom);
      var makeSankey = (0, _d3Sankey.sankey)().size([innerWidth, innerHeight]).nodeId(this.props.nodeId).nodeWidth(this.props.nodeWidth).nodePadding(this.props.nodePadding).nodeAlign(nodeAlignmentsByName[this.props.nodeAlignment] || nodeAlignmentsByName.justify);

      var nodes = this.props.shouldClone ? _lodash2.default.cloneDeep(this.props.nodes) : this.props.nodes;
      var links = this.props.shouldClone ? _lodash2.default.cloneDeep(this.props.links) : this.props.links;
      var sankeyGraph = makeSankey({ nodes: nodes, links: links });
      this._graph = enhanceGraph(sankeyGraph);
    }
  }, {
    key: "componentWillMount",
    value: function componentWillMount() {
      this._makeSankeyGraph();
    }
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      var _this2 = this;

      // only update this._graph if a prop which affects the sankey layout has changed (most don't)
      var sankeyLayoutPropKeys = ["nodes", "links", "width", "height", "marginTop", "marginBottom", "marginLeft", "marginRight", "nodeId", "nodeWidth", "nodePadding", "nodeAlignment"];

      var hasChangedSankey = _lodash2.default.some(sankeyLayoutPropKeys, function (key) {
        return nextProps[key] !== _this2.props[key];
      });
      if (hasChangedSankey) this._makeSankeyGraph();
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var _props = this.props,
          width = _props.width,
          height = _props.height,
          style = _props.style,
          standalone = _props.standalone,
          nodeId = _props.nodeId,
          marginTop = _props.marginTop,
          marginBottom = _props.marginBottom,
          marginLeft = _props.marginLeft,
          marginRight = _props.marginRight;


      var graph = this._graph;
      var makeLinkPath = (0, _d3Sankey.sankeyLinkHorizontal)();
      var className = "sankey-diagram " + this.props.className;
      var innerWidth = width - (marginLeft + marginRight);
      var innerHeight = height - (marginTop + marginBottom);

      function mapNodesInGroupIf(shouldShow, groupClassName, mapFunc) {
        if (!shouldShow) return null;
        return _react2.default.createElement(
          "g",
          { className: groupClassName },
          (graph.nodes || []).map(function (node, i) {
            if (!(0, _Data.getValue)(shouldShow, node, graph)) return null;
            var key = "node-" + nodeId(node);
            return mapFunc(node, i, key);
          })
        );
      }

      function mapLinksInGroupIf(shouldShow, groupClassName, mapFunc) {
        if (!shouldShow) return null;
        return _react2.default.createElement(
          "g",
          { className: groupClassName },
          (graph.links || []).map(function (link, i) {
            if (!(0, _Data.getValue)(shouldShow, link, graph)) return null;
            var key = "link-" + nodeId(link.source) + "-to-" + nodeId(link.target);
            return mapFunc(link, i, key);
          })
        );
      }

      return _react2.default.createElement(
        SVGContainer,
        { standalone: standalone, width: width, height: height, className: className, style: style },
        _react2.default.createElement(
          "g",
          {
            width: innerWidth,
            height: innerHeight,
            transform: "translate(" + marginLeft + ", " + marginTop + ")"
          },
          mapLinksInGroupIf(this.props.showLinks, "sankey-links", function (link, i, key) {
            var linkProps = _extends({}, _this3.props, {
              key: key,
              graph: graph,
              link: link,
              linkPath: makeLinkPath(link)
            });
            return _react2.default.createElement(SankeyLink, linkProps);
          }),
          mapNodesInGroupIf(this.props.showNodes, "sankey-nodes", function (node, i, key) {
            return _react2.default.createElement(SankeyNode, _extends({}, _this3.props, { key: key, graph: graph, node: node }));
          }),
          ";",
          mapNodesInGroupIf(this.props.showNodeTerminals, "sankey-node-terminals", function (node, i, key) {
            return _react2.default.createElement(SankeyNodeTerminal, _extends({}, _this3.props, { key: key, graph: graph, node: node }));
          }),
          ";",
          this.props.showLinkLabels || this.props.showLinkSourceLabels || this.props.showLinkTargetLabels ? _react2.default.createElement(
            "defs",
            null,
            graph.links.map(function (link) {
              var hasLabel = (0, _Data.getValue)(_this3.props.showLinkLabels, link, graph) || (0, _Data.getValue)(_this3.props.showLinkSourceLabels, link, graph) || (0, _Data.getValue)(_this3.props.showLinkTargetLabels, link, graph);
              if (!hasLabel) return null;

              var linkPath = makeLinkPath(link);
              var linkPathId = getLinkId(link, nodeId) + "-path";
              return _react2.default.createElement("path", { id: linkPathId, d: linkPath, key: linkPathId });
            })
          ) : null,
          mapLinksInGroupIf(this.props.showLinkLabels, "sankey-link-labels", function (link, i, key) {
            var linkPathId = getLinkId(link, nodeId) + "-path";
            var labelProps = _extends({}, _this3.props, {
              key: key,
              graph: graph,
              link: link,
              linkPathId: linkPathId
            });
            return _react2.default.createElement(SankeyLinkLabel, labelProps);
          }),
          mapNodesInGroupIf(this.props.showNodeLabels, "sankey-node-labels", function (node, i, key) {
            return _react2.default.createElement(SankeyNodeLabel, _extends({}, _this3.props, { key: key, graph: graph, node: node }));
          }),
          ";",
          mapLinksInGroupIf(this.props.showLinkSourceLabels, "sankey-link-source-labels", function (link, i, key) {
            var linkPathId = getLinkId(link, nodeId) + "-path";
            var commonProps = _extends({}, _this3.props, {
              key: key,
              graph: graph,
              link: link,
              linkPathId: linkPathId
            });
            var labelProps = _extends({}, commonProps, {
              linkLabelText: _this3.props.linkSourceLabelText,
              linkLabelClassName: _this3.props.linkSourceLabelClassName,
              linkLabelStyle: _this3.props.linkSourceLabelStyle,
              linkLabelAttributes: _this3.props.linkSourceLabelAttributes,
              linkLabelStartOffset: _this3.props.linkSourceLabelStartOffset
            });

            return _react2.default.createElement(SankeyLinkLabel, labelProps);
          }),
          mapLinksInGroupIf(this.props.showLinkTargetLabels, "sankey-link-target-labels", function (link, i, key) {
            var linkPathId = getLinkId(link, nodeId) + "-path";
            var commonProps = _extends({}, _this3.props, {
              key: key,
              graph: graph,
              link: link,
              linkPathId: linkPathId
            });
            var labelProps = _extends({}, commonProps, {
              linkLabelText: _this3.props.linkTargetLabelText,
              linkLabelClassName: _this3.props.linkTargetLabelClassName,
              linkLabelStyle: _extends({
                textAnchor: "end"
              }, _this3.props.linkTargetLabelStyle),
              linkLabelAttributes: _this3.props.linkTargetLabelAttributes,
              linkLabelStartOffset: _this3.props.linkTargetLabelStartOffset
            });

            return _react2.default.createElement(SankeyLinkLabel, labelProps);
          })
        )
      );
    }
  }]);

  return SankeyDiagram;
}(_react2.default.Component);

SankeyDiagram.propTypes = {
  /**
   * Array of node objects, represented by vertical rectangles.
   * These represent the base entities which links flow into & out of.
   */
  nodes: _propTypes2.default.arrayOf(_propTypes2.default.object).isRequired,
  /**
   * Array of link objects, represented by curved paths between nodes.
   * Links represent a magnitude of flow between one node and another.
   * Each should have a 'source' node [identifier], a 'target' node [identifier],
   * and a numerical value representing flow magnitude.
   */
  links: _propTypes2.default.arrayOf(_propTypes2.default.shape({
    source: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]),
    target: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]),
    value: _propTypes2.default.number
  })).isRequired,
  /**
   * Width of the SVG element.
   */
  width: _propTypes2.default.number.isRequired,
  /**
   * Height of the SVG element.
   */
  height: _propTypes2.default.number.isRequired,
  /**
   * Boolean which decides if the nodes & links props should be cloned before being mutated into
   * the Sankey data structure. Passing `false` is faster, but may cause unintended side effects
   * if nodes or links data are used elsewhere
   */
  shouldClone: _propTypes2.default.bool,
  /**
   * `className` attribute to be applied to the SVG element.
   */
  className: _propTypes2.default.string,
  /**
   * Inline style object to be applied to the SVG element.
   */
  style: _propTypes2.default.object,
  /**
   * Boolean which determines whether the chart should be rendered as a standalone `<svg>` element
   * or a `<g>` group element (as a child within an existing `<svg>`).
   * True by default, pass `false` to render in a `<g>`.
   */
  standalone: _propTypes2.default.bool,
  /**
   * Internal top margin, in pixels. Generally used to eg. leave extra space inside the SVG for labels.
   */
  marginTop: _propTypes2.default.number,
  /**
   * Internal bottom margin, in pixels.
   */
  marginBottom: _propTypes2.default.number,
  /**
   * Internal left margin, in pixels.
   */
  marginLeft: _propTypes2.default.number,
  /**
   * Internal right margin, in pixels.
   */
  marginRight: _propTypes2.default.number,

  /**
   * Boolean which determines if node rectangles should be shown,
   * or function (`showNode(node, graph)`) which returns a boolean
   */
  showNodes: _propTypes2.default.oneOfType([_propTypes2.default.bool, _propTypes2.default.func]),
  /**
   * Accessor function `nodeId(node, graph)` which specifies how to access the ID of each node object.
   * These should be the same identifiers used by `links[].source` and `.target`.
   * Uses the node's index in `nodes` array by default.
   */
  nodeId: _propTypes2.default.func,
  /**
   * Width (in pixels) of the vertical node rectangles.
   */
  nodeWidth: _propTypes2.default.number,
  /**
   * Vertical padding (in pixels) between each of the node lines.
   */
  nodePadding: _propTypes2.default.number,
  /**
   * Node alignment method used to layout the nodes.
   * May be 'left', 'right', 'center', 'justify', or a custom function.
   * See [d3-sankey alignment docs](https://github.com/d3/d3-sankey#alignments) for more details.
   */
  nodeAlignment: _propTypes2.default.oneOf(["left", "right", "center", "justify"]),
  /**
   * `className` attribute to be applied to each node,
   * or accessor function which returns a class (string).
   */
  nodeClassName: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]),
  /**
   * Inline style object to be applied to each node,
   * or accessor function which returns a style object.
   */
  nodeStyle: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.func]),
  /**
   * Node `mouseenter` event handler, called when user's mouse enters a node.
   */
  onMouseEnterNode: _propTypes2.default.func,
  /**
   * Node `mouseleave` event handler, called when user's mouse leaves a node.
   */
  onMouseLeaveNode: _propTypes2.default.func,
  /**
   * Node `mousemove` event handler, called when user's mouse moves within a node.
   */
  onMouseMoveNode: _propTypes2.default.func,
  /**
   * Node `mousedown` event handler, called when user's mouse button is depressed within a node.
   */
  onMouseDownNode: _propTypes2.default.func,
  /**
   * Node `mouseup` event handler, called when user's mouse button is released within a node.
   */
  onMouseUpNode: _propTypes2.default.func,
  /**
   * Node `click` event handler, called when user clicks within a node.
   */
  onClickNode: _propTypes2.default.func,

  /**
   * Boolean which determines if link paths should be shown,
   * or function (`showLink(link, graph)`) which returns a boolean
   */
  showLinks: _propTypes2.default.oneOfType([_propTypes2.default.bool, _propTypes2.default.func]),
  /**
   * Class attribute to be applied to each link,
   * or accessor function which returns a class (string).
   */
  linkClassName: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]),
  /**
   * Inline style object to be applied to each link,
   * or accessor function which returns a style object.
   */
  linkStyle: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.func]),
  /**
   * Link `mouseenter` event handler, called when user's mouse enters a link.
   */
  onMouseEnterLink: _propTypes2.default.func,
  /**
   * Link `mouseleave` event handler, called when user's mouse leaves a link.
   */
  onMouseLeaveLink: _propTypes2.default.func,
  /**
   * Link `mousemove` event handler, called when user's mouse moves within a link.
   */
  onMouseMoveLink: _propTypes2.default.func,
  /**
   * Link `mousedown` event handler, called when user's mouse button is depressed within a link.
   */
  onMouseDownLink: _propTypes2.default.func,
  /**
   * Link `mouseup` event handler, called when user's mouse button is released within a link.
   */
  onMouseUpLink: _propTypes2.default.func,
  /**
   * Link `click` event handler, called when user clicks within a link.
   */
  onClickLink: _propTypes2.default.func,

  /**
   * Boolean which determines if node terminals should be shown,
   * or function (`showLink(link, graph)`) which returns a boolean.
   * Terminals are bars that run alongside to show the amount
   * which has flowed *in* but not *out*
   */
  showNodeTerminals: _propTypes2.default.oneOfType([_propTypes2.default.bool, _propTypes2.default.func]),
  /**
   * Width (in pixels) of the node terminal rectangles,
   * or accessor function `f(node, graph)` which returns a width.
   */
  nodeTerminalWidth: _propTypes2.default.oneOfType([_propTypes2.default.bool, _propTypes2.default.number]),
  /**
   * Distance (in pixels) between nodes and their terminals,
   * or accessor function `f(node, graph)` which returns a distance.
   */
  nodeTerminalDistance: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.func]),
  /**
   * `className` attribute to be applied to each node terminal,
   * or accessor function which returns a class (string).
   */
  nodeTerminalClassName: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]),
  /**
   * Inline style object to be applied to each node terminal,
   * or accessor function which returns a style object.
   */
  nodeTerminalStyle: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.func]),
  /**
   * Attributes object to be applied to each node terminal element,
   * or accessor function which returns an object.
   */
  nodeTerminalAttributes: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.func]),
  /**
   * Node terminal `mouseenter` event handler, called when user's mouse enters a node terminal.
   */
  onMouseEnterNodeTerminal: _propTypes2.default.func,
  /**
   * Node terminal `mouseleave` event handler, called when user's mouse leaves a node terminal.
   */
  onMouseLeaveNodeTerminal: _propTypes2.default.func,
  /**
   * Node terminal `mousemove` event handler, called when user's mouse moves within a node terminal.
   */
  onMouseMoveNodeTerminal: _propTypes2.default.func,
  /**
   * Node terminal `mousedown` event handler, called when user's mouse button is depressed within a node terminal.
   */
  onMouseDownNodeTerminal: _propTypes2.default.func,
  /**
   * Node terminal `mouseup` event handler, called when user's mouse button is released within a node terminal.
   */
  onMouseUpNodeTerminal: _propTypes2.default.func,
  /**
   * Node terminal `click` event handler, called when user clicks within a node terminal.
   */
  onClickNodeTerminal: _propTypes2.default.func,

  /**
   * Boolean which determines if node labels should be shown,
   * or function (`showLink(link, graph)`) which returns a boolean
   */
  showNodeLabels: _propTypes2.default.oneOfType([_propTypes2.default.bool, _propTypes2.default.func]),
  /**
   * Placement of the node label relative to the node rectangle.
   * Expects 'before', 'after', 'above' or 'below', or a function which returns one of these.
   * By default, labels in the left half of the diagram are placed 'after' and those in the right half 'before'
   */
  nodeLabelPlacement: _propTypes2.default.oneOfType([_propTypes2.default.oneOf(["before", "after", "above", "below"]), _propTypes2.default.func]),
  /**
   * Distance (in pixels) between nodes and their labels,
   * or accessor function `f(node, graph)` which returns a distance.
   */
  nodeLabelDistance: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.func]),
  /**
   * Accessor function `nodeLabelText(node, graph)` which returns the content to be used for node labels.
   * The function may return a string/number (rendered as SVG `<text>`),
   * or arbitrary React SVG element(s) (rendered as-is inside the SVG).
   * NOTE: in the latter case (returning arbitrary SVG), `nodeLabelPlacement`, `nodeLabelDistance`,
   * `nodeLabelClassName` and `nodeLabelStyle` props will not be applied -
   * user is responsible for all positioning and attributes on this element.
   */
  nodeLabelText: _propTypes2.default.func,
  /**
   * `className` attribute to be applied to each node label,
   * or accessor function which returns a class (string).
   */
  nodeLabelClassName: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]),
  /**
   * Inline style object to be applied to each node label,
   * or accessor function which returns a style object.
   */
  nodeLabelStyle: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.func]),

  /**
   * Boolean which determines if link labels should be shown,
   * or function (`showLink(link, graph)`) which returns a boolean
   */
  showLinkLabels: _propTypes2.default.oneOfType([_propTypes2.default.bool, _propTypes2.default.func]),
  /**
   * Accessor function `f(link, graph)` which returns the text to be used for link labels.
   */
  linkLabelText: _propTypes2.default.func,
  /**
   * `className` attribute to be applied to each link label,
   * or accessor function which returns a class (string).
   */
  linkLabelClassName: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]),
  /**
   * Inline style object to be applied to each link label,
   * or accessor function which returns a style object.
   */
  linkLabelStyle: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.func]),
  /**
   * Attributes object to be applied to each link label element,
   * or accessor function which returns an object.
   */
  linkLabelAttributes: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.func]),
  /**
   * `startOffset` attribute to apply to the link label `<textpath>` element.
   * May be a number (in SVG units) or percent string (`"25%"`)
   */
  linkLabelStartOffset: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]),

  /**
   * Boolean which determines if link *source* labels should be shown,
   * or function (`showLink(link, graph)`) which returns a boolean
   */
  showLinkSourceLabels: _propTypes2.default.oneOfType([_propTypes2.default.bool, _propTypes2.default.func]),
  /**
   * Accessor function `f(link, graph)` which returns the text to be used for link *source* labels.
   */
  linkSourceLabelText: _propTypes2.default.func,
  /**
   * `className` attribute to be applied to each link *source* label,
   * or accessor function which returns a class (string).
   */
  linkSourceLabelClassName: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]),
  /**
   * Inline style object to be applied to each link *source* label,
   * or accessor function which returns a style object.
   */
  linkSourceLabelStyle: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.func]),
  /**
   * Attributes object to be applied to each link *source* label,
   * or accessor function which returns an object.
   */
  linkSourceLabelAttributes: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.func]),
  /**
   * `startOffset` attribute to apply to the link *source* label `<textpath>` element.
   * May be a number (in SVG units) or percent string (`"25%"`)
   */
  linkSourceLabelStartOffset: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]),

  /**
   * Boolean which determines if link *target* labels should be shown,
   * or function (`showLink(link, graph)`) which returns a boolean
   */
  showLinkTargetLabels: _propTypes2.default.oneOfType([_propTypes2.default.bool, _propTypes2.default.func]),
  /**
   * Accessor function `f(link, graph)` which returns the text to be used for link *target* labels.
   */
  linkTargetLabelText: _propTypes2.default.func,
  /**
   * `className` attribute to be applied to each link *target* label,
   * or accessor function which returns a class (string).
   */
  linkTargetLabelClassName: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]),
  /**
   * Inline style object to be applied to each link *target* label,
   * or accessor function which returns a style object.
   */
  linkTargetLabelStyle: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.func]),
  /**
   * Attributes object to be applied to each link *target* label,
   * or accessor function which returns an object.
   */
  linkTargetLabelAttributes: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.func]),
  /**
   * `startOffset` attribute to apply to the link *target* label `<textpath>` element.
   * May be a number (in SVG units) or percent string (`"25%"`)
   */
  linkTargetLabelStartOffset: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number])

  //standalone
};
SankeyDiagram.defaultProps = {
  width: 400,
  height: 300,
  shouldClone: true,
  className: "",
  style: {},
  standalone: true,
  marginTop: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
  nodeId: function nodeId(node) {
    return node.index;
  },
  showNodes: true,
  nodeWidth: 12,
  nodePadding: 8,
  nodeAlignment: "justify",
  nodeClassName: "",
  nodeStyle: {},
  showLinks: true,
  linkClassName: "",
  linkStyle: {},
  showNodeTerminals: true,
  nodeTerminalWidth: 5,
  nodeTerminalDistance: 1,
  nodeTerminalClassName: "",
  nodeTerminalStyle: {},
  nodeTerminalAttributes: { rx: 2, ry: 2 },
  showNodeLabels: true,
  nodeLabelPlacement: function nodeLabelPlacement(node, graph) {
    return node.depth < graph.maxDepth / 2 ? "after" : "before";
  },
  nodeLabelDistance: 4,
  nodeLabelText: function nodeLabelText(node, graph, props) {
    if (_lodash2.default.has(node, "name")) return node.name;
    if (_lodash2.default.has(node, "label")) return node.label;
    return (0, _Data.getValue)(props.nodeId, node, graph, props);
  },
  nodeLabelClassName: "",
  nodeLabelStyle: {},
  showLinkLabels: false,
  linkLabelText: function linkLabelText(link, graph, props) {
    var valueText = (0, _numeral2.default)(link.value || 0).format("0.[0]a");
    var sourceText = (0, _Data.getValue)(props.nodeLabelText, link.source, graph, props);
    var targetText = (0, _Data.getValue)(props.nodeLabelText, link.target, graph, props);
    return sourceText + "\u2192" + targetText + ": " + valueText;
  },
  linkLabelClassName: "",
  linkLabelStyle: {},
  linkLabelAttributes: {},
  linkLabelStartOffset: "25%",
  showLinkSourceLabels: false,
  linkSourceLabelText: function linkSourceLabelText(link, graph, props) {
    var valueRelative = link.valueSourceRelative;
    if (!_lodash2.default.isFinite(valueRelative)) return "";
    var percentText = valueRelative < 0.001 ? "<0.1%" : (0, _numeral2.default)(valueRelative).format("0.[0]%");
    return percentText + " to " + (0, _Data.getValue)(props.nodeLabelText, link.target, graph, props);
  },
  linkSourceLabelClassName: "",
  linkSourceLabelStyle: {},
  linkSourceLabelAttributes: {},
  linkSourceLabelStartOffset: "2%",
  showLinkTargetLabels: false,
  linkTargetLabelText: function linkTargetLabelText(link, graph, props) {
    var valueRelative = link.valueTargetRelative;
    if (!_lodash2.default.isFinite(valueRelative)) return "";
    var percentText = valueRelative < 0.001 ? "<0.1%" : (0, _numeral2.default)(valueRelative).format("0.[0]%");
    return percentText + " from " + (0, _Data.getValue)(props.nodeLabelText, link.source, graph, props);
  },
  linkTargetLabelClassName: "",
  linkTargetLabelStyle: {},
  linkTargetLabelAttributes: {},
  linkTargetLabelStartOffset: "98%"
};
exports.default = SankeyDiagram;
//# sourceMappingURL=SankeyDiagram.js.map