import _ from 'lodash';
import React from 'react';
import d3 from 'd3';
import TestUtils from 'react-addons-test-utils';
import {expect} from 'chai';


import {datasetsFromPropsOrDescendants} from '../../src/utils/Data'

describe('datasetsFromPropsOrDescendants', () => {
  it('returns props.datasets', () => {
    const props = {datasets: [[1]]};
    const datasets = datasetsFromPropsOrDescendants(props);
    expect(datasets).to.equal(props.datasets);
    expect(datasets).to.deep.equal(props.datasets);
  });

  it('returns props.data wrapped in an array', () => {
    const props = {data: [2]};
    const datasets = datasetsFromPropsOrDescendants(props);
    expect(datasets).to.be.an('array');
    expect(datasets[0]).to.equal(props.data);
    expect(datasets[0]).to.deep.equal(props.data);
  });
  
  it('traverses children and combines their props.data & props.datasets', () => {
    class TestComponent extends React.Component {
      render() {
        return <div>{this.props.children}</div>;
      }
    }

    const tree =
      <TestComponent first><div>
        <TestComponent data={[0, 1]}/>
        <TestComponent datasets={[[2, 3], [4, 5]]}/>
        <div><TestComponent data={[6, 7]}/></div>
      </div></TestComponent>;
    const rendered = TestUtils.renderIntoDocument(tree);
    const datasets = datasetsFromPropsOrDescendants(rendered.props);

    expect(datasets).to.be.an('array');
    expect(datasets).to.deep.equal([[0, 1], [2, 3], [4, 5], [6, 7]]);
  });
});