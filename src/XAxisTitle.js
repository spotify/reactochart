import React from 'react';
import defaults from 'lodash/defaults';
import measureText from './utils/measureText';
import PropTypes from 'prop-types';

export default class XAxisTitle extends React.Component {
  static propTypes = {
    height: PropTypes.number,
    width: PropTypes.number,
    /**
     * Title distance from X Axis
     */
    distance: PropTypes.number,
    /**
     * Position of title in regards to the x axis. Accepted options are "top" or "bottom"
     */
    position: PropTypes.oneOf(['top', 'bottom']),
    /**
     * Placement of title in regards to the x axis. Accepted options are "above" or "below"
     */
    placement: PropTypes.oneOf(['above', 'below']),
    alignment: PropTypes.oneOf(['left', 'center', 'right']),
    rotate: PropTypes.bool,
    /**
     * Object declaring styles for label.
     *
     * Disclaimer: labelStyle will merge its defaults with the given labelStyle prop
     * in order to ensure that our collision library measureText is able to calculate the
     * smallest amount of possible collisions along the axis. It's therefore dependent on
     * fontFamily, size and fontStyle to always be passed in. If you're looking to have a centralized
     * stylesheet, we suggest creating a styled title component that wraps XAxisTitle with your preferred styles.
     */
    style: PropTypes.object,
    /**
     * Spacing - provided by XYPlot
     */
    spacingTop: PropTypes.number,
    /**
     * Spacing - provided by XYPlot
     */
    spacingBottom: PropTypes.number,
    title: PropTypes.string,
    children: PropTypes.any,
  };
  static defaultProps = {
    height: 250,
    width: 400,
    distance: 5,
    position: 'bottom',
    alignment: 'center',
    rotate: false,
    style: {
      fontFamily: 'Helvetica, sans-serif',
      fontSize: '24px',
      fontWeight: 'bold',
      lineHeight: 1,
    },
    spacingTop: 0,
    spacingBottom: 0,
  };

  static getMargin(props) {
    const propsWithDefaults = defaults({}, props, XAxisTitle.defaultProps);
    const { distance, position, rotate } = propsWithDefaults;
    const placement =
      propsWithDefaults.placement ||
      (position === 'bottom' ? 'below' : 'above');
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

    const title = propsWithDefaults.title || propsWithDefaults.children;
    const style = defaults(
      propsWithDefaults.style,
      XAxisTitle.defaultProps.style,
    );
    const titleWithStyle = Object.assign({ text: title }, style);
    const measured = measureText(titleWithStyle);

    const marginValue =
      distance +
      Math.ceil(rotate ? measured.width.value : measured.height.value);

    return position === 'bottom'
      ? { ...zeroMargin, marginBottom: marginValue }
      : { ...zeroMargin, marginTop: marginValue };
  }

  render() {
    const {
      height,
      width,
      distance,
      position,
      alignment,
      style,
      spacingTop,
      spacingBottom,
    } = this.props;
    const title = this.props.title || this.props.children;
    const placement =
      this.props.placement || (position === 'bottom' ? 'below' : 'above');
    const rotate = this.props.rotate ? -90 : 0;

    const posY = position === 'bottom' ? height + spacingBottom : -spacingTop;
    const translateY = posY + (placement === 'above' ? -distance : distance);
    const translateX =
      alignment === 'center' ? width / 2 : alignment === 'right' ? width : 0;

    const textAnchor =
      rotate && placement === 'above'
        ? 'start'
        : rotate && placement === 'below'
        ? 'end'
        : alignment === 'left'
        ? 'start'
        : alignment === 'right'
        ? 'end'
        : 'middle';

    const dy =
      rotate && alignment === 'right'
        ? '-0.2em'
        : rotate && alignment === 'center'
        ? '0.3em'
        : rotate
        ? '0.8em'
        : placement === 'below'
        ? '0.8em'
        : '-0.2em';

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
