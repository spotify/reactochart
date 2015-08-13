import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';

import BarChart from './BarChart.js';

import {accessor, AccessorPropType} from './util.js';

const Histogram = React.createClass({
    getInitialState() {
        return {
            histogramData: null
        }
    },
    componentWillMount() {
        const histogramData = d3.layout.histogram().bins(30)(this.props.data);
        console.log('histogram', this.props.data, histogramData);
        this.setState({histogramData})
    },

    statics: {
        getExtent(data, getX, getY) {
            return {
                x: d3.extent(data, accessor(getX)),
                y: [0,100]
                //y: d3.extent(d3.extent(data, accessor(getY)).concat(0))
            }
        }
    },
    getHovered() {

    },
    render() {
        if(!this.state.histogramData) return <g></g>;
        const {name, xScale, yScale, innerWidth, innerHeight} = this.props;

        return <BarChart
            data={this.state.histogramData}
            getX={'x'} getY={'y'}
            {...{name, xScale, yScale, innerWidth, innerHeight}}
        />;

        return <svg><text>Hello!</text></svg>
    }
});

export default Histogram;