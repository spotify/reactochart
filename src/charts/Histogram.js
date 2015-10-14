import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';

import BarChart from './BarChart.js';

import {accessor, AccessorPropType, InterfaceMixin} from '../util.js';

const Histogram = React.createClass({
    mixins: [InterfaceMixin('XYChart')],
    propTypes: {
        // the array of data objects
        data: PropTypes.array.isRequired,

        // accessor for X & Y coordinates
        getValue: PropTypes.object,
        axisType: PropTypes.object,
        scale: PropTypes.object
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
        this.setState({histogramData});
    },

    statics: {
        getOptions(props) {
            const {data, getValue} = props;
            return {
                // todo: real x domain
                domain: {
                    x: d3.extent(data, accessor(getValue.x)),
                    // todo: real y domain
                    y: [0,200]
                }
            }
        }
    },
    getHovered() {

    },
    render() {
        if(!this.state.histogramData) return <g></g>;
        const {name, scale, axisType, scaleWidth, scaleHeight, plotWidth, plotHeight} = this.props;

        return <BarChart
            data={this.state.histogramData}
            getValue={{x: 'x', y: 'y'}}
            getEndValue={{x: d => d.x + d.dx}}
            {...{name, scale, axisType, scaleWidth, scaleHeight, plotWidth, plotHeight}}
        />;
    }
});

export default Histogram;