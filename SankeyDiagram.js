"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _d3Sankey = require("d3-sankey");

var _lodash = _interopRequireDefault(require("lodash"));

var _numeral = _interopRequireDefault(require("numeral"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

var _Data = require("./utils/Data");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const SankeyNode = props => {
  const {
    graph,
    node,
    nodeClassName,
    nodeStyle
  } = props; // create partial functions for handlers - callbacks with the current node/graph arguments attached

  const makeHandler = origHandler => _lodash.default.isFunction(origHandler) ? _lodash.default.partial(origHandler, _lodash.default, {
    node,
    graph
  }) : null;

  return _react.default.createElement("rect", {
    x: node.x0,
    y: node.y0,
    width: Math.abs(node.x1 - node.x0),
    height: Math.abs(node.y1 - node.y0),
    className: "rct-sankey-node ".concat((0, _Data.getValue)(nodeClassName, node, graph)),
    style: (0, _Data.getValue)(nodeStyle, node, graph),
    onMouseEnter: makeHandler(props.onMouseEnterNode),
    onMouseLeave: makeHandler(props.onMouseLeaveNode),
    onMouseMove: makeHandler(props.onMouseMoveNode),
    onMouseDown: makeHandler(props.onMouseDownNode),
    onMouseUp: makeHandler(props.onMouseUpNode),
    onClick: makeHandler(props.onClickNode)
  });
};

const SankeyLink = props => {
  const {
    graph,
    link,
    linkPath,
    linkClassName,
    linkStyle
  } = props; // create partial functions for handlers - callbacks with the current graph/link arguments attached

  const makeHandler = origHandler => _lodash.default.isFunction(origHandler) ? _lodash.default.partial(origHandler, _lodash.default, {
    link,
    graph
  }) : null;

  return _react.default.createElement("path", {
    d: linkPath,
    className: "rct-sankey-link ".concat((0, _Data.getValue)(linkClassName, link, graph)),
    style: _objectSpread({}, (0, _Data.getValue)(linkStyle, link, graph), {
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

const SankeyNodeTerminal = props => {
  const {
    node,
    graph
  } = props;
  if (!node.terminalValue) return null;

  const makeHandler = origHandler => _lodash.default.isFunction(origHandler) ? _lodash.default.partial(origHandler, _lodash.default, {
    node,
    graph,
    props
  }) : null;

  const getWithNode = accessor => (0, _Data.getValue)(accessor, node, graph, props);

  const width = getWithNode(props.nodeTerminalWidth) || 0;
  const distance = getWithNode(props.nodeTerminalDistance) || 0;
  const nodeHeight = Math.abs(node.y1 - node.y0) || 0;
  const height = (nodeHeight * node.terminalValue || 0) / (node.value || 0) || 0;
  const style = getWithNode(props.nodeTerminalStyle);
  const className = "rct-sankey-node-terminal ".concat(getWithNode(props.nodeTerminalClassName));
  const attributes = getWithNode(props.nodeTerminalAttributes);
  return _react.default.createElement("rect", _extends({
    x: node.x1 + distance,
    y: node.y0 + (nodeHeight - height)
  }, {
    width,
    height,
    style,
    className
  }, attributes, {
    onMouseEnter: makeHandler(props.onMouseEnterNodeTerminal),
    onMouseLeave: makeHandler(props.onMouseLeaveNodeTerminal),
    onMouseMove: makeHandler(props.onMouseMoveNodeTerminal),
    onMouseDown: makeHandler(props.onMouseDownNodeTerminal),
    onMouseUp: makeHandler(props.onMouseUpNodeTerminal),
    onClick: makeHandler(props.onClickNodeTerminal)
  }));
};

const SankeyNodeLabel = props => {
  const {
    node,
    graph,
    nodeLabelText,
    nodeId
  } = props;

  const getWithNode = accessor => (0, _Data.getValue)(accessor, node, graph, props);

  const getLabelText = _lodash.default.isFunction(nodeLabelText) ? nodeLabelText : nodeId;
  const placement = getWithNode(props.nodeLabelPlacement);
  const distance = getWithNode(props.nodeLabelDistance) || 0;
  const labelContent = getWithNode(getLabelText); // don't render empty labels

  if (_lodash.default.isNull(labelContent) || _lodash.default.isUndefined(labelContent) || labelContent === false || labelContent === "") {
    return null;
  } // if `labelContent` is a string or number, it is rendered as text within a SVG <text> element
  // otherwise, it is rendered as arbitrary SVG content
  // allows users to render components inside a node label (eg. to add icon or link)


  const isTextLabel = _lodash.default.isString(labelContent) || _lodash.default.isNumber(labelContent);

  if (!isTextLabel) {
    return labelContent;
  }

  const baseClassName = "rct-sankey-node-label ".concat(getWithNode(props.nodeLabelClassName));
  const baseStyle = getWithNode(props.nodeLabelStyle);
  let position;
  let textStyle; // use placement prop to determine x, y, alignmentBaseline and textAnchor

  if (placement === "above") {
    // render label above node, centered horizontally
    textStyle = _objectSpread({
      alignmentBaseline: "baseline",
      textAnchor: "middle"
    }, baseStyle);
    position = {
      x: node.x0 + Math.abs(node.x1 - node.x0) / 2,
      y: node.y0 - distance
    };
  } else if (placement === "below") {
    // render label above node, centered horizontally
    textStyle = _objectSpread({
      alignmentBaseline: "hanging",
      textAnchor: "middle"
    }, baseStyle);
    position = {
      x: node.x0 + Math.abs(node.x1 - node.x0) / 2,
      y: node.y1 + distance
    };
  } else if (placement === "before") {
    // render label before (to left of) node, centered vertically
    textStyle = _objectSpread({
      alignmentBaseline: "middle",
      textAnchor: "end"
    }, baseStyle);
    position = {
      x: node.x0 - distance,
      y: node.y0 + Math.abs(node.y1 - node.y0) / 2
    };
  } else {
    if (!_lodash.default.isUndefined(placement) && placement !== "after") console.warn("".concat(placement, " is not a valid value for nodeLabelPlacement - defaulting to \"after\"")); // render label after (to right of) node, centered vertically

    textStyle = _objectSpread({
      alignmentBaseline: "middle",
      textAnchor: "start"
    }, baseStyle);
    position = {
      x: node.x1 + distance,
      y: node.y0 + Math.abs(node.y1 - node.y0) / 2
    };
  }

  const className = "".concat(baseClassName, " rct-sankey-node-label-text");
  return _react.default.createElement("text", _extends({}, position, {
    className: className,
    style: textStyle
  }), labelContent);
};

const SankeyLinkLabel = props => {
  const {
    link,
    graph
  } = props;

  const getWithLink = accessor => (0, _Data.getValue)(accessor, link, graph, props);

  const className = "rct-sankey-link-label ".concat(getWithLink(props.linkLabelClassName || ""));
  const style = getWithLink(props.linkLabelStyle || {});
  const attributes = getWithLink(props.linkLabelAttributes || {});
  const startOffset = getWithLink(props.linkLabelStartOffset || 0);
  return _react.default.createElement("text", _extends({
    className: className,
    style: style
  }, attributes), _react.default.createElement("textPath", {
    startOffset: startOffset,
    xlinkHref: "#".concat(props.linkPathId)
  }, getWithLink(props.linkLabelText)));
};

const SankeyStepLabel = props => {
  const {
    x,
    y,
    stepLabelPadding,
    stepLabelText,
    stepLabelClassName,
    stepLabelStyle,
    step
  } = props;
  let yPos = y;

  if (_lodash.default.isNumber(stepLabelPadding)) {
    yPos = yPos - stepLabelPadding;
  }

  return _react.default.createElement("text", {
    className: "rct-step-label ".concat((0, _Data.getValue)(stepLabelClassName, step)),
    style: (0, _Data.getValue)(stepLabelStyle, step),
    x: x,
    y: yPos,
    key: "step-".concat(x, "-").concat(step)
  }, (0, _Data.getValue)(stepLabelText, step));
};

const SVGContainer = props => {
  const otherProps = _lodash.default.omit(props, ["standalone"]);

  if (props.standalone) {
    return _react.default.createElement("svg", otherProps);
  }

  return _react.default.createElement("g", otherProps);
};
/**
 * Enhance the graph object created by d3-sankey by adding some additional useful properties.
 * Adds `maxDepth` (max of node `depth` properties)
 * and `node.terminalValue` (value of node's terminal, sum of all 'out' nodes minus sum of 'in' nodes)
 */


function enhanceGraph(graph) {
  graph.nodes.forEach(node => {
    const sourceLinksSum = (node.sourceLinks || []).reduce((sum, link) => sum + link.value, 0);
    node.terminalValue = Math.max(node.value - sourceLinksSum, 0);
  });
  graph.links.forEach(link => {
    link.valueSourceRelative = (link.value || 0) / _lodash.default.get(link, "source.value", 0);
    link.valueTargetRelative = (link.value || 0) / _lodash.default.get(link, "target.value", 0);
  });
  graph.maxDepth = _lodash.default.maxBy(graph.nodes, "depth");
  graph.maxDepth = graph.nodes.reduce((max, node) => Math.max(node.depth || 0, max), 0);
  return graph;
}

function getLinkId(link, nodeId) {
  return "link-".concat(nodeId(link.source), "-to-").concat(nodeId(link.target));
}

const nodeAlignmentsByName = {
  left: _d3Sankey.sankeyLeft,
  right: _d3Sankey.sankeyRight,
  center: _d3Sankey.sankeyCenter,
  justify: _d3Sankey.sankeyJustify
};
/**
 * A `SankeyDiagram` is a type of flow diagram which visualizes directed flow between nodes
 * of a network graph. Currently only *acyclic* networks are supported.
 */

class SankeyDiagram extends _react.default.Component {
  _makeSankeyGraph() {
    const innerWidth = this.props.width - (this.props.marginLeft + this.props.marginRight);
    const innerHeight = this.props.height - (this.props.marginTop + this.props.marginBottom);
    const makeSankey = (0, _d3Sankey.sankey)().size([innerWidth, innerHeight]).nodeId(this.props.nodeId).nodeWidth(this.props.nodeWidth).nodePadding(this.props.nodePadding).nodeAlign(nodeAlignmentsByName[this.props.nodeAlignment] || nodeAlignmentsByName.justify);
    const nodes = this.props.shouldClone ? _lodash.default.cloneDeep(this.props.nodes) : this.props.nodes;
    const links = this.props.shouldClone ? _lodash.default.cloneDeep(this.props.links) : this.props.links;
    const sankeyGraph = makeSankey({
      nodes,
      links
    });
    this._graph = enhanceGraph(sankeyGraph);
  }

  componentWillMount() {
    this._makeSankeyGraph();
  }

  componentWillReceiveProps(nextProps) {
    // only update this._graph if a prop which affects the sankey layout has changed (most don't)
    const sankeyLayoutPropKeys = ["nodes", "links", "width", "height", "marginTop", "marginBottom", "marginLeft", "marginRight", "nodeId", "nodeWidth", "nodePadding", "nodeAlignment"];

    const hasChangedSankey = _lodash.default.some(sankeyLayoutPropKeys, key => {
      return nextProps[key] !== this.props[key];
    });

    if (hasChangedSankey) this._makeSankeyGraph();
  }

  render() {
    const {
      width,
      height,
      style,
      standalone,
      nodeId,
      marginTop,
      marginBottom,
      marginLeft,
      marginRight
    } = this.props;
    const graph = this._graph;
    const makeLinkPath = (0, _d3Sankey.sankeyLinkHorizontal)();
    const className = "rct-sankey-diagram ".concat(this.props.className);
    const innerWidth = width - (marginLeft + marginRight);
    const innerHeight = height - (marginTop + marginBottom);

    function mapNodesInGroupIf(shouldShow, groupClassName, mapFunc) {
      if (!shouldShow) return null;
      return _react.default.createElement("g", {
        className: groupClassName
      }, (graph.nodes || []).map((node, i) => {
        if (!(0, _Data.getValue)(shouldShow, node, graph)) return null;
        const key = "node-".concat(nodeId(node));
        return mapFunc(node, i, key);
      }));
    }

    function mapLinksInGroupIf(shouldShow, groupClassName, mapFunc) {
      if (!shouldShow) return null;
      return _react.default.createElement("g", {
        className: groupClassName
      }, (graph.links || []).map((link, i) => {
        if (!(0, _Data.getValue)(shouldShow, link, graph)) return null;
        const key = "link-".concat(nodeId(link.source), "-to-").concat(nodeId(link.target));
        return mapFunc(link, i, key);
      }));
    }

    function displayStepLabelsIf(stepLabelText, stepLabelClassName, stepLabelStyle, stepLabelPadding, nodes) {
      if (!stepLabelText) {
        return null;
      }

      const depthMapXPos = {};
      const depthMapYPos = {};
      nodes.forEach(n => {
        depthMapXPos[n.depth] = n.x0; // For the given depth, set the y equal to the highest positioned y value

        depthMapYPos[n.depth] = depthMapYPos[n.depth] ? Math.min(n.y0, depthMapYPos[n.depth]) : n.y0;
      });
      return _react.default.createElement("g", {
        className: "rct-step-labels",
        width: innerWidth,
        height: 100
      }, _lodash.default.map(depthMapXPos, (x, step) => {
        const stepLabelProps = {
          y: depthMapYPos[step],
          step,
          x,
          stepLabelText,
          stepLabelClassName,
          stepLabelPadding,
          stepLabelStyle
        };
        return _react.default.createElement(SankeyStepLabel, _extends({
          key: "rct-step-".concat(step)
        }, stepLabelProps));
      }));
    }

    return _react.default.createElement(SVGContainer, {
      standalone,
      width,
      height,
      className,
      style
    }, _react.default.createElement("g", {
      width: innerWidth,
      height: innerHeight,
      transform: "translate(".concat(marginLeft, ", ").concat(marginTop, ")")
    }, displayStepLabelsIf(this.props.stepLabelText, this.props.stepLabelClassName, this.props.stepLabelStyle, this.props.stepLabelPadding, graph.nodes), mapLinksInGroupIf(this.props.showLinks, "rct-sankey-links", (link, i, key) => {
      const linkProps = _objectSpread({}, this.props, {
        key,
        graph,
        link,
        linkPath: makeLinkPath(link)
      });

      return _react.default.createElement(SankeyLink, linkProps);
    }), mapNodesInGroupIf(this.props.showNodes, "rct-sankey-nodes", (node, i, key) => {
      return _react.default.createElement(SankeyNode, _extends({}, this.props, {
        key,
        graph,
        node
      }));
    }), ";", mapNodesInGroupIf(this.props.showNodeTerminals, "rct-sankey-node-terminals", (node, i, key) => {
      return _react.default.createElement(SankeyNodeTerminal, _extends({}, this.props, {
        key,
        graph,
        node
      }));
    }), ";", this.props.showLinkLabels || this.props.showLinkSourceLabels || this.props.showLinkTargetLabels ? _react.default.createElement("defs", null, graph.links.map(link => {
      const hasLabel = (0, _Data.getValue)(this.props.showLinkLabels, link, graph) || (0, _Data.getValue)(this.props.showLinkSourceLabels, link, graph) || (0, _Data.getValue)(this.props.showLinkTargetLabels, link, graph);
      if (!hasLabel) return null;
      const linkPath = makeLinkPath(link);
      const linkPathId = "".concat(getLinkId(link, nodeId), "-path");
      return _react.default.createElement("path", {
        id: linkPathId,
        d: linkPath,
        key: linkPathId
      });
    })) : null, mapLinksInGroupIf(this.props.showLinkLabels, "rct-sankey-link-labels", (link, i, key) => {
      const linkPathId = "".concat(getLinkId(link, nodeId), "-path");

      const labelProps = _objectSpread({}, this.props, {
        key,
        graph,
        link,
        linkPathId
      });

      return _react.default.createElement(SankeyLinkLabel, labelProps);
    }), mapNodesInGroupIf(this.props.showNodeLabels, "rct-sankey-node-labels", (node, i, key) => {
      return _react.default.createElement(SankeyNodeLabel, _extends({}, this.props, {
        key,
        graph,
        node
      }));
    }), ";", mapLinksInGroupIf(this.props.showLinkSourceLabels, "rct-sankey-link-source-labels", (link, i, key) => {
      const linkPathId = "".concat(getLinkId(link, nodeId), "-path");

      const commonProps = _objectSpread({}, this.props, {
        key,
        graph,
        link,
        linkPathId
      });

      const labelProps = _objectSpread({}, commonProps, {
        linkLabelText: this.props.linkSourceLabelText,
        linkLabelClassName: this.props.linkSourceLabelClassName,
        linkLabelStyle: this.props.linkSourceLabelStyle,
        linkLabelAttributes: this.props.linkSourceLabelAttributes,
        linkLabelStartOffset: this.props.linkSourceLabelStartOffset
      });

      return _react.default.createElement(SankeyLinkLabel, labelProps);
    }), mapLinksInGroupIf(this.props.showLinkTargetLabels, "rct-sankey-link-target-labels", (link, i, key) => {
      const linkPathId = "".concat(getLinkId(link, nodeId), "-path");

      const commonProps = _objectSpread({}, this.props, {
        key,
        graph,
        link,
        linkPathId
      });

      const labelProps = _objectSpread({}, commonProps, {
        linkLabelText: this.props.linkTargetLabelText,
        linkLabelClassName: this.props.linkTargetLabelClassName,
        linkLabelStyle: _objectSpread({
          textAnchor: "end"
        }, this.props.linkTargetLabelStyle),
        linkLabelAttributes: this.props.linkTargetLabelAttributes,
        linkLabelStartOffset: this.props.linkTargetLabelStartOffset
      });

      return _react.default.createElement(SankeyLinkLabel, labelProps);
    })));
  }

}

exports.default = SankeyDiagram;

_defineProperty(SankeyDiagram, "propTypes", {
  /**
   * Array of node objects, represented by vertical rectangles.
   * These represent the base entities which links flow into & out of.
   */
  nodes: _propTypes.default.arrayOf(_propTypes.default.object).isRequired,

  /**
   * Array of link objects, represented by curved paths between nodes.
   * Links represent a magnitude of flow between one node and another.
   * Each should have a 'source' node [identifier], a 'target' node [identifier],
   * and a numerical value representing flow magnitude.
   */
  links: _propTypes.default.arrayOf(_propTypes.default.shape({
    source: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.number]),
    target: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.number]),
    value: _propTypes.default.number
  })).isRequired,

  /**
   * Width of the SVG element.
   */
  width: _propTypes.default.number.isRequired,

  /**
   * Height of the SVG element.
   */
  height: _propTypes.default.number.isRequired,

  /**
   * Boolean which decides if the nodes & links props should be cloned before being mutated into
   * the Sankey data structure. Passing `false` is faster, but may cause unintended side effects
   * if nodes or links data are used elsewhere
   */
  shouldClone: _propTypes.default.bool,

  /**
   * `className` attribute to be applied to the SVG element.
   */
  className: _propTypes.default.string,

  /**
   * Inline style object to be applied to the SVG element.
   */
  style: _propTypes.default.object,

  /**
   * Boolean which determines whether the chart should be rendered as a standalone `<svg>` element
   * or a `<g>` group element (as a child within an existing `<svg>`).
   * True by default, pass `false` to render in a `<g>`.
   */
  standalone: _propTypes.default.bool,

  /**
   * Internal top margin, in pixels. Generally used to eg. leave extra space inside the SVG for labels.
   */
  marginTop: _propTypes.default.number,

  /**
   * Internal bottom margin, in pixels.
   */
  marginBottom: _propTypes.default.number,

  /**
   * Internal left margin, in pixels.
   */
  marginLeft: _propTypes.default.number,

  /**
   * Internal right margin, in pixels.
   */
  marginRight: _propTypes.default.number,

  /**
   * Boolean which determines if node rectangles should be shown,
   * or function (`showNode(node, graph)`) which returns a boolean
   */
  showNodes: _propTypes.default.oneOfType([_propTypes.default.bool, _propTypes.default.func]),

  /**
   * Accessor function `nodeId(node, graph)` which specifies how to access the ID of each node object.
   * These should be the same identifiers used by `links[].source` and `.target`.
   * Uses the node's index in `nodes` array by default.
   */
  nodeId: _propTypes.default.func,

  /**
   * Width (in pixels) of the vertical node rectangles.
   */
  nodeWidth: _propTypes.default.number,

  /**
   * Vertical padding (in pixels) between each of the node lines.
   */
  nodePadding: _propTypes.default.number,

  /**
   * Node alignment method used to layout the nodes.
   * May be 'left', 'right', 'center', 'justify', or a custom function.
   * See [d3-sankey alignment docs](https://github.com/d3/d3-sankey#alignments) for more details.
   */
  nodeAlignment: _propTypes.default.oneOf(["left", "right", "center", "justify"]),

  /**
   * `className` attribute to be applied to each node,
   * or accessor function which returns a class (string).
   */
  nodeClassName: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),

  /**
   * Inline style object to be applied to each node,
   * or accessor function which returns a style object.
   */
  nodeStyle: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.func]),

  /**
   * Node `mouseenter` event handler, called when user's mouse enters a node.
   */
  onMouseEnterNode: _propTypes.default.func,

  /**
   * Node `mouseleave` event handler, called when user's mouse leaves a node.
   */
  onMouseLeaveNode: _propTypes.default.func,

  /**
   * Node `mousemove` event handler, called when user's mouse moves within a node.
   */
  onMouseMoveNode: _propTypes.default.func,

  /**
   * Node `mousedown` event handler, called when user's mouse button is depressed within a node.
   */
  onMouseDownNode: _propTypes.default.func,

  /**
   * Node `mouseup` event handler, called when user's mouse button is released within a node.
   */
  onMouseUpNode: _propTypes.default.func,

  /**
   * Node `click` event handler, called when user clicks within a node.
   */
  onClickNode: _propTypes.default.func,

  /**
   * Boolean which determines if link paths should be shown,
   * or function (`showLink(link, graph)`) which returns a boolean
   */
  showLinks: _propTypes.default.oneOfType([_propTypes.default.bool, _propTypes.default.func]),

  /**
   * Class attribute to be applied to each link,
   * or accessor function which returns a class (string).
   */
  linkClassName: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),

  /**
   * Inline style object to be applied to each link,
   * or accessor function which returns a style object.
   */
  linkStyle: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.func]),

  /**
   * Link `mouseenter` event handler, called when user's mouse enters a link.
   */
  onMouseEnterLink: _propTypes.default.func,

  /**
   * Link `mouseleave` event handler, called when user's mouse leaves a link.
   */
  onMouseLeaveLink: _propTypes.default.func,

  /**
   * Link `mousemove` event handler, called when user's mouse moves within a link.
   */
  onMouseMoveLink: _propTypes.default.func,

  /**
   * Link `mousedown` event handler, called when user's mouse button is depressed within a link.
   */
  onMouseDownLink: _propTypes.default.func,

  /**
   * Link `mouseup` event handler, called when user's mouse button is released within a link.
   */
  onMouseUpLink: _propTypes.default.func,

  /**
   * Link `click` event handler, called when user clicks within a link.
   */
  onClickLink: _propTypes.default.func,

  /**
   * Boolean which determines if node terminals should be shown,
   * or function (`showLink(link, graph)`) which returns a boolean.
   * Terminals are bars that run alongside to show the amount
   * which has flowed *in* but not *out*
   */
  showNodeTerminals: _propTypes.default.oneOfType([_propTypes.default.bool, _propTypes.default.func]),

  /**
   * Width (in pixels) of the node terminal rectangles,
   * or accessor function `f(node, graph)` which returns a width.
   */
  nodeTerminalWidth: _propTypes.default.oneOfType([_propTypes.default.bool, _propTypes.default.number]),

  /**
   * Distance (in pixels) between nodes and their terminals,
   * or accessor function `f(node, graph)` which returns a distance.
   */
  nodeTerminalDistance: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.func]),

  /**
   * `className` attribute to be applied to each node terminal,
   * or accessor function which returns a class (string).
   */
  nodeTerminalClassName: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),

  /**
   * Inline style object to be applied to each node terminal,
   * or accessor function which returns a style object.
   */
  nodeTerminalStyle: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.func]),

  /**
   * Attributes object to be applied to each node terminal element,
   * or accessor function which returns an object.
   */
  nodeTerminalAttributes: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.func]),

  /**
   * Node terminal `mouseenter` event handler, called when user's mouse enters a node terminal.
   */
  onMouseEnterNodeTerminal: _propTypes.default.func,

  /**
   * Node terminal `mouseleave` event handler, called when user's mouse leaves a node terminal.
   */
  onMouseLeaveNodeTerminal: _propTypes.default.func,

  /**
   * Node terminal `mousemove` event handler, called when user's mouse moves within a node terminal.
   */
  onMouseMoveNodeTerminal: _propTypes.default.func,

  /**
   * Node terminal `mousedown` event handler, called when user's mouse button is depressed within a node terminal.
   */
  onMouseDownNodeTerminal: _propTypes.default.func,

  /**
   * Node terminal `mouseup` event handler, called when user's mouse button is released within a node terminal.
   */
  onMouseUpNodeTerminal: _propTypes.default.func,

  /**
   * Node terminal `click` event handler, called when user clicks within a node terminal.
   */
  onClickNodeTerminal: _propTypes.default.func,

  /**
   * Boolean which determines if node labels should be shown,
   * or function (`showLink(link, graph)`) which returns a boolean
   */
  showNodeLabels: _propTypes.default.oneOfType([_propTypes.default.bool, _propTypes.default.func]),

  /**
   * Placement of the node label relative to the node rectangle.
   * Expects 'before', 'after', 'above' or 'below', or a function which returns one of these.
   * By default, labels in the left half of the diagram are placed 'after' and those in the right half 'before'
   */
  nodeLabelPlacement: _propTypes.default.oneOfType([_propTypes.default.oneOf(["before", "after", "above", "below"]), _propTypes.default.func]),

  /**
   * Distance (in pixels) between nodes and their labels,
   * or accessor function `f(node, graph)` which returns a distance.
   */
  nodeLabelDistance: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.func]),

  /**
   * Accessor function `nodeLabelText(node, graph)` which returns the content to be used for node labels.
   * The function may return a string/number (rendered as SVG `<text>`),
   * or arbitrary React SVG element(s) (rendered as-is inside the SVG).
   * NOTE: in the latter case (returning arbitrary SVG), `nodeLabelPlacement`, `nodeLabelDistance`,
   * `nodeLabelClassName` and `nodeLabelStyle` props will not be applied -
   * user is responsible for all positioning and attributes on this element.
   */
  nodeLabelText: _propTypes.default.func,

  /**
   * `className` attribute to be applied to each node label,
   * or accessor function which returns a class (string).
   */
  nodeLabelClassName: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),

  /**
   * Inline style object to be applied to each node label,
   * or accessor function which returns a style object.
   */
  nodeLabelStyle: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.func]),

  /**
   * Boolean which determines if link labels should be shown,
   * or function (`showLink(link, graph)`) which returns a boolean
   */
  showLinkLabels: _propTypes.default.oneOfType([_propTypes.default.bool, _propTypes.default.func]),

  /**
   * Accessor function `f(link, graph)` which returns the text to be used for link labels.
   */
  linkLabelText: _propTypes.default.func,

  /**
   * `className` attribute to be applied to each link label,
   * or accessor function which returns a class (string).
   */
  linkLabelClassName: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),

  /**
   * Inline style object to be applied to each link label,
   * or accessor function which returns a style object.
   */
  linkLabelStyle: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.func]),

  /**
   * Attributes object to be applied to each link label element,
   * or accessor function which returns an object.
   */
  linkLabelAttributes: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.func]),

  /**
   * `startOffset` attribute to apply to the link label `<textpath>` element.
   * May be a number (in SVG units) or percent string (`"25%"`)
   */
  linkLabelStartOffset: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.number]),

  /**
   * Boolean which determines if link *source* labels should be shown,
   * or function (`showLink(link, graph)`) which returns a boolean
   */
  showLinkSourceLabels: _propTypes.default.oneOfType([_propTypes.default.bool, _propTypes.default.func]),

  /**
   * Accessor function `f(link, graph)` which returns the text to be used for link *source* labels.
   */
  linkSourceLabelText: _propTypes.default.func,

  /**
   * `className` attribute to be applied to each link *source* label,
   * or accessor function which returns a class (string).
   */
  linkSourceLabelClassName: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),

  /**
   * Inline style object to be applied to each link *source* label,
   * or accessor function which returns a style object.
   */
  linkSourceLabelStyle: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.func]),

  /**
   * Attributes object to be applied to each link *source* label,
   * or accessor function which returns an object.
   */
  linkSourceLabelAttributes: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.func]),

  /**
   * `startOffset` attribute to apply to the link *source* label `<textpath>` element.
   * May be a number (in SVG units) or percent string (`"25%"`)
   */
  linkSourceLabelStartOffset: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.number]),

  /**
   * Boolean which determines if link *target* labels should be shown,
   * or function (`showLink(link, graph)`) which returns a boolean
   */
  showLinkTargetLabels: _propTypes.default.oneOfType([_propTypes.default.bool, _propTypes.default.func]),

  /**
   * Accessor function `f(link, graph)` which returns the text to be used for link *target* labels.
   */
  linkTargetLabelText: _propTypes.default.func,

  /**
   * `className` attribute to be applied to each link *target* label,
   * or accessor function which returns a class (string).
   */
  linkTargetLabelClassName: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),

  /**
   * Inline style object to be applied to each link *target* label,
   * or accessor function which returns a style object.
   */
  linkTargetLabelStyle: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.func]),

  /**
   * Attributes object to be applied to each link *target* label,
   * or accessor function which returns an object.
   */
  linkTargetLabelAttributes: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.func]),

  /**
   * `startOffset` attribute to apply to the link *target* label `<textpath>` element.
   * May be a number (in SVG units) or percent string (`"25%"`)
   */
  linkTargetLabelStartOffset: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.number]),

  /**
   * Text for step label or
   * accessor function `f(step)` that returns the label text
   */
  stepLabelText: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),

  /**
   * `className` attribute applied to each label,
   * or accessor function which returns a class (string)
   */
  stepLabelClassName: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),

  /**
   * Inline style object to be applied to each label,
   * or accessor function which returns an object
   */
  stepLabelStyle: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.func]),

  /**
   * Vertical padding (in pixels) between step label and uppermost positioned node of that step
   */
  stepLabelPadding: _propTypes.default.number //standalone

});

_defineProperty(SankeyDiagram, "defaultProps", {
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
  nodeId: node => node.index,
  showNodes: true,
  nodeWidth: 12,
  nodePadding: 8,
  stepLabelPadding: 8,
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
  nodeTerminalAttributes: {
    rx: 2,
    ry: 2
  },
  showNodeLabels: true,
  nodeLabelPlacement: (node, graph) => {
    return node.depth < graph.maxDepth / 2 ? "after" : "before";
  },
  nodeLabelDistance: 4,
  nodeLabelText: (node, graph, props) => {
    if (_lodash.default.has(node, "name")) return node.name;
    if (_lodash.default.has(node, "label")) return node.label;
    return (0, _Data.getValue)(props.nodeId, node, graph, props);
  },
  nodeLabelClassName: "",
  nodeLabelStyle: {},
  showLinkLabels: false,
  linkLabelText: (link, graph, props) => {
    const valueText = (0, _numeral.default)(link.value || 0).format("0.[0]a");
    const sourceText = (0, _Data.getValue)(props.nodeLabelText, link.source, graph, props);
    const targetText = (0, _Data.getValue)(props.nodeLabelText, link.target, graph, props);
    return "".concat(sourceText, "\u2192").concat(targetText, ": ").concat(valueText);
  },
  linkLabelClassName: "",
  linkLabelStyle: {},
  linkLabelAttributes: {},
  linkLabelStartOffset: "25%",
  showLinkSourceLabels: false,
  linkSourceLabelText: (link, graph, props) => {
    const valueRelative = link.valueSourceRelative;
    if (!_lodash.default.isFinite(valueRelative)) return "";
    const percentText = valueRelative < 0.001 ? "<0.1%" : (0, _numeral.default)(valueRelative).format("0.[0]%");
    return "".concat(percentText, " to ").concat((0, _Data.getValue)(props.nodeLabelText, link.target, graph, props));
  },
  linkSourceLabelClassName: "",
  linkSourceLabelStyle: {},
  linkSourceLabelAttributes: {},
  linkSourceLabelStartOffset: "2%",
  showLinkTargetLabels: false,
  linkTargetLabelText: (link, graph, props) => {
    const valueRelative = link.valueTargetRelative;
    if (!_lodash.default.isFinite(valueRelative)) return "";
    const percentText = valueRelative < 0.001 ? "<0.1%" : (0, _numeral.default)(valueRelative).format("0.[0]%");
    return "".concat(percentText, " from ").concat((0, _Data.getValue)(props.nodeLabelText, link.source, graph, props));
  },
  linkTargetLabelClassName: "",
  linkTargetLabelStyle: {},
  linkTargetLabelAttributes: {},
  linkTargetLabelStartOffset: "98%"
});
//# sourceMappingURL=SankeyDiagram.js.map