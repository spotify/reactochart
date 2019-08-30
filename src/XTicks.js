import defaults from 'lodash/defaults';
import capitalize from 'lodash/capitalize';
import PropTypes from 'prop-types';
import React from 'react';
import { getScaleTicks, getTickDomain } from './utils/Scale';

export default class XTicks extends React.Component {
  static propTypes = {
    /**
     * Height of chart - provided by XYPlot.
     */
    height: PropTypes.number,
    /**
     * D3 scale for X axis - provided by XYPlot.
     */
    xScale: PropTypes.func,
    /**
     * Position of x ticks. Accepted options are "bottom" or "top".
     */
    position: PropTypes.oneOf(['bottom', 'top']),
    /**
     * Placement of ticks in regards to the x axis. Accepted options are "above" or "below".
     */
    placement: PropTypes.oneOf(['above', 'below']),
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
     * Inline style object applied to each tick.
     */
    tickStyle: PropTypes.object,
    /**
     * Class attribute to be applied to each tick.
     */
    tickClassName: PropTypes.string,
    /**
     * Spacing - provided by XYPlot and used to determine the placement of the ticks given spacingTop.
     */
    spacingTop: PropTypes.number,
    /**
     * Spacing - provided by XYPlot and used to determine the placement of the ticks given spacingBottom.
     */
    spacingBottom: PropTypes.number,
    /**
     * Round ticks to capture extent of given x domain from XYPlot.
     */
    nice: PropTypes.bool,
  };
  static defaultProps = {
    position: 'bottom',
    nice: true,
    tickLength: 5,
    tickStyle: {},
    tickClassName: '',
  };

  static getTickDomain(props) {
    if (!props.xScale) return;
    const propsWithDefaults = defaults({}, props, XTicks.defaultProps);
    return {
      xTickDomain: getTickDomain(propsWithDefaults.xScale, propsWithDefaults),
    };
  }

  static getMargin(props) {
    const { tickLength, position } = defaults({}, props, XTicks.defaultProps);
    const placement =
      props.placement || (position === 'top' ? 'above' : 'below');
    const zeroMargin = {
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
    };

    if (
      (position === 'bottom' && placement === 'above') ||
      (position === 'top' && placement === 'below')
    )
      return zeroMargin;

    return defaults(
      { [`margin${capitalize(position)}`]: tickLength || 0 },
      zeroMargin,
    );
  }

  render() {
    const {
      height,
      xScale,
      tickCount,
      position,
      tickLength,
      tickStyle,
      tickClassName,
      spacingTop,
      spacingBottom,
    } = this.props;

    const placement =
      this.props.placement || (position === 'top' ? 'above' : 'below');
    const ticks = this.props.ticks || getScaleTicks(xScale, null, tickCount);
    const className = `rct-chart-tick rct-chart-tick-x ${tickClassName || ''}`;
    const transform =
      position === 'bottom'
        ? `translate(0, ${height + (spacingBottom || 0)})`
        : `translate(0, ${-spacingTop || 0})`;

    return (
      <g className="rct-chart-ticks-x" transform={transform}>
        {ticks.map((tick, i) => {
          const x1 = xScale(tick);
          const y2 = placement === 'above' ? -tickLength : tickLength;

          return (
            <line
              {...{
                x1,
                x2: x1,
                y1: 0,
                y2,
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
