import React from "react";
import ReactDOM from "react-dom";
import _ from "lodash";
import remark from "remark";
import remarkReact from "remark-react";

export default class ComponentDocs extends React.Component {
  render() {
    const { name, propDocs, children } = this.props;
    const sortedProps = _(_.get(propDocs, "props"))
      .toPairs()
      .sortBy(0)
      .fromPairs()
      .value();

    return (
      <div className="container-fluid component-docs">
        <div className="row">
          <h2>{name}</h2>
        </div>

        {propDocs.description ? (
          <div className="row">
            <p className="component-description">
              {renderMarkdown(propDocs.description)}
            </p>
          </div>
        ) : null}

        <div className="row prop-docs">
          <h4>{name} props:</h4>
          {_.map(sortedProps, (propInfo, propKey) => {
            return (
              <div key={propKey} className="prop-doc">
                <strong>{propKey}</strong>:{" "}
                {_.get(propInfo, "type.name", "unknown")}
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

function renderMarkdown(markdownText = "") {
  return remark()
    .use(remarkReact)
    .processSync(markdownText).contents;
}
