import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';

import {accessor, AccessorPropType} from './util.js';

const BarChart = React.createClass({
    propTypes: {
        // the array of data objects
        data: PropTypes.array.isRequired,
        // accessors for X & Y coordinates
        // of the beginning of the range depicted by range bar

        getX: AccessorPropType,
        getY: AccessorPropType,
        // accessor for the

        xScale: PropTypes.func,
        yScale: PropTypes.func
    },

    statics: {
        getExtent(data, getX, getY) {
            return {
                x: d3.extent(data, accessor(getX)),
                y: d3.extent(d3.extent(data, accessor(getY)).concat(0))
            }
        }
    },
    getHovered() {

    },

    componentWillMount() {

    },

    render() {
        console.log('range barchart', this.props);
        return <g>
            {this.renderBars()}
        </g>
    },
    renderBars() {
        const {xScale, yScale, getX, getY} = this.props;
        const isHorizontal = this.props.orientation === 'bar';
        //const barThickness = this.state.barScale.rangeBand();
        const barThickness = 5;

        const xAccessor = accessor(getX);
        const yAccessor = accessor(getY);

        return <g>
            {this.props.data.map((d, i) => {
                const yVal = yAccessor(d);
                const barLength = Math.abs(yScale(0) - yScale(yVal));
                const barY = yVal >= 0 ? yScale(0) - barLength : yScale(0);

                return <rect
                    className="chart-bar chart-bar-vertical"
                    x={this.props.xScale(xAccessor(d)) - (barThickness / 2)}
                    y={barY}
                    width={barThickness}
                    height={barLength}
                />
            })}
        </g>
    }
});

export default BarChart;