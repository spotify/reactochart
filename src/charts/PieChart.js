import React from 'react/addons';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';
import {accessor, AccessorPropType} from '../util.js';

const DEFAULT_PROPS = {
    // accessor for getting the values plotted on the pie chart
    // if not provided, just uses the value itself at given index
    getValue: null,
    // (optional) total expected sum of all the pie slice values
    // if provided && slices don't add up to total, an "empty" slice will be rendered for the rest
    // if not provided, will be the sum of all values (ie. all values will always add up to 100%)
    total: null,
    // height and width of the SVG
    // if only one is passed, same # is used for both (ie. width=100 means height=100 also)
    // if neither is passed, but radius is, radius+margins is used
    // if neither is passed, and radius isn't either, DEFAULTS.size is used
    width: null,
    height: null,
    // pass *either* radius or margin to determine the pie chart size
    // main radius of the pie chart, inferred from margin if not provided
    radius: null,
    // margins (space between svg edges and pie circle), inferred from radius if not provided
    // can either be a single number (to make all margins equal), or {top, bottom, left, right} object
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
    // optional radius of the "donut hole" circle drawn on top of the pie chart to turn it into a donut chart
    holeRadius: 0
};

// default height/width, used only if height & width & radius are all undefined
const DEFAULT_SIZE = 150;

const PieChart = React.createClass({
    propTypes: {
        data: PropTypes.array.isRequired,
        getValue: AccessorPropType,
        width: PropTypes.number,
        height: PropTypes.number,
        radius: PropTypes.number,
        margin: PropTypes.object,
        holeRadius: PropTypes.number
    },
    getDefaultProps() { return DEFAULT_PROPS; },

    render() {
        const margin = _.isNumber(this.props.margin) ?
            {top: this.props.margin, bottom: this.props.margin, left: this.props.margin, right: this.props.margin} :
            _.defaults({}, this.props.margin, DEFAULT_PROPS.margin);
        // sizes fallback based on provided info: given dimension -> radius + margin -> other dimension -> default
        const width = this.props.width ||
            (this.props.radius) ? (this.props.radius * 2) + margin.left + margin.right :
            this.props.height || DEFAULTS.size;
        const height = this.props.height ||
            (this.props.radius) ? (this.props.radius * 2) + margin.top + margin.bottom :
            this.props.width || DEFAULTS.size;
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
                const className = `pie-slice pie-slice-${i}`;
                const slicePercent = valueAccessor(d) / total;
                const endPercent = startPercent + slicePercent;
                const pathStr = pieSlicePath(startPercent, endPercent, center, radius, holeRadius);
                const path = <path {...{className, d: pathStr}} />;
                startPercent += slicePercent;
                return path;
            })}

            {sum < total ? // draw empty slice if the sum of slices is less than expected total
                <path
                    className='pie-slice pie-slice-empty'
                    d={pieSlicePath(startPercent, 1, center, radius, holeRadius)}
                /> : null
            }
        </svg>
    }
});

function pieSlicePath(startPercent, endPercent, center, radius, holeRadius) {
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
