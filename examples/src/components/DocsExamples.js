
export default class DocsExamples extends React.Component {
  state = {
    expandedExamples: new Set()
  };

  componentWillMount() {
    // initialize expanded state so that examples with `isDefault` are expanded by default
    const expandedExamples = new Set();
    this.props.examples.forEach(example => {
      if(example.isDefault) expandedExamples.add(example.id);
    });
    this.setState({expandedExamples});
  }

  onClickExample = (e, id) => {
    const expandedExamples = new Set(this.state.expandedExamples);
    if (expandedExamples.has(id)) expandedExamples.delete(id);
    else expandedExamples.add(id);
    this.setState({expandedExamples});
  };

  render() {
    const {examples} = this.props;
    const {expandedExamples} = this.state;
    const [defaultExamples, otherExamples] = _.partition(examples, example => example.isDefault);

    return <div className="docs-examples">
      {defaultExamples.map(example => {
        const {codeText, name, id, description} = example;
        const scope = {React, ReactDOM, ...example.scope};
        const isExpanded = expandedExamples.has(id);
        const label = `Demo: ${name}`;
        const exampleProps = {codeText, id, description, scope, label, isExpanded, onClick: this.onClickExample};
        return <ExampleSection {...exampleProps} key={id} />;
      })}

      {otherExamples && otherExamples.length ?
        <div>
          <div className="row">
            <h2>More Examples:</h2>
          </div>

          {otherExamples.map(example => {
            const {codeText, name, id, description} = example;
            const scope = {React, ReactDOM, ...example.scope};
            const isExpanded = expandedExamples.has(id);
            const exampleProps = {codeText, id, description, scope, label: name, isExpanded, onClick: this.onClickExample};
            return <ExampleSection {...exampleProps} key={id} />;
          })}
        </div>
        : null
      }
    </div>
  }
}
