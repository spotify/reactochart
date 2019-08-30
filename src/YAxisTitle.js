import defaults from 'lodash/defaults';
import measureText from './utils/measureText';
import PropTypes from 'prop-types';
import React from 'react';

export default class YAxisTitle extends React.Component {
  static propTypes = {
    height: PropTypes.number,
    width: PropTypes.number,
    /**
     * Title distance from Y Axis
     */
    distance: PropTypes.number,
    /**
     * Position of title in regards to the y axis. Accepted options are "left" or "right"
     */
    position: PropTypes.oneOf(['left', 'right']),
    alignment: PropTypes.oneOf(['top', 'middle', 'bottom']),
    /**
     * Placement of title in regards to the y axis. Accepted options are "before" or "after"
     */
    placement: PropTypes.oneOf(['before', 'after']),
    rotate: PropTypes.bool,
    /**
     * Object declaring styles for label.
     *
     * Disclaimer: style will merge its defaults with the given style prop
     * in order to ensure that our collision library measureText is able to calculate the
     * smallest amount of possible collisions along the axis. It's therefore dependent on
     * fontFamily, size and fontStyle to always be passed in. If you're looking to have a centralized
     * stylesheet, we suggest creating a styled title component that wraps YAxisTitle with your preferred styles.
     */
    style: PropTypes.object,
    /**
     * Spacing - provided by XYPlot
     */
    spacingLeft: PropTypes.number,
    /**
     * Spacing - provided by XYPlot
     */
    spacingRight: PropTypes.number,
    title: PropTypes.string,
    children: PropTypes.string,
  };

  static defaultProps = {
    height: 250,
    width: 400,
    distance: 5,
    position: 'left',
    alignment: 'middle',
    placement: undefined,
    rotate: true,
    style: {
      fontFamily: 'Helvetica, sans-serif',
      fontSize: '24px',
      fontWeight: 'bold',
      lineHeight: 1,
    },
    spacingLeft: 0,
    spacingRight: 0,
  };

  static getMargin(props) {
    const propsWithDefault = defaults({}, props, YAxisTitle.defaultProps);
    const { distance, position, rotate } = propsWithDefault;
    const placement =
      propsWithDefault.placement || (position === 'left' ? 'before' : 'after');
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

    const title = propsWithDefault.title || propsWithDefault.children;
    const style = defaults(
      propsWithDefault.style,
      YAxisTitle.defaultProps.style,
    );
    const titleWithStyle = Object.assign({ text: title }, style);
    const measured = measureText(titleWithStyle);

    const marginValue =
      distance +
      Math.ceil(rotate ? measured.height.value : measured.width.value);

    return position === 'left'
      ? { ...zeroMargin, marginLeft: marginValue }
      : { ...zeroMargin, marginRight: marginValue };
  }

  render() {
    const {
      height,
      width,
      distance,
      position,
      alignment,
      style,
      spacingLeft,
      spacingRight,
    } = this.props;
    const title = this.props.title || this.props.children;
    const placement =
      this.props.placement || (position === 'left' ? 'before' : 'after');

    const rotate = this.props.rotate ? -90 : 0;
    const posX = position === 'right' ? width + spacingRight : -spacingLeft;
    const translateX = posX + (placement === 'before' ? -distance : distance);
    const translateY =
      alignment === 'middle' ? height / 2 : alignment === 'bottom' ? height : 0;
    const textAnchor =
      rotate && alignment === 'top'
        ? 'end'
        : rotate && alignment === 'middle'
          ? 'middle'
          : rotate && alignment === 'bottom'
            ? 'start'
            : placement === 'before'
              ? 'end'
              : 'start';
    const dy =
      rotate && placement === 'before'
        ? '-0.2em'
        : rotate
          ? '0.8em'
          : alignment === 'top'
            ? '0.8em'
            : alignment === 'middle'
              ? '0.3em'
              : null;

    return (
      <g transform={`translate(${translateX},${translateY})`}>
        <text
          style={{ ...style, textAnchor }}
          transform={`rotate(${rotate})`}
          dy={dy}
        >
          {title}
        </text>
      </g>
    );
  }
}
