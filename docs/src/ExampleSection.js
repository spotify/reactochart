import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import * as d3 from 'd3';
import Playground from 'component-playground';

// import *all* reactochart components/utils - usually you'd import one at a time
import * as Reactochart from '../../src';

import {randomWalk, randomWalkSeries, randomWalkTimeSeries, removeRandomData} from './data/util';

export default class ExampleSection extends React.Component {
  static propTypes = {
    codeText: React.PropTypes.string,
    scope: React.PropTypes.object,
    isExpanded: React.PropTypes.bool,
    label: React.PropTypes.node,
    id: React.PropTypes.string,
    description: React.PropTypes.node,
    onClick: React.PropTypes.func
  };
  static defaultProps = {
    codeText: "",
    scope: {},
    isExpanded: true,
    label: "Example",
    id: ""
  };

  onClick = (e) => {
    if(this.props.onClick) {
      this.props.onClick(e, this.props.id);
    }
  };

  render() {
    const {codeText, isExpanded, label, id, description, onClick} = this.props;
    const scope = {
      React, ReactDOM, d3, _,
      randomWalk, randomWalkSeries, randomWalkTimeSeries,
      // include all Reactochart components in scope
      ...Reactochart,
      ...this.props.scope
    };

    return <div className={`row example ${isExpanded ? 'example-active' : 'example-inactive'}`}>
      <div className="col-md-12">
        <h3 className="example-header" onClick={onClick ? this.onClick : _.noop}>
          {label || id} {isExpanded ? "▼" : "►"}
        </h3>

        {isExpanded ?
          <div>
            {description ?
              <div className="example-description">
                {description}
              </div>
              : null
            }
            <Playground codeText={codeText} scope={scope} noRender={false} />
          </div>
          : null
        }
      </div>
    </div>
  }
}
