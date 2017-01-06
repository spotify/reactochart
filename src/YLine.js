import React from 'react';

export default class YLine extends React.Component {
  static propTypes = {
    scale: React.PropTypes.shape({y: React.PropTypes.func.isRequired}),
    value: React.PropTypes.any.isRequired
  };
  static defaultProps = {
    style: {}
  };

  render() {
    const {value, width, spacing, style} = this.props;
    const scale = this.props.scale.y;
    const className = `chart-line-y ${this.props.className || ''}`;
    const lineY = scale(value);

    return <line {...{
      x1: -spacing.left,
      x2: width + spacing.right,
      y1: lineY,
      y2: lineY,
      className, style
    }} />;
  }
}
