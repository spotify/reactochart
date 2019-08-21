import React from 'react';
import defaults from 'lodash/defaults';
import omit from 'lodash/omit';
import identity from 'lodash/identity';
import measureText from './utils/measureText';
import PropTypes from 'prop-types';

export default class MeasuredValueLabel extends React.Component {
  static propTypes = {
    value: PropTypes.any,
    format: PropTypes.func,
    children: PropTypes.any,
  };

  static defaultProps = {
    format: identity,
    style: {
      fontFamily: 'Helvetica, sans-serif',
      fontSize: '20px',
      lineHeight: 1,
      textAnchor: 'middle',
    },
  };

  static getLabel(props) {
    const { value, format } = props;
    const style = defaults(props.style, MeasuredValueLabel.defaultProps.style);
    const labelStr = format(value);
    const labelWithStyle = Object.assign({ text: labelStr }, style);
    const measured = measureText(labelWithStyle);

    return {
      value: props.value,
      text: measured.text,
      height: measured.height.value,
      width: measured.width.value,
    };
  }

  render() {
    const { value, format } = this.props;
    const passedProps = omit(this.props, ['value', 'format']);

    return (
      <text {...passedProps}>
        {React.Children.count(this.props.children)
          ? this.props.children
          : format(value)}
      </text>
    );
  }
}
