import React from 'react';
import ReactDOM from 'react-dom';
import ExampleSection from '../components/ExampleSection';

const basicExample = require('raw-loader!../examples/AreaHeatmap.js.example');

const examples = [
  {
    id: "basic",
    label: "Basic Area Heatmap",
    codeText: basicExample,
  },
];

export default class AreaHeatmapExamples extends React.Component {
  render() {
    return <div className="container">
      <div className="row">
        <h2>Area Heatmap</h2>
      </div>

      {examples.map(example => {
        return <ExampleSection {...example} key={example.id} />;
      })}
    </div>;
  }
}
