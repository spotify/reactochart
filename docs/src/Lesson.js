import React from "react";
import ReactDOM from "react-dom";
import _ from "lodash";

export default class Lesson extends React.Component {
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
