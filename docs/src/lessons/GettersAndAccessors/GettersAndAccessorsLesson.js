import React from 'react';
import ReactDOM from 'react-dom';
import Lesson from '../../Lesson';
import ExampleSection from '../../ExampleSection';

const examples = [
  {
    id: "basic",
    label: "Getters and Accessors Example",
    codeText: require('raw-loader!./examples/GettersAndAccessors.js.example'),
  },
];

export default class GettersAndAccessorsLesson extends React.Component {
  render() {
    return <Lesson name="Getters and Accessors" componentName="GettersAndAccessors">


      {examples.map(example => {
        return <ExampleSection {...example} key={example.id} />;
      })}
    </Lesson>;
  }
}
