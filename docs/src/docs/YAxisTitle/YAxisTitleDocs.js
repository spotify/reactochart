import React from 'react';
import ComponentDocs from '../../ComponentDocs';
import ExampleSection from '../../ExampleSection';
// autogenerated docs data containing descriptions of this component's props
import propDocs from './propDocs.json';

const examples = [
  {
    id: 'basic',
    label: 'Basic YAxisTitle',
    codeText: require('./examples/YAxisTitle.js.example').default,
  },
  {
    id: 'all',
    label: 'YAxisTitle Positions and Placements',
    codeText: require('./examples/YAxisTitleAll.js.example').default,
  },
];

export default class YAxisTitleExamples extends React.Component {
  render() {
    return (
      <ComponentDocs name="YAxisTitle" propDocs={propDocs}>
        {/* documentation goes here. intersperse docs with examples or leave examples loop below */}

        {examples.map(example => {
          return <ExampleSection {...example} key={example.id} />;
        })}
      </ComponentDocs>
    );
  }
}
