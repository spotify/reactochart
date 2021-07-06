import React from 'react';
import PropTypes from 'prop-types';

A11yInterface.propTypes = {
  /**
   * A function that takes the index of the frame,
   * and returns a string to render as an aria label
   * for the specific frame in the Interface.
   *
   * (frameIndex) => string
   */
  ariaLabelGenerator: PropTypes.func.isRequired,
  /**
   * the number of frames to render across the visualization
   * (e.g. the number of data points to message via screen reader)
   */
  numFrames: PropTypes.number,
  /**
   * an optional `onKeyDown` event handler to provide for each frame
   * when selected.
   * Best practices are to describe how the user will interact with the chart in
   * the ariaLabelGenerator
   *
   * (event, frameIndex) => void
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
};

/**
 * `A11yInterface` provides a mechanism for keyboard navigation of
 * `LineChart` and `AreaChart` graphs within `XYPlot`. This component renders
 * a rectangle for a given `numFrames` across a Line/Area chart. Users can navigate to a frame
 * either by pressing `Tab`, or through their assistive technology. `A11yInterface`
 * takes an `ariaLabelGenerator`, which generates an aria-label for each frame of the chart.
 * [aria-labels](https://www.w3.org/TR/WCAG20-TECHS/ARIA6.html#ARIA6-description) are critical for users accessing
 * the web with screenreaders or other assistive technologies.
 */

export default function A11yInterface(props) {
  const { ariaLabelGenerator, numFrames, onKeyDown, height, width } = props;
  const sliceWidth = width / numFrames;

  return (
    <g className="spt-chart-a11y">
      {[...Array(numFrames).keys()].map((_d, frameIndex) => (
        <rect
          className="rct-chart-visually-hidden-rect"
          aria-label={ariaLabelGenerator(frameIndex)}
          key={frameIndex}
          height={height}
          width={sliceWidth}
          x={sliceWidth * frameIndex}
          y={0}
          role="button"
          tabIndex={0}
          onKeyDown={event => {
            if (!!onKeyDown) {
              onKeyDown(event, frameIndex);
            }
          }}
        />
      ))}
    </g>
  );
}
