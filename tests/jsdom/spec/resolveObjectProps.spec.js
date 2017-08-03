import _ from 'lodash';
import React from 'react';
import {expect} from 'chai';
import {mount, shallow} from 'enzyme';

import resolveObjectProps from '../../../src/utils/resolveObjectProps';

describe('resolveObjectProps', () => {
  class XYPropTest extends React.Component {
    static defaultProps = {
      domain: {x: [0, 100], y: [42, 1987]},
      axisType: {x: "foo", y: "bar"},
      foo: "baz"
    };

    render() {
      return <div></div>;
    }
  }

  const XYResolved = resolveObjectProps(XYPropTest, ['domain', 'axisType'], ['x', 'y']);

  it('resolves incompletely-specified object props into fully-specified objects using defaultProps', () => {
    const props = {
      domain: {x: [53, 442]},
      axisType: {y: "mimsy"}
    };
    const resolved = mount(<XYResolved {...props} />).find(XYPropTest);

    expect(resolved.props().domain.y).to.equal(XYPropTest.defaultProps.domain.y);
    expect(resolved.props().axisType.x).to.equal(XYPropTest.defaultProps.axisType.x);
    expect(resolved.props().domain.x).to.equal(props.domain.x);
    expect(resolved.props().axisType.y).to.equal(props.axisType.y);
  });

  it('resolves single values into fully-specified objects', () => {
    const props = {
      domain: 0,
      axisType: "uffish"
    };
    const resolved = mount(<XYResolved {...props} />).find(XYPropTest);

    _.forEach(props, (value, key) => {
      expect(resolved.props()[key]).to.deep.equal({x: value, y: value});
    });
  });

  it('uses defaultProps normally for undefined object props', () => {
    const wrapped = mount(<XYResolved />);
    const resolved = wrapped.find(XYPropTest);
    const {defaultProps} = XYPropTest;

    _.keys(defaultProps).forEach(k => {
      expect(resolved.props()[k]).to.equal(defaultProps[k]);
      expect(resolved.props()[k]).to.deep.equal(defaultProps[k]);
    });
  });

  it('passes fully-specified object props through', () => {
    const props = {
      domain: {x: [99, 199], y: [88, 188]},
      axisType: {x: "brillig", y: "slithy"}
    };
    const wrapped = mount(<XYResolved {...props} />);
    const resolved = wrapped.find(XYPropTest);

    _.keys(props).forEach(k => {
      expect(resolved.props()[k]).to.equal(props[k]);
      expect(resolved.props()[k]).to.deep.equal(props[k]);
    });
  });

  it('passes other props through', () => {
    const props = {
      num: 500,
      str: 'vorpal',
      arr: [1, 4],
      obj: {a: 5},
      nullable: null,
      notDefined: undefined
    };
    const wrapped = mount(<XYResolved {...props} />);
    const resolved = wrapped.find(XYPropTest);

    _.keys(props).forEach(k => {
      expect(resolved.props()[k]).to.equal(props[k])
    });
  });

  it('throws if a defaultProp is incorrectly shaped', () => {
    const XYResolvedBad = resolveObjectProps(XYPropTest, ['domain', 'axisType', 'foo'], ['x', 'y']);
    expect(() => {
      mount(<XYResolvedBad />);
    }).to.throw(Error);
  });
});

/*
todo test shouldComponentUpdate

 class TestComponent extends React.Component {
 render() {
 return <div>
 <div>domain.x: {_.get(this.props, 'domain.x').join()}</div>
 <div>domain.y: {_.get(this.props, 'domain.y').join()}</div>
 </div>
 }
 }
 const ResolvedTestComponent = resolveObjectProps(TestComponent, ['domain'], ['x', 'y']);

 class ObjectPropsShouldUpdateTest extends React.Component {
 static makeDomain = () => ({domain: {x: [_.random(10), _.random(10)], y: [_.random(10), _.random(10)]}});
 state = ObjectPropsShouldUpdateTest.makeDomain();

 onClickChange = () => {
 this.setState(ObjectPropsShouldUpdateTest.makeDomain());
 }
 onClickShallow = () => {
 this.setState({domain: {x: this.state.domain.x, y: this.state.domain.y}});
 }
 render() {
 return <div>
 <ResolvedTestComponent domain={this.state.domain} /><br />
 <ResolvedTestComponent domain={{x: this.state.domain.x, y: this.state.domain.y}} /><br />
 <ResolvedTestComponent domain={this.state.domain.x} /><br />
 <ResolvedTestComponent domain={this.state.domain.y} /><br />

 <div><button onClick={this.onClickChange}>change</button></div>
 <div><button onClick={this.onClickShallow}>change shallow</button></div>
 </div>
 }
 }

 */