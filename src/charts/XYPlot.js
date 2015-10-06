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
    padding: {top: null, bottom: null, left: null, right: null},
    spacing: {top: 0, bottom: 0, left: 0, right: 0},
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

        // whether or not to extend the scales to end on nice values (see docs for d3 scale.linear.nice())
        niceX: PropTypes.bool,
        niceY: PropTypes.bool,

        // todo: ability to pass in array of ticks
        // todo: minMargin - margin will be at least X, or more if necessary
        // todo: extraMargin
        // todo: padding, minPadding, extraPadding
        // todo: spacing, minSpacing, extraSpacing ???
        // todo: niceX, niceY
        // todo: xAxisLabel, yAxisLabel


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
            niceX: true,
            niceY: true,
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
        this.initLabelFormats(this.props);
        this.initDomains(this.props);
        this.initScale(this.props);
    },
    componentWillReceiveProps(newProps) {
        this.initLabelFormats(newProps);
        this.initDomains(newProps);
        this.initScale(newProps);
    },

    initDomains(props) {
        const {xType, yType} = this.props;
        // figure out the domains for each axis (ie. data extents)
        let allChartOptions = [];
        // unless both domains are given, ask each child chart for it's desired domain, & flatten them into one domain.
        // this is so that charts can plot their own modified version of the data (ie. a histogram),
        // even if it has a different domain than the original data
        //if(!(props.xDomain && props.yDomain)) {
        React.Children.forEach(props.children, child => {
            if(!childIsXYChart(child)) return; // only get options for children which identify themselves as XYCharts

            const childProps = _.assign({}, {xType, yType}, child.props);
            let {xDomain, yDomain, spacing} = _.isFunction(child.type.getOptions) ?
                child.type.getOptions(childProps) : {xDomain: null, yDomain: null, spacing: null};
            if(_.isNull(xDomain)) xDomain = defaultDomain(child.props.data, child.props.getX, xType);
            if(_.isNull(yDomain)) yDomain = defaultDomain(child.props.data, child.props.getY, yType);
            spacing = _.isNull(spacing) ? _.clone(DEFAULTS.spacing) : _.defaults({}, spacing, DEFAULTS.spacing);

            allChartOptions.push({xDomain, yDomain, spacing});
        });
        //}
        const xDomains = props.xDomain || _.pluck(allChartOptions, 'xDomain');
        const yDomains = props.yDomain || _.pluck(allChartOptions, 'yDomain');
        const spacings = props.spacing || _.pluck(allChartOptions, 'spacing');
        _.assign(this, {xDomains, yDomains, spacings});
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
                this[formatKey] = 'MM-DD';
            }
        })
    },

    initScale(props) {
        // create the X and Y scales shared by charts
        // calculate the inner width and height based on margins
        // todo get padding too
        const {
            width, height, xType, yType, xTickCount, yTickCount, niceX, niceY,
            xAxisLabel, xAxisLabelPadding, yAxisLabel, yAxisLabelPadding,
            labelPadding, tickLength, showXTicks, showYTicks
        } = props;
        const {spacings, xLabelFormat, yLabelFormat} = this;
        const origMargin = _.defaults({}, this.props.margin, DEFAULTS.margin);
        const origPadding = _.defaults({}, this.props.padding, DEFAULTS.padding);

        const shouldMeasureLabels = _.any(origMargin, _.isNull);

        if(shouldMeasureLabels) {
            let isDone = false;
            // start with a margin of 10 pixels for all unknown margins
            let margin = _.transform(origMargin, (result, m, key) => result[key] = _.isNull(m) ? 10 : m);
            // and padding equal to the first chart's spacing for unknown paddings
            let padding = _.transform(origPadding, (res, p, key) => res[key] = _.isNull(p) ? spacings[0][key] : p);
            // make scales using margin, measure labels, make new margins
            // repeat until we converge on a margin that works
            let xScale, yScale, scaleWidth, scaleHeight, chartWidth, chartHeight, labelBoxes;
            let i=0, limit=5; // ensure we dont loop forever
            while(!isDone && i<limit) {
                i++;
                scaleWidth = width - (margin.left + margin.right + padding.left + padding.right);
                scaleHeight = height - (margin.top + margin.bottom + padding.top + padding.bottom);
                xScale = makeScale(this.xDomains, [padding.left, scaleWidth + padding.left], xType);
                yScale = makeScale(this.yDomains, [scaleHeight + padding.top, padding.top], yType);
                // todo cleanup ticks... doing more than i need to here...
                let xTicks = (xType === 'ordinal') ? xScale.domain() : xScale.ticks(xTickCount);
                let yTicks = (yType === 'ordinal') ? yScale.domain() : yScale.ticks(yTickCount);
                if(niceX && xType !== 'ordinal') xTicks = xScale.nice(xTicks.length);
                if(niceY && yType !== 'ordinal') yTicks = yScale.nice(yTicks.length).ticks();

                labelBoxes = measureAxisLabels(
                    this.getXAxisProps({scaleWidth, scaleHeight, scale: xScale}),
                    this.getYAxisProps({scaleWidth, scaleHeight, scale: yScale}),
                    xAxisLabel ? this.getXAxisLabelProps({margin}) : null,
                    yAxisLabel ? this.getYAxisLabelProps({margin}) : null
                );

                // calculate padding based on spacings and domains
                // spacing is the amount of outer space ('margin') required by the outermost elements of each chart,
                // so that they still fit within the chart boundaries, defined by chartWidth and chartHeight.
                // padding is the actual amount of extra space required, after taking into account the scales.
                // if the outermost chart elements are on the scale extrema, padding = spacing,
                // but the scale may extend beyond the last element anyway, so we may not need the extra padding.
                // NOTE: temporarily set as padding = max spacing, todo: implement real padding
                padding = _.reduce(spacings, (result, spacing) => {
                    return _.transform(spacing, (result, space, dir) => {
                        result[dir] = _.isNull(origPadding[dir]) ? Math.max(result[dir] || space) : origPadding[dir];
                    });
                }, {});

                // todo: modify to handle all possible label alignments
                // todo: handle case of labels not shown (ie if !this.props.showYLabels)
                const hasXAxisLabel = xAxisLabel && labelBoxes.xAxis;
                const hasYAxisLabel = yAxisLabel && labelBoxes.yAxis;
                const hasXValLabels = !!labelBoxes.xVal.length;
                const hasYValLabels = !!labelBoxes.yVal.length;


                const [xRange, yRange] = [xScale.range(), yScale.range()];

                // find # of pixels by which the top- and bottom-most y axis labels overhang the top/bottom chart edges
                const [topYTick, bottomYTick] = [_.min(yTicks, yScale), _.max(yTicks, yScale)];
                const [topYTickFromTop, bottomYTickFromBottom] =
                    [Math.abs(yScale(topYTick) - _.min(yRange)), Math.abs(yScale(bottomYTick) - _.max(yRange))];
                const [topYValBox, bottomYValBox] = hasYValLabels ?
                    [_.min(labelBoxes.yVal, accessor('top')), _.max(labelBoxes.yVal, accessor('top'))] : [null, null];
                const [topYValOverhang, bottomYValOverhang] = hasYValLabels ? [
                    Math.ceil(Math.max((0.5 * topYValBox.height) - (topYTickFromTop + padding.top), 0)),
                    Math.ceil(Math.max((0.5 * bottomYValBox.height) - (bottomYTickFromBottom + padding.bottom), 0))
                ] : [0, 0];

                // find # of pixels by which the left- and right-most x axis labels overhang the left/right chart edges
                // todo: do the rest of this
                //const [leftXTick, rightXTick] = [_.min(xTicks, yScale), _.max(yTicks, yScale)];


                // todo: modify to handle padding!!
                //
                //const topYValOverhang = hasYValLabels ? Math.ceil(_.last(labelBoxes.yVal).height / 2) : 0;
                const xAxisLabelOuterHeight = hasXAxisLabel ? Math.ceil(labelBoxes.xAxis.height + xAxisLabelPadding) : 0;
                const yAxisLabelOuterHeight = hasYAxisLabel ? Math.ceil(labelBoxes.yAxis.height + yAxisLabelPadding) : 0;

                const topMargin = _.isNull(origMargin.top) ?
                    Math.max(topYValOverhang, xAxisLabelOuterHeight, yAxisLabelOuterHeight) : origMargin.top;

                const yTickAndPadSpace =
                    ((hasYValLabels || hasYAxisLabel) ? labelPadding : 0) + (showYTicks ? tickLength : 0);

                const maxYValWidth =
                    (hasYValLabels ? Math.ceil(d3.max(labelBoxes.yVal, accessor('width'))) : 0) + yTickAndPadSpace;
                const yAxisLabelOuterWidth = hasYAxisLabel ? Math.ceil(labelBoxes.yAxis.width) + yTickAndPadSpace : 0;
                //console.log(maxYValWidth, yAxisLabelOuterWidth);

                const leftMargin =  _.isNull(origMargin.left) ?
                    Math.max(maxYValWidth, yAxisLabelOuterWidth) : origMargin.left;

                const xTickAndPadSpace =
                    ((hasXValLabels || hasXAxisLabel) ? labelPadding : 0) + (showXTicks ? tickLength : 0);

                const rightXValOverhang = hasXValLabels ? Math.ceil(_.last(labelBoxes.xVal).width / 2) : 0;

                const maxXValHeight =
                    (hasXValLabels ? Math.ceil(d3.max(labelBoxes.xVal, accessor('height'))) : 0) + xTickAndPadSpace;


                let requiredMargin = {
                    top: topMargin,
                    bottom: maxXValHeight,
                    left: leftMargin,
                    right: rightXValOverhang
                };

                let newMargin = _(requiredMargin)
                    .map((v,k) => [k, _.isNull(origMargin[k]) ? v : origMargin[k]])
                    .object().value();

                isDone = _.all(_.keys(margin), k => margin[k] === newMargin[k]);
                //console.log('calculated margin', newMargin);
                margin = newMargin;
                scaleWidth = width - (margin.left + margin.right + padding.left + padding.right);
                scaleHeight = height - (margin.top + margin.bottom + padding.top + padding.bottom);
            }
            //console.log('padding', padding);
            //console.log({scaleWidth, scaleHeight});
            _.assign(this, {margin, padding, scaleWidth, scaleHeight, xScale, yScale, labelBoxes});
        } else {
            // margins are all pre-defined, just make the scales
            const scaleWidth = width - (props.margin.left + props.margin.right);
            const scaleHeight = height - (props.margin.top + props.margin.bottom);
            const xScale = makeScale(this.xDomains, [0, scaleWidth], xType);
            const yScale = makeScale(this.yDomains, [scaleHeight, 0], yType);
            _.assign(this, {margin: props.margin, scaleWidth, scaleHeight, xScale, yScale});
        }
    },

    onMouseMove(e) {
        const {xType, yType, height, width} = this.props;
        const {margin, padding, scaleWidth, scaleHeight} = this;
        // todo faster method than getBoundingClientRect on every mouseover?
        const chartBB = e.currentTarget.getBoundingClientRect();
        const chartX = Math.round((e.clientX - chartBB.left) - this.margin.left);
        const chartY = Math.round((e.clientY - chartBB.top) - this.margin.top);

        const chartXVal = (!_.inRange(chartX, 0, scaleWidth + padding.left + padding.right)) ? null :
            (xType === 'ordinal') ?
                this.xScale.domain()[indexOfClosestNumberInList(chartX, this.xScale.range())] :
                this.xScale.invert(chartX);
        const chartYVal = (!_.inRange(chartY, 0, scaleHeight + padding.top + padding.bottom)) ? null :
            (yType === 'ordinal') ?
                this.yScale.domain()[indexOfClosestNumberInList(chartY, this.yScale.range())] :
                this.yScale.invert(chartY);

        const chart = this.refs['chart-series-0'];
        const hovered = (chart && _.isFunction(chart.getHovered)) ? chart.getHovered(chartXVal) : null;

        this.props.onMouseMove(hovered, e, {chartX, chartY, chartXVal, chartYVal});
    },

    render() {
        const {width, height, xType, yType, xAxisLabel, yAxisLabel} = this.props;
        const {margin, padding, xScale, yScale, scaleWidth, scaleHeight} = this;
        const chartWidth = scaleWidth + padding.left + padding.right;
        const chartHeight = scaleHeight + padding.top + padding.bottom;

        const propsToPass = {
            xType, yType, xScale, yScale, scaleWidth, scaleHeight, plotWidth: width, plotHeight: height,
            chartMargin: margin, chartPadding: padding
        };

        const childrenUnderAxes = React.Children.map(this.props.children, (child, i) => {
            if(!child || !child.props || !child.props.underAxes) return null;
            // todo fix chart series #
            const name = child.props.name || 'chart-series-' + i;
            return React.cloneElement(child, _.assign({ref: name, name}, propsToPass));
        });
        const childrenAboveAxes = React.Children.map(this.props.children, (child, i) => {
            if(!child || (child.props && child.props.underAxes)) return null;
            const name = child.props.name || 'chart-series-' + i;
            return React.cloneElement(child, _.assign({ref: name, name}, propsToPass));
        });

        return (
            <svg className="xy-plot" {...{width, height}}
                 onMouseMove={_.isFunction(this.props.onMouseMove) ? this.onMouseMove : null}
            >
                <g className="chart-inner"
                   transform={`translate(${margin.left}, ${margin.top})`}
                >
                    <rect className="chart-background" width={chartWidth} height={chartHeight} />

                    {childrenUnderAxes}

                    <ChartAxis {...this.getXAxisProps()} />
                    <ChartAxis {...this.getYAxisProps()} />

                    {childrenAboveAxes}
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
        const scaleHeight = options.scaleHeight || this.scaleHeight;
        const padding = options.padding || this.padding || {};
        return this.getAxisProps(_.assign({
            letter: 'x',
            orientation: 'horizontal',
            axisTransform: `translate(0, ${scaleHeight + (padding.top || 0) + (padding.bottom || 0)})`
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
            scaleWidth: options.scaleWidth || this.scaleWidth,
            scaleHeight: options.scaleWidth || this.scaleHeight,
            padding: options.padding || this.padding,
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
            scaleWidth: this.scaleWidth,
            scaleHeight: this.scaleHeight,
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
            scaleWidth: this.scaleWidth,
            scaleHeight: this.scaleHeight,
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
        scaleWidth: PropTypes.number,
        scaleHeight: PropTypes.number,
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
            scaleWidth: 0
        }
    },
    render() {
        const {label, labelBox, margin, alignment} = this.props;

        const top = labelBox.height;
        const left = margin.left;
        const x =
            (alignment.horizontal === 'left') ? 0 :
            (alignment.horizontal === 'right') ? this.props.scaleWidth :
            this.props.scaleWidth / 2;
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
        scaleWidth: PropTypes.number,
        scaleHeight: PropTypes.number,
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
            scaleWidth: 0
        }
    },
    render() {
        const {label, labelBox, margin, valueLabelPadding, showTicks, tickLength, alignment} = this.props;
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

        scaleWidth: PropTypes.number,
        scaleHeight: PropTypes.number,
        padding: PropTypes.object,
        labelPadding: PropTypes.number,
        tickLength: PropTypes.number,
        showLabels: PropTypes.bool,
        showTicks: PropTypes.bool,
        showGrid: PropTypes.bool
    },
    getDefaultProps() {
        return { padding: DEFAULTS.spacing }
    },
    render() {
        const {
            scale, type, orientation, axisTransform, tickCount, letter, labelFormat,
            scaleWidth, scaleHeight, padding, labelPadding, tickLength, showLabels, showTicks, showGrid
        } = this.props;

        if(!(showLabels || showTicks || showGrid)) return null;

        const ticks = (type === 'ordinal') ? scale.domain() : scale.ticks(tickCount);
        const distance = (showTicks) ? tickLength + labelPadding : labelPadding;
        const [tickTransform, labelOffset, gridLength] = (orientation === 'vertical') ?
            [v => `translate(0, ${scale(v)})`, {x: -distance}, scaleWidth + padding.left + padding.right] :
            [v => `translate(${scale(v)}, 0)`, {y: distance}, scaleHeight + padding.top + padding.bottom];


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

function closestNumberInList(number, list) {
    return list.reduce((closest, current) => {
        return Math.abs(current - number) < Math.abs(closest - number) ? current : closest;
    });
}
function indexOfClosestNumberInList(number, list) {
    //let closestIndex = 0;
    //const closestNumber = list.reduce((closest, current, i) => {
    //    if(Math.abs(current - number) < Math.abs(closest - number)) {
    //        closestIndex = i;
    //        return current;
    //    } else return closest;
    //}, Infinity);

    return list.reduce((closestI, current, i) => {
        return Math.abs(current - number) < Math.abs(list[closestI] - number) ? i : closestI;
    }, 0);
    //return closestIndex;
}

function childIsXYChart(child) {
    return !!(child && _.has(child, 'type.implementsInterface') && child.type.implementsInterface('XYChart'));
}

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
    xProps = _.assign({}, xProps, {showTicks: false, showGrid: false});
    yProps = _.assign({}, yProps, {showTicks: false, showGrid: false});
    const xAxisHtml = React.renderToStaticMarkup(<ChartAxis {...xProps}/>);
    const yAxisHtml = React.renderToStaticMarkup(<ChartAxis {...yProps}/>);
    const xLabelHtml = xAxisLabelProps ? React.renderToStaticMarkup(<XAxisLabel {...xAxisLabelProps}/>) : '';
    const yLabelHtml = yAxisLabelProps ? React.renderToStaticMarkup(<YAxisLabel {...yAxisLabelProps}/>) : '';
    // todo don't use jquery...
    const $testSvg = $(`<svg class="xy-plot"><g class="chart-inner">\
        ${xAxisHtml}${yAxisHtml}${xLabelHtml}${yLabelHtml}
    </g></svg>`);
    $('body').append($testSvg);

    const getRect = (el => el.getBoundingClientRect()); // get rekt
    const labelBoxes = {
        xVal: xProps.showLabels ? _.map($testSvg.find('.chart-axis-value-label-x'), getRect) : [],
        yVal: yProps.showLabels ? _.map($testSvg.find('.chart-axis-value-label-y'), getRect) : [],
        xAxis: xAxisLabelProps ? $testSvg.find('.chart-axis-label-x text')[0].getBoundingClientRect() : null,
        yAxis: yAxisLabelProps ? $testSvg.find('.chart-axis-label-y text')[0].getBoundingClientRect() : null
    };
    $testSvg.remove();
    return labelBoxes;
}

export default XYPlot;
