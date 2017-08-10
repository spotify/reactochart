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

// todo: flesh out this lesson and re-do this example:

class CustomSelectionRect extends React.Component {
  render() {
    const {scale, hoveredYVal} = this.props;
    return hoveredYVal ?
      <rect
        x="0"
        y={scale.y(hoveredYVal) - 20}
        width="500" height="40"
        style={{fill: 'red'}}
      />
      : null;
  }
};

class CustomChildExample extends React.Component {
  state = {
    hoveredYVal: null
  };

  onMouseMoveChart = ({yValue}) => {
    this.setState({hoveredYVal: yValue});
  };

  render() {
    return <div>
      <XYPlot
        width={500} height={400}
        padding={{bottom: 20, top: 20}}
        onMouseMove={this.onMouseMoveChart}
      >
        <XAxis /><YAxis />
        <CustomSelectionRect underAxes={true} hoveredYVal={this.state.hoveredYVal} />
        <BarChart
          horizontal
          data={[]}
          getX={0}
          getY={1}
          barThickness={20}
        />
      </XYPlot>
    </div>
  }
};