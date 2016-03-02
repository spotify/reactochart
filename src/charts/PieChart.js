import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';
import {accessor, AccessorPropType, methodIfFuncProp} from '../util.js';

const DEFAULT_PROPS = {
    getValue: null,
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
    markerLineClass: 'marker-line',
    markerLineOverhangInner: 2,
    markerLineOverhangOuter: 2
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
        margin: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
        // (optional) radius of the "donut hole" circle drawn on top of the pie chart to turn it into a donut chart
        holeRadius: PropTypes.number,
        // (optional) label text to display in the middle of the pie/donut
        centerLabel: PropTypes.string,

        markerLineValue: PropTypes.number,
        markerLineClass: PropTypes.string,
        markerLineOverhangInner: PropTypes.number,
        markerLineOverhangOuter: PropTypes.number,

        onMouseEnterLine: PropTypes.func,
        onMouseMoveLine: PropTypes.func,
        onMouseLeaveLine: PropTypes.func
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

    onMouseEnterLine(e, d) {
        this.props.onMouseEnterLine(e, d);
    },
    onMouseMoveLine(e, d) {
        this.props.onMouseMoveLine(e, d);
    },
    onMouseLeaveLine(e, d) {
        this.props.onMouseLeaveLine(e, d);
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

        const {markerLineValue, markerLineClass, markerLineOverhangInner, markerLineOverhangOuter} = this.props;

        const valueAccessor = accessor(this.props.getValue);
        const sum = _.sum(this.props.data, valueAccessor);
        const total = this.props.total || sum;
        const markerLinePercent = _.isFinite(markerLineValue) ? markerLineValue / total : null;

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
                const key = `pie-slice-${i}`;

                return <path {...{className, d: pathStr, onMouseEnter, onMouseMove, onMouseLeave, key}} />;
            })}

            {sum < total ? // draw empty slice if the sum of slices is less than expected total
                <path
                    className='pie-slice pie-slice-empty'
                    d={pieSlicePath(startPercent, 1, center, radius, holeRadius)}
                    key="pie-slice-empty"
                /> : null
            }

            {_.isFinite(markerLinePercent) ?
                this.renderMarkerLine(markerLineClass, markerLine(markerLinePercent, center, radius, holeRadius, markerLineOverhangOuter, markerLineOverhangInner), 'pie-slice-marker-line')
                : null
            }

            {this.props.centerLabel ? this.renderCenterLabel(center) : null}
        </svg>
    },

    renderMarkerLine(className, d, key) {
        const [onMouseEnter, onMouseMove, onMouseLeave] =
            ['onMouseEnterLine', 'onMouseMoveLine', 'onMouseLeaveLine'].map(eventName => {
                // partially apply this bar's data point as 2nd callback argument
                const callback = methodIfFuncProp(eventName, this.props, this);
                return _.isFunction(callback) ? _.partial(callback, _, d) : null;
            });

        return <path
            className={className}
            d={d}
            key={key}
            {...{onMouseEnter, onMouseMove, onMouseLeave}}
        />
    },

    renderCenterLabel(center) {
        const {x, y} = center;
        const style = {textAnchor: 'middle', dominantBaseline: 'central'};
        return <text className='pie-label-center' {...{x, y, style}}>
            {this.props.centerLabel}
        </text>
    }
});

function markerLine(percentValue, center, radius, holeRadius=0, overhangOuter=0, overhangInner=0) {
    if(percentValue == 1) endPercent = .9999999; // arc cannot be a full circle
    const startX = Math.sin((2 * Math.PI) / (1 / percentValue));
    const startY = Math.cos((2 * Math.PI) / (1 / percentValue));
    const [c, r, rH, x0, y0] = [center, radius, holeRadius, startX, startY];
    const [r0, r1] = [Math.max(rH - overhangInner, 0), r + overhangOuter];

    return [ // construct a string representing the marker line
        `M ${c.x + (x0 * r0)},${c.y - (y0 * r0)}`, // start at edge of inner (hole) circle, or center if no hole
        `L ${c.x + (x0 * r1)},${c.y - (y0 * r1)} z` // straight line to outer circle, along radius
    ].join(' ');
}

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
