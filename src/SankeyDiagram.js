import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import numeral from "numeral";
import {sankey, sankeyLinkHorizontal, sankeyLeft, sankeyRight, sankeyCenter, sankeyJustify} from "d3-sankey";

import {makeAccessor, getValue, domainFromData, combineDomains} from "./utils/Data";
import xyPropsEqual from "./utils/xyPropsEqual";
import * as CustomPropTypes from "./utils/CustomPropTypes";

window.numeral = numeral;

const nodeAlignmentsByName = {
  left: sankeyLeft,
  right: sankeyRight,
  center: sankeyCenter,
  justify: sankeyJustify
};

const SankeyNode = props => {
  const {
    graph,
    node,
    nodeClassName,
    nodeStyle,
    onMouseEnterNode,
    onMouseLeaveNode,
    onMouseMoveNode,
    onMouseDownNode,
    onMouseUpNode,
    onClickNode
  } = props;
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
      onMouseEnter={makeHandler(onMouseEnterNode)}
      onMouseLeave={makeHandler(onMouseLeaveNode)}
      onMouseMove={makeHandler(onMouseMoveNode)}
      onMouseDown={makeHandler(onMouseDownNode)}
      onMouseUp={makeHandler(onMouseUpNode)}
      onClick={makeHandler(onClickNode)}
    />
  );
};

const SankeyLink = props => {
  const {
    graph,
    link,
    linkPath,
    linkClassName,
    linkStyle,
    onMouseEnterLink,
    onMouseLeaveLink,
    onMouseMoveLink,
    onMouseDownLink,
    onMouseUpLink,
    onClickLink
  } = props;
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
      onMouseEnter={makeHandler(onMouseEnterLink)}
      onMouseLeave={makeHandler(onMouseLeaveLink)}
      onMouseMove={makeHandler(onMouseMoveLink)}
      onMouseDown={makeHandler(onMouseDownLink)}
      onMouseUp={makeHandler(onMouseUpLink)}
      onClick={makeHandler(onClickLink)}
    />
  );
};

const SankeyNodeTerminal = props => {
  const {node, graph} = props;
  const getWithNode = accessor => getValue(accessor, node, graph, props);
  const width = getWithNode(props.nodeTerminalWidth) || 0;
  const distance = getWithNode(props.nodeTerminalDistance) || 0;
  const nodeHeight = Math.abs(node.y1 - node.y0) || 0;
  const height = (((nodeHeight * node.terminalValue) || 0) / (node.value || 0)) || 0;
  const style = getWithNode(props.nodeTerminalStyle);
  const className = `sankey-node-terminal ${getWithNode(props.nodeTerminalClassName)}`;
  const attributes = getWithNode(props.nodeTerminalAttributes);

  return (
    <rect
      x={node.x1 + distance}
      y={node.y0 + (nodeHeight - height)}
      {...{width, height, style, className}}
      {...attributes}
      // onMouseEnter={makeHandler(props.onMouseEnterNode)}
      // onMouseLeave={makeHandler(props.onMouseLeaveNode)}
      // onMouseMove={makeHandler(props.onMouseMoveNode)}
      // onMouseDown={makeHandler(props.onMouseDownNode)}
      // onMouseUp={makeHandler(props.onMouseUpNode)}
      // onClick={makeHandler(props.onClickNode)}
    />
  );
};

const SankeyNodeLabel = props => {
  const {
    node,
    graph,
    nodeLabelText,
    nodeId,
    nodeLabelPlacement,
    nodeLabelDistance,
    nodeLabelClassName,
    nodeLabelStyle
  } = props;
  const getWithNode = accessor => getValue(accessor, node, graph);
  const getLabelText = _.isFunction(nodeLabelText) ? nodeLabelText : nodeId;
  const placement = getWithNode(nodeLabelPlacement);
  const distance = getWithNode(nodeLabelDistance) || 0;

  let style = {...getWithNode(nodeLabelStyle)};
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
    <text {...textPosition} className={`sankey-node-label ${getWithNode(nodeLabelClassName)}`} style={style}>
      {getLabelText(node, graph)}
    </text>
  );
};

const SankeyLinkLabel = props => {
  const {link, linkPath, nodeId, linkLabelText, linkLabelClassName, linkLabelStyle} = props;
  const className = getValue(linkLabelClassName, link, props.graph, props);
  const style = getValue(linkLabelStyle, link, props.graph, props);

  return (
    <g className="sankey-link-label-container">
      <defs>
        <path id={`link-${nodeId(link.source)}-to-${nodeId(link.target)}`} d={linkPath} />
      </defs>
      <text className={`sankey-link-label ${className}`} style={style}>
        <textPath startOffset="15%" xlinkHref={`#link-${nodeId(link.source)}-to-${nodeId(link.target)}`}>
          {getValue(linkLabelText, link, props.graph, props)}
        </textPath>
      </text>
    </g>
  );
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
     * Boolean which determines if link paths should be shown,
     * or function (`showLink(link, graph)`) which returns a boolean
     */
    showLinks: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    /**
     * Boolean which determines if node labels should be shown,
     * or function (`showLink(link, graph)`) which returns a boolean
     */
    showNodeLabels: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    /**
     * Boolean which determines if node labels should be shown,
     * or function (`showLink(link, graph)`) which returns a boolean
     */
    showLinkLabels: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),

    /**
     * Accessor function `nodeId(node, graph)` which specifies how to access the ID of each node object.
     * These should be the same identifiers used by `links[].source` and `.target`.
     * Uses the node's index in `nodes` array by default.
     */
    nodeId: PropTypes.func,
    /**
     * Width (in pixels) of the vertical node lines.
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

    // to test
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

    // showNodeTerminals
    // nodeTerminalWidth
    // nodeTerminalDistance
    // nodeTerminalClassName
    // nodeTerminalStyle
    // nodeTerminalAttributes

    // showLinkInLabels
    // showLinkOutLabels

    onMouseEnterNode: PropTypes.func,
    onMouseLeaveNode: PropTypes.func,
    onMouseMoveNode: PropTypes.func,
    onMouseDownNode: PropTypes.func,
    onMouseUpNode: PropTypes.func,
    onClickNode: PropTypes.func,

    onMouseEnterLink: PropTypes.func,
    onMouseLeaveLink: PropTypes.func,
    onMouseMoveLink: PropTypes.func,
    onMouseDownLink: PropTypes.func,
    onMouseUpLink: PropTypes.func,
    onClickLink: PropTypes.func
  };
  static defaultProps = {
    width: 400,
    height: 300,
    className: "",
    style: {},
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
    showNodeLabels: true,
    nodeLabelPlacement: (node, graph) => {
      return node.depth < graph.maxDepth / 2 ? "after" : "before";
    },
    nodeLabelDistance: 4,
    nodeLabelText: node => node.name,
    nodeLabelClassName: "",
    nodeLabelStyle: {},
    showLinkLabels: true,
    linkLabelText: (link, graph, props) => {
      const valueRelative = (link.value || 0) / _.get(link, "source.value", 0);
      if (!_.isFinite(valueRelative)) return "";
      const percentText = valueRelative < 0.001 ? "<0.1%" : numeral(valueRelative).format("0.[0]%");
      return `${percentText} to ${getValue(props.nodeLabelText, link.target, graph, props)}`;
    },
    linkLabelClassName: "",
    linkLabelStyle: {},
    showNodeTerminals: true,
    nodeTerminalWidth: 6,
    nodeTerminalDistance: 1,
    nodeTerminalClassName: '',
    nodeTerminalStyle: {},
    nodeTerminalAttributes: {rx: 2, ry: 2}
  };

  componentWillMount() {
    const {width, height, nodeId, nodeWidth, nodePadding, nodeAlignment} = this.props;
    this._sankey = sankey()
      .size([width, height])
      .nodeId(nodeId)
      .nodeWidth(nodeWidth)
      .nodePadding(nodePadding)
      .nodeAlign(nodeAlignmentsByName[nodeAlignment] || nodeAlignmentsByName.justify);
  }

  render() {
    const {
      nodes,
      links,
      width,
      height,
      className,
      style,
      showNodes,
      showLinks,
      showNodeLabels,
      showLinkLabels,
      showNodeTerminals,
      nodeId
    } = this.props;

    const graph = enhanceGraph(this._sankey({nodes, links}));
    const makeLinkPath = sankeyLinkHorizontal();

    console.log(graph);

    function enhanceGraph(graph) {
      graph.nodes.forEach(node => {
        const sourceLinksSum = (node.sourceLinks || []).reduce((sum, link) => sum + link.value, 0);
        node.terminalValue = Math.max(node.value - sourceLinksSum, 0);
      });

      graph.maxDepth = _.maxBy(graph.nodes, "depth");
      graph.maxDepth = graph.nodes.reduce((max, node) => Math.max(node.depth || 0, max), 0);
      return graph;
    }


    return (
      <svg width={width} height={height} className={`sankey-diagram ${className}`} style={style}>
        {showLinks ? (
          <g className="sankey-links">
            {(graph.links || []).map(link => {
              if (!getValue(showLinks, link, graph)) return null;
              const key = `link-${nodeId(link.source)}-to-${nodeId(link.target)}`;
              return (
                <SankeyLink
                  {...this.props}
                  {...{
                    key,
                    graph,
                    link,
                    linkPath: makeLinkPath(link)
                  }}
                />
              );
            })}
          </g>
        ) : null}
        {showNodes ? (
          <g className="sankey-nodes">
            {graph.nodes.map(node => {
              if (!getValue(showNodes, node, graph)) return null;
              const key = `node-${nodeId(node)}`;
              return <SankeyNode {...this.props} {...{key, graph, node}} />;
            })}
          </g>
        ) : null}
        {showNodeTerminals ? (
          <g className="sankey-node-terminals">
            {graph.nodes.map(node => {
              if (!getValue(showNodeTerminals, node, graph)) return null;
              const key = `node-terminal-${nodeId(node)}`;
              return <SankeyNodeTerminal {...this.props} {...{key, graph, node}} />;
            })}
          </g>
        ) : null}
        {showLinkLabels ? (
          <g className="sankey-link-labels">
            {graph.links.map(link => {
              if (!getValue(showLinkLabels, link, graph)) return null;
              const key = `link-label-${nodeId(link.source)}-to-${nodeId(link.target)}`;
              const linkPath = makeLinkPath(link);
              return (
                <SankeyLinkLabel
                  {...this.props}
                  {...{
                    key,
                    graph,
                    link,
                    linkPath
                  }}
                />
              );
            })}
          </g>
        ) : null}
        {showNodeLabels ? (
          <g className="sankey-node-labels">
            {graph.nodes.map(node => {
              if (!getValue(showNodeLabels, node, graph)) return null;
              const key = `node-label-${nodeId(node)}`;
              return <SankeyNodeLabel {...this.props} {...{key, graph, node}} />;
            })}
          </g>
        ) : null}
      </svg>
    );
  }
}
