import React from 'react';
import _ from 'lodash';
import measureText from 'measure-text';

export default class YAxisTitle extends React.Component {
  static propTypes = {
    height: React.PropTypes.number,
    width: React.PropTypes.number,
    distance: React.PropTypes.number,
    position: React.PropTypes.oneOf(['left', 'right']),
    alignment: React.PropTypes.oneOf(['top', 'middle', 'bottom']),
    placement: React.PropTypes.oneOf(['before', 'after']),
    rotate: React.PropTypes.bool,
    style: React.PropTypes.object
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
      fontFamily: "Helvetica, sans-serif",
      fontSize: '24px',
      fontWeight: 'bold',
      lineHeight: 1
    },
    spacing: {top: 0, bottom: 0, left: 0, right: 0}
  };

  static getMargin(props) {
    props = _.defaults({}, props, YAxisTitle.defaultProps);
    const {distance, position, rotate} = props;
    const placement = props.placement || ((position === 'left') ? 'before' : 'after');
    const zeroMargin = {top: 0, bottom: 0, left: 0, right: 0};

    if((position === 'left' && placement === 'after') || (position == 'right' && placement === 'before'))
      return zeroMargin;

    const title = props.title || props.children;
    const style = _.defaults(props.style, YAxisTitle.defaultProps.style);
    const measured = measureText(_.assign({text: title}, style));

    const marginValue = distance +
      Math.ceil(rotate ?
        measured.height.value :
        measured.width.value
      );

    return (position === 'left') ?
    {...zeroMargin, left: marginValue} :
    {...zeroMargin, right: marginValue};
  }

  render() {
    const {height, width, distance, position, alignment, style, spacing} = this.props;
    const title = this.props.title || this.props.children;
    const placement = this.props.placement || ((position === 'left') ? 'before' : 'after');

    const rotate = this.props.rotate ? -90 : 0;
    const posX = (position === 'right') ? width + spacing.right : -spacing.left;
    const translateX = posX +
      ((placement === 'before') ? -distance : distance);
    const translateY =
      (alignment === 'middle') ? (height / 2) :
      (alignment === 'bottom') ? (height) :
      0;
    const textAnchor =
      (rotate && alignment === 'top') ? 'end' :
      (rotate && alignment === 'middle') ? 'middle' :
      (rotate && alignment === 'bottom') ? 'start' :
      (placement === 'before') ? 'end' :
      'start';
    const dy =
      (rotate && placement == 'before') ? '-0.2em' :
      (rotate) ? '0.8em' :
      (alignment === 'top') ? '0.8em' :
      (alignment === 'middle') ? '0.3em' :
      null;

    return <g transform={`translate(${translateX},${translateY})`}>
      <text style={{...style, textAnchor}} transform={`rotate(${rotate})`} dy={dy}>
        {title}
      </text>
    </g>;
  }
}
