import React from 'react';
import _ from 'lodash';
import measureText from 'measure-text';
import PropTypes from 'prop-types';

export default class MeasuredValueLabel extends React.Component {
  static propTypes = {
    value: PropTypes.any.isRequired
  };
  static defaultProps = {
    format: _.identity,
    style: {
      fontFamily: "Helvetica, sans-serif",
      fontSize: '20px',
      lineHeight: 1,
      textAnchor: 'middle'
    }
  };
  static getLabel(props) {
    const {value, format} = props;
    const style = _.defaults(props.style, MeasuredValueLabel.defaultProps.style);
    const labelStr = format(value);
    const measured = measureText(_.assign({text: labelStr}, style));

    return {
      value: props.value,
      text: measured.text,
      height: measured.height.value,
      width: measured.width.value
    };
  }

  render() {
    const {value, format} = this.props;
    const passedProps = _.omit(this.props, ['value', 'format']);

    return <text {...passedProps}>
      {React.Children.count(this.props.children) ?
        this.props.children : format(value)
      }
    </text>;
  }
}

