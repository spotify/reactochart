import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {area} from 'd3';

import {sankey, sankeyLinkHorizontal, sankeyLeft, sankeyRight, sankeyCenter, sankeyJustify} from 'd3-sankey';

import {makeAccessor, getValue, domainFromData, combineDomains} from './utils/Data';
import xyPropsEqual from './utils/xyPropsEqual';
import * as CustomPropTypes from './utils/CustomPropTypes';

const nodeAlignmentsByName = {
  left: sankeyLeft,
  right: sankeyRight,
  center: sankeyCenter,
  justify: sankeyJustify
};


export const SankeyNode = (props) => {
  const {graph, node, nodeIndex, nodeClassName, nodeStyle,
    onMouseEnterNode, onMouseLeaveNode, onMouseMoveNode, onMouseDownNode, onMouseUpNode, onClickNode
  } = props;
  // create partial functions for handlers - callbacks with the current graph/node/nodeIndex arguments attached
  const makeHandler = (origHandler) =>
    (_.isFunction(origHandler) ? _.partial(origHandler, _, {graph, node, nodeIndex}) : null);

  return <rect
    x={node.x0}
    y={node.y0}
    width={Math.abs(node.x1 - node.x0)}
    height={Math.abs(node.y1 - node.y0)}
    className={`sankey-node ${getValue(nodeClassName, node, nodeIndex)}`}
    style={getValue(nodeStyle, node, nodeIndex)}
    onMouseEnter={makeHandler(onMouseEnterNode)}
    onMouseLeave={makeHandler(onMouseLeaveNode)}
    onMouseMove={makeHandler(onMouseMoveNode)}
    onMouseDown={makeHandler(onMouseDownNode)}
    onMouseUp={makeHandler(onMouseUpNode)}
    onClick={makeHandler(onClickNode)}
  />;
};

export const SankeyLink = (props) => {
  const {
    graph, link, linkIndex, linkPath, linkClassName, linkStyle,
    onMouseEnterLink, onMouseLeaveLink, onMouseMoveLink, onMouseDownLink, onMouseUpLink, onClickLink
  } = props;
  // create partial functions for handlers - callbacks with the current graph/link/linkIndex arguments attached
  const makeHandler = (origHandler) =>
    (_.isFunction(origHandler) ? _.partial(origHandler, _, {graph, link, linkIndex}) : null);

  return <path
    d={linkPath}
    className={`sankey-link ${getValue(linkClassName, link, linkIndex)}`}
    style={{
      ...getValue(linkStyle, link, linkIndex),
      strokeWidth: link.width
    }}
    onMouseEnter={makeHandler(onMouseEnterLink)}
    onMouseLeave={makeHandler(onMouseLeaveLink)}
    onMouseMove={makeHandler(onMouseMoveLink)}
    onMouseDown={makeHandler(onMouseDownLink)}
    onMouseUp={makeHandler(onMouseUpLink)}
    onClick={makeHandler(onClickLink)}
  />
};

const SankeyNodeLabel = (props) => {
  const {node, nodeLabelText} = props;
  return <text
    className="sankey-node-label"
    alignmentBaseline="middle"
    x={node.x1}
    y={node.y0 + (Math.abs(node.y1 - node.y0) / 2)}
  >
    {nodeLabelText(node)}
  </text>
};


const SankeyLinkLabel = (props) => {
  const {link, linkIndex, linkPath, linkClassName, linkStyle, nodeId} = props;

  return <g className="sankey-link-label-container">
    <defs>
      <path
        id={`link-${nodeId(link.source)}-to-${nodeId(link.target)}`}
        d={linkPath}
      />
    </defs>
    <text className="sankey-link-label">
      <textPath startOffset="15%" xlinkHref={`#link-${nodeId(link.source)}-to-${nodeId(link.target)}`}>
        {Math.round(link.value)} to {link.target.name}
      </textPath>
    </text>
  </g>;
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
    links: PropTypes.arrayOf(PropTypes.shape({
      source: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      target: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      value: PropTypes.number
    })).isRequired,
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
     * Accessor function `nodeId(node, nodeIndex)` which specifies how to access the ID of each node object.
     * These should be the same identifiers used by `links[].source` and `.target`.
     * Uses the node's index in `nodes` array by default.
     */
    nodeId: PropTypes.func,

    nodeLabelText: PropTypes.func,
    // nodeLabelPlacement
    // nodeLabelDistance
    // showLinkInLabels
    // showLinkOutLabels
    // className
    // style

    /**
     * Boolean which determines if node rectangles should be shown,
     * or function (`showNode(node, nodeIndex)`) which returns a boolean
     */
    showNodes: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
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
     * Boolean which determines if link paths should be shown,
     * or function (`showLink(link, linkIndex)`) which returns a boolean
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
     * Boolean which determines if node labels should be shown,
     * or function (`showLink(link, linkIndex)`) which returns a boolean
     */
    showNodeLabels: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),

    /**
     * Boolean which determines if node labels should be shown,
     * or function (`showLink(link, linkIndex)`) which returns a boolean
     */
    showLinkLabels: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),

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
    onClickLink: PropTypes.func,
  };
  static defaultProps = {
    width: 400,
    height: 300,
    className: '',
    style: {},
    nodeId: node => node.index,
    showNodes: true,
    nodeWidth: 12,
    nodePadding: 8,
    nodeAlignment: 'justify',
    nodeClassName: '',
    nodeStyle: {},
    showLinks: true,
    linkClassName: '',
    linkStyle: {},
    showNodeLabels: true,
    nodeLabelText: node => node.name,
    showLinkLabels: true
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
    const {nodes, links, width, height, className, style, showNodes, showLinks, showNodeLabels, showLinkLabels, nodeId} = this.props;

    const graph = this._sankey({nodes, links});
    const makeLinkPath = sankeyLinkHorizontal();

    // console.log('graph', graph);

    return <svg width={width} height={height} className={`sankey-diagram ${className}`} style={style}>
      {showLinks ?
        <g className="sankey-links">
          {(graph.links || []).map((link, linkIndex) => {
            if(!getValue(showLinks, link, linkIndex)) return null;
            const key = `link-${nodeId(link.source)}-to-${nodeId(link.target)}`;
            return <SankeyLink {...this.props} {...{key, graph, link, linkIndex, linkPath: makeLinkPath(link)}} />
          })}
        </g>
        : null
      }
      {showNodes ?
        <g className="sankey-nodes">
          {graph.nodes.map((node, nodeIndex) => {
            if(!getValue(showNodes, node, nodeIndex)) return null;
            const key = `node-${nodeId(node)}`;
            return <SankeyNode {...this.props} {...{key, graph, node, nodeIndex}} />
          })}
        </g>
        : null
      }
      {showLinkLabels ?
        <g className="sankey-link-labels">
          {graph.links.map((link, linkIndex) => {
            if(!getValue(showLinkLabels, link, linkIndex)) return null;
            const key = `link-label-${nodeId(link.source)}-to-${nodeId(link.target)}`;
            return <SankeyLinkLabel {...this.props} {...{key, graph, link, linkIndex, linkPath: makeLinkPath(link)}} />
          })}
        </g>
        : null
      }
      {showNodeLabels ?
        <g className="sankey-node-labels">
          {graph.nodes.map((node, nodeIndex) => {
            if(!getValue(showNodeLabels, node, nodeIndex)) return null;
            const key = `node-label-${nodeId(node)}`;
            return <SankeyNodeLabel {...this.props} {...{key, graph, node, nodeIndex}} />
          })}
        </g>
        : null
      }
    </svg>;
  }
}
