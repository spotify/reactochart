import defaults from 'lodash/defaults';
import capitalize from 'lodash/capitalize';
import PropTypes from 'prop-types';
import React from 'react';
import { getScaleTicks, getTickDomain } from './utils/Scale';

export default class YTicks extends React.Component {
  static propTypes = {
    /**
     * Width of chart - provided by XYPlot.
     */
    width: PropTypes.number,
    /**
     * D3 scale for Y axis - provided by XYPlot.
     */
    yScale: PropTypes.func,
    /**
     * Position of y ticks. Accepted options are "left" or "right".
     */
    position: PropTypes.oneOf(['left', 'right']),
    /**
     * Placement of ticks in regards to the y axis. Accepted options are "before" or "after".
     */
    placement: PropTypes.oneOf(['before', 'after']),
    /**
     * Custom ticks to display.
     */
    ticks: PropTypes.array,
    /**
     * Number of ticks on axis.
     */
    tickCount: PropTypes.number,
    tickLength: PropTypes.number,
    /**
     * Inline style object to be applied to each tick.
     */
    tickStyle: PropTypes.object,
    /**
     * Class attribute to be applied to each tick.
     */
    tickClassName: PropTypes.string,
    /**
     * Spacing - provided by XYPlot and used to determine the placement of the ticks given spacingLeft.
     */
    spacingLeft: PropTypes.number,
    /**
     * Spacing - provided by XYPlot and used to determine the placement of the ticks given spacingRight.
     */
    spacingRight: PropTypes.number,
    /**
     * Round ticks to capture extent of given y domain from XYPlot.
     */
    nice: PropTypes.bool,
  };
  static defaultProps = {
    position: 'left',
    nice: true,
    tickLength: 5,
    tickStyle: {},
  };

  static getTickDomain(props) {
    if (!props.yScale) {
      return;
    }

    const propsWithDefaults = defaults({}, props, YTicks.defaultProps);
    return { yTickDomain: getTickDomain(props.yScale, propsWithDefaults) };
  }

  static getMargin(props) {
    const { tickLength, position } = defaults({}, props, YTicks.defaultProps);
    const placement =
      props.placement || (position === 'left' ? 'before' : 'after');
    const zeroMargin = {
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
    };

    if (
      (position === 'left' && placement === 'after') ||
      (position === 'right' && placement === 'before')
    )
      return zeroMargin;

    return defaults(
      { [`margin${capitalize(position)}`]: tickLength || 0 },
      zeroMargin,
    );
  }

  render() {
    const {
      width,
      yScale,
      tickCount,
      position,
      tickLength,
      tickStyle,
      tickClassName,
      spacingLeft,
      spacingRight,
    } = this.props;
    const placement =
      this.props.placement || (position === 'left' ? 'before' : 'after');
    const ticks = this.props.ticks || getScaleTicks(yScale, null, tickCount);
    const className = `rct-chart-tick rct-chart-tick-y ${tickClassName || ''}`;
    const transform =
      position === 'right'
        ? `translate(${width + (spacingRight || 0)}, 0)`
        : `translate(${-spacingLeft || 0}, 0)`;

    return (
      <g className="rct-chart-ticks-y" transform={transform}>
        {ticks.map((tick, i) => {
          const y1 = yScale(tick);
          const x2 = placement === 'before' ? -tickLength : tickLength;

          return (
            <line
              {...{
                x1: 0,
                x2,
                y1,
                y2: y1,
                className,
                style: tickStyle,
                key: `tick-${i}`,
              }}
            />
          );
        })}
      </g>
    );
  }
}
