import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import numeral from "numeral";
import {sankey, sankeyLinkHorizontal, sankeyLeft, sankeyRight, sankeyCenter, sankeyJustify} from "d3-sankey";

import {getValue} from "./utils/Data";

const SankeyNode = props => {
  const {graph, node, nodeClassName, nodeStyle} = props;
  // create partial functions for handlers - callbacks with the current node/graph arguments attached
  const makeHandler = origHandler => (_.isFunction(origHandler) ? _.partial(origHandler, _, {node, graph}) : null);

  return (
    <rect
      x={node.x0}
      y={node.y0}
      width={Math.abs(node.x1 - node.x0)}
      height={Math.abs(node.y1 - node.y0)}
      className={`sankey-node ${getValue(nodeClassName, node, graph)}`}
      style={getValue(nodeStyle, node, graph)}
      onMouseEnter={makeHandler(props.onMouseEnterNode)}
      onMouseLeave={makeHandler(props.onMouseLeaveNode)}
      onMouseMove={makeHandler(props.onMouseMoveNode)}
      onMouseDown={makeHandler(props.onMouseDownNode)}
      onMouseUp={makeHandler(props.onMouseUpNode)}
      onClick={makeHandler(props.onClickNode)}
    />
  );
};

const SankeyLink = props => {
  const {graph, link, linkPath, linkClassName, linkStyle} = props;
  // create partial functions for handlers - callbacks with the current graph/link arguments attached
  const makeHandler = origHandler => (_.isFunction(origHandler) ? _.partial(origHandler, _, {link, graph}) : null);

  return (
    <path
      d={linkPath}
      className={`sankey-link ${getValue(linkClassName, link, graph)}`}
      style={{
        ...getValue(linkStyle, link, graph),
        strokeWidth: link.width
      }}
      onMouseEnter={makeHandler(props.onMouseEnterLink)}
      onMouseLeave={makeHandler(props.onMouseLeaveLink)}
      onMouseMove={makeHandler(props.onMouseMoveLink)}
      onMouseDown={makeHandler(props.onMouseDownLink)}
      onMouseUp={makeHandler(props.onMouseUpLink)}
      onClick={makeHandler(props.onClickLink)}
    />
  );
};

const SankeyNodeTerminal = props => {
  const {node, graph} = props;
  if (!node.terminalValue) return null;
  const makeHandler = origHandler =>
    _.isFunction(origHandler) ? _.partial(origHandler, _, {node, graph, props}) : null;
  const getWithNode = accessor => getValue(accessor, node, graph, props);
  const width = getWithNode(props.nodeTerminalWidth) || 0;
  const distance = getWithNode(props.nodeTerminalDistance) || 0;
  const nodeHeight = Math.abs(node.y1 - node.y0) || 0;
  const height = (nodeHeight * node.terminalValue || 0) / (node.value || 0) || 0;
  const style = getWithNode(props.nodeTerminalStyle);
  const className = `sankey-node-terminal ${getWithNode(props.nodeTerminalClassName)}`;
  const attributes = getWithNode(props.nodeTerminalAttributes);

  return (
    <rect
      x={node.x1 + distance}
      y={node.y0 + (nodeHeight - height)}
      {...{width, height, style, className}}
      {...attributes}
      onMouseEnter={makeHandler(props.onMouseEnterNodeTerminal)}
      onMouseLeave={makeHandler(props.onMouseLeaveNodeTerminal)}
      onMouseMove={makeHandler(props.onMouseMoveNodeTerminal)}
      onMouseDown={makeHandler(props.onMouseDownNodeTerminal)}
      onMouseUp={makeHandler(props.onMouseUpNodeTerminal)}
      onClick={makeHandler(props.onClickNodeTerminal)}
    />
  );
};

const SankeyNodeLabel = props => {
  const {node, graph, nodeLabelText, nodeId} = props;
  const getWithNode = accessor => getValue(accessor, node, graph, props);
  const getLabelText = _.isFunction(nodeLabelText) ? nodeLabelText : nodeId;
  const placement = getWithNode(props.nodeLabelPlacement);
  const distance = getWithNode(props.nodeLabelDistance) || 0;

  const className = `sankey-node-label ${getWithNode(props.nodeLabelClassName)}`;
  let style = {...getWithNode(props.nodeLabelStyle)};
  let textPosition;

  // use placement prop to determine x, y, alignmentBaseline and
  if (placement === "above") {
    style = {alignmentBaseline: "baseline", textAnchor: "middle", ...style};
    textPosition = {
      x: node.x0 + Math.abs(node.x1 - node.x0) / 2,
      y: node.y0 - distance
    };
  } else if (placement === "below") {
    style = {alignmentBaseline: "hanging", textAnchor: "middle", ...style};
    textPosition = {
      x: node.x0 + Math.abs(node.x1 - node.x0) / 2,
      y: node.y1 + distance
    };
  } else if (placement === "before") {
    style = {alignmentBaseline: "middle", textAnchor: "end", ...style};
    textPosition = {
      x: node.x0 - distance,
      y: node.y0 + Math.abs(node.y1 - node.y0) / 2
    };
  } else {
    if (!_.isUndefined(placement) && placement !== "after")
      console.warn(`${placement} is not a valid value for nodeLabelPlacement - defaulting to "after"`);
    style = {alignmentBaseline: "middle", textAnchor: "start", ...style};
    textPosition = {
      x: node.x1 + distance,
      y: node.y0 + Math.abs(node.y1 - node.y0) / 2
    };
  }

  return (
    <text {...textPosition} className={className} style={style}>
      {getLabelText(node, graph)}
    </text>
  );
};

const SankeyLinkLabel = props => {
  const {link, graph} = props;
  const getWithLink = accessor => getValue(accessor, link, graph, props);
  const className = `sankey-link-label ${getWithLink(props.linkLabelClassName || "")}`;
  const style = getWithLink(props.linkLabelStyle || {});
  const attributes = getWithLink(props.linkLabelAttributes || {});
  const startOffset = getWithLink(props.linkLabelStartOffset || 0);

  return (
    <text className={className} style={style} {...attributes}>
      <textPath startOffset={startOffset} xlinkHref={`#${props.linkPathId}`}>
        {getWithLink(props.linkLabelText)}
      </textPath>
    </text>
  );
};


const SVGContainer = props => {
  const otherProps = _.omit(props, ['standalone']);
  if(props.standalone) {
    return <svg {...otherProps} />;
  }
  return <g {...otherProps} />;
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
    link.valueSourceRelative = (link.value || 0) / _.get(link, "source.value", 0);
    link.valueTargetRelative = (link.value || 0) / _.get(link, "target.value", 0);
  });

  graph.maxDepth = _.maxBy(graph.nodes, "depth");
  graph.maxDepth = graph.nodes.reduce((max, node) => Math.max(node.depth || 0, max), 0);
  return graph;
}

function getLinkId(link, nodeId) {
  return `link-${nodeId(link.source)}-to-${nodeId(link.target)}`;
}

const nodeAlignmentsByName = {
  left: sankeyLeft,
  right: sankeyRight,
  center: sankeyCenter,
  justify: sankeyJustify
};

/**
 * A Sankey diagram is a type of flow diagram which represents
 */
export default class SankeyDiagram extends React.Component {
  static propTypes = {
    /**
     * Array of node objects, represented by vertical rectangles.
     * These represent the base entities which links flow into & out of.
     */
    nodes: PropTypes.arrayOf(PropTypes.object).isRequired,
    /**
     * Array of link objects, represented by curved paths between nodes.
     * Links represent a magnitude of flow between one node and another.
     * Each should have a 'source' node [identifier], a 'target' node [identifier],
     * and a numerical value representing flow magnitude.
     */
    links: PropTypes.arrayOf(
      PropTypes.shape({
        source: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        target: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        value: PropTypes.number
      })
    ).isRequired,
    /**
     * Width of the SVG element.
     */
    width: PropTypes.number.isRequired,
    /**
     * Height of the SVG element.
     */
    height: PropTypes.number.isRequired,
    /**
     * `className` attribute to be applied to the SVG element.
     */
    className: PropTypes.string,
    /**
     * Inline style object to be applied to the SVG element.
     */
    style: PropTypes.object,

    /**
     * Boolean which determines if node rectangles should be shown,
     * or function (`showNode(node, graph)`) which returns a boolean
     */
    showNodes: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    /**
     * Accessor function `nodeId(node, graph)` which specifies how to access the ID of each node object.
     * These should be the same identifiers used by `links[].source` and `.target`.
     * Uses the node's index in `nodes` array by default.
     */
    nodeId: PropTypes.func,
    /**
     * Width (in pixels) of the vertical node rectangles.
     */
    nodeWidth: PropTypes.number,
    /**
     * Vertical padding (in pixels) between each of the node lines.
     */
    nodePadding: PropTypes.number,
    /**
     * Node alignment method used to layout the nodes.
     * May be 'left', 'right', 'center', 'justify', or a custom function.
     * See [d3-sankey alignment docs](https://github.com/d3/d3-sankey#alignments) for more details.
     */
    nodeAlignment: PropTypes.oneOf(["left", "right", "center", "justify"]),
    /**
     * `className` attribute to be applied to each node,
     * or accessor function which returns a class (string).
     */
    nodeClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    /**
     * Inline style object to be applied to each node,
     * or accessor function which returns a style object.
     */
    nodeStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /**
     * Node `mouseenter` event handler, called when user's mouse enters a node.
     */
    onMouseEnterNode: PropTypes.func,
    /**
     * Node `mouseleave` event handler, called when user's mouse leaves a node.
     */
    onMouseLeaveNode: PropTypes.func,
    /**
     * Node `mousemove` event handler, called when user's mouse moves within a node.
     */
    onMouseMoveNode: PropTypes.func,
    /**
     * Node `mousedown` event handler, called when user's mouse button is depressed within a node.
     */
    onMouseDownNode: PropTypes.func,
    /**
     * Node `mouseup` event handler, called when user's mouse button is released within a node.
     */
    onMouseUpNode: PropTypes.func,
    /**
     * Node `click` event handler, called when user clicks within a node.
     */
    onClickNode: PropTypes.func,

    /**
     * Boolean which determines if link paths should be shown,
     * or function (`showLink(link, graph)`) which returns a boolean
     */
    showLinks: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    /**
     * Class attribute to be applied to each link,
     * or accessor function which returns a class (string).
     */
    linkClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    /**
     * Inline style object to be applied to each link,
     * or accessor function which returns a style object.
     */
    linkStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /**
     * Link `mouseenter` event handler, called when user's mouse enters a link.
     */
    onMouseEnterLink: PropTypes.func,
    /**
     * Link `mouseleave` event handler, called when user's mouse leaves a link.
     */
    onMouseLeaveLink: PropTypes.func,
    /**
     * Link `mousemove` event handler, called when user's mouse moves within a link.
     */
    onMouseMoveLink: PropTypes.func,
    /**
     * Link `mousedown` event handler, called when user's mouse button is depressed within a link.
     */
    onMouseDownLink: PropTypes.func,
    /**
     * Link `mouseup` event handler, called when user's mouse button is released within a link.
     */
    onMouseUpLink: PropTypes.func,
    /**
     * Link `click` event handler, called when user clicks within a link.
     */
    onClickLink: PropTypes.func,

    /**
     * Boolean which determines if node terminals should be shown,
     * or function (`showLink(link, graph)`) which returns a boolean.
     * Terminals are bars that run alongside to show the amount
     * which has flowed *in* but not *out*
     */
    showNodeTerminals: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    /**
     * Width (in pixels) of the node terminal rectangles,
     * or accessor function `f(node, graph)` which returns a width.
     */
    nodeTerminalWidth: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    /**
     * Distance (in pixels) between nodes and their terminals,
     * or accessor function `f(node, graph)` which returns a distance.
     */
    nodeTerminalDistance: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    /**
     * `className` attribute to be applied to each node terminal,
     * or accessor function which returns a class (string).
     */
    nodeTerminalClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    /**
     * Inline style object to be applied to each node terminal,
     * or accessor function which returns a style object.
     */
    nodeTerminalStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /**
     * Attributes object to be applied to each node terminal element,
     * or accessor function which returns an object.
     */
    nodeTerminalAttributes: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /**
     * Node terminal `mouseenter` event handler, called when user's mouse enters a node terminal.
     */
    onMouseEnterNodeTerminal: PropTypes.func,
    /**
     * Node terminal `mouseleave` event handler, called when user's mouse leaves a node terminal.
     */
    onMouseLeaveNodeTerminal: PropTypes.func,
    /**
     * Node terminal `mousemove` event handler, called when user's mouse moves within a node terminal.
     */
    onMouseMoveNodeTerminal: PropTypes.func,
    /**
     * Node terminal `mousedown` event handler, called when user's mouse button is depressed within a node terminal.
     */
    onMouseDownNodeTerminal: PropTypes.func,
    /**
     * Node terminal `mouseup` event handler, called when user's mouse button is released within a node terminal.
     */
    onMouseUpNodeTerminal: PropTypes.func,
    /**
     * Node terminal `click` event handler, called when user clicks within a node terminal.
     */
    onClickNodeTerminal: PropTypes.func,

    /**
     * Boolean which determines if node labels should be shown,
     * or function (`showLink(link, graph)`) which returns a boolean
     */
    showNodeLabels: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    /**
     * Placement of the node label relative to the node rectangle.
     * Expects 'before', 'after', 'above' or 'below', or a function which returns one of these.
     * By default, labels in the left half of the diagram are placed 'after' and those in the right half 'before'
     */
    nodeLabelPlacement: PropTypes.oneOfType([PropTypes.oneOf(["before", "after", "above", "below"]), PropTypes.func]),
    /**
     * Distance (in pixels) between nodes and their labels,
     * or accessor function `f(node, graph)` which returns a distance.
     */
    nodeLabelDistance: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    /**
     * Accessor function `nodeLabelText(node, graph)` which returns the text to be used for node labels.
     */
    nodeLabelText: PropTypes.func,
    /**
     * `className` attribute to be applied to each node label,
     * or accessor function which returns a class (string).
     */
    nodeLabelClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    /**
     * Inline style object to be applied to each node label,
     * or accessor function which returns a style object.
     */
    nodeLabelStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),

    /**
     * Boolean which determines if link labels should be shown,
     * or function (`showLink(link, graph)`) which returns a boolean
     */
    showLinkLabels: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    /**
     * Accessor function `f(link, graph)` which returns the text to be used for link labels.
     */
    linkLabelText: PropTypes.func,
    /**
     * `className` attribute to be applied to each link label,
     * or accessor function which returns a class (string).
     */
    linkLabelClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    /**
     * Inline style object to be applied to each link label,
     * or accessor function which returns a style object.
     */
    linkLabelStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /**
     * Attributes object to be applied to each link label element,
     * or accessor function which returns an object.
     */
    linkLabelAttributes: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /**
     * `startOffset` attribute to apply to the link label `<textpath>` element.
     * May be a number (in SVG units) or percent string (`"25%"`)
     */
    linkLabelStartOffset: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    /**
     * Boolean which determines if link *source* labels should be shown,
     * or function (`showLink(link, graph)`) which returns a boolean
     */
    showLinkSourceLabels: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    /**
     * Accessor function `f(link, graph)` which returns the text to be used for link *source* labels.
     */
    linkSourceLabelText: PropTypes.func,
    /**
     * `className` attribute to be applied to each link *source* label,
     * or accessor function which returns a class (string).
     */
    linkSourceLabelClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    /**
     * Inline style object to be applied to each link *source* label,
     * or accessor function which returns a style object.
     */
    linkSourceLabelStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /**
     * Attributes object to be applied to each link *source* label,
     * or accessor function which returns an object.
     */
    linkSourceLabelAttributes: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /**
     * `startOffset` attribute to apply to the link *source* label `<textpath>` element.
     * May be a number (in SVG units) or percent string (`"25%"`)
     */
    linkSourceLabelStartOffset: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    /**
     * Boolean which determines if link *target* labels should be shown,
     * or function (`showLink(link, graph)`) which returns a boolean
     */
    showLinkTargetLabels: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    /**
     * Accessor function `f(link, graph)` which returns the text to be used for link *target* labels.
     */
    linkTargetLabelText: PropTypes.func,
    /**
     * `className` attribute to be applied to each link *target* label,
     * or accessor function which returns a class (string).
     */
    linkTargetLabelClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    /**
     * Inline style object to be applied to each link *target* label,
     * or accessor function which returns a style object.
     */
    linkTargetLabelStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /**
     * Attributes object to be applied to each link *target* label,
     * or accessor function which returns an object.
     */
    linkTargetLabelAttributes: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /**
     * `startOffset` attribute to apply to the link *target* label `<textpath>` element.
     * May be a number (in SVG units) or percent string (`"25%"`)
     */
    linkTargetLabelStartOffset: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  };
  static defaultProps = {
    width: 400,
    height: 300,
    className: "",
    style: {},
    standalone: true,
    nodeId: node => node.index,
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
    nodeTerminalAttributes: {rx: 2, ry: 2},
    showNodeLabels: true,
    nodeLabelPlacement: (node, graph) => {
      return node.depth < graph.maxDepth / 2 ? "after" : "before";
    },
    nodeLabelDistance: 4,
    nodeLabelText: (node, graph, props) => {
      if (_.has(node, "name")) return node.name;
      if (_.has(node, "label")) return node.label;
      return getValue(props.nodeId, node, graph, props);
    },
    nodeLabelClassName: "",
    nodeLabelStyle: {},
    showLinkLabels: false,
    linkLabelText: (link, graph, props) => {
      const valueText = numeral(link.value || 0).format("0.[0]a");
      const sourceText = getValue(props.nodeLabelText, link.source, graph, props);
      const targetText = getValue(props.nodeLabelText, link.target, graph, props);
      return `${sourceText}→${targetText}: ${valueText}`;
    },
    linkLabelClassName: "",
    linkLabelStyle: {},
    linkLabelAttributes: {},
    linkLabelStartOffset: "25%",
    showLinkSourceLabels: false,
    linkSourceLabelText: (link, graph, props) => {
      const valueRelative = link.valueSourceRelative;
      if (!_.isFinite(valueRelative)) return "";
      const percentText = valueRelative < 0.001 ? "<0.1%" : numeral(valueRelative).format("0.[0]%");
      return `${percentText} to ${getValue(props.nodeLabelText, link.target, graph, props)}`;
    },
    linkSourceLabelClassName: "",
    linkSourceLabelStyle: {},
    linkSourceLabelAttributes: {},
    linkSourceLabelStartOffset: "2%",
    showLinkTargetLabels: false,
    linkTargetLabelText: (link, graph, props) => {
      const valueRelative = link.valueTargetRelative;
      if (!_.isFinite(valueRelative)) return "";
      const percentText = valueRelative < 0.001 ? "<0.1%" : numeral(valueRelative).format("0.[0]%");
      return `${percentText} from ${getValue(props.nodeLabelText, link.source, graph, props)}`;
    },
    linkTargetLabelClassName: "",
    linkTargetLabelStyle: {},
    linkTargetLabelAttributes: {},
    linkTargetLabelStartOffset: "98%"
  };

  _makeSankeyGraph() {
    const makeSankey = sankey()
      .size([this.props.width, this.props.height])
      .nodeId(this.props.nodeId)
      .nodeWidth(this.props.nodeWidth)
      .nodePadding(this.props.nodePadding)
      .nodeAlign(nodeAlignmentsByName[this.props.nodeAlignment] || nodeAlignmentsByName.justify);

    const sankeyGraph = makeSankey({nodes: this.props.nodes, links: this.props.links});
    this._graph = enhanceGraph(sankeyGraph);
  }

  componentWillMount() {
    this._makeSankeyGraph();
  }
  componentWillReceiveProps(nextProps) {
    // only update this._graph if a prop which affects the sankey layout has changed (most don't)
    const sankeyLayoutPropKeys = [
      "nodes",
      "links",
      "width",
      "height",
      "nodeId",
      "nodeWidth",
      "nodePadding",
      "nodeAlignment"
    ];

    const hasChangedSankey = _.some(sankeyLayoutPropKeys, key => {
      if (nextProps[key] !== this.props[key]) console.log("changed", key);
      return nextProps[key] !== this.props[key];
    });
    if (hasChangedSankey) this._makeSankeyGraph();
  }

  render() {
    const {width, height, style, standalone, nodeId} = this.props;

    const graph = this._graph;
    const makeLinkPath = sankeyLinkHorizontal();
    const className = `sankey-diagram ${this.props.className}`;

    function mapNodesInGroupIf(shouldShow, groupClassName, mapFunc) {
      if (!shouldShow) return null;
      return (
        <g className={groupClassName}>
          {(graph.nodes || []).map((node, i) => {
            if (!getValue(shouldShow, node, graph)) return null;
            const key = `node-${nodeId(node)}`;
            return mapFunc(node, i, key);
          })}
        </g>
      );
    }

    function mapLinksInGroupIf(shouldShow, groupClassName, mapFunc) {
      if (!shouldShow) return null;
      return (
        <g className={groupClassName}>
          {(graph.links || []).map((link, i) => {
            if (!getValue(shouldShow, link, graph)) return null;
            const key = `link-${nodeId(link.source)}-to-${nodeId(link.target)}`;
            return mapFunc(link, i, key);
          })}
        </g>
      );
    }

    return (
      <SVGContainer {...{standalone, width, height, className, style}}>
        {mapLinksInGroupIf(this.props.showLinks, "sankey-links", (link, i, key) => {
          const linkProps = {...this.props, key, graph, link, linkPath: makeLinkPath(link)};
          return <SankeyLink {...linkProps} />;
        })}
        {mapNodesInGroupIf(this.props.showNodes, "sankey-nodes", (node, i, key) => {
          return <SankeyNode {...this.props} {...{key, graph, node}} />;
        })};
        {mapNodesInGroupIf(this.props.showNodeTerminals, "sankey-node-terminals", (node, i, key) => {
          return <SankeyNodeTerminal {...this.props} {...{key, graph, node}} />;
        })};
        {/* the three types of link labels (link, link source, link target) use textpath to follow the link's path */}
        {/* to minimize dom elements, first render one set of path definitions to be used by all three label types */}
        {this.props.showLinkLabels || this.props.showLinkSourceLabels || this.props.showLinkTargetLabels ? (
          <defs>
            {graph.links.map(link => {
              const hasLabel =
                getValue(this.props.showLinkLabels, link, graph) ||
                getValue(this.props.showLinkSourceLabels, link, graph) ||
                getValue(this.props.showLinkTargetLabels, link, graph);
              if (!hasLabel) return null;

              const linkPath = makeLinkPath(link);
              const linkPathId = `${getLinkId(link, nodeId)}-path`;
              return <path id={linkPathId} d={linkPath} key={linkPathId} />;
            })}
          </defs>
        ) : null}
        {mapLinksInGroupIf(this.props.showLinkLabels, "sankey-link-labels", (link, i, key) => {
          const linkPathId = `${getLinkId(link, nodeId)}-path`;
          const labelProps = {...this.props, key, graph, link, linkPathId};
          return <SankeyLinkLabel {...labelProps} />;
        })}
        {mapNodesInGroupIf(this.props.showNodeLabels, "sankey-node-labels", (node, i, key) => {
          return <SankeyNodeLabel {...this.props} {...{key, graph, node}} />;
        })};
        {mapLinksInGroupIf(this.props.showLinkSourceLabels, "sankey-link-source-labels", (link, i, key) => {
          const linkPathId = `${getLinkId(link, nodeId)}-path`;
          const commonProps = {...this.props, key, graph, link, linkPathId};
          const labelProps = {
            ...commonProps,
            linkLabelText: this.props.linkSourceLabelText,
            linkLabelClassName: this.props.linkSourceLabelClassName,
            linkLabelStyle: this.props.linkSourceLabelStyle,
            linkLabelAttributes: this.props.linkSourceLabelAttributes,
            linkLabelStartOffset: this.props.linkSourceLabelStartOffset
          };

          return <SankeyLinkLabel {...labelProps} />;
        })}
        {mapLinksInGroupIf(this.props.showLinkTargetLabels, "sankey-link-target-labels", (link, i, key) => {
          const linkPathId = `${getLinkId(link, nodeId)}-path`;
          const commonProps = {...this.props, key, graph, link, linkPathId};
          const labelProps = {
            ...commonProps,
            linkLabelText: this.props.linkTargetLabelText,
            linkLabelClassName: this.props.linkTargetLabelClassName,
            linkLabelStyle: {textAnchor: "end", ...this.props.linkTargetLabelStyle},
            linkLabelAttributes: this.props.linkTargetLabelAttributes,
            linkLabelStartOffset: this.props.linkTargetLabelStartOffset
          };

          return <SankeyLinkLabel {...labelProps} />;
        })}
      </SVGContainer>
    );
  }
}
