import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import * as d3 from "d3";

// todo: make sure this correctly handles new props getting passed in, doesn't double bind events

export default class ZoomContainer extends React.Component {
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    standalone: PropTypes.func,
    customZoon: PropTypes.bool,

    onZoom: PropTypes.func,
    extent: PropTypes.array,
    scaleExtent: PropTypes.array,
    translateExtent: PropTypes.array,
    clickDistance: PropTypes.number,
    duration: PropTypes.number,
    interpolate: PropTypes.func,
    constrain: PropTypes.func,
    filter: PropTypes.func,
    touchable: PropTypes.func,
    wheelDelta: PropTypes.func
  };
  static defaultProps = {
    width: 800,
    height: 600
  };

  state = {
    zoomTransform: null
  };

  _initZoom() {
    this.zoom = d3.zoom().on("zoom", this.handleZoom);

    const {extent, scaleExtent, translateExtent, clickDistance, duration, interpolate} = this.props;
    const {constrain, filter, touchable, wheelDelta} = this.props;

    if (_.isArray(extent)) this.zoom.extent(extent);
    if (_.isArray(scaleExtent)) this.zoom.scaleExtent(scaleExtent);
    if (_.isArray(translateExtent)) this.zoom.translateExtent(translateExtent);
    if (_.isFinite(clickDistance)) this.zoom.clickDistance(clickDistance);
    if (_.isFinite(duration)) this.zoom.duration(duration);
    if (_.isFunction(interpolate)) this.zoom.interpolate(interpolate);
    if (_.isFunction(constrain)) this.zoom.constrain(constrain);
    if (_.isFunction(filter)) this.zoom.filter(filter);
    if (_.isFunction(touchable)) this.zoom.touchable(touchable);
    if (_.isFunction(wheelDelta)) this.zoom.wheelDelta(wheelDelta);
  }

  componentDidMount() {
    this._initZoom();
    d3.select(this.refs.svg).call(this.zoom);
  }
  componentDidUpdate() {
    this._initZoom();
    d3.select(this.refs.svg).call(this.zoom);
  }

  handleZoom = (...args) => {
    this.setState({
      zoomTransform: d3.event.transform
    });
    if (this.props.onZoom) this.props.onZoom(...args);
  };

  render() {
    return (
      <svg ref="svg" width={this.props.width} height={this.props.height}>
        <g width={this.props.width} height={this.props.height} transform={this.state.zoomTransform}>
          {this.props.children}
        </g>
      </svg>
    );
  }
}
