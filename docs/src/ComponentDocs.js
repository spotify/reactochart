import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import remark from 'remark';
import remarkReact from 'remark-react';

const ComponentDocs = props => {
  const { name, propDocs, children } = props;
  const componentProps = _.get(propDocs, 'props');

  const sortedProps = Object.entries(componentProps)
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  return (
    <div className="container-fluid component-docs">
      <div className="row">
        <h2>{name}</h2>
      </div>

      {propDocs.description ? (
        <div className="row component-description">
          {renderMarkdown(propDocs.description)}
        </div>
      ) : null}

      <div className="row prop-docs">
        <h4>{name} props:</h4>
        {_.map(sortedProps, (propInfo, propKey) => {
          return (
            <div key={propKey} className="prop-doc">
              <strong>{propKey}</strong>: {renderType(propInfo)}
              {propInfo.description ? <br /> : null}
              {propInfo.description ? (
                <span className="prop-description">
                  {renderMarkdown(propInfo.description)}
                </span>
              ) : null}
              {propInfo.defaultValue ? (
                <div className="prop-default">
                  default value: <code>{propInfo.defaultValue.value}</code>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {children}
    </div>
  );
};

ComponentDocs.propTypes = {
  name: PropTypes.string,
  propDocs: PropTypes.object,
  children: PropTypes.any,
};

function renderType(propInfo) {
  const typeInfo = _.get(propInfo, 'type');

  if (!typeInfo) {
    return 'unknown';
  }

  const typeName = _.get(typeInfo, 'name', 'unknown');
  let type = typeName;

  if (typeName === 'union') {
    if (!typeInfo.computed) {
      type = _.get(propInfo, 'type.value', [])
        .map(propTypes => _.get(propTypes, 'name', ''))
        .join(' || ');
    } else {
      // Handle custom proptypes
      type = 'func || value';
    }
  } else if (typeName === 'custom') {
    if (typeInfo.raw === 'CustomPropTypes.valueOrAccessor') {
      type = 'func || value';
    }
  } else if (typeName === 'arrayOf') {
    const arrayType = _.get(propInfo, 'type.value.name', {});
    type = `Array<${arrayType}>`;
  }

  return type;
}

function renderMarkdown(markdownText = '') {
  return remark()
    .use(remarkReact)
    .processSync(markdownText).contents;
}

export default ComponentDocs;
