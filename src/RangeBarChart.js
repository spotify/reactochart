import React from 'react';
import invariant from 'invariant';

import * as CustomPropTypes from './utils/CustomPropTypes';
import {hasXYScales, dataTypeFromScaleType} from './utils/Scale';
import {makeAccessor, domainFromRangeData, domainFromData, getDataDomainByAxis} from './utils/Data';
import Bar from './Bar';

export default class RangeBarChart extends React.Component {
  static propTypes = {
    scale: CustomPropTypes.xyObjectOf(React.PropTypes.func.isRequired),
    data: React.PropTypes.array,
    horizontal: React.PropTypes.bool,

    getX: CustomPropTypes.getter,
    getXEnd: CustomPropTypes.getter,
    getY: CustomPropTypes.getter,
    getYEnd: CustomPropTypes.getter,

    barThickness: React.PropTypes.number,
    barClassName: React.PropTypes.string,
    barStyle: React.PropTypes.object,
    getClass: CustomPropTypes.getter,

    onMouseEnterBar: React.PropTypes.func, 
    onMouseMoveBar: React.PropTypes.func, 
    onMouseLeaveBar: React.PropTypes.func
  };
  static defaultProps = {
    data: [],
    horizontal: false,
    barThickness: 8,
    barClassName: '',
    barStyle: {}
  };

  static getDomain(props) {
    const {scaleType, horizontal, data, getX, getXEnd, getY, getYEnd} = props;

    // only have to specify range axis domain, other axis uses default domainFromData
    const rangeAxis = horizontal ? 'x' : 'y';
    const rangeStartAccessor = horizontal ? makeAccessor(getX) : makeAccessor(getY);
    const rangeEndAccessor = horizontal ? makeAccessor(getXEnd) : makeAccessor(getYEnd);
    const rangeDataType = dataTypeFromScaleType(scaleType[rangeAxis]);

    return {
      [rangeAxis]: domainFromRangeData(data, rangeStartAccessor, rangeEndAccessor, rangeDataType)
    };
  }
  static getSpacing(props) {
    const {barThickness, horizontal, scale, data, domain} = props;
    const dataDomain = getDataDomainByAxis(props);
    const P = barThickness / 2; //padding
    const k = horizontal ? 'y' : 'x';
    //find the edges of the tick domain, and map them through the scale function
    const [domainHead, domainTail] = _([_.first(domain[k]), _.last(domain[k])]).map(scale[k]).sortBy(); //sort the pixel values return by the domain extents
    //find the edges of the data domain, and map them through the scale function
    const [dataDomainHead, dataDomainTail] = _([_.first(dataDomain[k]), _.last(dataDomain[k])]).map(scale[k]).sortBy(); //sort the pixel values return by the domain extents
    //find the neccessary spacing (based on bar width) to push the bars completely inside the tick domain
    const [spacingTail, spacingHead] = [_.clamp(P - (domainTail - dataDomainTail), 0, P), _.clamp(P - (dataDomainHead - domainHead), 0, P)];
    if(horizontal){
      return {top: spacingHead, right: 0, bottom: spacingTail, left: 0}
    } else {
      return {top: 0, right: spacingTail, bottom: 0, left: spacingHead}
    }
  }
  render() {
    const {scale, data, horizontal, getX, getXEnd, getY, getYEnd, barThickness, barClassName, barStyle, getClass} = this.props;
    invariant(hasXYScales(scale), `RangeBarChart.props.scale.x and scale.y must both be valid d3 scales`);
    // invariant(hasOneOfTwo(getXEnd, getYEnd), `RangeBarChart expects a getXEnd *or* getYEnd prop, but not both.`);

    const accessors = {x: makeAccessor(getX), y: makeAccessor(getY)};
    const endAccessors = {x: makeAccessor(getXEnd), y: makeAccessor(getYEnd)};
    


    return <g>
      {data.map((d, i) => {

        const [onMouseEnter, onMouseMove, onMouseLeave] =
          ['onMouseEnterBar', 'onMouseMoveBar', 'onMouseLeaveBar'].map(eventName => {

            // partially apply this bar's data point as 2nd callback argument
            const callback = _.get(this.props, eventName);
            return _.isFunction(callback) ? _.partial(callback, _, d) : null;
        });

        const barProps = {
          scale,
          thickness: barThickness,
          className: `chart-bar ${barClassName} ${getClass ? getClass(d) : ''}`,
          style: barStyle
        };

        const thisBarProps = {
          xValue: accessors.x(d),
          yValue: accessors.y(d),
          key: `chart-bar-${i}`,
          onMouseEnter, 
          onMouseMove, 
          onMouseLeave,
          ...barProps
        };

        return horizontal ?
          <Bar xEndValue={endAccessors.x(d)} {...thisBarProps} /> :
          <Bar yEndValue={endAccessors.y(d)} {...thisBarProps} />;
      })}
    </g>;
  }
}
