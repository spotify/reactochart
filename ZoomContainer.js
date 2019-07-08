"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var d3 = _interopRequireWildcard(require("d3"));

var _lodash = _interopRequireDefault(require("lodash"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// todo: make sure this correctly handles new props getting passed in, doesn't double bind events
function zoomTransformFromProps(props) {
  const {
    zoomScale,
    zoomX,
    zoomY
  } = props;
  return d3.zoomIdentity.translate(zoomX || 0, zoomY || 0).scale(zoomScale || 1);
}
/**
 * `ZoomContainer` is a wrapper that gives users the ability to zoom in, zoom out and drag its children components.
 */


class ZoomContainer extends _react.default.Component {
  constructor(..._args) {
    super(..._args);

    _defineProperty(this, "state", {
      lastZoomTransform: null,
      selection: null
    });

    _defineProperty(this, "handleZoom", (...args) => {
      const nextZoomTransform = d3.event.transform;

      if (this.props.controlled) {
        // zoom transform should be controlled by props, but d3-zoom has already applied new transform to this.zoom
        // (even though props haven't changed), so we must *undo* it by applying lastZoomTransform to this.zoom
        const {
          selection,
          lastZoomTransform
        } = this.state; // unbind zoom event first, so that manually setting transform doesn't trigger handleZoom infinite loop

        this.zoom.on("zoom", null);
        this.zoom.transform(selection, lastZoomTransform);
        this.zoom.on("zoom", this.handleZoom);
      } else {
        // *uncontrolled* (stateful) ZoomContainer, we want to keep the transform applied by d3-zoom;
        // but since the state is inside d3-zoom, we need to update something on this.state to trigger re-render
        this.setState({
          zoomKey: Math.random()
        });
      }

      if (this.props.onZoom) this.props.onZoom(nextZoomTransform, ...args);
    });
  }

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
    if (_lodash.default.isArray(extent)) this.zoom.extent(extent);
    if (_lodash.default.isArray(scaleExtent)) this.zoom.scaleExtent(scaleExtent);
    if (_lodash.default.isArray(translateExtent)) this.zoom.translateExtent(translateExtent);
    if (_lodash.default.isFinite(clickDistance)) this.zoom.clickDistance(clickDistance);
    if (_lodash.default.isFinite(duration)) this.zoom.duration(duration);
    if (_lodash.default.isFunction(interpolate)) this.zoom.interpolate(interpolate);
    if (_lodash.default.isFunction(constrain)) this.zoom.constrain(constrain);
    if (_lodash.default.isFunction(filter)) this.zoom.filter(filter);
    if (_lodash.default.isFunction(touchable)) this.zoom.touchable(touchable);
    if (_lodash.default.isFunction(wheelDelta)) this.zoom.wheelDelta(wheelDelta);
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
  } // React is deprecating componentWillReceiveProps, but it's pretty much necessary in this case
  // TODO: change to UNSAFE_componentWillReceiveProps when upgrading React


  componentWillReceiveProps(nextProps) {
    if (this.props.controlled) {
      // if controlled component and zoom props have changed, apply the new zoom props to d3-zoom
      // (unbind handler first so as not to create infinite callback loop)
      const hasChangedZoom = nextProps.zoomX !== this.props.zoomX || nextProps.zoomY !== this.props.zoomY || nextProps.zoomScale !== this.props.zoomScale;

      if (hasChangedZoom) {
        this.zoom.on("zoom", null);
        const nextZoomTransform = zoomTransformFromProps(nextProps);
        this.zoom.transform(this.state.selection, nextZoomTransform);
        this.zoom.on("zoom", this.handleZoom); // update state.lastZoomTransform so we can revert d3-zoom to this next time it's changed internally

        this.setState({
          lastZoomTransform: nextZoomTransform
        });
      }
    }

    this._updateZoomProps(nextProps);
  }

  render() {
    const zoomTransform = this.refs.svg ? d3.zoomTransform(this.refs.svg) : null;
    return _react.default.createElement("svg", {
      ref: "svg",
      width: this.props.width,
      height: this.props.height
    }, _react.default.createElement("g", {
      width: this.props.width,
      height: this.props.height,
      transform: zoomTransform
    }, this.props.children));
  }

}

exports.default = ZoomContainer;

_defineProperty(ZoomContainer, "propTypes", {
  /**
   * (outer) width of the chart (SVG element).
   */
  width: _propTypes.default.number,

  /**
   * (outer) width of the chart (SVG element).
   */
  height: _propTypes.default.number,

  /**
   * Zoom callback function, called when zoom changes.
   * For controlled version of this component, you should update zoomX, zoomY and zoomScale props in this callback.
   */
  onZoom: _propTypes.default.func,

  /**
   * Boolean which determines whether the component is "controlled" (true) or "stateful" (false).
   * When true, zoom transformation is controlled entirely by the `zoomX`, `zoomY` and `zoomScale` props, which
   * you are responsible for updating in the `onZoom` callback function.
   * When false, zoom transformation is handled by internal state, and the `zoomX`, `zoomY` and `zoomScale` props
   * specify only the initial X, Y and scale transformation of the component.
   */
  controlled: _propTypes.default.bool,

  /**
   * Disables wheel-driven zooming (say to not interfere with native scrolling).
   */
  disableMouseWheelZoom: _propTypes.default.bool,

  /**
   * The X-coordinate of the zoom transformation (or initial X-coordinate, if `controlled` is false).
   */
  zoomX: _propTypes.default.number,

  /**
   * The Y-coordinate of the zoom transformation (or initial Y-coordinate, if `controlled` is false).
   */
  zoomY: _propTypes.default.number,

  /**
   * The scaling factor of the zoom transformation (or initial scaling, if `controlled` is false).
   * 1.0 is normal size, 2.0 is double size, 0.5 is half size.
   */
  zoomScale: _propTypes.default.number,

  /**
   * Sets the viewport extent to the specified array of points [[x0, y0], [x1, y1]],
   * where [x0, y0] is the top-left corner of the viewport and [x1, y1] is the bottom-right corner of the viewport.
   * See d3-zoom docs for more information.
   */
  extent: _propTypes.default.array,

  /**
   * Sets the scale extent to the specified array of numbers [k0, k1]
   * where k0 is the minimum allowed scale factor and k1 is the maximum allowed scale factor.
   * See d3-zoom docs for more information.
   */
  scaleExtent: _propTypes.default.array,

  /**
   * Sets the translate extent to the specified array of points [[x0, y0], [x1, y1]],
   * where [x0, y0] is the top-left corner of the world and [x1, y1] is the bottom-right corner of the world.
   * See d3-zoom docs for more information.
   */
  translateExtent: _propTypes.default.array,

  /**
   * Sets the maximum distance that the mouse can move between mousedown and mouseup that will trigger
   * a subsequent click event.
   * See d3-zoom docs for more information.
   */
  clickDistance: _propTypes.default.number,

  /**
   * Sets the duration for zoom transitions on double-click and double-tap to the specified number of milliseconds.
   * See d3-zoom docs for more information.
   */
  duration: _propTypes.default.number,

  /**
   * Sets the interpolation factory for zoom transitions to the specified function.
   * See d3-zoom docs for more information.
   */
  interpolate: _propTypes.default.func,

  /**
   * Sets the transform constraint function to the specified function.
   * See d3-zoom docs for more information.
   */
  constrain: _propTypes.default.func,

  /**
   * Sets the zoom event filter to the specified function.
   * See d3-zoom docs for more information.
   */
  filter: _propTypes.default.func,

  /**
   * Sets the touch support detector to the specified function.
   * See d3-zoom docs for more information.
   */
  touchable: _propTypes.default.func,

  /**
   * Sets the wheel delta function to the specified function.
   * See d3-zoom docs for more information.
   */
  wheelDelta: _propTypes.default.func
});

_defineProperty(ZoomContainer, "defaultProps", {
  width: 800,
  height: 600,
  controlled: false,
  disableMouseWheelZoom: false,
  zoomX: 0,
  zoomY: 0,
  zoomScale: 1
});
//# sourceMappingURL=ZoomContainer.js.map