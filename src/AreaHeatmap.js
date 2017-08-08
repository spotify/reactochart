import React from 'react';
import _ from 'lodash';
import {extent} from 'd3';
import PropTypes from 'prop-types';

import {methodIfFuncProp} from './util.js';
import {makeAccessor} from './utils/Data';
import xyPropsEqual from './utils/xyPropsEqual';

export default class AreaHeatmap extends React.Component {
  static propTypes = {
    unitsPerPixel: PropTypes.number,
    rectClassName: PropTypes.string,
    rectStyle: PropTypes.object
  };
  static defaultProps = {
    rectClassName: '',
    rectStyle: {}
  };

  static getDomain(props) {
    const {data, getX, getXEnd, getY, getYEnd} = props;
    return {
      x: extent(_.flatten([data.map(makeAccessor(getX)), data.map(makeAccessor(getXEnd))])),
      y: extent(_.flatten([data.map(makeAccessor(getY)), data.map(makeAccessor(getYEnd))]))
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const shouldUpdate = !xyPropsEqual(this.props, nextProps, ['rectStyle']);
    return shouldUpdate;
  }

  onMouseEnter = (e) => {
    this.props.onMouseEnter(e);
  };
  onMouseLeave = (e) => {
    this.props.onMouseLeave(e);
  };
  onMouseMove = (e) => {
    const {scale, data, getArea, getX, getXEnd, getY, getYEnd, onMouseMove} = this.props;
    if(!_.isFunction(onMouseMove)) return;
    // const [xAccessor, xEndAccessor, yAccessor, yEndAccessor] =
    //   [getArea, getX, getXEnd, getY, getYEnd].map(makeAccessor);

    const boundBox = this.refs.background.getBoundingClientRect();
    if(!boundBox) return;
    const [x, y] = [e.clientX - (boundBox.left || 0), e.clientY - (boundBox.top || 0)];
    const [xVal, yVal] = [scale.x.invert(x), scale.y.invert(y)];
    //const xD = _.find(data, d => xVal >= xAccessor(d) && xVal < xEndAccessor(d));
    //const yD = _.find(data, d => yVal >= yAccessor(d) && yVal < yEndAccessor(d));
    //const d = _.find(data,
    //    d => xVal >= xAccessor(d) && xVal < xEndAccessor(d) && yVal >= yAccessor(d) && yVal < yEndAccessor(d));
    //const xBin = [xAccessor(xD), xEndAccessor(xD)];
    //const yBin = [yAccessor(yD), yEndAccessor(yD)];

    //onMouseMove(e, {xVal, yVal, d, xD, yD, xBin, yBin});
    onMouseMove(e, {xVal, yVal});
  };

  render() {
    const {data, getArea, getX, getXEnd, getY, getYEnd, scale, scaleWidth, scaleHeight, rectClassName, rectStyle}
      = this.props;
    const [areaAccessor, xAccessor, xEndAccessor, yAccessor, yEndAccessor] =
      [getArea, getX, getXEnd, getY, getYEnd].map(makeAccessor);

    // to determine how many data units are represented by 1 square pixel of area,
    // find the bin that would require the highest unit-per-pixel scale if its rectangle filled the whole container
    const unitsPerPixel = this.props.unitsPerPixel ||
      Math.max.apply(this, data.map(d => areaAccessor(d) / Math.abs(
        // area of entire containing rectangle
        (scale.x(xEndAccessor(d)) - scale.x(xAccessor(d))) * (scale.y(yEndAccessor(d)) - scale.y(yAccessor(d)))
      )));

    const handlers = {
      onMouseMove: methodIfFuncProp('onMouseMove', this.props, this),
      onMouseEnter: methodIfFuncProp('onMouseEnter', this.props, this),
      onMouseLeave: methodIfFuncProp('onMouseLeave', this.props, this)
    };

    return <g className="area-heatmap-chart" {...handlers}>
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
        // 2. all rectangles, regardless of size, have the same shape (are congruent), so the ratio
        //    of the rect's width to the full width is equal to the ratio of its height to the full height.
        //    ie. (height / fullHeight) = (width / fullWidth)
        // solve for height and width to get...
        const width = Math.sqrt((areaAccessor(d) / unitsPerPixel) * (fullWidth / fullHeight));
        const height = Math.sqrt((areaAccessor(d) / unitsPerPixel) * (fullHeight / fullWidth));

        // center the data rect in the containing rectangle
        const x = x0 + ((fullWidth - width) / 2);
        const y = y0 + ((fullHeight - height) / 2);

        if(!_.every([x, y, width, height], _.isFinite)) return null;

        const className = `area-heatmap-rect ${rectClassName}`;
        const style = rectStyle;
        const key = `rect-${i}`;

        return <rect {...{x, y, width, height, className, style, key}}/>;
      })}
    </g>;
  }
}
