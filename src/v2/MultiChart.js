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
    },
    getDefaultProps() {
        return {
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
        const {data, dateKey, plotKeys, shouldIncludeZero} = props;

        // todo handle missing values/date gaps
        const xScale = d3.time.scale()
            .range([0, innerWidth])
            .domain([0,20]);

        const yScale = d3.scale.linear()
            .range([innerHeight, 0])
            // get the max/min for each dataset we're plotting, then the overall max/min of all of them
            .domain([0,100])
            // extend domain to start/end at nice round values
            .nice();

        this.setState({xScale, yScale, innerWidth, innerHeight});
    },
    initDataLookup(props) {
        this.setState({bisectDate: d3.bisector(d => d[props.dateKey]).left});
    },

    render() {
        const {width, height} = this.props;
        const {xScale, yScale, innerWidth, innerHeight} = this.state;
        return (
            <svg className="multi-chart" {...{width, height}}>
                {React.Children.map(this.props.children, child => {
                    return React.cloneElement(child, {xScale, yScale, innerWidth, innerHeight});
                    //return child;
                })}
            </svg>
        );
    }
});

export default MultiChart;