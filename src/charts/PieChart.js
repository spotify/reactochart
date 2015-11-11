import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';
import {accessor, AccessorPropType, methodIfFuncProp} from '../util.js';

const DEFAULT_PROPS = {
    getValue: null,
    margin: { top: 0, bottom: 0, left: 0, right: 0 }
};

// default height/width, used only if height & width & radius are all undefined
const DEFAULT_SIZE = 150;

const PieChart = React.createClass({
    propTypes: {
        // array of data to plot with pie chart
        data: PropTypes.array.isRequired,
        // (optional) accessor for getting the values plotted on the pie chart
        // if not provided, just uses the value itself at given index
        getValue: AccessorPropType,
        // (optional) total expected sum of all the pie slice values
        // if provided && slices don't add up to total, an "empty" slice will be rendered for the rest
        // if not provided, will be the sum of all values (ie. all values will always add up to 100%)
        total: PropTypes.number,
        // (optional) height and width of the SVG
        // if only one is passed, same # is used for both (ie. width=100 means height=100 also)
        // if neither is passed, but radius is, radius+margins is used
        // if neither is passed, and radius isn't either, DEFAULTS.size is used
        width: PropTypes.number,
        height: PropTypes.number,
        // (optional) main radius of the pie chart, inferred from margin/width/height if not provided
        radius: PropTypes.number,
        // (optional) margins (between svg edges and pie circle), inferred from radius/width/height if not provided
        // can either be a single number (to make all margins equal), or {top, bottom, left, right} object
        margin: PropTypes.oneOfType(PropTypes.object, PropTypes.number),
        // (optional) radius of the "donut hole" circle drawn on top of the pie chart to turn it into a donut chart
        holeRadius: PropTypes.number,
        // (optional) label text to display in the middle of the pie/donut
        centerLabel: PropTypes.string
    },
    getDefaultProps() { return DEFAULT_PROPS; },

    onMouseEnterSlice(e, d) {
        this.props.onMouseEnterSlice(e, d);
    },
    onMouseMoveSlice(e, d) {
        this.props.onMouseMoveSlice(e, d);
    },
    onMouseLeaveSlice(e, d) {
        this.props.onMouseLeaveSlice(e, d);
    },

    render() {
        const margin = _.isNumber(this.props.margin) ?
            {top: this.props.margin, bottom: this.props.margin, left: this.props.margin, right: this.props.margin} :
            _.defaults({}, this.props.margin, DEFAULT_PROPS.margin);
        // sizes fallback based on provided info: given dimension -> radius + margin -> other dimension -> default
        const width = this.props.width ||
            (this.props.radius ? (this.props.radius * 2) + margin.left + margin.right : this.props.height)
            || DEFAULT_SIZE;
        const height = this.props.height ||
            (this.props.radius ? (this.props.radius * 2) + margin.top + margin.bottom : this.props.width)
            || DEFAULT_SIZE;
        const radius = this.props.radius ||
            Math.min((width - (margin.left + margin.right)) / 2, (height - (margin.top + margin.bottom)) / 2);
        const {holeRadius} = this.props;
        const center = {x: margin.left + radius, y: margin.top + radius};

        const valueAccessor = accessor(this.props.getValue);
        const sum = _.sum(this.props.data, valueAccessor);
        const total = this.props.total || sum;

        let startPercent = 0;
        return <svg className="pie-chart" {...{width, height}}>
            {this.props.data.map((d, i) => {
                const [onMouseEnter, onMouseMove, onMouseLeave] =
                    ['onMouseEnterSlice', 'onMouseMoveSlice', 'onMouseLeaveSlice'].map(eventName => {
                        // partially apply this bar's data point as 2nd callback argument
                        const callback = methodIfFuncProp(eventName, this.props, this);
                        return _.isFunction(callback) ? _.partial(callback, _, d) : null;
                    });

                const className = `pie-slice pie-slice-${i}`;
                const slicePercent = valueAccessor(d) / total;
                const endPercent = startPercent + slicePercent;
                const pathStr = pieSlicePath(startPercent, endPercent, center, radius, holeRadius);
                startPercent += slicePercent;

                return <path {...{className, d: pathStr, onMouseEnter, onMouseMove, onMouseLeave}} />;
            })}

            {sum < total ? // draw empty slice if the sum of slices is less than expected total
                <path
                    className='pie-slice pie-slice-empty'
                    d={pieSlicePath(startPercent, 1, center, radius, holeRadius)}
                /> : null
            }

            {this.props.centerLabel ? this.renderCenterLabel(center) : null}
        </svg>
    },
    renderCenterLabel(center) {
        const {x, y} = center;
        const style = {textAnchor: 'middle', dominantBaseline: 'central'};
        return <text className='pie-label-center' {...{x, y, style}}>
            {this.props.centerLabel}
        </text>
    }
});

function pieSlicePath(startPercent, endPercent, center, radius, holeRadius=0) {
    if(endPercent == 1) endPercent = .9999999; // arc cannot be a full circle
    const startX = Math.sin((2 * Math.PI) / (1 / startPercent));
    const startY = Math.cos((2 * Math.PI) / (1 / startPercent));
    const endX = Math.sin((2 * Math.PI) / (1 / endPercent));
    const endY = Math.cos((2 * Math.PI) / (1 / endPercent));
    const largeArc = (endPercent - startPercent <= 0.5) ? 0 : 1;
    const [c, r, rH, x0, x1, y0, y1] = [center, radius, holeRadius, startX, endX, startY, endY];

    return [ // construct a string representing the pie slice path
        `M ${c.x + (x0 * rH)},${c.y - (y0 * rH)}`, // start at edge of inner (hole) circle, or center if no hole
        `L ${c.x + (x0 * r)},${c.y - (y0 * r)}`, // straight line to outer circle, along radius
        `A ${r},${r} 0 ${largeArc} 1 ${c.x + (x1 * r)},${c.y - (y1 * r)}` // outer arc
    ].concat(holeRadius ? [ // if we have an inner (donut) hole, draw an inner arc too, otherwise we're done
        `L ${c.x + (x1 * rH)},${c.y - (y1 * rH)}`, // straight line to inner (hole) circle, along radius
        `A ${rH},${rH} 0 ${largeArc} 0 ${c.x + (x0 * rH)},${c.y - (y0 * rH)} z` // inner arc
    ] : 'z').join(' ');
}

export default PieChart;
