import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';
import {accessor} from './util.js';

window.accessor = accessor;

function makeScale(type) {
    switch(type) {
        case 'number': return d3.scale.linear();
        case 'ordinal': return d3.scale.ordinal();
        case 'time': return d3.time.scale();
    }
}

function domainFromChildren(children, xType, yType) {
    let childDomains = [];
    React.Children.forEach(children, child => {
        let domain = _.isFunction(child.type.getDomain) ?
            child.type.getDomain(child.props, xType, yType) : {x: null, y: null};

        if(_.isNull(domain.x)) domain.x = defaultDomain(child.props.data, child.props.getX, xType);
        if(_.isNull(domain.y)) domain.y = defaultDomain(child.props.data, child.props.getY, yType);
        childDomains.push(domain);
    });

    return {
        x: defaultDomain(_.flatten(_.pluck(childDomains, 'x')), null, xType),
        y: defaultDomain(_.flatten(_.pluck(childDomains, 'y')), null, yType)
    };
}

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
        const innerWidth = props.width - (props.marginLeft + props.marginRight);
        const innerHeight = props.height - (props.marginTop + props.marginBottom);

        let chartDomains = [];
        React.Children.forEach(props.children, child => {
            let domain = _.isFunction(child.type.getDomain) ?
                child.type.getDomain(child.props, props.xType, props.yType) : {x: null, y: null};

            if(_.isNull(domain.x)) domain.x = defaultDomain(child.props.data, child.props.getX, props.xType);
            if(_.isNull(domain.y)) domain.y = defaultDomain(child.props.data, child.props.getY, props.yType);
            chartDomains.push(domain);
        });

        const xDomain = defaultDomain(_.flatten(_.pluck(chartDomains, 'x')), null, props.xType);
        const yDomain = defaultDomain(_.flatten(_.pluck(chartDomains, 'y')), null, props.yType);

        const xScale = makeScale(props.xType)
            //.range([0, innerWidth])
            .domain(xDomain);
        props.xType === 'ordinal' ? xScale.rangePoints([0, innerWidth]) : xScale.range([0, innerWidth]);

        const yScale = makeScale(props.yType)
            .range([innerHeight, 0])
            .domain(yDomain);

        _.assign(this, {xScale, yScale, innerWidth, innerHeight});
    },

    _initScale(props) {
        const innerWidth = props.width - (props.marginLeft + props.marginRight);
        const innerHeight = props.height - (props.marginTop + props.marginBottom);

        console.log('domainFromChildren', domainFromChildren(props.children, props.xType, props.yType));

        //let xDomain = props.xDomain;
        //if(!xDomain) {
        //    let childDomains = [];
        //    React.Children.forEach(props.children, child => {
        //        childDomains.push(child.type.getDomain(child.props, props.xType));
        //    });
        //    xDomain = (props.xType === 'number' || props.xType === 'time') ?
        //            d3.extent(_.flatten(childDomains), (d) => +d) : // extent for numbers, coerce dates to numbers
        //            _.uniq(_.flatten(childDomains)); // unique for ordinal scale
        //}


        // children are required to implement the static method `getExtent`
        // which returns the extent of the data domain that will be plotted on that chart for given dataset
        let childExtents = [];
        React.Children.forEach(props.children, child => {
            const {data, getX, getY} = child.props;
            childExtents.push(child.type.getExtent(data, getX, getY, child.props));
        });

        // take the total combined extent of all children's domain extents to determine the overall domain extent
        const xExtent = d3.extent(_.flatten(_.pluck(childExtents, 'x')));
        const yExtent = d3.extent(_.flatten(_.pluck(childExtents, 'y')));

        const xScale = makeScale(props.xType)
            .range([0, innerWidth])
            .domain(xExtent);

        const yScale = makeScale(props.yType)
            .range([innerHeight, 0])
            .domain(yExtent)
            .nice();

        //this.setState({xScale, yScale, innerWidth, innerHeight});
        _.assign(this, {xScale, yScale, innerWidth, innerHeight});
    },

    onMouseMove(e) {
        //if(!this.props.onMouseMove && !this.state.isSelecting) return;

        const chartBB = e.currentTarget.getBoundingClientRect();
        const chartX = (e.clientX - chartBB.left) - this.props.marginLeft;
        const chartXVal = this.xScale.invert(chartX);

        const hovered = this.refs['chart-series-0'].getHovered(chartXVal);

        this.props.onMouseMove(hovered, e);
    },

    render() {
        const {width, height, marginLeft, marginTop} = this.props;
        const {xScale, yScale, innerWidth, innerHeight} = this;
        return (
            <svg className="multi-chart" {...{width, height}}
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
                            {ref: name, name, xScale, yScale, innerWidth, innerHeight}
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
                            {x+""}
                        </text>
                        : null
                    }
                </g>
            })}
        </g>
    },
    renderYAxis() {
        const {shouldDrawYTicks, shouldDrawYLabels} = this.props;
        if(!(shouldDrawYTicks || shouldDrawYLabels)) return null;
        const {yScale, innerWidth} = this;
        const yTicks = yScale.ticks();

        return <g className="chart-axis chart-axis-y">
            {_.map(yTicks, (value) => {
                return <g transform={`translate(0, ${yScale(value)})`}>
                    {shouldDrawYTicks ?
                        <line className="chart-tick chart-tick-y" x2={innerWidth} y2={0} />
                        : null
                    }
                    {shouldDrawYLabels ?
                        <text className="chart-axis-label chart-y-label" dy="0.32em" x={-3}>
                            {value}
                        </text>
                        : null
                    }
                </g>
            })}
        </g>
    }
});

export default XYPlot;