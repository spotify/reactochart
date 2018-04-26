import React from "react";
import PropTypes from "prop-types";

export default class XLine extends React.Component {
  static propTypes = {
    xScale: PropTypes.func,
    value: PropTypes.any.isRequired,
    spacingTop: PropTypes.number,
    spacingBottom: PropTypes.number,
    style: PropTypes.object,
    className: PropTypes.string
  };
  static defaultProps = {
    style: {},
    className: "",
    spacingTop: 0,
    spacingBottom: 0
  };

  render() {
    const {
      xScale,
      value,
      height,
      style,
      spacingTop,
      spacingBottom
    } = this.props;
    const className = `chart-line-x ${this.props.className}`;
    const lineX = xScale(value);

    return (
      <line
        {...{
          x1: lineX,
          x2: lineX,
          y1: -spacingTop,
          y2: height + spacingBottom,
          className,
          style
        }}
      />
    );
  }
}
