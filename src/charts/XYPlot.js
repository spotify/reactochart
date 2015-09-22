import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';
import {accessor} from '../util.js';
import moment from 'moment';
import numeral from 'numeral';
import $ from 'jquery';

const DEFAULTS = {
    margin: {top: null, bottom: null, left: null, right: null},
    xAxisLabelAlign: {horizontal: 'left', vertical: 'top'},
    yAxisLabelAlign: {horizontal: 'right', vertical: 'top'}
};

const XYPlot = React.createClass({
    propTypes: {
        // x & y scale types, defaults to 'number'
        xType: PropTypes.oneOf(['number', 'time', 'ordinal']),
        yType: PropTypes.oneOf(['number', 'time', 'ordinal']),

        // scale domains may be provided, otherwise will be inferred from data
        xDomain: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.instanceOf(Date)])),
        yDomain: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.instanceOf(Date)])),

        // approximate # of ticks to include on each axis (actual # may be slightly different, to get nicest intervals)
        xTickCount: PropTypes.number,
        yTickCount: PropTypes.number,

        // (outer) width and height of the chart
        // todo infer from data/other props??
        width: PropTypes.number,
        height: PropTypes.number,

        // chart margins
        margin: PropTypes.shape({
            top: PropTypes.number,
            bottom: PropTypes.number,
            left: PropTypes.number,
            right: PropTypes.number
        }),

        // todo: padding

        // format to use for the axis value labels
        // interpreted as momentjs formats for time axes, or numeraljs formats for number axes
        xLabelFormat: PropTypes.string,
        yLabelFormat: PropTypes.string,

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

        // todo: niceX, niceY
        // todo: xAxisLabel, yAxisLabel

        xAxisLabel: PropTypes.string,
        xAxisLabelAlign: PropTypes.shape({
            horizontal: PropTypes.oneOf(['left', 'center', 'right']),
            vertical: PropTypes.oneOf(['top', 'bottom'])
        }),
        xAxisLabelPadding: PropTypes.number,

        yAxisLabel: PropTypes.string,
        yAxisLabelAlign: PropTypes.shape({
            horizontal: PropTypes.oneOf(['left', 'center', 'right']),
            vertical: PropTypes.oneOf(['top', 'bottom'])
        }),
        yAxisLabelPadding: PropTypes.number,

        // todo more interaction?
        onMouseMove: PropTypes.func
    },
    getDefaultProps() {
        return {
            xType: 'number',
            yType: 'number',
            xDomain: null,
            yDomain: null,
            xTickCount: 10,
            yTickCount: 10,
            width: 400,
            height: 250,
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
            xLabelFormat: null,
            yLabelFormat: null,
            xAxisLabel: null,
            xAxisLabelAlign: DEFAULTS.xAxisLabelAlign,
            xAxisLabelPadding: 10,
            yAxisLabel: null,
            yAxisLabelAlign: DEFAULTS.yAxisLabelAlign,
            yAxisLabelPadding: 10,
            onMouseMove: _.noop
        }
    },
    getInitialState() {
        return {};
    },

    componentWillMount() {
        this.initDomains(this.props);
        this.initLabelFormats(this.props);
        this.initScale(this.props);
    },
    componentWillReceiveProps(newProps) {
        this.initDomains(newProps);
        this.initLabelFormats(this.props);
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
                if(!child) return;
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
    initLabelFormats(props) {
        ['x', 'y'].forEach(letter => {
            const formatKey = `${letter}LabelFormat`;
            const axisType = props[`${letter}Type`];

            // use given format if provided
            if(!_.isNull(props[formatKey])) this[formatKey] = props[formatKey];
            // otherwise determine appropriate format for axis type
            else if(axisType == 'number') {
                this[formatKey] = '0.[000000]a';
            } else if(axisType === 'time') {
                // todo determine most appropriate date format for this domain
                //const domains = this[`${letter}Domains`];
                //const domain = defaultDomain(_.flatten(domains), null, axisType);
                this[formatKey] = 'MM-DD';
            }
        })
    },

    initScale(props) {
        // create the X and Y scales shared by charts
        // calculate the inner width and height based on margins
        // todo get padding too
        const {
            width, height, xType, yType, xTickCount, yTickCount,
            xAxisLabel, xAxisLabelPadding, yAxisLabel, yAxisLabelPadding,
            labelPadding, tickLength, showXTicks, showYTicks
        } = props;
        const {xLabelFormat, yLabelFormat} = this;
        const origMargin = _.defaults(this.props.margin, DEFAULTS.margin);

        const shouldMeasureLabels = _.any(origMargin, _.isNull);
        if(shouldMeasureLabels) {
            let isDone = false;
            // start with a margin of 10 pixels for all unknown margins
            let margin = _.transform(origMargin, (result, m, key) => result[key] = _.isNull(m) ? 10 : m);
            // make scales using margin, measure labels, make new margins
            // repeat until we converge on a margin that works
            let innerWidth, innerHeight, xScale, yScale, labelBoxes;
            while(!isDone) {
                innerWidth = width - (margin.left + margin.right);
                innerHeight = height - (margin.top + margin.bottom);
                xScale = makeScale(this.xDomains, [0, innerWidth], xType);
                yScale = makeScale(this.yDomains, [innerHeight, 0], yType);
                const xTicks = (xType === 'ordinal') ? xScale.domain() : xScale.ticks(xTickCount);
                const yTicks = (yType === 'ordinal') ? yScale.domain() : yScale.ticks(yTickCount);
                if(xType !== 'ordinal') xScale.nice(xTicks.length);
                if(yType !== 'ordinal') yScale.nice(yTicks.length);
                //const labelBoxes = measureAxisLabels(xTicks, yTicks, xType, yType, xLabelFormat, yLabelFormat);

                const xAxisLabelProps = xAxisLabel ? {letter: 'x', label: xAxisLabel} : null;

                labelBoxes = measureAxisLabels(
                    this.getXAxisProps({innerWidth, innerHeight, scale: xScale}),
                    this.getYAxisProps({innerWidth, innerHeight, scale: yScale}),
                    xAxisLabel ? this.getXAxisLabelProps({margin}) : null,
                    yAxisLabel ? this.getYAxisLabelProps({margin}) : null
                );

                // todo: modify to handle all possible label alignments
                // todo: handle case of labels not shown (ie if !this.props.showYLabels)
                const topYValOverhang = Math.ceil(_.last(labelBoxes.yVal).height / 2);
                const xAxisLabelOuterHeight = xAxisLabel && labelBoxes.xAxis ?
                    Math.ceil(labelBoxes.xAxis.height + xAxisLabelPadding) : 0;
                const yAxisLabelOuterHeight = yAxisLabel && labelBoxes.yAxis ?
                    Math.ceil(labelBoxes.yAxis.height + yAxisLabelPadding) : 0;

                const topMargin = _.isNull(origMargin.top) ?
                    Math.max(topYValOverhang, xAxisLabelOuterHeight, yAxisLabelOuterHeight) : origMargin.top;

                const yTickAndPadSpace = labelPadding + (showYTicks ? tickLength : 0);

                const maxYValWidth = Math.ceil(d3.max(labelBoxes.yVal, accessor('width')) + yTickAndPadSpace);
                const yAxisLabelOuterWidth = yAxisLabel && labelBoxes.yAxis ?
                    Math.ceil(labelBoxes.yAxis.width) + yTickAndPadSpace : 0;
                //console.log(maxYValWidth, yAxisLabelOuterWidth);

                const leftMargin =  _.isNull(origMargin.left) ?
                    Math.max(maxYValWidth, yAxisLabelOuterWidth) : origMargin.left;

                let newMargin = {
                    top: topMargin,
                    right: _.isNull(origMargin.right) ?
                        Math.ceil(_.last(labelBoxes.xVal).width / 2)
                        : origMargin.right,
                    left: leftMargin,
                    bottom: _.isNull(origMargin.bottom) ?
                        Math.ceil(d3.max(labelBoxes.xVal, accessor('height')) + labelPadding + (showXTicks ? tickLength : 0))
                        : origMargin.bottom
                };
                isDone = _.all(_.keys(margin), k => margin[k] === newMargin[k]);
                //console.log('calculated margin', newMargin);
                //console.log(xScale.domain(), yScale.domain());
                margin = newMargin;
                innerWidth = width - (margin.left + margin.right);
                innerHeight = height - (margin.top + margin.bottom);
            }
            _.assign(this, {margin, innerWidth, innerHeight, xScale, yScale, labelBoxes});
        } else {
            // margins are all pre-defined, just make the scales
            const innerWidth = width - (props.margin.left + props.margin.right);
            const innerHeight = height - (props.margin.top + props.margin.bottom);
            const xScale = makeScale(this.xDomains, [0, innerWidth], xType);
            const yScale = makeScale(this.yDomains, [innerHeight, 0], yType);
            _.assign(this, {margin: props.margin, innerWidth, innerHeight, xScale, yScale});
        }
    },

    onMouseMove(e) {
        //if(!this.props.onMouseMove && !this.state.isSelecting) return;
        const chartBB = e.currentTarget.getBoundingClientRect();
        const chartX = (e.clientX - chartBB.left) - this.margin.left;
        // todo alternative to invert for ordinal scales
        const chartXVal = this.xScale.invert(chartX);

        const chart = this.refs['chart-series-0'];
        const hovered = _.isFunction(chart.getHovered) ? chart.getHovered(chartXVal) : null;

        this.props.onMouseMove(hovered, e);
    },

    render() {
        const {width, height, xType, yType, xAxisLabel, yAxisLabel} = this.props;
        const {margin, xScale, yScale, innerWidth, innerHeight} = this;
        return (
            <svg className="xy-plot" {...{width, height}}
                 onMouseMove={this.onMouseMove}
            >
                <g className="chart-inner"
                   transform={`translate(${margin.left}, ${margin.top})`}
                >
                    <ChartAxis {...this.getXAxisProps()} />
                    <ChartAxis {...this.getYAxisProps()} />

                    {React.Children.map(this.props.children, (child, i) => {
                        if(!child) return null;
                        const name = child.props.name || 'chart-series-' + i;
                        return React.cloneElement(child,
                            {ref: name, name, xType, yType, xScale, yScale, innerWidth, innerHeight}
                        );
                    })}
                </g>

                {xAxisLabel ?
                    <XAxisLabel {...this.getXAxisLabelProps()} />
                    : null
                }
                {yAxisLabel ?
                    <YAxisLabel {...this.getYAxisLabelProps()} />
                    : null
                }
            </svg>
        );
    },

    getXAxisProps(options={}) {
        const innerHeight = options.innerHeight || this.innerHeight;
        return this.getAxisProps(_.assign({
            letter: 'x',
            orientation: 'horizontal',
            axisTransform: `translate(0, ${innerHeight})`
        }, options));
    },
    getYAxisProps(options={}) {
        return this.getAxisProps(_.assign({
            letter: 'y',
            orientation: 'vertical'
        }, options));
    },
    getAxisProps(options) {
        const {letter, orientation, axisTransform} = options;
        const upperLetter = letter.toUpperCase();
        return {
            letter, orientation, axisTransform,
            labelPadding: options.labelPadding || this.props.labelPadding,
            tickLength: options.tickLength || this.props.tickLength,
            innerWidth: options.innerWidth || this.innerWidth,
            innerHeight: options.innerWidth || this.innerHeight,
            scale: options.scale || this[`${letter}Scale`],
            type: options.type || this.props[`${letter}Type`],
            tickCount: options.tickCount || this.props[`${letter}TickCount`],
            labelFormat: options.labelFormat || this[`${letter}LabelFormat`],
            showLabels: options.showLabels || this.props[`show${upperLetter}Labels`],
            showTicks: options.showTicks || this.props[`show${upperLetter}Ticks`],
            showGrid: options.showGrid || this.props[`show${upperLetter}Grid`]
        };
    },

    getXAxisLabelProps(options={}) {
        const {labelBoxes} = this;
        return _.defaults(options, {
            label: this.props.xAxisLabel,
            margin: this.margin,
            innerWidth: this.innerWidth,
            innerHeight: this.innerHeight,
            alignment: this.props.xAxisLabelAlign,
            axisLabelPadding: this.props.xAxisLabelPadding,
            valueLabelPadding: this.props.labelPadding,
            tickLength: this.props.tickLength,
            showTicks: this.props.showXTicks,
            labelBox: (labelBoxes && labelBoxes.xAxis) ? labelBoxes.xAxis : {width: 10, height: 10}
        })
    },
    getYAxisLabelProps(options={}) {
        const {labelBoxes} = this;
        return _.defaults(options, {
            label: this.props.yAxisLabel,
            margin: this.margin,
            innerWidth: this.innerWidth,
            innerHeight: this.innerHeight,
            alignment: this.props.yAxisLabelAlign,
            axisLabelPadding: this.props.yAxisLabelPadding,
            valueLabelPadding: this.props.labelPadding,
            tickLength: this.props.tickLength,
            showTicks: this.props.showYTicks,
            labelBox: (labelBoxes && labelBoxes.yAxis) ? labelBoxes.yAxis : {width: 10, height: 10}
        })
    }
});

const XAxisLabel = React.createClass({
    propTypes: {
        label: PropTypes.string,
        //letter: PropTypes.string,
        margin: PropTypes.object,
        innerWidth: PropTypes.number,
        innerHeight: PropTypes.number,
        alignment: PropTypes.shape({
            horizontal: PropTypes.oneOf(['left', 'center', 'right']),
            vertical: PropTypes.oneOf(['top', 'bottom'])
        }),
        axisLabelPadding: PropTypes.number,
        valueLabelPadding: PropTypes.number,
        tickLength: PropTypes.number,
        // bounding box of the label
        labelBox: PropTypes.object
    },
    getDefaultProps() {
        return {
            labelBox: {height: 10, width: 10},
            innerWidth: 0
        }
    },
    render() {
        const {label, labelBox, margin, alignment} = this.props;

        const top = labelBox.height;
        const left = margin.left;
        const x =
            (alignment.horizontal === 'left') ? 0 :
            (alignment.horizontal === 'right') ? this.props.innerWidth :
            this.props.innerWidth / 2;
        const textAnchor =
            (alignment.horizontal === 'left') ? 'start' :
            (alignment.horizontal === 'right') ? 'end' :
            'middle';

        // todo implement vertical alignment

        return <g
            className={`chart-axis-label chart-axis-label-x`}
            transform={`translate(${left},${top})`}
            >
            <text {...{x, style: {textAnchor}}}>{label}</text>
        </g>
    }
});

const YAxisLabel = React.createClass({
    propTypes: {
        label: PropTypes.string,
        //letter: PropTypes.string,
        margin: PropTypes.object,
        innerWidth: PropTypes.number,
        innerHeight: PropTypes.number,
        alignment: PropTypes.shape({
            horizontal: PropTypes.oneOf(['left', 'center', 'right']),
            vertical: PropTypes.oneOf(['top', 'bottom'])
        }),
        axisLabelPadding: PropTypes.number,
        valueLabelPadding: PropTypes.number,
        tickLength: PropTypes.number,
        showTicks: PropTypes.bool,
        // bounding box of the label
        labelBox: PropTypes.object
    },
    getDefaultProps() {
        return {
            labelBox: {height: 10, width: 10},
            innerWidth: 0
        }
    },
    render() {
        const {label, labelBox, margin, valueLabelPadding, showTicks, tickLength} = this.props;
        const alignment = {horizontal: 'center'};
        const yTickAndPadSpace = valueLabelPadding + (showTicks ? tickLength : 0);

        const top = labelBox.height;
        const left = 0;
        const x =
            (alignment.horizontal === 'left') ? 0 :
            (alignment.horizontal === 'right') ? margin.left - yTickAndPadSpace :
            (margin.left - yTickAndPadSpace) / 2;
        const textAnchor =
            (alignment.horizontal === 'left') ? 'start' :
            (alignment.horizontal === 'right') ? 'end' :
            'middle';

        // todo implement vertical alignment

        return <g
            className={`chart-axis-label chart-axis-label-y`}
            transform={`translate(${left},${top})`}
            >
            <text {...{x, style: {textAnchor}}}>{label}</text>
        </g>
    }
});

const ChartAxis = React.createClass({
    propTypes: {
        scale: PropTypes.object,
        type: PropTypes.string,
        orientation: PropTypes.string,
        axisTransform: PropTypes.string,
        tickCount: PropTypes.number,
        labelFormat: PropTypes.string,
        letter: PropTypes.string,

        innerWidth: PropTypes.number,
        innerHeight: PropTypes.number,
        labelPadding: PropTypes.number,
        tickLength: PropTypes.number,
        showLabels: PropTypes.bool,
        showTicks: PropTypes.bool,
        showGrid: PropTypes.bool
    },
    render() {
        const {
            scale, type, orientation, axisTransform, tickCount, letter, labelFormat,
            innerWidth, innerHeight, labelPadding, tickLength, showLabels, showTicks, showGrid
        } = this.props;

        if(!(showLabels || showTicks || showGrid)) return null;

        const ticks = (type === 'ordinal') ? scale.domain() : scale.ticks(tickCount);
        const tickTransform = (value) => (orientation === 'vertical') ?
            `translate(0, ${scale(value)})` : `translate(${scale(value)}, 0)`;
        const distance = (showTicks) ? tickLength + labelPadding : labelPadding;
        const labelOffset = (orientation === 'vertical') ? {x: -distance} : {y: distance};
        const gridLength = (orientation === 'vertical') ? innerWidth : innerHeight;

        return <g ref={`${letter}Axis`} className={`chart-axis chart-axis-${letter}`} transform={axisTransform}>
            {_.map(ticks, (value) => {
                const tickOptions = {value, letter, type, orientation, labelOffset, gridLength, tickLength, labelFormat};
                return <g transform={tickTransform(value)}>
                    {showLabels ? this.renderLabel(tickOptions): null}
                    {showGrid ? this.renderGrid(tickOptions): null}
                    {showTicks ? this.renderTick(tickOptions) : null}
                </g>
            })}
        </g>
    },
    renderLabel(options) {
        const {letter, value, type, labelOffset, labelFormat} = options;
        const className = `chart-axis-value-label chart-axis-value-label-${letter}`;
        // todo generalize dy for all text sizes...?
        return <text {...{className}} dy="0.32em" {...labelOffset}>
            {formatAxisLabel(value, type, labelFormat)}
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

function formatAxisLabel(value, type, format) {
    return type === 'number' ? numeral(value).format(format)
        : type === 'time' ? moment(value).format(format)
        : value;
}

function measureAxisLabels(xProps, yProps, xAxisLabelProps, yAxisLabelProps) {
    _.assign(xProps, {showTicks: false, showGrid: false});
    _.assign(yProps, {showTicks: false, showGrid: false});
    const xAxisHtml = React.renderToStaticMarkup(<ChartAxis {...xProps}/>);
    const yAxisHtml = React.renderToStaticMarkup(<ChartAxis {...yProps}/>);
    const xLabelHtml = xAxisLabelProps ? React.renderToStaticMarkup(<XAxisLabel {...xAxisLabelProps}/>) : '';
    const yLabelHtml = yAxisLabelProps ? React.renderToStaticMarkup(<YAxisLabel {...yAxisLabelProps}/>) : '';
    // todo don't use jquery...
    const $testSvg = $(`<svg class="xy-plot">\
        <g class="chart-inner">\
            ${xAxisHtml}${yAxisHtml}${xLabelHtml}${yLabelHtml}
        </g>\
    </svg>`);
    $('body').append($testSvg);
    const xValLabelBoxes = _.map($testSvg.find('.chart-axis-value-label-x'), el => el.getBoundingClientRect());
    const yValLabelBoxes = _.map($testSvg.find('.chart-axis-value-label-y'), el => el.getBoundingClientRect());
    const xAxisLabelBox = xAxisLabelProps ? $testSvg.find('.chart-axis-label-x text')[0].getBoundingClientRect() : null;
    const yAxisLabelBox = yAxisLabelProps ? $testSvg.find('.chart-axis-label-y text')[0].getBoundingClientRect() : null;
    $testSvg.remove();
    //console.log({xAxis: xAxisLabelBox, yAxis: yAxisLabelBox, xVal: xValLabelBoxes, yVal: yValLabelBoxes});
    return {xAxis: xAxisLabelBox, yAxis: yAxisLabelBox, xVal: xValLabelBoxes, yVal: yValLabelBoxes};
}

export default XYPlot;
