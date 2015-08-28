import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';
import {accessor} from './util.js';
import moment from 'moment';

const XYPlot = React.createClass({
    propTypes: {
        // x & y scale types
        xType: PropTypes.oneOf(['number', 'time', 'ordinal']),
        yType: PropTypes.oneOf(['number', 'time', 'ordinal']),

        // scale domains may be provided, otherwise will be inferred from data
        xDomain: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.instanceOf(Date)])),
        yDomain: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.instanceOf(Date)])),

        // (outer) width and height of the chart
        width: PropTypes.number,
        height: PropTypes.number,

        // chart margins
        marginTop: PropTypes.number,
        marginBottom: PropTypes.number,
        marginLeft: PropTypes.number,
        marginRight: PropTypes.number,

        // whether or not to draw the tick lines on the X axis
        shouldDrawXTicks: PropTypes.bool,
        // whether or not to draw X axis label text (dates)
        shouldDrawXLabels: PropTypes.bool,

        // whether or not to draw the tick lines on the Y axis
        shouldDrawYTicks: PropTypes.bool,
        // whether or not to draw Y axis label text (values)
        shouldDrawYLabels: PropTypes.bool,

        // todo: niceX, niceY
        // todo: shouldDrawXGrid, shouldDrawYGrid, shouldDrawXZero, shouldDrawYZero
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
            shouldDrawXTicks: true,
            shouldDrawXLabels: true,
            shouldDrawYTicks: true,
            shouldDrawYLabels: true,
            onMouseMove: _.noop
        }
    },

    componentWillMount() {
        this.initScale(this.props);
    },
    componentWillReceiveProps(newProps) {
        this.initScale(newProps);
    },

    initScale(props) {
        let chartDomains = [];
        React.Children.forEach(props.children, child => {
            // todo handle domain passed in as prop
            let domain = _.isFunction(child.type.getDomain) ?
                child.type.getDomain(child.props, props.xType, props.yType) : {x: null, y: null};
            if(_.isNull(domain.x)) domain.x = defaultDomain(child.props.data, child.props.getX, props.xType);
            if(_.isNull(domain.y)) domain.y = defaultDomain(child.props.data, child.props.getY, props.yType);
            //console.log('chartDomain', domain);
            chartDomains.push(domain);
        });

        const innerWidth = props.width - (props.marginLeft + props.marginRight);
        const innerHeight = props.height - (props.marginTop + props.marginBottom);
        const xScale = makeScale(_.pluck(chartDomains, 'x'), [0, innerWidth], props.xType);
        const yScale = makeScale(_.pluck(chartDomains, 'y'), [innerHeight, 0], props.yType);

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
    renderXAxis() {
        const {shouldDrawXTicks, shouldDrawXLabels, xType} = this.props;
        if(!(shouldDrawXTicks || shouldDrawXLabels)) return null;
        const {xScale, innerHeight} = this;
        const xTicks = xType == 'ordinal' ? xScale.domain() : xScale.ticks();

        return <g className="chart-axis chart-axis-x" transform={`translate(0, ${innerHeight})`}>
            {_.map(xTicks, (x) => {
                return <g transform={`translate(${xScale(x)}, 0)`}>
                    {shouldDrawXTicks ?
                        <line className="chart-tick chart-tick-x" x2={0} y2={6} />
                        : null
                    }
                    {shouldDrawXLabels ?
                        <text className="chart-axis-label chart-x-label" dy="0.8em" y="9" >
                            {xType === 'time' ? moment(x).format('M/DD') : x}
                        </text>
                        : null
                    }
                </g>
            })}
        </g>
    },
    renderYAxis() {
        // todo combine into one renderAxis method
        const {shouldDrawYTicks, shouldDrawYLabels, yType} = this.props;
        if(!(shouldDrawYTicks || shouldDrawYLabels)) return null;
        const {yScale, innerWidth} = this;
        const yTicks = yType == 'ordinal' ? yScale.domain() : yScale.ticks();

        return <g className="chart-axis chart-axis-y">
            {_.map(yTicks, (value) => {
                return <g transform={`translate(0, ${yScale(value)})`}>
                    {shouldDrawYTicks ?
                        <line className="chart-tick chart-tick-y" x2={innerWidth} y2={0} />
                        : null
                    }
                    {shouldDrawYLabels ?
                        <text className="chart-axis-label chart-y-label" dy="0.32em" x={-3}>
                            {yType === 'time' ? moment(value).format('MM-DD') : value}
                        </text>
                        : null
                    }
                </g>
            })}
        </g>
    }
});

function defaultDomain(data, getter, scaleType) {
    switch(scaleType) {
        // extent for number/time scales, coerce dates to numbers
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

function makeScale(domains, range, axisType) {
    const domain = defaultDomain(_.flatten(domains), null, axisType);
    const scale = initScale(axisType).domain(domain);
    axisType === 'ordinal' ? scale.rangePoints(range) : scale.range(range);
    return scale;
}

export default XYPlot;