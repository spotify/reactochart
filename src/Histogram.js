import { extent, histogram, scaleLinear } from "d3";
import first from "lodash/first";
import last from "lodash/last";
import maxBy from "lodash/maxBy";
import PropTypes from "prop-types";
import React from "react";
import AreaBarChart from "./AreaBarChart";
import xyPropsEqual from "./utils/xyPropsEqual";

/**
 * `Histogram` is used to represent the distribution of numerical data. Histograms, only relate
 * to one variable, where data is typically "binned" and counted.
 */

// todo make histogram work horizontally *or* vertically
// todo make histogram work with ordinal scale
export default class Histogram extends React.Component {
  static propTypes = {
    /**
     * The array of data objects for the histogram.
     * These should be individual "samples" or "facts", not an array of bins -
     * this component will count and bin the samples for you. If you have data that is already binned,
     * use the `<AreaBarChart>` component.
     */
    data: PropTypes.array.isRequired,
    /**
     * Data value accessor function, called once per datum, which returns the values to bin and plot in the histogram.
     * If `data` is just an array of numbers, this may be the identity function (`function(d) { return d }`).
     */
    value: PropTypes.func,
    /**
     * D3 scale for X axis - provided by XYPlot.
     */
    xScale: PropTypes.func,
    /**
     * D3 scale for Y axis - provided by XYPlot.
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
     * The domain over which your data will be binned. Defined as an array `[min, max]`.
     * If not provided, binDomain will be the domain of your data values by default.
     *
     * Warning: This prop takes priority if `nice = true`.
     */
    binDomain: PropTypes.array,
    /**
     * If true, nicely rounds the start and end values of your bins.
     * Implemented using [d3's ticks nicing logic](https://github.com/d3/d3-array#ticks).
     */
    nice: PropTypes.bool,
    /**
     * Class attribute to be applied to each bar,
     * or accessor function which returns a class.
     */
    barClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    /**
     * Inline style object to be applied to each bar,
     * or accessor function which returns a style object.
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
    return { xScaleType: "linear", yScaleType: "linear" };
  }

  static getDomain(props) {
    const { data, value, thresholds, binDomain, nice } = props;

    const bins = Histogram.computeHistogram(
      data,
      thresholds,
      value,
      binDomain,
      nice
    );

    const domains = {
      xDomain: [first(bins).x0, last(bins).x1],
      yDomain: [0, maxBy(bins, bin => bin.length).length]
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
          "Warning: if binDomain is defined and nice = true, histogram prioritizes binDomain and disregards nice."
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
        first(niceBinDomain),
        last(niceBinDomain)
      ]);
    }

    const bins = makeHistogram(data);

    return bins;
  }

  shouldComponentUpdate(nextProps) {
    const shouldUpdate = !xyPropsEqual(this.props, nextProps, []);
    return shouldUpdate;
  }

  render() {
    const { value, data, thresholds, binDomain, nice } = this.props;

    const bins = Histogram.computeHistogram(
      data,
      thresholds,
      value,
      binDomain,
      nice
    );

    if (!bins) return <g />;

    return (
      <AreaBarChart
        {...this.props}
        data={bins}
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
