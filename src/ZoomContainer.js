import * as d3 from "d3";
import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";

// todo: make sure this correctly handles new props getting passed in, doesn't double bind events

function zoomTransformFromProps(props) {
  const { zoomScale, zoomX, zoomY } = props;
  return d3.zoomIdentity
    .translate(zoomX || 0, zoomY || 0)
    .scale(zoomScale || 1);
}

/**
 * `ZoomContainer` is a wrapper that gives users the ability to zoom in, zoom out and drag its children components.
 */
export default class ZoomContainer extends React.Component {
  static propTypes = {
    /**
     * (outer) width of the chart (SVG element).
     */
    width: PropTypes.number,
    /**
     * (outer) width of the chart (SVG element).
     */
    height: PropTypes.number,
    /**
     * Zoom callback function, called when zoom changes.
     * For controlled version of this component, you should update zoomX, zoomY and zoomScale props in this callback.
     */
    onZoom: PropTypes.func,
    /**
     * Boolean which determines whether the component is "controlled" (true) or "stateful" (false).
     * When true, zoom transformation is controlled entirely by the `zoomX`, `zoomY` and `zoomScale` props, which
     * you are responsible for updating in the `onZoom` callback function.
     * When false, zoom transformation is handled by internal state, and the `zoomX`, `zoomY` and `zoomScale` props
     * specify only the initial X, Y and scale transformation of the component.
     */
    controlled: PropTypes.bool,
    /**
     * Disables wheel-driven zooming (say to not interfere with native scrolling).
     */
    disableMouseWheelZoom: PropTypes.bool,
    /**
     * The X-coordinate of the zoom transformation (or initial X-coordinate, if `controlled` is false).
     */
    zoomX: PropTypes.number,
    /**
     * The Y-coordinate of the zoom transformation (or initial Y-coordinate, if `controlled` is false).
     */
    zoomY: PropTypes.number,
    /**
     * The scaling factor of the zoom transformation (or initial scaling, if `controlled` is false).
     * 1.0 is normal size, 2.0 is double size, 0.5 is half size.
     */
    zoomScale: PropTypes.number,

    /**
     * Sets the viewport extent to the specified array of points [[x0, y0], [x1, y1]],
     * where [x0, y0] is the top-left corner of the viewport and [x1, y1] is the bottom-right corner of the viewport.
     * See d3-zoom docs for more information.
     */
    extent: PropTypes.array,
    /**
     * Sets the scale extent to the specified array of numbers [k0, k1]
     * where k0 is the minimum allowed scale factor and k1 is the maximum allowed scale factor.
     * See d3-zoom docs for more information.
     */
    scaleExtent: PropTypes.array,
    /**
     * Sets the translate extent to the specified array of points [[x0, y0], [x1, y1]],
     * where [x0, y0] is the top-left corner of the world and [x1, y1] is the bottom-right corner of the world.
     * See d3-zoom docs for more information.
     */
    translateExtent: PropTypes.array,
    /**
     * Sets the maximum distance that the mouse can move between mousedown and mouseup that will trigger
     * a subsequent click event.
     * See d3-zoom docs for more information.
     */
    clickDistance: PropTypes.number,
    /**
     * Sets the duration for zoom transitions on double-click and double-tap to the specified number of milliseconds.
     * See d3-zoom docs for more information.
     */
    duration: PropTypes.number,
    /**
     * Sets the interpolation factory for zoom transitions to the specified function.
     * See d3-zoom docs for more information.
     */
    interpolate: PropTypes.func,
    /**
     * Sets the transform constraint function to the specified function.
     * See d3-zoom docs for more information.
     */
    constrain: PropTypes.func,
    /**
     * Sets the zoom event filter to the specified function.
     * See d3-zoom docs for more information.
     */
    filter: PropTypes.func,
    /**
     * Sets the touch support detector to the specified function.
     * See d3-zoom docs for more information.
     */
    touchable: PropTypes.func,
    /**
     * Sets the wheel delta function to the specified function.
     * See d3-zoom docs for more information.
     */
    wheelDelta: PropTypes.func
  };
  static defaultProps = {
    width: 800,
    height: 600,
    controlled: false,
    disableMouseWheelZoom: false,
    zoomX: 0,
    zoomY: 0,
    zoomScale: 1
  };

  state = {
    lastZoomTransform: null,
    selection: null
  };

  _updateZoomProps(props) {
    if (!props) props = this.props;
    const {
      extent,
      scaleExtent,
      translateExtent,
      clickDistance,
      duration,
      interpolate,
      constrain,
      filter,
      touchable,
      wheelDelta
    } = props;

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
    const initialZoomTransform = zoomTransformFromProps(this.props);
    const selection = d3.select(this.refs.svg);

    this.zoom = d3.zoom();
    selection.call(this.zoom);

    if (this.props.disableMouseWheelZoom) {
      selection.call(this.zoom).on("wheel.zoom", null);
    } else {
      selection.call(this.zoom);
    }

    this.zoom.transform(selection, initialZoomTransform);
    this._updateZoomProps();
    this.zoom.on("zoom", this.handleZoom);

    this.setState({
      selection,
      lastZoomTransform: initialZoomTransform
    });
  }

  // React is deprecating componentWillReceiveProps, but it's pretty much necessary in this case
  // TODO: change to UNSAFE_componentWillReceiveProps when upgrading React
  componentWillReceiveProps(nextProps) {
    if (this.props.controlled) {
      // if controlled component and zoom props have changed, apply the new zoom props to d3-zoom
      // (unbind handler first so as not to create infinite callback loop)
      const hasChangedZoom =
        nextProps.zoomX !== this.props.zoomX ||
        nextProps.zoomY !== this.props.zoomY ||
        nextProps.zoomScale !== this.props.zoomScale;

      if (hasChangedZoom) {
        this.zoom.on("zoom", null);
        const nextZoomTransform = zoomTransformFromProps(nextProps);
        this.zoom.transform(this.state.selection, nextZoomTransform);
        this.zoom.on("zoom", this.handleZoom);

        // update state.lastZoomTransform so we can revert d3-zoom to this next time it's changed internally
        this.setState({ lastZoomTransform: nextZoomTransform });
      }
    }
    this._updateZoomProps(nextProps);
  }

  handleZoom = (...args) => {
    const nextZoomTransform = d3.event.transform;

    if (this.props.controlled) {
      // zoom transform should be controlled by props, but d3-zoom has already applied new transform to this.zoom
      // (even though props haven't changed), so we must *undo* it by applying lastZoomTransform to this.zoom
      const { selection, lastZoomTransform } = this.state;

      // unbind zoom event first, so that manually setting transform doesn't trigger handleZoom infinite loop
      this.zoom.on("zoom", null);
      this.zoom.transform(selection, lastZoomTransform);
      this.zoom.on("zoom", this.handleZoom);
    } else {
      // *uncontrolled* (stateful) ZoomContainer, we want to keep the transform applied by d3-zoom;
      // but since the state is inside d3-zoom, we need to update something on this.state to trigger re-render
      this.setState({ zoomKey: Math.random() });
    }

    if (this.props.onZoom) this.props.onZoom(nextZoomTransform, ...args);
  };

  render() {
    const zoomTransform = this.refs.svg
      ? d3.zoomTransform(this.refs.svg)
      : null;

    return (
      <svg ref="svg" width={this.props.width} height={this.props.height}>
        <g
          width={this.props.width}
          height={this.props.height}
          transform={zoomTransform}
        >
          {this.props.children}
        </g>
      </svg>
    );
  }
}
