import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';
import {accessor} from '../util.js';
import moment from 'moment';
import $ from 'jquery';

const DEFAULTS = {
    margin: {top: null, right: null, left: null, bottom: null}
};

const XYPlot = React.createClass({
    propTypes: {
        // x & y scale types, defaults to 'number'
        xType: PropTypes.oneOf(['number', 'time', 'ordinal']),
        yType: PropTypes.oneOf(['number', 'time', 'ordinal']),

        // scale domains may be provided, otherwise will be inferred from data
        xDomain: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.instanceOf(Date)])),
        yDomain: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.instanceOf(Date)])),

        // (outer) width and height of the chart
        // todo infer from data/other props??
        width: PropTypes.number,
        height: PropTypes.number,

        // chart margins
        marginTop: PropTypes.number,
        marginBottom: PropTypes.number,
        marginLeft: PropTypes.number,
        marginRight: PropTypes.number,

        // todo: padding

        // padding between axis value labels and the axis/ticks
        labelPadding: PropTypes.number,
        // size of axis ticks
        tickLength: PropTypes.number,

        // should we draw axis labels
        showXLabels: PropTypes.bool,
        showYLabels: PropTypes.bool,
        // should we draw the grid lines in the main chart space
        showXGrid: PropTypes.bool,
        showYGrid: PropTypes.bool,
        // should we draw the little tick lines along the axis
        showXTicks: PropTypes.bool,
        showYTicks: PropTypes.bool,
        // should we draw a line showing where zero is
        showXZero: PropTypes.bool,
        showYZero: PropTypes.bool,


        // todo: tickLength, labelPadding
        // todo: labelFormat
        // todo: niceX, niceY
        // todo: xAxisLabel, yAxisLabel

        // todo more interaction?
        onMouseMove: PropTypes.func
    },
    getDefaultProps() {
        return {
            xType: 'number',
            yType: 'number',
            xDomain: null,
            yDomain: null,
            width: 400,
            height: 250,
            marginTop: 10,
            marginBottom: 40,
            marginLeft: 60,
            marginRight: 10,
            margin: DEFAULTS.margin,
            labelPadding: 6,
            tickLength: 6,
            showXLabels: true,
            showYLabels: true,
            showXGrid: true,
            showYGrid: true,
            showXTicks: true,
            showYTicks: true,
            showXZero: true,
            showYZero: true,
            onMouseMove: _.noop
        }
    },
    getInitialState() {
        return {};
    },

    componentWillMount() {
        this.initDomains(this.props);
        this.initScale(this.props);
    },
    componentWillReceiveProps(newProps) {
        this.initDomains(newProps);
        this.initScale(newProps);
    },

    initDomains(props) {
        // figure out the domains for each axis (ie. data extents)
        let chartDomains = [];
        // unless both domains are given, ask each child chart for it's desired domain, & flatten them into one domain.
        // this is so that charts can plot their own modified version of the data (ie. a histogram),
        // even if it has a different domain than the original data
        if(!(props.xDomain && props.yDomain)) {
            React.Children.forEach(props.children, child => {
                // todo handle domain passed in as prop
                let domain = _.isFunction(child.type.getDomain) ?
                    child.type.getDomain(child.props, props.xType, props.yType) : {x: null, y: null};
                if(_.isNull(domain.x)) domain.x = defaultDomain(child.props.data, child.props.getX, props.xType);
                if(_.isNull(domain.y)) domain.y = defaultDomain(child.props.data, child.props.getY, props.yType);
                chartDomains.push(domain);
            });
        }
        const xDomains = props.xDomain || _.pluck(chartDomains, 'x');
        const yDomains = props.yDomain || _.pluck(chartDomains, 'y');
        _.assign(this, {xDomains, yDomains});
    },
    initScale(props) {
        // create the X and Y scales shared by charts
        // calculate the inner width and height based on margins
        // todo get padding too
        const {width, height, xType, yType, labelPadding, tickLength, showXTicks, showYTicks} = props;
        this.margin = _.defaults(this.props.margin, DEFAULTS.margin);

        const shouldMeasureLabels = _.any(this.margin, _.isNull);
        if(shouldMeasureLabels) {
            let isDone = false;
            // start with a margin of 10 pixels for all unknown margins
            let margin = _.transform(this.margin, (result, m, key) => result[key] = _.isNull(m) ? 10 : m);
            // make scales using margin, measure labels, make new margins
            // repeat until we converge on a margin that works
            let innerWidth, innerHeight, xScale, yScale;
            while(!isDone) {
                innerWidth = width - (margin.left + margin.right);
                innerHeight = height - (margin.top + margin.bottom);
                xScale = makeScale(this.xDomains, [0, innerWidth], xType);
                yScale = makeScale(this.yDomains, [innerHeight, 0], yType);
                const xTicks = (xType === 'ordinal') ? xScale.domain() : xScale.ticks();
                const yTicks = (yType === 'ordinal') ? yScale.domain() : yScale.ticks();
                if(xType !== 'ordinal') xScale.nice(xTicks.length);
                if(yType !== 'ordinal') yScale.nice(yTicks.length);
                const labelBoxes = measureAxisLabels(xTicks, yTicks, xType, yType);
                //console.log(xTicks, yTicks);
                //console.log(labelBoxes);
                let newMargin = {
                    top: Math.ceil(_.last(labelBoxes.y).height / 2),
                    right: Math.ceil(_.last(labelBoxes.x).width / 2),
                    left: Math.ceil(d3.max(labelBoxes.y, accessor('width')) + labelPadding + (showYTicks ? tickLength : 0)),
                    bottom: Math.ceil(d3.max(labelBoxes.x, accessor('height')) + labelPadding + (showXTicks ? tickLength : 0))
                };
                isDone = _.all(_.keys(margin), k => margin[k] === newMargin[k]);
                //console.log('calculated margin', newMargin);
                //console.log(xScale.domain(), yScale.domain());
                margin = newMargin;
            }
            _.assign(this, {margin, innerWidth, innerHeight, xScale, yScale});
        } else {
            // margins are all pre-defined, just make the scales
            const innerWidth = width - (props.margin.left + props.margin.right);
            const innerHeight = height - (props.margin.top + props.margin.bottom);
            const xScale = makeScale(this.xDomains, [0, innerWidth], xType);
            const yScale = makeScale(this.yDomains, [innerHeight, 0], yType);
            _.assign(this, {innerWidth, innerHeight, xScale, yScale});
        }
    },

    onMouseMove(e) {
        //if(!this.props.onMouseMove && !this.state.isSelecting) return;
        const chartBB = e.currentTarget.getBoundingClientRect();
        const chartX = (e.clientX - chartBB.left) - this.props.marginLeft;
        // todo alternative to invert for ordinal scales
        const chartXVal = this.xScale.invert(chartX);

        const chart = this.refs['chart-series-0'];
        const hovered = _.isFunction(chart.getHovered) ? chart.getHovered(chartXVal) : null;

        this.props.onMouseMove(hovered, e);
    },

    render() {
        const {width, height, xType, yType} = this.props;
        const {margin, xScale, yScale, innerWidth, innerHeight} = this;
        return (
            <svg className="xy-plot" {...{width, height}}
                 onMouseMove={this.onMouseMove}
            >
                <g className="chart-inner"
                   transform={`translate(${margin.left}, ${margin.top})`}
                >
                    {this.renderXAxis()}
                    {this.renderYAxis()}

                    {React.Children.map(this.props.children, (child, i) => {
                        const name = child.props.name || 'chart-series-' + i;
                        return React.cloneElement(child,
                            {ref: name, name, xType, yType, xScale, yScale, innerWidth, innerHeight}
                        );
                    })}
                </g>
            </svg>
        );
    },

    renderXAxis() {
        return this.renderAxis({
            letter: 'x',
            orientation: 'horizontal',
            axisTransform: `translate(0, ${this.innerHeight})`
        });
    },
    renderYAxis() {
        return this.renderAxis({
            letter: 'y',
            orientation: 'vertical'
        });
    },
    renderAxis(options) {
        const {letter, orientation, axisTransform} = options;
        const upperLetter = letter.toUpperCase();
        const showLabels = this.props[`show${upperLetter}Labels`];
        const showTicks = this.props[`show${upperLetter}Ticks`];
        const showGrid = this.props[`show${upperLetter}Grid`];
        if(!(showLabels || showTicks || showGrid)) return null;

        const {labelPadding, tickLength} = this.props;
        const scale = this[`${letter}Scale`];
        const type = this.props[`${letter}Type`];
        const ticks = (type === 'ordinal') ? scale.domain() : scale.ticks();
        const tickTransform = (value) => (orientation === 'vertical') ?
            `translate(0, ${scale(value)})` : `translate(${scale(value)}, 0)`;
        const distance = (showTicks) ? tickLength + labelPadding : labelPadding;
        const labelOffset = (orientation === 'vertical') ? {x: -distance} : {y: distance};
        const gridLength = (orientation === 'vertical') ? this.innerWidth : this.innerHeight;

        return <g ref={`${letter}Axis`} className={`chart-axis chart-axis-${letter}`} transform={axisTransform}>
            {_.map(ticks, (value) => {
                const tickOptions = {value, letter, type, orientation, labelOffset, gridLength, tickLength};
                return <g transform={tickTransform(value)}>
                    {showLabels ? this.renderLabel(tickOptions): null}
                    {showGrid ? this.renderGrid(tickOptions): null}
                    {showTicks ? this.renderTick(tickOptions) : null}
                </g>
            })}
        </g>
    },
    renderLabel(options) {
        const {letter, value, type, labelOffset} = options;
        const className = `chart-axis-label chart-axis-label-${letter}`;
        // todo generalize dy for all text sizes...?
        return <text {...{className}} dy="0.32em" {...labelOffset}>
            {formatAxisLabel(value, type)}
        </text>
    },
    renderTick(options) {
        const {letter, tickLength, orientation} = options;
        const className = `chart-tick chart-tick-${letter}`;
        const [x2, y2] = (orientation === 'vertical') ? [-tickLength, 0] : [0, tickLength];
        return <line {...{className, x2, y2}} />
    },
    renderGrid(options) {
        const {letter, gridLength, orientation} = options;
        const className = `chart-grid chart-grid-${letter}`;
        const [x2, y2] = (orientation === 'vertical') ? [gridLength, 0] : [0, -gridLength];
        return <line {...{className, x2, y2}} />
    }
});

function isNullOrUndefined(d) { return _.isNull(d) || _.isUndefined(d); }

function makeScale(domains, range, axisType) {
    const domain = defaultDomain(_.flatten(domains), null, axisType);
    const scale = initScale(axisType).domain(domain);
    axisType === 'ordinal' ? scale.rangePoints(range) : scale.range(range);
    return scale;
}

function defaultDomain(data, getter, scaleType) {
    switch(scaleType) {
        // extent for number & time scales, coerce dates to numbers
        case 'number':
        case 'time':
            return d3.extent(data, (d) => +accessor(getter)(d));
        // all unique values for ordinal scale
        case 'ordinal': return _.uniq(data.map(accessor(getter)));
    }
    return [];
}

function initScale(type) {
    switch(type) {
        case 'number': return d3.scale.linear().nice();
        case 'ordinal': return d3.scale.ordinal();
        case 'time': return d3.time.scale().nice();
    }
}

function formatAxisLabel(value, type) {
    return type === 'time' ? moment(value).format('MM-DD') : value;
}


function measureAxisLabels(xLabels, yLabels, xType, yType) {
    const xLabelEls = xLabels.map(l => `<text class='chart-axis-label chart-axis-label-x'>${formatAxisLabel(l, xType)}</text>`);
    const yLabelEls = yLabels.map(l => `<text class='chart-axis-label chart-axis-label-y'>${formatAxisLabel(l, yType)}</text>`);
    // todo don't use jquery
    const $testSvg = $(`<svg class="xy-plot">\
        <g class="chart-inner">\
            <g class="chart-axis chart-axis-x">${xLabelEls.join('')}</g>\
            <g class="chart-axis chart-axis-y">${yLabelEls.join('')}</g>\
        </g>\
    </svg>`).css({visibility: 'hidden'});
    $('body').append($testSvg);
    const xLabelBoxes = _.map($testSvg.find('.chart-axis-label-x'), el => el.getBoundingClientRect());
    const yLabelBoxes = _.map($testSvg.find('.chart-axis-label-y'), el => el.getBoundingClientRect());
    $testSvg.remove();
    return {x: xLabelBoxes, y: yLabelBoxes};
}

export default XYPlot;
