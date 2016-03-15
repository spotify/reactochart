import React from 'react';
import _ from 'lodash';

class YLine extends React.Component {
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
    const {scale, value, width, lineClassName, lineStyle} = this.props;
    const className = `chart-line-y ${lineClassName}`;
    const lineY = scale(value);

    return <line {...{
      x1: 0,
      x2: width,
      y1: lineY,
      y2: lineY,
      className,
      style: lineStyle
    }} />;
  }
}

export default YLine;
