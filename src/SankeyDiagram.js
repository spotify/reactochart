import {
  sankey,
  sankeyCenter,
  sankeyJustify,
  sankeyLeft,
  sankeyLinkHorizontal,
  sankeyRight,
} from 'd3-sankey';
import isFunction from 'lodash/isFunction';
import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import omit from 'lodash/omit';
import get from 'lodash/get';
import maxBy from 'lodash/maxBy';
import has from 'lodash/has';
import cloneDeep from 'lodash/cloneDeep';
import map from 'lodash/map';
import { format as numberFormat, formatPrefix } from 'd3-format';
import PropTypes from 'prop-types';
import React from 'react';
import { getValue } from './utils/Data';
import { bindTrailingArgs } from './util.js';

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
    onClickNode,
  } = props;
  // create partial functions for handlers - callbacks with the current node/graph arguments attached
  const makeHandler = origHandler =>
    isFunction(origHandler)
      ? bindTrailingArgs(origHandler, { node, graph })
      : null;

  return (
    <rect
      x={node.x0}
      y={node.y0}
      width={Math.abs(node.x1 - node.x0)}
      height={Math.abs(node.y1 - node.y0)}
      className={`rct-sankey-node ${getValue(nodeClassName, node, graph)}`}
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

SankeyNode.propTypes = {
  graph: PropTypes.object,
  node: PropTypes.object,
  nodeClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  nodeStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  onMouseEnterNode: PropTypes.func,
  onMouseLeaveNode: PropTypes.func,
  onMouseMoveNode: PropTypes.func,
  onMouseDownNode: PropTypes.func,
  onMouseUpNode: PropTypes.func,
  onClickNode: PropTypes.func,
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
    onClickLink,
  } = props;

  // create partial functions for handlers - callbacks with the current graph/link arguments attached
  const makeHandler = origHandler =>
    isFunction(origHandler)
      ? bindTrailingArgs(origHandler, { link, graph })
      : null;

  return (
    <path
      d={linkPath}
      className={`rct-sankey-link ${getValue(linkClassName, link, graph)}`}
      style={{
        ...getValue(linkStyle, link, graph),
        strokeWidth: link.width,
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

SankeyLink.propTypes = {
  graph: PropTypes.object,
  link: PropTypes.object,
  linkPath: PropTypes.string,
  linkClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  linkStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  onMouseEnterLink: PropTypes.func,
  onMouseLeaveLink: PropTypes.func,
  onMouseMoveLink: PropTypes.func,
  onMouseDownLink: PropTypes.func,
  onMouseUpLink: PropTypes.func,
  onClickLink: PropTypes.func,
};

const SankeyNodeTerminal = props => {
  const {
    node,
    graph,
    nodeTerminalWidth,
    nodeTerminalDistance,
    nodeTerminalStyle,
    nodeTerminalClassName,
    nodeTerminalAttributes,
    onMouseEnterNodeTerminal,
    onMouseLeaveNodeTerminal,
    onMouseMoveNodeTerminal,
    onMouseDownNodeTerminal,
    onMouseUpNodeTerminal,
    onClickNodeTerminal,
  } = props;

  if (!node.terminalValue) return null;
  const makeHandler = origHandler =>
    isFunction(origHandler)
      ? bindTrailingArgs(origHandler, { node, graph, props })
      : null;
  const getWithNode = accessor => getValue(accessor, node, graph, props);
  const width = getWithNode(nodeTerminalWidth) || 0;
  const distance = getWithNode(nodeTerminalDistance) || 0;
  const nodeHeight = Math.abs(node.y1 - node.y0) || 0;
  const height =
    (nodeHeight * node.terminalValue || 0) / (node.value || 0) || 0;
  const style = getWithNode(nodeTerminalStyle);
  const className = `rct-sankey-node-terminal ${getWithNode(
    nodeTerminalClassName,
  )}`;
  const attributes = getWithNode(nodeTerminalAttributes);

  return (
    <rect
      x={node.x1 + distance}
      y={node.y0 + (nodeHeight - height)}
      {...{ width, height, style, className }}
      {...attributes}
      onMouseEnter={makeHandler(onMouseEnterNodeTerminal)}
      onMouseLeave={makeHandler(onMouseLeaveNodeTerminal)}
      onMouseMove={makeHandler(onMouseMoveNodeTerminal)}
      onMouseDown={makeHandler(onMouseDownNodeTerminal)}
      onMouseUp={makeHandler(onMouseUpNodeTerminal)}
      onClick={makeHandler(onClickNodeTerminal)}
    />
  );
};

SankeyNodeTerminal.propTypes = {
  node: PropTypes.object,
  graph: PropTypes.object,
  nodeTerminalWidth: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  nodeTerminalDistance: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
  nodeTerminalStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  nodeTerminalClassName: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
  ]),
  nodeTerminalAttributes: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.func,
  ]),
  onMouseEnterNodeTerminal: PropTypes.func,
  onMouseLeaveNodeTerminal: PropTypes.func,
  onMouseMoveNodeTerminal: PropTypes.func,
  onMouseDownNodeTerminal: PropTypes.func,
  onMouseUpNodeTerminal: PropTypes.func,
  onClickNodeTerminal: PropTypes.func,
};

const SankeyNodeLabel = props => {
  const {
    node,
    graph,
    nodeLabelText,
    nodeId,
    nodeLabelPlacement,
    nodeLabelDistance,
  } = props;
  const getWithNode = accessor => getValue(accessor, node, graph, props);
  const getLabelText = isFunction(nodeLabelText) ? nodeLabelText : nodeId;
  const placement = getWithNode(nodeLabelPlacement);
  const distance = getWithNode(nodeLabelDistance) || 0;
  const labelContent = getWithNode(getLabelText);
  // don't render empty labels
  if (
    isNull(labelContent) ||
    isUndefined(labelContent) ||
    labelContent === false ||
    labelContent === ''
  ) {
    return null;
  }

  // if `labelContent` is a string or number, it is rendered as text within a SVG <text> element
  // otherwise, it is rendered as arbitrary SVG content
  // allows users to render components inside a node label (eg. to add icon or link)
  const isTextLabel = isString(labelContent) || isNumber(labelContent);
  if (!isTextLabel) {
    return labelContent;
  }

  const baseClassName = `rct-sankey-node-label ${getWithNode(
    props.nodeLabelClassName,
  )}`;
  const baseStyle = getWithNode(props.nodeLabelStyle);
  let position;
  let textStyle;

  // use placement prop to determine x, y, alignmentBaseline and textAnchor
  if (placement === 'above') {
    // render label above node, centered horizontally
    textStyle = {
      alignmentBaseline: 'baseline',
      textAnchor: 'middle',
      ...baseStyle,
    };
    position = {
      x: node.x0 + Math.abs(node.x1 - node.x0) / 2,
      y: node.y0 - distance,
    };
  } else if (placement === 'below') {
    // render label above node, centered horizontally
    textStyle = {
      alignmentBaseline: 'hanging',
      textAnchor: 'middle',
      ...baseStyle,
    };
    position = {
      x: node.x0 + Math.abs(node.x1 - node.x0) / 2,
      y: node.y1 + distance,
    };
  } else if (placement === 'before') {
    // render label before (to left of) node, centered vertically
    textStyle = {
      alignmentBaseline: 'middle',
      textAnchor: 'end',
      ...baseStyle,
    };
    position = {
      x: node.x0 - distance,
      y: node.y0 + Math.abs(node.y1 - node.y0) / 2,
    };
  } else {
    if (!isUndefined(placement) && placement !== 'after')
      // eslint-disable-next-line no-console
      console.warn(
        `${placement} is not a valid value for nodeLabelPlacement - defaulting to "after"`,
      );
    // render label after (to right of) node, centered vertically
    textStyle = {
      alignmentBaseline: 'middle',
      textAnchor: 'start',
      ...baseStyle,
    };
    position = {
      x: node.x1 + distance,
      y: node.y0 + Math.abs(node.y1 - node.y0) / 2,
    };
  }

  const className = `${baseClassName} rct-sankey-node-label-text`;
  return (
    <text {...position} className={className} style={textStyle}>
      {labelContent}
    </text>
  );
};

SankeyNodeLabel.propTypes = {
  node: PropTypes.object,
  graph: PropTypes.object,
  nodeLabelClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  nodeLabelStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  nodeLabelText: PropTypes.func,
  nodeId: PropTypes.func,
  nodeLabelPlacement: PropTypes.oneOfType([
    PropTypes.oneOf(['before', 'after', 'above', 'below']),
    PropTypes.func,
  ]),
  nodeLabelDistance: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
};

const SankeyLinkLabel = props => {
  const {
    link,
    graph,
    linkLabelClassName,
    linkLabelStyle,
    linkLabelAttributes,
    linkLabelStartOffset,
    linkLabelText,
    linkPathId,
  } = props;
  const getWithLink = accessor => getValue(accessor, link, graph, props);
  const className = `rct-sankey-link-label ${getWithLink(
    linkLabelClassName || '',
  )}`;
  const style = getWithLink(linkLabelStyle || {});
  const attributes = getWithLink(linkLabelAttributes || {});
  const startOffset = getWithLink(linkLabelStartOffset || 0);

  return (
    <text className={className} style={style} {...attributes}>
      <textPath startOffset={startOffset} xlinkHref={`#${linkPathId}`}>
        {getWithLink(linkLabelText)}
      </textPath>
    </text>
  );
};

SankeyLinkLabel.propTypes = {
  link: PropTypes.object,
  graph: PropTypes.object,
  linkLabelClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  linkLabelStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  linkLabelAttributes: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  linkLabelStartOffset: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  linkLabelText: PropTypes.func,
  linkPathId: PropTypes.string,
};

const SankeyStepLabel = props => {
  const {
    x,
    y,
    stepLabelPadding,
    stepLabelText,
    stepLabelClassName,
    stepLabelStyle,
    step,
  } = props;

  let yPos = y;

  if (isNumber(stepLabelPadding)) {
    yPos = yPos - stepLabelPadding;
  }

  return (
    <text
      className={`rct-step-label ${getValue(stepLabelClassName, step)}`}
      style={getValue(stepLabelStyle, step)}
      x={x}
      y={yPos}
      key={`step-${x}-${step}`}
    >
      {getValue(stepLabelText, step)}
    </text>
  );
};

SankeyStepLabel.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  stepLabelPadding: PropTypes.number,
  stepLabelText: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  stepLabelClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  stepLabelStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  step: PropTypes.string,
};

const SVGContainer = props => {
  const otherProps = omit(props, ['standalone']);
  if (props.standalone) {
    return <svg {...otherProps} />;
  }
  return <g {...otherProps} />;
};

SVGContainer.propTypes = {
  standalone: PropTypes.bool,
};

/**
 * Enhance the graph object created by d3-sankey by adding some additional useful properties.
 * Adds `maxDepth` (max of node `depth` properties)
 * and `node.terminalValue` (value of node's terminal, sum of all 'out' nodes minus sum of 'in' nodes)
 */
function enhanceGraph(graph) {
  graph.nodes.forEach(node => {
    const sourceLinksSum = (node.sourceLinks || []).reduce(
      (sum, link) => sum + link.value,
      0,
    );
    node.terminalValue = Math.max(node.value - sourceLinksSum, 0);
  });
  graph.links.forEach(link => {
    link.valueSourceRelative = (link.value || 0) / get(link, 'source.value', 0);
    link.valueTargetRelative = (link.value || 0) / get(link, 'target.value', 0);
  });

  graph.maxDepth = maxBy(graph.nodes, 'depth');
  graph.maxDepth = graph.nodes.reduce(
    (max, node) => Math.max(node.depth || 0, max),
    0,
  );
  return graph;
}

function getLinkId(link, nodeId) {
  return `link-${nodeId(link.source)}-to-${nodeId(link.target)}`;
}

const nodeAlignmentsByName = {
  left: sankeyLeft,
  right: sankeyRight,
  center: sankeyCenter,
  justify: sankeyJustify,
};

/**
 * A `SankeyDiagram` is a type of flow diagram which visualizes directed flow between nodes
 * of a network graph. Currently only *acyclic* networks are supported.
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
        value: PropTypes.number,
      }),
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
     * Boolean which decides if the nodes & links props should be cloned before being mutated into
     * the Sankey data structure. Passing `false` is faster, but may cause unintended side effects
     * if nodes or links data are used elsewhere
     */
    shouldClone: PropTypes.bool,
    /**
     * `className` attribute to be applied to the SVG element.
     */
    className: PropTypes.string,
    /**
     * Inline style object to be applied to the SVG element.
     */
    style: PropTypes.object,
    /**
     * Boolean which determines whether the chart should be rendered as a standalone `<svg>` element
     * or a `<g>` group element (as a child within an existing `<svg>`).
     * True by default, pass `false` to render in a `<g>`.
     */
    standalone: PropTypes.bool,
    /**
     * Internal top margin, in pixels. Generally used to leave extra space inside the SVG for labels.
     */
    marginTop: PropTypes.number,
    /**
     * Internal bottom margin, in pixels.
     */
    marginBottom: PropTypes.number,
    /**
     * Internal left margin, in pixels.
     */
    marginLeft: PropTypes.number,
    /**
     * Internal right margin, in pixels.
     */
    marginRight: PropTypes.number,

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
     * Must be 'left', 'right', 'center', or 'justify'.
     * See [d3-sankey alignment docs](https://github.com/d3/d3-sankey#alignments) for more details.
     */
    nodeAlignment: PropTypes.oneOf(['left', 'right', 'center', 'justify']),
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
     * Node sort function
     */
    nodeSort: PropTypes.func,
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
     * Link sort function
     */
    linkSort: PropTypes.func,
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
    nodeTerminalDistance: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.func,
    ]),
    /**
     * `className` attribute to be applied to each node terminal,
     * or accessor function which returns a class (string).
     */
    nodeTerminalClassName: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
    ]),
    /**
     * Inline style object to be applied to each node terminal,
     * or accessor function which returns a style object.
     */
    nodeTerminalStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /**
     * Attributes object to be applied to each node terminal element,
     * or accessor function which returns an object.
     */
    nodeTerminalAttributes: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.func,
    ]),
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
    nodeLabelPlacement: PropTypes.oneOfType([
      PropTypes.oneOf(['before', 'after', 'above', 'below']),
      PropTypes.func,
    ]),
    /**
     * Distance (in pixels) between nodes and their labels,
     * or accessor function `f(node, graph)` which returns a distance.
     */
    nodeLabelDistance: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    /**
     * Accessor function `nodeLabelText(node, graph)` which returns the content to be used for node labels.
     * The function may return a string/number (rendered as SVG `<text>`),
     * or arbitrary React SVG element(s) (rendered as-is inside the SVG).
     * NOTE: in the latter case (returning arbitrary SVG), `nodeLabelPlacement`, `nodeLabelDistance`,
     * `nodeLabelClassName` and `nodeLabelStyle` props will not be applied -
     * user is responsible for all positioning and attributes on this element.
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
    linkLabelAttributes: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.func,
    ]),
    /**
     * `startOffset` attribute to apply to the link label `<textpath>` element.
     * May be a number (in SVG units) or percent string (`"25%"`)
     */
    linkLabelStartOffset: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),

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
    linkSourceLabelClassName: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
    ]),
    /**
     * Inline style object to be applied to each link *source* label,
     * or accessor function which returns a style object.
     */
    linkSourceLabelStyle: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.func,
    ]),
    /**
     * Attributes object to be applied to each link *source* label,
     * or accessor function which returns an object.
     */
    linkSourceLabelAttributes: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.func,
    ]),
    /**
     * `startOffset` attribute to apply to the link *source* label `<textpath>` element.
     * May be a number (in SVG units) or percent string (`"25%"`)
     */
    linkSourceLabelStartOffset: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),

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
    linkTargetLabelClassName: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
    ]),
    /**
     * Inline style object to be applied to each link *target* label,
     * or accessor function which returns a style object.
     */
    linkTargetLabelStyle: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.func,
    ]),
    /**
     * Attributes object to be applied to each link *target* label,
     * or accessor function which returns an object.
     */
    linkTargetLabelAttributes: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.func,
    ]),
    /**
     * `startOffset` attribute to apply to the link *target* label `<textpath>` element.
     * May be a number (in SVG units) or percent string (`"25%"`)
     */
    linkTargetLabelStartOffset: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    /**
     * Text for step label or
     * accessor function `f(step)` that returns the label text
     */
    stepLabelText: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    /**
     * `className` attribute applied to each label,
     * or accessor function which returns a class (string)
     */
    stepLabelClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    /**
     * Inline style object to be applied to each label,
     * or accessor function which returns an object
     */
    stepLabelStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /**
     * Vertical padding (in pixels) between step label and uppermost positioned node of that step
     */
    stepLabelPadding: PropTypes.number,
  };
  static defaultProps = {
    width: 400,
    height: 300,
    shouldClone: true,
    className: '',
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
    nodeAlignment: 'justify',
    nodeClassName: '',
    nodeStyle: {},
    showLinks: true,
    linkClassName: '',
    linkStyle: {},
    showNodeTerminals: true,
    nodeTerminalWidth: 5,
    nodeTerminalDistance: 1,
    nodeTerminalClassName: '',
    nodeTerminalStyle: {},
    nodeTerminalAttributes: { rx: 2, ry: 2 },
    showNodeLabels: true,
    nodeLabelPlacement: (node, graph) => {
      return node.depth < graph.maxDepth / 2 ? 'after' : 'before';
    },
    nodeLabelDistance: 4,
    nodeLabelText: (node, graph, props) => {
      if (has(node, 'name')) return node.name;
      if (has(node, 'label')) return node.label;
      return getValue(props.nodeId, node, graph, props);
    },
    nodeLabelClassName: '',
    nodeLabelStyle: {},
    showLinkLabels: false,
    linkLabelText: (link, graph, props) => {
      const linkValue = link.value || 0;
      const valueText = formatPrefix('.1~f', linkValue)(linkValue);
      const sourceText = getValue(
        props.nodeLabelText,
        link.source,
        graph,
        props,
      );
      const targetText = getValue(
        props.nodeLabelText,
        link.target,
        graph,
        props,
      );
      return `${sourceText}→${targetText}: ${valueText}`;
    },
    linkLabelClassName: '',
    linkLabelStyle: {},
    linkLabelAttributes: {},
    linkLabelStartOffset: '25%',
    showLinkSourceLabels: false,
    linkSourceLabelText: (link, graph, props) => {
      const valueRelative = link.valueSourceRelative;
      if (valueRelative === null || !isFinite(valueRelative)) return '';
      const percentText =
        valueRelative < 0.001 ? '<0.1%' : numberFormat('.1~%')(valueRelative);
      return `${percentText} to ${getValue(
        props.nodeLabelText,
        link.target,
        graph,
        props,
      )}`;
    },
    linkSourceLabelClassName: '',
    linkSourceLabelStyle: {},
    linkSourceLabelAttributes: {},
    linkSourceLabelStartOffset: '2%',
    showLinkTargetLabels: false,
    linkTargetLabelText: (link, graph, props) => {
      const valueRelative = link.valueTargetRelative;
      if (valueRelative === null || !isFinite(valueRelative)) return '';
      const percentText =
        valueRelative < 0.001 ? '<0.1%' : numberFormat('.1~%')(valueRelative);
      return `${percentText} from ${getValue(
        props.nodeLabelText,
        link.source,
        graph,
        props,
      )}`;
    },
    linkTargetLabelClassName: '',
    linkTargetLabelStyle: {},
    linkTargetLabelAttributes: {},
    linkTargetLabelStartOffset: '98%',
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { prevProps } = prevState;

    // only update this._graph if a prop which affects the sankey layout has changed (most don't)
    const sankeyLayoutPropKeys = [
      'nodes',
      'links',
      'width',
      'height',
      'marginTop',
      'marginBottom',
      'marginLeft',
      'marginRight',
      'nodeId',
      'nodeWidth',
      'nodePadding',
      'nodeAlignment',
    ];

    const hasChangedSankey = sankeyLayoutPropKeys.some(key => {
      return nextProps[key] !== prevProps[key];
    });
    if (hasChangedSankey) {
      const graph = SankeyDiagram.makeSankeyGraph(nextProps);
      return {
        graph,
        prevProps: cloneDeep(nextProps),
      };
    }

    return null;
  }

  static makeSankeyGraph(props) {
    const innerWidth = props.width - (props.marginLeft + props.marginRight);
    const innerHeight = props.height - (props.marginTop + props.marginBottom);
    const makeSankey = sankey()
      .size([innerWidth, innerHeight])
      .nodeId(props.nodeId)
      .nodeWidth(props.nodeWidth)
      .nodePadding(props.nodePadding)
      .nodeSort(props.nodeSort)
      .linkSort(props.linkSort)
      .nodeAlign(
        nodeAlignmentsByName[props.nodeAlignment] ||
          nodeAlignmentsByName.justify,
      );

    const nodes = props.shouldClone ? cloneDeep(props.nodes) : props.nodes;
    const links = props.shouldClone ? cloneDeep(props.links) : props.links;
    const sankeyGraph = makeSankey({ nodes, links });
    return enhanceGraph(sankeyGraph);
  }

  constructor(props) {
    super(props);
    const graph = SankeyDiagram.makeSankeyGraph(props);
    const prevProps = cloneDeep(props);
    this.state = { graph, prevProps };
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
      marginRight,
    } = this.props;

    const { graph } = this.state;
    const makeLinkPath = sankeyLinkHorizontal();
    const className = `rct-sankey-diagram ${this.props.className}`;
    const innerWidth = width - (marginLeft + marginRight);
    const innerHeight = height - (marginTop + marginBottom);

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

    function displayStepLabelsIf(
      stepLabelText,
      stepLabelClassName,
      stepLabelStyle,
      stepLabelPadding,
      nodes,
    ) {
      if (!stepLabelText) {
        return null;
      }

      const depthMapXPos = {};
      const depthMapYPos = {};

      nodes.forEach(n => {
        depthMapXPos[n.depth] = n.x0;

        // For the given depth, set the y equal to the highest positioned y value
        depthMapYPos[n.depth] = depthMapYPos[n.depth]
          ? Math.min(n.y0, depthMapYPos[n.depth])
          : n.y0;
      });

      return (
        <g className="rct-step-labels" width={innerWidth} height={100}>
          {map(depthMapXPos, (x, step) => {
            const stepLabelProps = {
              y: depthMapYPos[step],
              step,
              x,
              stepLabelText,
              stepLabelClassName,
              stepLabelPadding,
              stepLabelStyle,
            };

            return (
              <SankeyStepLabel key={`rct-step-${step}`} {...stepLabelProps} />
            );
          })}
        </g>
      );
    }

    return (
      <SVGContainer {...{ standalone, width, height, className, style }}>
        <g
          width={innerWidth}
          height={innerHeight}
          transform={`translate(${marginLeft}, ${marginTop})`}
        >
          {displayStepLabelsIf(
            this.props.stepLabelText,
            this.props.stepLabelClassName,
            this.props.stepLabelStyle,
            this.props.stepLabelPadding,
            graph.nodes,
          )}
          {mapLinksInGroupIf(
            this.props.showLinks,
            'rct-sankey-links',
            (link, i, key) => {
              const linkProps = {
                ...this.props,
                key,
                graph,
                link,
                linkPath: makeLinkPath(link),
              };
              return <SankeyLink {...linkProps} />;
            },
          )}
          {mapNodesInGroupIf(
            this.props.showNodes,
            'rct-sankey-nodes',
            (node, i, key) => {
              return <SankeyNode {...this.props} {...{ key, graph, node }} />;
            },
          )}
          ;
          {mapNodesInGroupIf(
            this.props.showNodeTerminals,
            'rct-sankey-node-terminals',
            (node, i, key) => {
              return (
                <SankeyNodeTerminal {...this.props} {...{ key, graph, node }} />
              );
            },
          )}
          ;
          {/* the three types of link labels (link, link source, link target) use textpath to follow the link's path */}
          {/* to minimize dom elements, first render one set of path definitions to be used by all three label types */}
          {this.props.showLinkLabels ||
          this.props.showLinkSourceLabels ||
          this.props.showLinkTargetLabels ? (
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
          {mapLinksInGroupIf(
            this.props.showLinkLabels,
            'rct-sankey-link-labels',
            (link, i, key) => {
              const linkPathId = `${getLinkId(link, nodeId)}-path`;
              const labelProps = {
                ...this.props,
                key,
                graph,
                link,
                linkPathId,
              };
              return <SankeyLinkLabel {...labelProps} />;
            },
          )}
          {mapNodesInGroupIf(
            this.props.showNodeLabels,
            'rct-sankey-node-labels',
            (node, i, key) => {
              return (
                <SankeyNodeLabel {...this.props} {...{ key, graph, node }} />
              );
            },
          )}
          ;
          {mapLinksInGroupIf(
            this.props.showLinkSourceLabels,
            'rct-sankey-link-source-labels',
            (link, i, key) => {
              const linkPathId = `${getLinkId(link, nodeId)}-path`;
              const commonProps = {
                ...this.props,
                key,
                graph,
                link,
                linkPathId,
              };
              const labelProps = {
                ...commonProps,
                linkLabelText: this.props.linkSourceLabelText,
                linkLabelClassName: this.props.linkSourceLabelClassName,
                linkLabelStyle: this.props.linkSourceLabelStyle,
                linkLabelAttributes: this.props.linkSourceLabelAttributes,
                linkLabelStartOffset: this.props.linkSourceLabelStartOffset,
              };

              return <SankeyLinkLabel {...labelProps} />;
            },
          )}
          {mapLinksInGroupIf(
            this.props.showLinkTargetLabels,
            'rct-sankey-link-target-labels',
            (link, i, key) => {
              const linkPathId = `${getLinkId(link, nodeId)}-path`;
              const commonProps = {
                ...this.props,
                key,
                graph,
                link,
                linkPathId,
              };
              const labelProps = {
                ...commonProps,
                linkLabelText: this.props.linkTargetLabelText,
                linkLabelClassName: this.props.linkTargetLabelClassName,
                linkLabelStyle: {
                  textAnchor: 'end',
                  ...this.props.linkTargetLabelStyle,
                },
                linkLabelAttributes: this.props.linkTargetLabelAttributes,
                linkLabelStartOffset: this.props.linkTargetLabelStartOffset,
              };

              return <SankeyLinkLabel {...labelProps} />;
            },
          )}
        </g>
      </SVGContainer>
    );
  }
}
