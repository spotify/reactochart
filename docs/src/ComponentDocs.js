import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

export default class ComponentDocs extends React.Component {
  render() {
    const {name, propDocs, children} = this.props;

    return <div className="container component-docs">
      <div className="row">
        <h2>{name}</h2>
      </div>

      <div className="row prop-docs">
        <h4>{name} props:</h4>
        {_.map(_.get(propDocs, 'props'), (propInfo, propKey) => {
          return <div key={propKey} className="prop-doc">
            <strong>{propKey}</strong>: {propInfo.type.name}
          </div>
        })}
      </div>

      {children}
    </div>
  }
}