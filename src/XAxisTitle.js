import React from 'react';
import _ from 'lodash';
import measureText from 'measure-text';
import PropTypes from 'prop-types';

export default class XAxisTitle extends React.Component {
  static propTypes = {
    height: PropTypes.number,
    width: PropTypes.number,
    distance: PropTypes.number,
    position: PropTypes.oneOf(['top', 'bottom']),
    placement: PropTypes.oneOf(['above', 'below']),
    alignment: PropTypes.oneOf(['left', 'center', 'right']),
    rotate: PropTypes.bool,
    style: PropTypes.object
  };
  static defaultProps = {
    height: 250,
    width: 400,
    distance: 5,
    position: 'bottom',
    placement: undefined,
    alignment: 'center',
    rotate: false,
    style: {
      fontFamily: "Helvetica, sans-serif",
      fontSize: '24px',
      fontWeight: 'bold',
      lineHeight: 1
    },
    spacing: {top: 0, bottom: 0, left: 0, right: 0}
  };

  static getMargin(props) {
    props = _.defaults({}, props, XAxisTitle.defaultProps);
    const {distance, position, rotate} = props;
    const placement = props.placement || ((position === 'bottom') ? 'below' : 'above');
    const zeroMargin = {top: 0, bottom: 0, left: 0, right: 0};

    if((position === 'bottom' && placement === 'above') || (position == 'top' && placement === 'below'))
      return zeroMargin;

    const title = props.title || props.children;
    const style = _.defaults(props.style, XAxisTitle.defaultProps.style);
    const measured = measureText(_.assign({text: title}, style));

    const marginValue = distance +
      Math.ceil(rotate ?
        measured.width.value :
        measured.height.value
      );

    return (position === 'bottom') ?
      {...zeroMargin, bottom: marginValue} :
      {...zeroMargin, top: marginValue};
  }

  render() {
    const {height, width, distance, position, alignment, style, spacing} = this.props;
    const title = this.props.title || this.props.children;
    const placement = this.props.placement || ((position === 'bottom') ? 'below' : 'above');
    const rotate = this.props.rotate ? -90 : 0;

    const posY = (position === 'bottom') ? height + spacing.bottom : -spacing.top;
    const translateY = posY +
      ((placement === 'above') ? -distance : distance);
    const translateX =
      (alignment === 'center') ? (width / 2) :
      (alignment === 'right') ? (width) :
      0;

    const textAnchor =
      (rotate && placement === 'above') ? 'start' :
      (rotate && placement === 'below') ? 'end' :
      (alignment === 'left') ? 'start' :
      (alignment === 'right') ? 'end' :
      'middle';

    const dy =
      (rotate && alignment === 'right') ? '-0.2em' :
      (rotate && alignment === 'center') ? '0.3em' :
      (rotate) ? '0.8em' :
      (placement === 'below') ? '0.8em' :
      '-0.2em';

    return <g transform={`translate(${translateX},${translateY})`}>
      <text style={{...style, textAnchor}} transform={`rotate(${rotate})`} dy={dy}>
        {title}
      </text>
    </g>;
  }
}
