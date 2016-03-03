import _ from 'lodash';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import {expect} from 'chai';

import resolveXYScales from '../../src/utils/resolveObjectProps';


describe('resolveXYScales', () => {
  class XYChart extends React.Component {
    static defaultProps = {};
    static getDomain() {

    }
    static getMargin() {

    }
    render() {
      return <div></div>;
    }
  }

  // functional stateless component test fixtures
  const ScaledXYChart = resolveXYScales(XYChart);

  it('passes XY scales and margins through if both are provided', () => {});

  it('resolves XY scales from data, margins and size', () => {});

  it('resolves XY scales from domain, margins and size', () => {});

  it('resolves XY scales and margins from data and size', () => {});

  it('resolves XY scales and margins from domain and size', () => {});

  it('sets margins to zero if they are neither provided nor resolvable', () => {});

  it('throws if domains are neither provided nor resolvable', () => {});

  it('throws if neither XY scales nor size are provided', () => {});

  it('throws if neither XY scales nor (domain or data) are provided', () => {});
});
