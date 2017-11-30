import React from 'react';
import PropTypes from 'prop-types';

export default class YLine extends React.Component {
  static propTypes = {
    yScale: PropTypes.func,
    value: PropTypes.any.isRequired,
    spacingLeft: PropTypes.number,
    spacingRight: PropTypes.number,
    style: PropTypes.object,
    className: PropTypes.string
  };
  static defaultProps = {
    style: {},
    className: '',
    spacingLeft: 0,
    spacingRight: 0
  };

  render() {
    const {yScale, value, width, spacingLeft, spacingRight, style} = this.props;
    const className = `chart-line-y ${this.props.className || ''}`;
    const lineY = yScale(value);

    return <line {...{
      x1: -spacingLeft,
      x2: width + spacingRight,
      y1: lineY,
      y2: lineY,
      className, style
    }} />;
  }
}
