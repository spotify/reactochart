import React from 'react/addons';
const {PropTypes} = React;
const {PureRenderMixin} = React.addons;
import _ from 'lodash';
import d3 from 'd3';
import moment from 'moment';

const TimeseriesLineChart = React.createClass({
    mixins: [PureRenderMixin],
    propTypes: {
        // the array of data objects
        data: PropTypes.arrayOf(PropTypes.object).isRequired,
        // keys for props.data objects, whose values will be plotted (on y-axis)
        plotKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
        // key for props.data referring to the date (to be plotted on x-axis)
        dateKey: PropTypes.string,

        // whether or not the scale of the Y-axis should always include zero
        shouldIncludeZero: PropTypes.bool,
        // whether or not to draw a zero line
        shouldDrawZero: PropTypes.bool,

        // whether or not to draw the tick lines on the X axis
        shouldDrawXTicks: PropTypes.bool,
        // whether or not to draw X axis label text (dates)
        shouldDrawXLabels: PropTypes.bool,

        // whether or not to draw the tick lines on the Y axis
        shouldDrawYTicks: PropTypes.bool,
        // whether or not to draw Y axis label text (values)
        shouldDrawYLabels: PropTypes.bool,

        // called when user mouses over the chart
        onMouseMove: PropTypes.func,

        // true if the user can click and drag to select a date range
        // (this doesn't change the date range on the chart, just calls callback with range and shows highlight)
        isRangeSelectable: PropTypes.bool,
        // callback called when selected range changes
        // (this is a controlled component, parent must maintain selected range state)
        onChangeSelectedRange: PropTypes.func,
        // min and max dates of the selected range
        selectedRangeMin: PropTypes.object,
        selectedRangeMax: PropTypes.object,

        // (outer) width and height of the chart
        width: PropTypes.number,
        height: PropTypes.number,
        // chart margins
        marginTop: PropTypes.number,
        marginBottom: PropTypes.number,
        marginLeft: PropTypes.number,
        marginRight: PropTypes.number
    },
    getDefaultProps() {
        return {
            dateKey: 'date',
            shouldIncludeZero: true,
            shouldDrawZero: true,
            shouldDrawXTicks: true,
            shouldDrawXLabels: true,
            shouldDrawYTicks: true,
            shouldDrawYLabels: true,
            isRangeSelectable: false,
            onChangeSelectedRange: _.noop,
            width: 400,
            height: 250,
            marginTop: 10,
            marginBottom: 40,
            marginLeft: 60,
            marginRight: 10
        }
    },
    getInitialState() {
        return {
            isSelecting: false,
            xScale: null,
            yScale: null,
            innerWidth: null,
            innerHeight: null
        }
    },
    componentWillMount() {
        this.initScale(this.props);
        this.initDataLookup(this.props);
    },
    componentWillReceiveProps(newProps) {
        this.initScale(newProps);
        this.initDataLookup(newProps);
    },

    initScale(props) {
        const innerWidth = props.width - (props.marginLeft + props.marginRight);
        const innerHeight = props.height - (props.marginTop + props.marginBottom);
        const {data, dateKey, plotKeys, shouldIncludeZero} = props;

        // todo handle missing values/date gaps
        const xScale = d3.time.scale()
            .range([0, innerWidth])
            .domain(d3.extent(data, d => d[dateKey]));

        const yScale = d3.scale.linear()
            .range([innerHeight, 0])
            // get the max/min for each dataset we're plotting, then the overall max/min of all of them
            .domain(d3.extent(_.flatten(
                _.map(plotKeys, plotKey => d3.extent(data, d => d[plotKey]))
                    .concat(shouldIncludeZero ? [0] : [])
            )))
            // extend domain to start/end at nice round values
            .nice();

        this.setState({xScale, yScale, innerWidth, innerHeight});
    },
    initDataLookup(props) {
        this.setState({bisectDate: d3.bisector(d => d[props.dateKey]).left});
    },

    onMouseDown(e) {
        const chartBB = e.currentTarget.getBoundingClientRect();
        const chartX = (e.clientX - chartBB.left) - this.props.marginLeft;
        const chartDate = this.state.xScale.invert(chartX);

        this.setState({isSelecting: true});
        this.props.onChangeSelectedRange(chartDate, chartDate, true);
    },
    onMouseUp(e) {
        const chartBB = e.currentTarget.getBoundingClientRect();
        const chartX = (e.clientX - chartBB.left) - this.props.marginLeft;
        const chartDate = this.state.xScale.invert(chartX);

        this.setState({isSelecting: false});
        if(chartDate > this.props.selectedRangeMin)
            this.props.onChangeSelectedRange(this.props.selectedRangeMin, chartDate, false);
        else
            this.props.onChangeSelectedRange(chartDate, this.props.selectedRangeMin, false);
    },
    onMouseMove(e) {
        if(!this.props.onMouseMove && !this.state.isSelecting) return;

        const chartBB = e.currentTarget.getBoundingClientRect();
        const chartX = (e.clientX - chartBB.left) - this.props.marginLeft;
        const chartDate = this.state.xScale.invert(chartX);
        const closestDataIndex = this.state.bisectDate(this.props.data, chartDate);

        if(this.props.onMouseMove)
            this.props.onMouseMove(this.props.data[closestDataIndex], closestDataIndex, e);

        if(!this.state.isSelecting) return;

        if(chartDate > this.props.selectedRangeMin)
            this.props.onChangeSelectedRange(this.props.selectedRangeMin, chartDate, true);
        else
            this.props.onChangeSelectedRange(chartDate, this.props.selectedRangeMin, true);
    },

    render() {
        console.log('rendered line chart');
        const {xScale, yScale} = this.state;
        const {
            data, dateKey, plotKeys, isRangeSelectable,
            width, height, marginLeft, marginTop
        } = this.props;

        const points = _.map(data, d => [ xScale(d[dateKey]), yScale(d[plotKeys[0]]) ]);
        const pathStr = pointsToPathStr(points);

        return (
            <svg className="line-chart"
                {...{width, height}}
                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}
                onMouseMove={this.onMouseMove}
            >
                <g className="chart-inner"
                   transform={`translate(${marginLeft}, ${marginTop})`}
                >

                    {isRangeSelectable ? this.renderSelectedRange() : null}

                    {this.renderXAxis()}
                    {this.renderYAxis()}

                    <g>
                        <path className="chart-line" d={pathStr} />
                    </g>

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
            {_.map(xTicks, (date) => {
                return <g transform={`translate(${xScale(date)}, 0)`}>
                    {shouldDrawXTicks ?
                        <line className="chart-tick chart-tick-x" x2={0} y2={6} />
                        : null
                    }
                    {shouldDrawXLabels ?
                        <text className="chart-axis-label chart-x-label" dy="0.8em" y="9" >
                            {moment(date).format("MMM 'YY")}
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
    renderSelectedRange() {
        const {xScale, yScale, innerWidth, innerHeight} = this.state;
        const {isRangeSelectable, selectedRangeMin, selectedRangeMax} = this.props;
        if(!(isRangeSelectable && selectedRangeMin && selectedRangeMax)) return null;

        const x = xScale(selectedRangeMin);
        const width = xScale(selectedRangeMax) - x;

        return <rect
            className="chart-selected-range"
            {...{x, width}}
            y={yScale.range()[1]} height={innerHeight}
        />
    }
});

function pointsToPathStr(points) {
    // takes array of points in [[x, y], [x, y]... ] format
    // returns SVG path string in "M X Y L X Y" format
    // https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#Line_commands
    return _.map(points, ([x, y], i) => {
        const command = (i === 0) ? 'M' : 'L';
        return `${command} ${x} ${y}`;
    }).join(' ');
}

export default TimeseriesLineChart;