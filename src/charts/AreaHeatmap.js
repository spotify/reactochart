import React from 'react';
import _ from 'lodash';
import d3 from 'd3';

import {accessor, AccessorPropType, InterfaceMixin} from '../util.js';

const AreaHeatmap = React.createClass({
    mixins: [InterfaceMixin('XYChart')],
    propTypes: {
        unitsPerPixel: React.PropTypes.number
    },
    statics: {
        getOptions(props) {
            const {data, getValue, getEndValue} = props;
            return {domain: {
                x: d3.extent(_.flatten([data.map(accessor(getValue.x)), data.map(accessor(getEndValue.x))])),
                y: d3.extent(_.flatten([data.map(accessor(getValue.y)), data.map(accessor(getEndValue.y))]))
            }}
        }
    },

    onMouseEnter(e) {
        this.props.onMouseEnter(e);
    },
    onMouseLeave(e) {
        this.props.onMouseLeave(e);
    },
    onMouseMove(e) {
        const {scale, data, getValue, getEndValue, onMouseMove} = this.props;
        if(!_.isFunction(onMouseMove)) return;
        const [xAccessor, xEndAccessor, yAccessor, yEndAccessor] =
            [getValue.x, getEndValue.x, getValue.y, getEndValue.y].map(accessor);

        const boundBox = this.refs.background.getBoundingClientRect();
        if(!boundBox) return;
        const [x, y] = [e.clientX - (boundBox.left || 0), e.clientY - (boundBox.top || 0)];
        const [xVal, yVal] = [scale.x.invert(x), scale.y.invert(y)];
        const xD = _.find(data, d => xVal >= xAccessor(d) && xVal < xEndAccessor(d));
        const yD = _.find(data, d => yVal >= yAccessor(d) && yVal < yEndAccessor(d));
        const xBin = [xAccessor(xD), xEndAccessor(xD)];
        const yBin = [yAccessor(yD), yEndAccessor(yD)];

        onMouseMove(e, {xVal, yVal, xD, yD, xBin, yBin});
    },

    render() {
        const {data, getValue, getEndValue, getArea, scale, scaleWidth, scaleHeight} = this.props;
        const [areaAccessor, xAccessor, xEndAccessor, yAccessor, yEndAccessor] =
            [getArea, getValue.x, getEndValue.x, getValue.y, getEndValue.y].map(accessor);

        // to determine how many data units are represented by 1 square pixel of area,
        // find the bin that would require the highest unit-per-pixel scale if its rectangle filled the whole container
        const unitsPerPixel = this.props.unitsPerPixel ||
            Math.max.apply(this, data.map(d => areaAccessor(d) / Math.abs(
                // area of entire containing rectangle
                (scale.x(xEndAccessor(d)) - scale.x(xAccessor(d))) * (scale.y(yEndAccessor(d)) - scale.y(yAccessor(d)))
            )));

        return <g className="area-heatmap-chart" onMouseMove={this.onMouseMove} onMouseLeave={this.onMouseLeave}>
            <rect x="0" y="0" width={scaleWidth} height={scaleHeight} ref="background" fill="transparent" />
            {data.map((d, i) => {
                // full width and height of the containing rectangle
                const fullWidth = Math.abs(scale.x(xEndAccessor(d)) - scale.x(xAccessor(d)));
                const fullHeight = Math.abs(scale.y(yEndAccessor(d)) - scale.y(yAccessor(d)));
                // x / y position of top left of the containing rectangle
                const x0 = Math.min(scale.x(xEndAccessor(d)), scale.x(xAccessor(d)));
                const y0 = Math.min(scale.y(yEndAccessor(d)), scale.y(yAccessor(d)));

                // we know two facts:
                // 1. the (pixel) area of the rect will be the data value divided by the # of data units per pixel
                //    ie. area = height * width = areaAccessor(d) / unitsPerPixel
                // 2. as the rectangle shrinks, the removed area is taken equally out of all sides, so that the ratio
                //    of the rect's width to the full width is equal to the ratio of its height to the full height.
                //    ie. (height / fullHeight) = (width / fullWidth)
                // solve for height and width to get...
                const width = Math.sqrt((areaAccessor(d) / unitsPerPixel) * (fullWidth / fullHeight));
                const height = Math.sqrt((areaAccessor(d) / unitsPerPixel) * (fullHeight / fullWidth));

                // center the data rect in the containing rectangle
                const x = x0 + ((fullWidth - width) / 2);
                const y = y0 + ((fullHeight - height) / 2);

                if(!_.all([x, y, width, height], _.isFinite)) return null;

                return <rect {...{x, y, width, height, className: 'area-heatmap-rect', key: `rect-${i}`}}/>;
            })}
        </g>;
    }
});

export default AreaHeatmap;
