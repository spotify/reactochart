import React from 'react';
import ReactDOM from 'react-dom';
import ExampleSection from '../components/ExampleSection';

const basicExample = require('raw-loader!../examples/ColorHeatmap.js.example');
const categoricalExample = require('raw-loader!../examples/CategoricalColorHeatmap.js.example');

const examples = [
  {
    id: "basic",
    label: "Basic Color Heatmap",
    codeText: basicExample,
  },
  {
    id: "categorical",
    label: "Categorical Color Heatmap",
    codeText: categoricalExample,
  }
];

export default class ColorHeatmapExamples extends React.Component {
  render() {
    return <div className="container" style={{minHeight: 2000}}>
      <div className="row">
        <h2>Color Heatmap</h2>
      </div>

      {examples.map(example => {
        return <ExampleSection {...example} key={example.id} />;
      })}
    </div>;
  }
}
