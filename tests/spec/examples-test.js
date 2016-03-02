import _ from 'lodash';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import {expect} from 'chai';

import {examples} from '../../examples/src/main'

//import {XYPlot, LineChart} from '../../src';
//import resolveObjectProps from '../../src/utils/resolveObjectProps';

describe('examples', () => {
  it('renders the examples', () => {
    examples.forEach(example => {
      const ExampleComponent = example.Component;
      const wrapped = TestUtils.renderIntoDocument(<ExampleComponent />);
    })
  });
});
