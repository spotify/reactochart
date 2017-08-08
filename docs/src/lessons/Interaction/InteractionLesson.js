import React from 'react';
import ReactDOM from 'react-dom';
import Lesson from '../../Lesson';
import ExampleSection from '../../ExampleSection';

const examples = [
  {
    id: "basic",
    label: "Interaction Example",
    codeText: require('raw-loader!./examples/Interaction.js.example'),
  },
];

export default class InteractionLesson extends React.Component {
  render() {
    return <Lesson name="Interaction" componentName="Interaction">

      {/* Interaction lesson goes here. intersperse with examples or leave examples loop below */}

      {examples.map(example => {
        return <ExampleSection {...example} key={example.id} />;
      })}
    </Lesson>;
  }
}
