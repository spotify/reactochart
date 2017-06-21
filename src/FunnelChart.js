import React from 'react';
import _ from 'lodash';
import {area, scaleOrdinal, schemeCategory20b} from 'd3';
import invariant from 'invariant';

import * as CustomPropTypes from './utils/CustomPropTypes';
import {makeAccessor, domainFromData, combineDomains} from './utils/Data';
import {dataTypeFromScaleType} from './utils/Scale';

export default class FunnelChart extends React.Component {
  static propTypes = {
    // passed from xyplot
    scale: CustomPropTypes.xyObjectOf(React.PropTypes.func.isRequired),
    // data array
    data: React.PropTypes.array.isRequired,
    // data getters
    getX: CustomPropTypes.getter,
    getY: CustomPropTypes.getter
  };
  static defaultProps = {

  };

  static getDomain(props) {
    const {data, scale, scaleType, getX, getY, horizontal} = props;
    const [xAccessor, yAccessor] = [makeAccessor(getX), makeAccessor(getY)];
    const [xDataType, yDataType] = [dataTypeFromScaleType(scaleType.x), dataTypeFromScaleType(scaleType.y)];

    return horizontal ?
      {
        x: combineDomains([
          domainFromData(data, xAccessor, xDataType),
          domainFromData(data, d => -xAccessor(d), xDataType)
        ]),
        y: domainFromData(data, yAccessor, yDataType)
      } :
      {
        x: domainFromData(data, xAccessor, xDataType),
        y: combineDomains([
          domainFromData(data, yAccessor, yDataType),
          domainFromData(data, d => -yAccessor(d), yDataType)
        ])
      };
  }

  render() {
    const {data, scale, getX, getY, horizontal} = this.props;

    const funnelArea = area();
    if(horizontal) {
      funnelArea
        .x0(d => scale.x(-makeAccessor(getX)(d)))
        .x1(d => scale.x(makeAccessor(getX)(d)))
        .y(d => scale.y(makeAccessor(getY)(d)));
    } else {
      funnelArea
        .x(d => scale.x(makeAccessor(getX)(d)))
        .y0(d => scale.y(-makeAccessor(getY)(d)))
        .y1(d => scale.y(makeAccessor(getY)(d)));
    }

    const colors = scaleOrdinal(schemeCategory20b).domain(_.range(10));

    return <g className="funnel-chart">
      {data.map((d, i) => {
        if(i == 0) return null;
        const pathStr = funnelArea([data[i-1], d]);

        return <path d={pathStr} style={{fill: colors(i-1), stroke: 'transparent'}} />;
      })}
    </g>
  }
}
