import React from 'react';
import _ from 'lodash';

class XLine extends React.Component {
  static propTypes = {
    scale: React.PropTypes.func.isRequired,
    value: React.PropTypes.any.isRequired
  };
  static defaultProps = {
    height: 250,
    width: 400,
    lineClassName: '',
    lineStyle: {}
  };

  render() {
    const {scale, value, height, lineClassName, lineStyle} = this.props;
    const className = `chart-line-x ${lineClassName}`;
    const lineX = scale(value);

    return <line {...{
      x1: lineX,
      x2: lineX,
      y1: 0,
      y2: height,
      className,
      style: lineStyle
    }} />;
  }
}

export default XLine;
