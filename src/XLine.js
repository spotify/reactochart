import React from 'react';

export default class XLine extends React.Component {
  static propTypes = {
    scale: React.PropTypes.shape({x: React.PropTypes.func.isRequired}),
    value: React.PropTypes.any.isRequired
  };
  static defaultProps = {
    style: {}
  };

  render() {
    const {value, height, spacing, style} = this.props;
    const scale = this.props.scale.x;
    const className = `chart-line-x ${this.props.className || ''}`;
    const lineX = scale(value);

    return <line {...{
      x1: lineX,
      x2: lineX,
      y1: -spacing.top,
      y2: height + spacing.bottom,
      className, style
    }} />;
  }
}
