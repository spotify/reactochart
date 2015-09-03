import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';
import {accessor} from './util.js';
import moment from 'moment';

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
        // todo: padding

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
        return {preRender: false};
    },

    componentWillMount() {
        //this.initMargin(this.props);
        this.initScale(this.props);
    },
    componentWillReceiveProps(newProps) {
        this.initScale(newProps);
    },

    initMargin(props) {
        if(props.showXLabels) {
            props.data.forEach(d => {
                console.log()
            })
        }
    },
    initScale(props) {
        // create the X and Y scales shared by charts
        // first figure out the domains for each axis (ie. data extent)
        let chartDomains = [];
        // unless both domains are given, ask each child chart for it's desired domain, & flatten them into one domain.
        // this is so that charts can plot their own modified version of the data (ie. a histogram),
        // even if it has a different domain than the original data
        if(!(this.props.xDomain && this.props.yDomain)) {
            React.Children.forEach(props.children, child => {
                // todo handle domain passed in as prop
                let domain = _.isFunction(child.type.getDomain) ?
                    child.type.getDomain(child.props, props.xType, props.yType) : {x: null, y: null};
                if(_.isNull(domain.x)) domain.x = defaultDomain(child.props.data, child.props.getX, props.xType);
                if(_.isNull(domain.y)) domain.y = defaultDomain(child.props.data, child.props.getY, props.yType);
                //console.log('chartDomain', domain);
                chartDomains.push(domain);
            });
        }

        // calculate the inner width and height based on margin
        // todo get padding too
        const innerWidth = props.width - (props.marginLeft + props.marginRight);
        const innerHeight = props.height - (props.marginTop + props.marginBottom);

        // make the scales, combining all domains to create one
        const xDomains = this.props.xDomain || _.pluck(chartDomains, 'x');
        const yDomains = this.props.yDomain || _.pluck(chartDomains, 'y');
        const xScale = makeScale(xDomains, [0, innerWidth], props.xType);
        const yScale = makeScale(yDomains, [innerHeight, 0], props.yType);

        _.assign(this, {innerWidth, innerHeight, xScale, yScale});
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
        if(this.state.preRender) return this.preRender();

        const {width, height, marginLeft, marginTop, xType, yType} = this.props;
        const {xScale, yScale, innerWidth, innerHeight} = this;
        return (
            <svg className="xy-plot" {...{width, height}}
                 onMouseMove={this.onMouseMove}
            >
                <g className="chart-inner"
                   transform={`translate(${marginLeft}, ${marginTop})`}
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
    preRender() {
        window.requestAnimationFrame(() => {
            // stuff to do after the pre-render
            // ie. measure what you rendered & set state to trigger a real render
            //const labels = this.refs.labels.getDOMNode().children;
            //console.log(labels);
            //const labelBoxes = _.map(labels, label => label.getBoundingClientRect());
            //console.log(labelBoxes);
            //const maxLabelWidth = Math.max.apply(null, _.pluck(labelBoxes, 'width'));
            //console.log(maxLabelWidth);
            this.setState({maxLabelWidth: 0, preRender: false});
        });

        const {width, height} = this.props;

        return (
            <svg className="xy-plot" {...{width, height}}>
                <g className="chart-inner" ref="labels" transform="translate(30,10)">
                    {this.renderXAxis()}
                    {this.renderYAxis()}
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

        const scale = this[`${letter}Scale`];
        const type = this.props[`${letter}Type`];
        const ticks = (type === 'ordinal') ? scale.domain() : scale.ticks();
        const tickTransform = (value) => (orientation === 'vertical') ?
            `translate(0, ${scale(value)})` : `translate(${scale(value)}, 0)`;
        const labelPadding = 6; // todo make prop
        const tickLength = 6; // todo make prop
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
        console.log('labelOffset', labelOffset);
        // todo generalize dy for all text sizes...?
        return <text {...{className}} dy="0.32em" {...labelOffset}>
            {type === 'time' ? moment(value).format('MM-DD') : value}
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
        case 'number': return d3.scale.linear();
        case 'ordinal': return d3.scale.ordinal();
        case 'time': return d3.time.scale();
    }
}

export default XYPlot;
