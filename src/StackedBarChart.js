import React from 'react';
import _ from 'lodash';
import d3 from 'd3';
const {PropTypes} = React;

const StackedBarChart = React.createClass({
    propTypes: {
        // the array of data objects
        data: PropTypes.arrayOf(PropTypes.object).isRequired,
        // keys for props.data objects, whose values will be plotted by the bars
        plotKeys: PropTypes.arrayOf(PropTypes.string).isRequired,

        // orientation of the chart... 'column' for vertical columns, 'bar' for horizontal bars
        orientation: PropTypes.oneOf(['bar', 'column']),

        // (outer) width and height of the chart
        width: PropTypes.number,
        height: PropTypes.number,
        // chart margins
        marginTop: PropTypes.number,
        marginBottom: PropTypes.number,
        marginLeft: PropTypes.number,
        marginRight: PropTypes.number,
        // padding between bars, expressed as a ratio of bar thickness
        // (ie. if barPadding is 0.5, padding will be same size as bar thickness. see d3.scale.ordinal.rangeBands)
        barPadding: PropTypes.number
    },
    getDefaultProps() {
        return {
            orientation: 'bar',
            barPadding: 0.15,

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
            barScale: null,
            valueScale: null
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
        const barAxisLength = props.orientation === 'bar' ? innerHeight : innerWidth;
        const valueAxisLength = props.orientation === 'bar' ? innerWidth : innerHeight;

        const barScale = d3.scale.ordinal()
            .rangeRoundBands([0, barAxisLength], props.barPadding)
            .domain(_.range(props.data.length));

        const valueScale = d3.scale.linear()
            .range([0, valueAxisLength])
            // todo stacked extent
            .domain(d3.extent([0].concat(d3.extent(props.data, d => d[props.plotKeys[0]]))));

        this.setState({barScale, valueScale, innerWidth, innerHeight});
    },

    render() {
        const {data, width, height, marginLeft, marginTop} = this.props;
        return (
            <svg className="stacked-bar-chart"
                {...{width, height}}
                style={{backgroundColor:'#e0e0e0'}}
                fill="red"
            >
                <g className="chart-inner"
                   transform={`translate(${marginLeft}, ${marginTop})`}
                   fill='darkblue'
                >

                    {this.renderBars()}

                </g>
            </svg>
        )
    },
    renderBars() {
        const isHorizontal = this.props.orientation === 'bar';
        const barThickness = this.state.barScale.rangeBand();

        return <g>
            {this.props.data.map((d, i) => {
                const barLength = this.state.valueScale(d[this.props.plotKeys[0]]);

                return isHorizontal ?
                    <rect
                        x={0}
                        y={this.state.barScale(i)}
                        width={barLength}
                        height={barThickness}
                    /> :
                    <rect
                        x={this.state.barScale(i)}
                        y={this.state.innerHeight - barLength}
                        width={barThickness}
                        height={barLength}
                    />
            })}
        </g>
    }
});

export default StackedBarChart;