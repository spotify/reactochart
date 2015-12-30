import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';
import {accessor} from '../util.js';

const TreeMapNode = React.createClass({
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
    getDefaultProps() {
        return {
            minLabelWidth: 0,
            minLabelHeight: 0
        };
    },
    render() {
        const {node, getLabel, nodeStyle, labelStyle, minLabelWidth, minLabelHeight, NodeLabelComponent} = this.props;
        const {x, y, dx, dy, depth, parent} = node;

        const nodeGroupClass = parent ? `node-group-${_.kebabCase(parent.name)}` : '';
        const className = `tree-map-node node-depth-${depth} ${nodeGroupClass}`;

        let style = {position: 'absolute', width: dx, height: dy, top: y, left: x};
        const customStyle = _.isFunction(nodeStyle) ? nodeStyle(node) : (_.isObject(nodeStyle) ? nodeStyle : {});
        _.assign(style, customStyle);

        let handlers = ['onClick', 'onMouseEnter', 'onMouseLeave', 'onMouseMove'].reduce((handlers, eventName) => {
            const handler = this.props[`${eventName}Node`];
            if(handler) handlers[eventName] = handler.bind(null, node);
            return handlers;
        }, {});

        return <div {...{className, style}} {...handlers}>
            {dx > minLabelWidth && dy > minLabelHeight ? // show label if node is big enough
                <NodeLabelComponent {...{node, getLabel, labelStyle}} />
                : null
            }
        </div>;
    }
});

const TreeMapNodeLabel = React.createClass({
    propTypes: {
        node: PropTypes.object,
        getLabel: PropTypes.func,
        labelStyle: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
        minLabelWidth: PropTypes.number,
        minLabelHeight: PropTypes.number
    },
    render() {
        const {node, getLabel, labelStyle} = this.props;
        const {x, y, dx, dy} = node;

        let style = {width: dx};
        const customStyle = _.isFunction(labelStyle) ? labelStyle(node) : (_.isObject(labelStyle) ? labelStyle : {});
        _.assign(style, customStyle);

        return <div className="node-label" {...{style}}>
            {getLabel(node)}
        </div>
    }
});

const TreeMap = React.createClass({
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
    getDefaultProps() {
        return {
            NodeComponent: TreeMapNode,
            NodeLabelComponent: TreeMapNodeLabel,
            minLabelWidth: 0,
            minLabelHeight: 0
        };
    },
    _initTreemap(props) {
        const {width, height, getValue, getChildren, sort, padding, round, sticky, mode, ratio} = props;

        const treemap = d3.layout.treemap()
            .size([width, height])
            .value(accessor(getValue));

        if(!_.isUndefined(getChildren)) treemap.children(getChildren);
        if(!_.isUndefined(sort)) treemap.sort(sort);
        if(!_.isUndefined(padding)) treemap.padding(padding);
        if(!_.isUndefined(round)) treemap.round(round);
        if(!_.isUndefined(sticky)) treemap.sticky(sticky);
        if(!_.isUndefined(mode)) treemap.mode(mode);
        if(!_.isUndefined(ratio)) treemap.ratio(ratio);

        return treemap;
    },
    render() {
        const {
            width, height, nodeStyle, labelStyle, getLabel, minLabelWidth, minLabelHeight,
            onClickNode, onMouseEnterNode, onMouseLeaveNode, onMouseMoveNode, NodeComponent, NodeLabelComponent
        } = this.props;

        // clone the data because d3 mutates it!
        const data = _.cloneDeep(this.props.data);
        // initialize the layout function
        const treemap = this._initTreemap(this.props);
        // run the layout function with our data to create treemap layout
        const nodes = treemap.nodes(data);

        const style = {position: 'relative', width, height};

        return <div className="tree-map" {...{style}}>
            {nodes.map((node, i) => <NodeComponent {...{
                node, nodeStyle, minLabelWidth, minLabelHeight, labelStyle, getLabel, NodeLabelComponent,
                onClickNode, onMouseEnterNode, onMouseLeaveNode, onMouseMoveNode,
                key: `node-${i}`
            }} />)}
        </div>;
    }
});

export default TreeMap;