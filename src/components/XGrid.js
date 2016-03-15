import React from 'react';

const XGrid = React.createClass({
  propTypes: {
    ticks: PropTypes.array,
    scale: PropTypes.array,
    chartWidth: PropTypes.number,
    chartHeight: PropTypes.number,
  },
  render() {
    const {ticks, scale, chartWidth, chartHeight} = this.props;

    return ticks.map((value, i) => {
      const x = scale(value);
    })
  }
});

export default XGrid;
