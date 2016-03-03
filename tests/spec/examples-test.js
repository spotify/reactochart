import _ from 'lodash';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import {expect} from 'chai';

import {examples} from '../../examples/src/Examples.jsx';

describe('examples', () => {
  it('has examples', () => {
    expect(examples.length).to.be.at.least(1);
  });

  examples.forEach(example => {
    it(`renders the ${example.title} example`, () => {
      const ExampleComponent = example.Component;
      const wrapped = TestUtils.renderIntoDocument(<ExampleComponent />);
      var svg = TestUtils.scryRenderedDOMComponentsWithTag(wrapped, 'svg');
      expect(svg.length).to.be.at.least(1);
    });
  })
});
