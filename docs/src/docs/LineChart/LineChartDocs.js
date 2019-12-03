import React from 'react';
import ComponentDocs from '../../ComponentDocs';
import ExampleSection from '../../ExampleSection';
// autogenerated docs data containing descriptions of this component's props
import propDocs from './propDocs.json';

const examples = [
  {
    id: 'basic',
    label: 'Basic LineChart',
    codeText: require('./examples/LineChart.js.example').default,
  },
  {
    id: 'interactive',
    label: 'Interactive LineChart',
    codeText: require('./examples/InteractiveLineChart.js.example').default,
  },
];

export default class LineChartExamples extends React.Component {
  render() {
    return (
      <ComponentDocs name="LineChart" propDocs={propDocs}>
        {/* documentation goes here. intersperse docs with examples or leave examples loop below */}

        {examples.map(example => {
          return <ExampleSection {...example} key={example.id} />;
        })}
      </ComponentDocs>
    );
  }
}
