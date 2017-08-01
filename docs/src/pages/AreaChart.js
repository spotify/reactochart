import React from 'react';
import ReactDOM from 'react-dom';
import ExampleSection from '../components/ExampleSection';

const basicExample = require('raw-loader!../examples/AreaChart.js.example');

const examples = [
  {
    id: "basic",
    label: "Basic Area Chart",
    codeText: require('raw-loader!../examples/AreaChart.js.example'),
  },
];

export default class AreaChartExamples extends React.Component {
  render() {
    return <div className="container">
      <div className="row">
        <h2>Area Chart</h2>
      </div>

      {examples.map(example => {
        return <ExampleSection {...example} key={example.id} />;
      })}
    </div>;
  }
}
