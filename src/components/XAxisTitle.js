import React from 'react';
import _ from 'lodash';
import measureText from 'measure-text';

export default class YAxisTitle extends React.Component {
  static propTypes = {
    height: React.PropTypes.number,
    width: React.PropTypes.number,
    distance: React.PropTypes.number,
    position: React.PropTypes.oneOf(['top', 'bottom']),
    alignment: React.PropTypes.oneOf(['left', 'center', 'right']),
    placement: React.PropTypes.oneOf(['above', 'below']),
    rotate: React.PropTypes.bool,
    titleStyle: React.PropTypes.object
  };
  static defaultProps = {
    height: 250,
    width: 400,
    distance: 5,
    position: 'bottom',
    alignment: 'center',
    placement: undefined,
    rotate: false,
    titleStyle: {
      fontFamily: "Helvetica, sans-serif",
      fontSize: '24px',
      fontWeight: 'bold',
      lineHeight: 1
    }
  };

  render() {
    const {height, width, distance, position, alignment, titleStyle} = this.props;
    const title = this.props.title || this.props.children;
    const placement = this.props.placement || ((position === 'bottom') ? 'below' : 'above');

    const rotate = this.props.rotate ? -90 : 0;
    const posY = (position === 'bottom') ? height : 0;
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
      <text style={{...titleStyle, textAnchor}} transform={`rotate(${rotate})`} dy={dy}>
        {title}
      </text>
    </g>;
  }
}
