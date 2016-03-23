import React from 'react';
//const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';
import {accessor} from '../util.js';
import moment from 'moment';
import numeral from 'numeral';
import ReactDOMServer from 'react-dom/server';
import resolveObjectProps from 'utils/resolveObjectProps';
import resolveXYScales from 'utils/resolveXYScales';

let PropTypes = React.PropTypes;
PropTypes = _.assign({}, PropTypes, {
    // all props that can apply to both axes take the form {x: val, y: val}
    xyObjectOf: (type) => PropTypes.oneOfType([type, PropTypes.shape({x: type, y: type})]),
    axisType: PropTypes.oneOf(['number', 'time', 'ordinal']),
    //DomainType: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.instanceOf(Date)])),
    dataArray: PropTypes.arrayOf(PropTypes.oneOfType([
        PropTypes.number, PropTypes.string, PropTypes.instanceOf(Date)
    ])),
    fourDirections: PropTypes.shape({
        top: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
        right: PropTypes.number
    }),
    stringFormatter: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
});

const XYPlot = React.createClass({
    propTypes: {
        // (outer) width and height of the chart
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,

        // chart margins (space around edges where axis labels live)
        margin: PropTypes.fourDirections,
        // internal chart padding (space between scale ends and edge of inner chart background)
        padding: PropTypes.fourDirections,
        // the max extra spacing required by the plot elements, if they were on the edge of the chart
        // eg. if a 10px radius dot is plotted at the end of one axis,
        // it needs 10px of spacing so it doesn't hang over the edge of the chart
        // spacing is the max possible necessary padding, and will == padding if plot elements are on scale extrema
        spacing: PropTypes.fourDirections,

        // axis types - number, time or ordinal
        scaleType: PropTypes.xyObjectOf(PropTypes.scaleType),
        // scale domains may be provided, otherwise will be inferred from data
        domain: PropTypes.xyObjectOf(PropTypes.dataArray),
        // whether or not to extend the scales to end on nice values (see docs for d3 scale.linear.nice())
        nice: PropTypes.xyObjectOf(PropTypes.bool),
        // whether or not to invert the axis (ie. put largest numbers on bottom for Y axis, or on left for X)
        invertAxis: PropTypes.xyObjectOf(PropTypes.bool),
        // placement of the axis labels/ticks on the chart
        axisPosition: PropTypes.shape({
            x: PropTypes.oneOf(['top', 'bottom']),
            y: PropTypes.oneOf(['left', 'right'])
        }),

        // approximate # of ticks to include on each axis - 10 is default
        // (actual # may be slightly different, to get nicest intervals)
        tickCount: PropTypes.xyObjectOf(PropTypes.number),
        // or alternatively, you can pass an array of the exact tick values to use on each axis
        ticks: PropTypes.xyObjectOf(PropTypes.dataArray),
        // size of axis ticks
        tickLength: PropTypes.xyObjectOf(PropTypes.number),

        // axis value labels will be created for each tick, unless you specify a different list of values to label
        labelValues: PropTypes.xyObjectOf(PropTypes.dataArray),
        // format to use for the axis value labels. can be a function or a string.
        // if function, called on each label.
        // if string, interpreted as momentjs formats for time axes, or numeraljs formats for number axes
        labelFormat: PropTypes.xyObjectOf(PropTypes.stringFormatter),
        // padding between axis value labels and the axis/ticks
        labelPadding: PropTypes.xyObjectOf(PropTypes.number),
        // label to show for null/undefined values
        emptyLabel: PropTypes.string,

        // should we draw axis value labels
        showLabels: PropTypes.xyObjectOf(PropTypes.bool),
        // should we draw the grid lines in the main chart space
        showGrid: PropTypes.xyObjectOf(PropTypes.bool),
        // should we draw the little tick lines along the axis
        showTicks: PropTypes.xyObjectOf(PropTypes.bool),
        // should we draw a line showing where zero is
        showZero: PropTypes.xyObjectOf(PropTypes.bool),

        // label for entire axis, not value labels
        axisLabel: PropTypes.xyObjectOf(PropTypes.string),
        axisLabelAlign: PropTypes.xyObjectOf(PropTypes.shape({
            horizontal: PropTypes.oneOf(['left', 'center', 'right']),
            vertical: PropTypes.oneOf(['top', 'bottom'])
        })),
        axisLabelPadding: PropTypes.xyObjectOf(PropTypes.number),

        // todo more interaction
        onMouseMove: PropTypes.func,
        onMouseEnter: PropTypes.func,
        onMouseLeave: PropTypes.func,
        onMouseDown: PropTypes.func,
        onMouseUp: PropTypes.func

        // todo: minMargin - margin will be at least X, or more if necessary
        // todo: extraMargin - margin to add to calculated necessary margin
        // todo: minPadding, extraPadding ?
        // todo: minSpacing, extraSpacing ?
    },
    getDefaultProps() {
        return {
            width: 400,
            height: 250,
            axisType: {x: 'number', y: 'number'},
            nice: {x: true, y: true},
            invertAxis: {x: false, y: false},
            tickCount: {x: 10, y: 10},
            tickLength: {x: 6, y: 6},
            labelPadding: {x: 6, y: 6},
            emptyLabel: "Unknown",
            showLabels: {x: true, y: true},
            showGrid: {x: true, y: true},
            showTicks: {x: true, y: true},
            showZero: {x: false, y: false},
            axisLabelPadding: {x: 10, y: 10},
            axisLabelAlign: {
                x: {horizontal: 'left', vertical: 'top'},
                y: {horizontal: 'right', vertical: 'top'}
            },

            // these values are inferred from data if not provided, therefore empty defaults
            margin: {}, padding: {}, spacing: {}, domain: {},
            ticks: {}, labelValues: {}, labelFormat: {}, axisLabel: {}
        };
    },
    getInitialState() {
        return {};
    },

    componentWillMount() {
        this.trueProps = this.initProps(this.props);
        this.initLabelFormats(this.trueProps);
        //this.initDomains(this.trueProps);
        //this.initScale(this.trueProps);
    },
    componentWillReceiveProps(newProps) {
        this.trueProps = this.initProps(newProps);
        this.initLabelFormats(this.trueProps);
        //this.initDomains(this.trueProps);
        //this.initScale(this.trueProps);
    },

    initProps(props) {
        return _.assign({}, props);
    },

    initDomains(props) {
        const {axisType, ticks, labelValues} = props;

        _.assign(this, {domains: props.domain, spacings: {}});

        //// figure out the domains for each axis (ie. data extents)
        //// unless both domains are given, ask each child chart for it's desired domain, & flatten them into one domain.
        //// this is so that charts can plot their own modified version of the data (ie. a histogram),
        //// even if it has a different domain than the original data
        //// todo: only do this when necessary
        //let allChartOptions = [];
        //React.Children.forEach(props.children, child => {
        //    if(!childIsXYChart(child)) return; // only get options for children which identify themselves as XYCharts
        //
        //    const childProps = _.assign({}, {axisType}, child.props);
        //    let {domain, spacing} = _.isFunction(child.type.getOptions) ? child.type.getOptions(childProps) : {};
        //    domain = domain || {};
        //    ['x','y'].forEach(k => {
        //        if(isNullOrUndefined(domain[k]))
        //            domain[k] = defaultDomain(child.props.data, child.props.getValue[k], axisType[k]);
        //    });
        //
        //    allChartOptions.push({domain, spacing});
        //});
        //
        //// use domain from props if provided, else calculated domains from children
        //let domains = _.fromPairs(_.map(['x','y'], k => {
        //    return [k, props.domain[k] || _.compact(_.map(allChartOptions, `domain.${k}`))]
        //}));
        //// if user has passed in custom ticks or label values, extend the domain to ensure they are all are included
        //['x','y'].forEach(k => {
        //    const isOrdinal = axisType[k] === 'ordinal';
        //    [ticks[k], labelValues[k]].forEach(values => {
        //        if(values) domains[k].push(isOrdinal ? values : d3.extent(values));
        //    });
        //});
        //// use spacing from props if provided, else calculated spacings from children
        //const spacings = _.map(allChartOptions, 'spacing').map(spacing => {
        //    return _.defaults({}, spacing, props.spacing);
        //});
        //
        //_.assign(this, {domains, spacings});


    },
    initLabelFormats(props) {
        this.labelFormat = _.fromPairs(_.map(['x', 'y'], k => {
            const axisType = props.axisType[k];
            // use given format if provided
            return (_.isObject(props.labelFormat) && _.has(props.labelFormat, k)) ? [k, props.labelFormat[k]] :
                // otherwise determine appropriate format for axis type
                (axisType == 'number') ? [k, '0.[000000]a'] :
                // todo determine most appropriate date format for this domain
                (axisType === 'time') ? [k, 'MM-DD'] : [k, undefined];
        }));
    },

    initScale(props) {
        // create the X and Y scales shared by charts
        // calculate the inner width and height based on margins
        const {
            width, height, axisType, tickCount, nice,
            axisLabel, axisLabelPadding, labelPadding, tickLength, showTicks
        } = props;
        const {domains, spacings, labelFormat} = this;
        const origMargin = props.margin;
        const origPadding = props.padding;

        // todo fix
        const shouldMeasureLabels = true;
        if(shouldMeasureLabels) {
            // several inferred variables depend on each other in a complicated/circular way:
            // the axis scales, margin, padding, ticks and labels.
            // eg. scale width depends on margin, which depends on the axis labels, which depend on the scale
            // so we set some sane initial values and iterate until it settles down (or we get tired of waiting)

            // start with a margin of 10 pixels for all unknown margins
            //let margin = _.transform(origMargin, (result, m, key) => result[key] = isNullOrUndefined(m) ? 10 : m);
            let margin = _.defaults({}, origMargin, {top: 10, bottom: 10, left: 10, right: 10});
            // and padding equal to the first chart's spacing for unknown paddings
            //let padding = _.transform(origPadding, (res, p, key) => res[key] = _.isNull(p) ? spacings[0][key] : p);
            let padding = _.defaults({}, origPadding, {top: 0, bottom: 0, left: 0, right: 0});
            // make scales using margin, measure labels, make new margins
            // repeat until we converge on a margin that works
            let scaleWidth, scaleHeight, labelBoxes;
            let scale = {};
            let ticks = {};

            let isDone = false, i = 0, limit = 5; // don't loop forever
            while(!isDone && i < limit) {
                i++;
                // calculate scale width based on previous margin
                scaleWidth = width - (margin.left + margin.right + padding.left + padding.right);
                scaleHeight = height - (margin.top + margin.bottom + padding.top + padding.bottom);
                const range = {
                    x: [padding.left, scaleWidth + padding.left],
                    y: [scaleHeight + padding.top, padding.top]
                };

                ['x', 'y'].forEach(k => {
                    scale[k] = makeScale(domains[k], range[k], axisType[k], nice[k], tickCount[k]);
                    if(props.invertAxis[k]) scale[k].domain(scale[k].domain().reverse());
                    ticks[k] = props.ticks[k] ||
                        ((axisType[k] === 'ordinal') ? scale[k].domain() : scale[k].ticks(tickCount[k]));
                });

                labelBoxes = measureAxisLabels(
                    this.getXAxisProps({scaleWidth, scaleHeight, scale: scale.x, ticks: ticks.x}),
                    this.getYAxisProps({scaleWidth, scaleHeight, scale: scale.y, ticks: ticks.y}),
                    axisLabel.x ? this.getXAxisLabelProps({margin}) : null,
                    axisLabel.y ? this.getYAxisLabelProps({margin}) : null
                );

                // calculate padding based on spacings and domains
                // spacing is the amount of outer space ('margin') required by the outermost elements of each chart,
                // so that they still fit within the chart boundaries, defined by chartWidth and chartHeight.
                // padding is the actual amount of extra space required, after taking into account the scales.
                // if the outermost chart elements are on the scale extrema, padding = spacing,
                // but the scale may extend beyond the last element anyway, so we may not need the extra padding.
                // NOTE: temporarily set as padding = max spacing, todo: implement real padding
                padding = _.defaults(origPadding, _.reduce(spacings, (newPadding, spacing) => {
                    return _.transform(spacing, (result, space, dir) => {
                        result[dir] = Math.max(newPadding[dir] || space);
                    });
                }, {}), {top: 0, bottom: 0, left: 0, right: 0});


                // todo: modify to handle all possible label alignments
                // todo: handle case of labels not shown (ie if !this.props.showYLabels)
                const hasXAxisLabel = axisLabel.x && labelBoxes.xAxis;
                const hasYAxisLabel = axisLabel.y && labelBoxes.yAxis;
                const hasXValLabels = !!labelBoxes.xVal.length;
                const hasYValLabels = !!labelBoxes.yVal.length;

                const [xRange, yRange] = [scale.x.range(), scale.y.range()];

                // find # of pixels by which the top- and bottom-most y axis labels overhang the top/bottom chart edges
                const [topYTick, bottomYTick] = [_.min(ticks.y, scale.y), _.max(ticks.y, scale.y)];
                const [topYTickFromTop, bottomYTickFromBottom] =
                    [Math.abs(scale.y(topYTick) - _.min(yRange)), Math.abs(scale.y(bottomYTick) - _.max(yRange))];
                const [topYValBox, bottomYValBox] = hasYValLabels ?
                    [_.min(labelBoxes.yVal, accessor('top')), _.max(labelBoxes.yVal, accessor('top'))] : [null, null];
                const [topYValOverhang, bottomYValOverhang] = hasYValLabels ? [
                    Math.ceil(Math.max((0.5 * topYValBox.height) - (topYTickFromTop + padding.top), 0)),
                    Math.ceil(Math.max((0.5 * bottomYValBox.height) - (bottomYTickFromBottom + padding.bottom), 0))
                ] : [0, 0];

                // find # of pixels by which the left- and right-most x axis labels overhang the left/right chart edges
                const [leftXTick, rightXTick] = [_.min(ticks.x, scale.x), _.max(ticks.x, scale.x)];
                const [leftXTickFromLeft, rightXTickFromRight] =
                    [Math.abs(scale.x(leftXTick) - _.min(xRange)), Math.abs(scale.x(rightXTick) - _.max(xRange))];
                const [leftXValBox, rightXValBox] = hasXValLabels ?
                    [_.min(labelBoxes.xVal, accessor('left')), _.max(labelBoxes.xVal, accessor('right'))] : [null, null];
                const [leftXValOverhang, rightXValOverhang] = hasXValLabels ? [
                    Math.ceil(Math.max((0.5 * leftXValBox.width) - (leftXTickFromLeft + padding.left), 0)),
                    Math.ceil(Math.max((0.5 * rightXValBox.width) - (rightXTickFromRight + padding.right), 0))
                ] : [0, 0];



                // todo: fix all of this... sigh...
                //
                const xAxisLabelOuterHeight = hasXAxisLabel ? Math.ceil(labelBoxes.xAxis.height + axisLabelPadding.x) : 0;
                const yAxisLabelOuterHeight = hasYAxisLabel ? Math.ceil(labelBoxes.yAxis.height + axisLabelPadding.y) : 0;

                const topMargin = _.has(origMargin, 'top') ?
                    origMargin.top : Math.max(topYValOverhang, xAxisLabelOuterHeight, yAxisLabelOuterHeight);

                const yTickAndPadSpace =
                    ((hasYValLabels || hasYAxisLabel) ? labelPadding.y : 0) + (showTicks.y ? tickLength.y : 0);

                const maxYValWidth =
                    (hasYValLabels ? Math.ceil(d3.max(labelBoxes.yVal, accessor('width'))) : 0) + yTickAndPadSpace;
                const yAxisLabelOuterWidth = hasYAxisLabel ? Math.ceil(labelBoxes.yAxis.width) + yTickAndPadSpace : 0;
                //console.log(maxYValWidth, yAxisLabelOuterWidth);

                const leftMargin =  _.has(origMargin, 'left') ?
                    origMargin.left : Math.max(leftXValOverhang, maxYValWidth, yAxisLabelOuterWidth);

                const xTickAndPadSpace =
                    ((hasXValLabels || hasXAxisLabel) ? labelPadding.x : 0) + (showTicks.x ? tickLength.x : 0);

                const maxXValHeight =
                    (hasXValLabels ? Math.ceil(d3.max(labelBoxes.xVal, accessor('height'))) : 0) + xTickAndPadSpace;


                let requiredMargin = {
                    top: topMargin,
                    bottom: maxXValHeight,
                    left: leftMargin,
                    right: rightXValOverhang
                };

                let newMargin = _(requiredMargin)
                    .map((v,k) => [k, _.has(origMargin, k) ? origMargin[k] : v])
                    .fromPairs()
                    .value();

                isDone = _.every(_.keys(margin), k => margin[k] === newMargin[k]);
                //console.log('calculated margin', newMargin);
                margin = newMargin;
                scaleWidth = width - (margin.left + margin.right + padding.left + padding.right);
                scaleHeight = height - (margin.top + margin.bottom + padding.top + padding.bottom);
            }
            //console.log('padding', padding);
            //console.log({scaleWidth, scaleHeight});
            _.assign(this, {scale, ticks, margin, padding, scaleWidth, scaleHeight, labelBoxes});
        } else {
            // margins are all pre-defined, just make the scales
            // todo still need to determine padding??
            //const scaleWidth = width - (props.margin.left + props.margin.right);
            //const scaleHeight = height - (props.margin.top + props.margin.bottom);
            //const xScale = makeScale(this.xDomains, [0, scaleWidth], xType);
            //const yScale = makeScale(this.yDomains, [scaleHeight, 0], yType);
            //_.assign(this, {margin: props.margin, scaleWidth, scaleHeight, xScale, yScale});
        }
    },

    onMouseMove(e) {
        const {axisType, height, width} = this.trueProps;
        const {margin, padding, scale, scaleWidth, scaleHeight} = this;
        // todo faster method than getBoundingClientRect on every mouseover?
        const chartBB = e.currentTarget.getBoundingClientRect();
        const chartX = Math.round((e.clientX - chartBB.left) - margin.left);
        const chartY = Math.round((e.clientY - chartBB.top) - margin.top);

        const chartXVal = (!_.inRange(chartX, 0, scaleWidth + padding.left + padding.right)) ? null :
            (axisType.x === 'ordinal') ?
                scale.x.domain()[indexOfClosestNumberInList(chartX, scale.x.range())] :
                scale.x.invert(chartX);
        const chartYVal = (!_.inRange(chartY, 0, scaleHeight + padding.top + padding.bottom)) ? null :
            (axisType.y === 'ordinal') ?
                scale.y.domain()[indexOfClosestNumberInList(chartY, scale.y.range())] :
                scale.y.invert(chartY);

        const chart = this.refs['chart-series-0'];
        const hovered = (chart && _.isFunction(chart.getHovered)) ? chart.getHovered(chartXVal) : null;

        this.trueProps.onMouseMove(hovered, e, {chartX, chartY, chartXVal, chartYVal});
    },
    onMouseEnter(e) {
        this.trueProps.onMouseEnter(e);
    },
    onMouseLeave(e) {
        this.trueProps.onMouseLeave(e);
    },
    onMouseDown(e) {
        this.trueProps.onMouseDown(e);
    },
    onMouseUp(e) {
        this.trueProps.onMouseUp(e);
    },

    render() {
        const {
            children, width, height, scaleType, axisLabel, invertScale,
            onMouseMove, onMouseEnter, onMouseLeave, onMouseDown, onMouseUp,
            scale, margin, padding
        } = this.trueProps;
        const scaleWidth = width - (margin.left + margin.right);
        const scaleHeight = width - (margin.top + margin.bottom);
        const ticks = [];
        //const {scale, margin, padding, scaleWidth, scaleHeight, ticks} = this;
        const chartWidth = scaleWidth + padding.left + padding.right;
        const chartHeight = scaleHeight + padding.top + padding.bottom;

        const propsToPass = {
            scaleType, invertScale, scale, scaleWidth, scaleHeight, plotWidth: width, plotHeight: height,
            chartMargin: margin, chartPadding: padding, margin, padding, ticks
        };

        const childrenUnderAxes = React.Children.map(children, (child, i) => {
            if(!child || !child.props || !child.props.underAxes) return null;
            // todo fix chart series #
            const name = child.props.name || 'chart-series-' + i;
            return React.cloneElement(child, _.assign({ref: name, name}, propsToPass));
        });
        const childrenAboveAxes = React.Children.map(children, (child, i) => {
            if(!child || (child.props && child.props.underAxes)) return null;
            const name = child.props.name || 'chart-series-' + i;
            return React.cloneElement(child, _.assign({ref: name, name}, propsToPass));
        });

        return (
            <svg className="xy-plot" {...{width, height}}
                 onMouseMove={_.isFunction(onMouseMove) ? this.onMouseMove : null}
                 onMouseEnter={_.isFunction(onMouseEnter) ? this.onMouseEnter : null}
                 onMouseLeave={_.isFunction(onMouseLeave) ? this.onMouseLeave : null}
                 onMouseDown={_.isFunction(onMouseDown) ? this.onMouseDown : null}
                 onMouseUp={_.isFunction(onMouseUp) ? this.onMouseUp : null}
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

                {axisLabel.x ?
                    <XAxisLabel {...this.getXAxisLabelProps()} />
                    : null
                }
                {axisLabel.y ?
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
        const props = this.trueProps;
        const k = options.letter;

        return _.defaults({}, options, {
            scale: _.get(this.scale, k),
            padding: this.padding,
            scaleHeight: this.scaleHeight,
            scaleWidth: this.scaleWidth,
            labelFormat: this.labelFormat[k],
            type: props.axisType[k],
            tickCount: props.tickCount[k],
            ticks: _.get(this.ticks, k) || [],
            labels: props.labelValues[k],
            labelPadding: props.labelPadding[k],
            emptyLabel: props.emptyLabel,
            tickLength: props.tickLength[k],
            showLabels: props.showLabels[k],
            showTicks: props.showTicks[k],
            showGrid: props.showGrid[k],
            showZero: props.showZero[k]
        });
    },

    getXAxisLabelProps(options={}) {
        return this.getAxisLabelProps('x', options);
    },
    getYAxisLabelProps(options={}) {
        return this.getAxisLabelProps('y', options);
    },
    getAxisLabelProps(k, options={}) {
        const props = this.trueProps;
        const {labelBoxes, margin, scaleWidth, scaleHeight} = this;

        return _.defaults({}, options, {
            margin, scaleWidth, scaleHeight,
            label: _.get(props.axisLabel, k),
            alignment: _.get(props.axisLabelAlign, k),
            axisLabelPadding: _.get(props.axisLabelPadding, k),
            valueLabelPadding: _.get(props.labelPadding, k),
            tickLength: _.get(props.tickLength, k),
            showTicks: _.get(props.showTicks, k),
            labelBox: (labelBoxes && labelBoxes[`${k}Axis`]) ? labelBoxes[`${k}Axis`] : {width: 10, height: 10}
        })
    }
});

const XGrid = React.createClass({
    propTypes: {
        ticks: PropTypes.array,
        scale: PropTypes.array,
        chartWidth: PropTypes.number,
        chartHeight: PropTypes.number,
    },
    render() {
        const {ticks, scale, chartWidth, chartHeight} = this.props;

        return ticks.map((value, i) => {
            const x = scale(value);

        })
    }
});

const GridLine = React.createClass({
    render(options) {
        const {letter, gridLength, orientation} = options;
        const className = `chart-grid chart-grid-${letter || ''}`;
        const [x2, y2] = (orientation === 'vertical') ? [gridLength, 0] : [0, -gridLength];
        return <line {...{className, x2, y2}} />
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
        scale: PropTypes.func,
        type: PropTypes.string,
        orientation: PropTypes.string,
        axisTransform: PropTypes.string,
        ticks: PropTypes.array,
        labels: PropTypes.array,
        tickCount: PropTypes.number,
        labelFormat: PropTypes.stringFormatter,
        emptyLabel: PropTypes.string,
        letter: PropTypes.string,

        scaleWidth: PropTypes.number,
        scaleHeight: PropTypes.number,
        padding: PropTypes.object,
        labelPadding: PropTypes.number,
        tickLength: PropTypes.number,
        showLabels: PropTypes.bool,
        showTicks: PropTypes.bool,
        showGrid: PropTypes.bool,
        showZero: PropTypes.bool
    },
    getDefaultProps() {
        return {
            padding: {},
            emptyLabel: "Unknown"
        }
    },
    render() {
        const {
            scale, type, orientation, axisTransform, tickCount, letter, labelFormat, emptyLabel, ticks,
            scaleWidth, scaleHeight, padding, labelPadding, tickLength,
            showLabels, showTicks, showGrid, showZero
        } = this.props;

        if(!(showLabels || showTicks || showGrid || showZero)) return null;

        const labels = _.isArray(this.props.labels) ? this.props.labels : ticks;
        const distance = (showTicks) ? tickLength + labelPadding : labelPadding;
        const [tickTransform, labelOffset, gridLength] = (orientation === 'vertical') ?
            [v => `translate(0, ${scale(v)})`, {x: -distance}, scaleWidth + padding.left + padding.right] :
            [v => `translate(${scale(v)}, 0)`, {y: distance}, scaleHeight + padding.top + padding.bottom];

        const options = {letter, type, orientation, labelOffset, gridLength, tickLength, labelFormat, emptyLabel};
        return <g ref={`${letter}Axis`} className={`chart-axis chart-axis-${letter}`} transform={axisTransform}>
            {showTicks || showGrid || (showLabels && labels === ticks) ?
                _.map(ticks, (value, i) => {
                    const tickOptions = _.assign({}, options, {value});
                    return <g transform={tickTransform(value)} key={`tick-${i}`}>
                        {showGrid ? this.renderGrid(tickOptions) : null}
                        {showTicks ? this.renderTick(tickOptions) : null}
                        {(showLabels && labels === ticks) ? this.renderLabel(tickOptions) : null}
                    </g>
                })
                : null
            }
            {(showLabels && labels !== ticks) ? // render custom labels (passed in, not same as ticks)
                _.map(labels, (value, i) => {
                    return <g transform={tickTransform(value)} key={`tick-${i}`}>
                        {this.renderLabel(_.assign({}, options, {value}))}
                    </g>
                })
                : null
            }
            {showZero ?
                <g transform={tickTransform(0)}>
                    {showZero ? this.renderZero(options): null}
                </g>
                : null
            }
        </g>
    },
    renderLabel(options) {
        const {letter, value, type, labelOffset, labelFormat, emptyLabel} = options;
        const className = `chart-axis-value-label chart-axis-value-label-${letter}`;
        // todo generalize dy for all text sizes...?
        return <text {...{className}} dy="0.32em" {...labelOffset}>
            {formatAxisLabel(value, type, labelFormat, emptyLabel)}
        </text>
    },
    // todo unify into drawLine
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
    },
    renderZero(options) {
        const {letter, gridLength, orientation} = options;
        const className = `chart-zero-line chart-zero-line-${letter}`;
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
    return list.reduce((closestI, current, i) => {
        return Math.abs(current - number) < Math.abs(list[closestI] - number) ? i : closestI;
    }, 0);
}

function childIsXYChart(child) {
    return !!(child && _.has(child, 'type.implementsInterface') && child.type.implementsInterface('XYChart'));
}

function isNullOrUndefined(d) { return _.isNull(d) || _.isUndefined(d); }

function makeScale(domains, range, axisType, isNice, tickCount) {
    const domain = defaultDomain(_.flatten(domains), null, axisType);
    const scale = initScale(axisType).domain(domain);
    axisType === 'ordinal' ? scale.rangePoints(range) : scale.range(range);
    if(isNice && axisType !== 'ordinal') scale.nice(tickCount);
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

function formatAxisLabel(value, type, format, emptyLabel) {
    return _.isNull(value) || _.isUndefined(value) ? emptyLabel
        : _.isFunction(format) ? format(value)
        : type === 'number' ? numeral(value).format(format)
        : type === 'time' ? moment(value).format(format)
        : value;
}

function measureAxisLabels(xProps, yProps, xAxisLabelProps, yAxisLabelProps) {
    // hacky... pre-measure the bounding boxes of all axis labels,
    // by rendering axis HTML to the DOM, measuring them with getBoundingClientRect, then deleting them.
    xProps = _.assign({}, xProps, {showTicks: false, showGrid: false});
    yProps = _.assign({}, yProps, {showTicks: false, showGrid: false});
    const xAxisHtml = ReactDOMServer.renderToStaticMarkup(<ChartAxis {...xProps}/>);
    const yAxisHtml = ReactDOMServer.renderToStaticMarkup(<ChartAxis {...yProps}/>);
    const xLabelHtml = xAxisLabelProps ? ReactDOMServer.renderToStaticMarkup(<XAxisLabel {...xAxisLabelProps}/>) : '';
    const yLabelHtml = yAxisLabelProps ? ReactDOMServer.renderToStaticMarkup(<YAxisLabel {...yAxisLabelProps}/>) : '';

    let testSvg = document.createElement('div');
    testSvg.innerHTML = `<svg class="xy-plot"><g class="chart-inner">\
        ${xAxisHtml}${yAxisHtml}${xLabelHtml}${yLabelHtml}
    </g></svg>`;
    document.body.appendChild(testSvg);

    const getRect = (el => el.getBoundingClientRect()); // get rekt
    const labelBoxes = {
        xVal: xProps.showLabels ? _.map(testSvg.querySelectorAll('.chart-axis-value-label-x'), getRect) : [],
        yVal: yProps.showLabels ? _.map(testSvg.querySelectorAll('.chart-axis-value-label-y'), getRect) : [],
        xAxis: xAxisLabelProps ? testSvg.querySelectorAll('.chart-axis-label-x text')[0].getBoundingClientRect() : null,
        yAxis: yAxisLabelProps ? testSvg.querySelectorAll('.chart-axis-label-y text')[0].getBoundingClientRect() : null
    };
    document.body.removeChild(testSvg);
    //console.log(labelBoxes);

    return labelBoxes;
}

// use resolveObjectProps HOC to resolve partially specified XY-type and direction-type object props
// into their fully specified forms
// todo: don't hardcode these - use tcomb?
const xyKeys = [
    'axisType', 'domain', 'nice', 'invertAxis', 'tickCount', 'ticks', 'tickLength',
    'labelValues', 'labelFormat', 'labelPadding', 'showLabels', 'showGrid', 'showTicks', 'showZero',
    'axisLabel', 'axisLabelAlign', 'axisLabelPadding'
];
const dirKeys = ['margin', 'padding', 'spacing'];

const XYPlotResolved = _.flow([
  resolveXYScales,
  _.partial(resolveObjectProps, _, xyKeys, ['x', 'y']),
  _.partial(resolveObjectProps, _, dirKeys, ['top', 'bottom', 'left', 'right'])
])(XYPlot);

export default XYPlotResolved;
