import React from 'react';
import PropTypes from 'prop-types';

export default class Lesson extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    children: PropTypes.any,
  };

  render() {
    const { name, children } = this.props;

    return (
      <div>
        <h2>{name}</h2>

        {children}
      </div>
    );
  }
}
