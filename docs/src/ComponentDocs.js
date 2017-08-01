import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

export default class ComponentDocs extends React.Component {
  render() {
    const {name, propDocs, children} = this.props;

    return <div className="container">
      <div className="row">
        <h2>{name}</h2>
      </div>

      {children}
    </div>
  }
}