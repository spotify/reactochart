import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';

import {accessor, AccessorPropType} from '../util.js';

const ScatterPlot = React.createClass({
    propTypes: {
        // the array of data objects
        data: PropTypes.array.isRequired,
        // accessor for X & Y coordinates
        getX: AccessorPropType,
        getY: AccessorPropType,

        xScale: PropTypes.func,
        yScale: PropTypes.func,

        // used with the default point symbol (circle), defines the circle radius
        pointRadius: PropTypes.number,
        // text or SVG node to use as custom point symbol, or function which returns text/SVG
        pointSymbol: PropTypes.oneOfType(PropTypes.node, PropTypes.func),
        // manual x and y offset applied to the point to center it, for custom point symbols which can't be auto-centered
        pointOffset: PropTypes.arrayOf(PropTypes.number)
    },
    getDefaultProps() {
        return {
            pointRadius: 3,
            pointSymbol: <circle />,
            pointOffset: [0,0]
        }
    },

    getHovered() {},

    render() {
        return <g>
            {this.props.data.map(this.renderPoint)}
        </g>
    },
    renderPoint(d, i) {
        const {xScale, yScale, getX, getY, pointRadius, pointOffset} = this.props;
        let {pointSymbol} = this.props;
        let symbolProps = {};

        // resolve symbol-generating functions into real symbols
        if(_.isFunction(pointSymbol)) pointSymbol = pointSymbol(d, i);
        // wrap string/number symbols in <text> container
        if(_.isString(pointSymbol) || _.isNumber(pointSymbol)) pointSymbol = <text>{pointSymbol}</text>;
        // use props.pointRadius for circle radius
        if(pointSymbol.type === 'circle' && _.isUndefined(pointSymbol.props.r)) symbolProps.r = pointRadius;

        // x,y coords of center of symbol
        const cx = xScale(accessor(getX)(d)) + pointOffset[0];
        const cy = yScale(accessor(getY)(d)) + pointOffset[1];

        // set positioning attributes based on symbol type
        if(pointSymbol.type === 'circle' || pointSymbol.type === 'ellipse') {
            _.assign(symbolProps, {cx, cy});
        } else if(pointSymbol.type === 'text') {
            _.assign(symbolProps, {x: cx, y: cy, style: {textAnchor: 'middle', dominantBaseline: 'central'}});
        } else {
            _.assign(symbolProps, {x: cx, y: cy, style: {transform: "translate(-50%, -50%)"}});
        }

        return React.cloneElement(pointSymbol, symbolProps);
    }
});

export default ScatterPlot;