import _ from "lodash";
import React from "react";
import remark from "remark";
import remarkReact from "remark-react";

export default class ComponentDocs extends React.Component {
  render() {
    const { name, propDocs, children } = this.props;
    const props = _.get(propDocs, "props", {});
    const sortedProps = Object.entries(props)
      .sort((a, b) => a[0] - b[0])
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
  }
}

function renderType(propInfo) {
  const typeInfo = _.get(propInfo, "type");

  if (!typeInfo) {
    return "unknown";
  }

  const typeName = _.get(typeInfo, "name", "unknown");
  let type = typeName;

  if (typeName === "union") {
    if (!typeInfo.computed) {
      type = _.get(propInfo, "type.value", [])
        .map(type => _.get(type, "name", ""))
        .join(" || ");
    } else {
      // Handle custom proptypes
      type = "func || value";
    }
  } else if (typeName === "custom") {
    if (typeInfo.raw === "CustomPropTypes.valueOrAccessor") {
      type = "func || value";
    }
  }

  return type;
}

function renderMarkdown(markdownText = "") {
  return remark()
    .use(remarkReact)
    .processSync(markdownText).contents;
}
