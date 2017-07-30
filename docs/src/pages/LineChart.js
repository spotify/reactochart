import React from 'react';
import ReactDOM from 'react-dom';
import ExampleSection from '../components/ExampleSection';

const basicExample = require('raw-loader!../examples/LineChart.js.example');
const interactiveExample = require('raw-loader!../examples/InteractiveLineChart.js.example');
const examples = [
  {
    id: "basic",
    label: "Basic Line Chart",
    codeText: basicExample,
    isExpanded: true,
  },
  {
    id: "interactive",
    label: "Interactive Line Chart",
    codeText: interactiveExample,
    isExpanded: true,
  }
];

export default class LineChartExamples extends React.Component {
  render() {
    return <div className="container" style={{minHeight: 2000}}>
      <div className="row">
        <h2>Line Chart</h2>
      </div>

      {examples.map(example => {
        return <ExampleSection {...example} key={example.id} />;
      })}

    </div>;
  }
}
