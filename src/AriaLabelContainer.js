import React from 'react';
import PropTypes from 'prop-types';
import { ascending } from 'd3-array';
import * as CustomPropTypes from './utils/CustomPropTypes';
import { getValue } from './utils/Data';

AriaLabelContainer.propTypes = {
  /**
   * An array containing n objects in the following shape:
   * [{
   *    data: Array of your data points, normally used in rendering specific line or area charts
   *    accessor: A function used to access the data point on the x axis from the `data` attribute
   *              (datum) => number
   * }]
   */
  datasetWithAccessor: PropTypes.arrayOf(
    PropTypes.shape({
      data: PropTypes.arrayOf(PropTypes.object).isRequired,
      accessor: CustomPropTypes.valueOrAccessor.isRequired,
    }),
  ).isRequired,
  /**
   * A function that takes the xValue at the start of the frame, an array of datapoints at that xValue, and the index of the frame,
   * and returns a string to render as an aria label
   * for the specific frame in the Interface.
   *
   * (xValue, [datapoints], frameIndex) => string
   */
  ariaLabelGenerator: PropTypes.func.isRequired,
  /**
   * an optional `onKeyDown` event handler to provide for each frame
   * when selected.
   * Best practices are to describe how the user will interact with the chart in
   * the ariaLabelGenerator
   *
   * (event, xValue, [datapoints]) => void
   */
  onKeyDown: PropTypes.func,
  /**
   * height of the chart - provided by `XYPlot`
   */
  height: PropTypes.number,
  /**
   * width of the chart - provided by `XYPlot`
   */
  width: PropTypes.number,
  /**
   * D3 scale for X axis - provided by XYPlot
   */
  xScale: PropTypes.func,
};

/**
 * `AriaLabelContainer` provides a mechanism for keyboard navigation of
 * `LineChart` and `AreaChart` graphs within `XYPlot`. This component renders
 * a rectangle for a given `numFrames` across a Line/Area chart. `numFrames` should
 * be equal to the number of data points in your dataset. Users can navigate to a frame
 * either by pressing `Tab`, or through their assistive technology. `AriaLabelContainer`
 * takes an `ariaLabelGenerator`, which generates an aria-label for each frame of the chart.
 * [aria-labels](https://www.w3.org/TR/WCAG20-TECHS/ARIA6.html#ARIA6-description) are critical for users accessing
 * the web with screenreaders or other assistive technologies.
 */

export default function AriaLabelContainer(props) {
  const {
    ariaLabelGenerator,
    onKeyDown,
    height,
    width,
    datasetWithAccessor,
    xScale,
  } = props;

  const domain = xScale.domain();

  const groupedData = {};
  // determine number of frames from n datasets with potentially different accessors
  datasetWithAccessor.forEach(({ data, accessor }, index) => {
    data.forEach(d => {
      const xValue = getValue(accessor, d);
      const key = xValue.toString();
      if (!groupedData[key]) {
        groupedData[key] = {
          xValue,
          data: new Array(datasetWithAccessor.length),
          // account for missing datapoints in different datasets
        };
      }
      groupedData[key].data[index] = d;
    });
  });

  const zippedDatapoints = Object.values(groupedData).sort((a, b) =>
    ascending(a.xValue, b.xValue),
  );

  const numFrames = zippedDatapoints.length;
  const sliceWidth = width / (numFrames - 1);

  return (
    <g className="rct-chart-a11y">
      {zippedDatapoints.map(({ xValue, data }, index) => (
        <rect
          className="rct-chart-visually-hidden-rect"
          aria-label={ariaLabelGenerator(xValue, data, index)}
          key={index}
          height={height}
          width={sliceWidth}
          x={
            xValue === domain[1]
              ? xScale(zippedDatapoints[index - 1].xValue)
              : xScale(xValue)
            // otherwise the last rect renders outside the chart
          }
          y={0}
          role="button"
          tabIndex={0}
          onKeyDown={event => {
            if (!!onKeyDown) {
              onKeyDown(event, xValue, data);
            }
          }}
        />
      ))}
    </g>
  );
}
