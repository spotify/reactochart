import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';

const MultiChart = React.createClass({
    propTypes: {
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
    },
    getDefaultProps() {
        return {
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
        }
    },
    getInitialState() {
        return {
            xScale: null,
            yScale: null,
            innerWidth: null,
            innerHeight: null
        }
    },

    componentWillMount() {
        this.initScale(this.props);
        //this.initDataLookup(this.props);
    },
    componentWillReceiveProps(newProps) {
        this.initScale(newProps);
        //this.initDataLookup(newProps);
    },

    initScale(props) {
        const innerWidth = props.width - (props.marginLeft + props.marginRight);
        const innerHeight = props.height - (props.marginTop + props.marginBottom);
        //const {data, dateKey, plotKeys, shouldIncludeZero} = props;

        let childExtents = [];
        React.Children.forEach(props.children, child => {
            const {data, getX, getY} = child.props;
            childExtents.push(child.type.getExtent(data, getX, getY));
        });
        console.log('childExtents', childExtents);

        const xExtent = d3.extent(_.flatten(_.pluck(childExtents, 'x')));
        const yExtent = d3.extent(_.flatten(_.pluck(childExtents, 'y')));


        // todo handle missing values/date gaps
        const xScale = d3.scale.linear()
            .range([0, innerWidth])
            .domain(xExtent);

        const yScale = d3.scale.linear()
            .range([innerHeight, 0])
            // get the max/min for each dataset we're plotting, then the overall max/min of all of them
            .domain(yExtent)
            // extend domain to start/end at nice round values
            .nice();

        this.setState({xScale, yScale, innerWidth, innerHeight});
    },
    initDataLookup(props) {
        this.setState({bisectDate: d3.bisector(d => d[props.dateKey]).left});
    },



    render() {
        const {width, height, marginLeft, marginTop} = this.props;
        const {xScale, yScale, innerWidth, innerHeight} = this.state;
        return (
            <svg className="multi-chart" {...{width, height}}>
                <g className="chart-inner"
                   transform={`translate(${marginLeft}, ${marginTop})`}
                >
                    {this.renderXAxis()}
                    {this.renderYAxis()}

                    {React.Children.map(this.props.children, (child, i) => {
                        const {data, getX, getY} = child.props;
                        const extent = child.type.getExtent(data, getX, getY);
                        console.log('extent', extent);
                        return React.cloneElement(child,
                            {name: 'chart-series-'+i, xScale, yScale, innerWidth, innerHeight}
                        );
                        //return child;
                    })}
                </g>
            </svg>
        );
    },
    renderXAxis() {
        const {shouldDrawXTicks, shouldDrawXLabels} = this.props;
        if(!(shouldDrawXTicks || shouldDrawXLabels)) return null;
        const {xScale, innerHeight} = this.state;
        const xTicks = xScale.ticks();

        return <g className="chart-axis chart-axis-x" transform={`translate(0, ${innerHeight})`}>
            {_.map(xTicks, (x) => {
                console.log(x);
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
        const {yScale, innerWidth} = this.state;
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
    },
});

export default MultiChart;