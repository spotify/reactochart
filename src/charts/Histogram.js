import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';

import BarChart from './BarChart.js';

import {accessor, AccessorPropType} from '../util.js';

const Histogram = React.createClass({
    propTypes: {
        // the array of data objects
        data: PropTypes.array.isRequired,
        // accessor for X & Y coordinates
        getX: AccessorPropType,
        getY: AccessorPropType,

        // x & y scale types
        xType: PropTypes.oneOf(['number', 'time', 'ordinal']),
        yType: PropTypes.oneOf(['number', 'time', 'ordinal']),

        xScale: PropTypes.func,
        yScale: PropTypes.func
    },
    getDefaultProps() {
        return {}
    },
    getInitialState() {
        return {
            histogramData: null
        }
    },
    componentWillMount() {
        const histogramData = d3.layout.histogram().bins(30)(this.props.data);
        //console.log('histogram', this.props.data, histogramData);
        this.setState({histogramData})
    },

    statics: {
        getOptions(props) {
            const {getX, getY} = props;
            return {
                // todo: real x domain
                xDomain: d3.extent(data, accessor(getX)),
                // todo: real y domain
                yDomain: [0,200]
            }
        }
    },
    getHovered() {

    },
    render() {
        if(!this.state.histogramData) return <g></g>;
        const {name, xScale, yScale, xType, yType, innerWidth, innerHeight} = this.props;

        return <BarChart
            data={this.state.histogramData}
            getX={'x'}
            getY={'y'}
            getXEnd={d => d.x + d.dx}
            {...{name, xScale, yScale, xType, yType, innerWidth, innerHeight}}
        />;
    }
});

export default Histogram;