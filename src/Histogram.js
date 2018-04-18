import React from "react";
import _ from "lodash";
import { histogram, extent, ticks, scaleLinear } from "d3";
import PropTypes from "prop-types";

import * as CustomPropTypes from "./utils/CustomPropTypes";
import {
  makeAccessor2,
  domainFromRangeData,
  domainFromData
} from "./utils/Data";

import xyPropsEqual from "./utils/xyPropsEqual";
import AreaBarChart from "./AreaBarChart";

// todo make histogram work horizontally *or* vertically
export default class Histogram extends React.Component {
  static propTypes = {
    /**
     * the array of data objects
     */
    data: PropTypes.array.isRequired,
    value: CustomPropTypes.valueOrAccessor,
    axisType: PropTypes.object,
    /**
     * D3 scale for X axis - provided by XYPlot
     */
    xScale: PropTypes.func,
    /**
     * D3 scale for Y axis - provided by XYPlot
     */
    yScale: PropTypes.func,
    /**
     * Following [d3's thresholds documentation](https://github.com/d3/d3-array#histogram_thresholds) ...
     *
     * If a number `count`  is specified, then the domain will be uniformly divided into approximately `count` bins.
     *
     * If an array `[x0, x1 ... xN]` is specified, then any value less than `x0` will be placed in the first bin; any value greater than
     * or equal to `x0` but less than `x1` will be placed in the second bin; and so on. The generated histogram will have `array.length` + 1 bins.
     */
    thresholds: PropTypes.oneOfType([PropTypes.number, PropTypes.array])
      .isRequired,
    /**
     * The domain to which your data will be mapped and binned. binDomain is defined as an array `[min, max]`.
     *
     * Warning: This prop takes priority if `nice = true`
     */
    binDomain: PropTypes.array,
    /**
     * Nicely rounds the start and end values of your bins. Implemented using [d3's ticks nicing logic](https://github.com/d3/d3-array#ticks)
     */
    nice: PropTypes.bool,
    /**
     * Class attribute to be applied to each bar.
     * or accessor function which returns a class;
     */
    barClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    /**
     * Inline style object to be applied to each bar,
     * or accessor function which returns a style object;
     */
    barStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /**
     * `mousemove` event handler callback, called when user's mouse moves within a bar.
     */
    onMouseMoveBar: PropTypes.func,
    /**
     * `mouseenter` event handler callback, called when user's mouse enters a bar.
     */
    onMouseEnterBar: PropTypes.func,
    /**
     * `mouseleave` event handler callback, called when user's mouse leaves a bar.
     */
    onMouseLeaveBar: PropTypes.func
  };

  static defaultProps = { data: [], thresholds: 30, nice: false };

  state = { histogramData: null };

  static getScaleType() {
    // TODO make histogram work with ordinal scale
    return { xScaleType: "linear", yScaleType: "linear" };
  }

  static getDomain(props) {
    const { data, value, thresholds, binDomain, nice } = props;
    const xDomain = domainFromData(data, makeAccessor2(value));

    const bins = Histogram.computeHistogram(
      data,
      thresholds,
      makeAccessor2(value),
      binDomain,
      nice
    );

    const domains = {
      xDomain: [_.first(bins).x0, _.last(bins).x1],
      yDomain: [0, _.maxBy(bins, bin => bin.length).length]
    };

    return domains;
  }

  static computeHistogram(data, thresholds, accessor, binDomain, nice) {
    let makeHistogram = histogram()
      .value(accessor)
      .thresholds(thresholds);

    if (binDomain) {
      // Throw warning if nice = true and binDomain is defined
      if (nice) {
        console.warn(
          "Warning: if binDomain is defined and nice = true, histogram prioritizes binDomain and disregards nicing."
        );
      }

      // Use user's passed in binDomain to makeHistogram
      makeHistogram = makeHistogram.domain(binDomain);
    } else if (nice) {
      // Create a linear scale to nice values
      const scale = scaleLinear()
        .domain(extent(data))
        .nice();

      // Nicely round domain given temp bins
      const niceBinDomain = scale.ticks();

      // Set nicely rounded domain as domain for makeHistogram
      makeHistogram = makeHistogram.domain([
        _.first(niceBinDomain),
        _.last(niceBinDomain)
      ]);
    }

    const bins = makeHistogram(data);

    return bins;
  }

  shouldComponentUpdate(nextProps, nextState) {
    const shouldUpdate = !xyPropsEqual(this.props, nextProps, []);
    return shouldUpdate;
  }

  componentWillMount() {
    const { value, data, thresholds, binDomain, nice } = this.props;

    const bins = Histogram.computeHistogram(
      data,
      thresholds,
      makeAccessor2(value),
      binDomain,
      nice
    );

    this.setState({ histogramData: bins });
  }

  render() {
    if (!this.state.histogramData) return <g />;
    const {
      name,
      scale,
      axisType,
      scaleWidth,
      scaleHeight,
      plotWidth,
      plotHeight
    } = this.props;

    return (
      <AreaBarChart
        {...this.props}
        data={this.state.histogramData}
        x={getX0}
        xEnd={getX1}
        y={getLength}
      />
    );
  }
}

function getX0(d) {
  return d.x0;
}
function getX1(d) {
  return d.x1;
}
function getLength(d) {
  return d.length;
}
