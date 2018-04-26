"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _d = require("d3");

var d3 = _interopRequireWildcard(_d);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// todo: make sure this correctly handles new props getting passed in, doesn't double bind events

function zoomTransformFromProps(props) {
  var zoomScale = props.zoomScale,
      zoomX = props.zoomX,
      zoomY = props.zoomY;

  return d3.zoomIdentity.translate(zoomX || 0, zoomY || 0).scale(zoomScale || 1);
}

var ZoomContainer = function (_React$Component) {
  _inherits(ZoomContainer, _React$Component);

  function ZoomContainer() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, ZoomContainer);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = ZoomContainer.__proto__ || Object.getPrototypeOf(ZoomContainer)).call.apply(_ref, [this].concat(args))), _this), _initialiseProps.call(_this), _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(ZoomContainer, [{
    key: "_updateZoomProps",
    value: function _updateZoomProps(props) {
      if (!props) props = this.props;
      var _props = props,
          extent = _props.extent,
          scaleExtent = _props.scaleExtent,
          translateExtent = _props.translateExtent,
          clickDistance = _props.clickDistance,
          duration = _props.duration,
          interpolate = _props.interpolate;
      var _props2 = props,
          constrain = _props2.constrain,
          filter = _props2.filter,
          touchable = _props2.touchable,
          wheelDelta = _props2.wheelDelta;


      if (_lodash2.default.isArray(extent)) this.zoom.extent(extent);
      if (_lodash2.default.isArray(scaleExtent)) this.zoom.scaleExtent(scaleExtent);
      if (_lodash2.default.isArray(translateExtent)) this.zoom.translateExtent(translateExtent);
      if (_lodash2.default.isFinite(clickDistance)) this.zoom.clickDistance(clickDistance);
      if (_lodash2.default.isFinite(duration)) this.zoom.duration(duration);
      if (_lodash2.default.isFunction(interpolate)) this.zoom.interpolate(interpolate);
      if (_lodash2.default.isFunction(constrain)) this.zoom.constrain(constrain);
      if (_lodash2.default.isFunction(filter)) this.zoom.filter(filter);
      if (_lodash2.default.isFunction(touchable)) this.zoom.touchable(touchable);
      if (_lodash2.default.isFunction(wheelDelta)) this.zoom.wheelDelta(wheelDelta);
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      var initialZoomTransform = zoomTransformFromProps(this.props);
      var selection = d3.select(this.refs.svg);

      this.zoom = d3.zoom();
      selection.call(this.zoom);
      this.zoom.transform(selection, initialZoomTransform);
      this._updateZoomProps();
      this.zoom.on("zoom", this.handleZoom);

      this.setState({
        selection: selection,
        lastZoomTransform: initialZoomTransform
      });
    }

    // React is deprecating componentWillReceiveProps, but it's pretty much necessary in this case
    // TODO: change to UNSAFE_componentWillReceiveProps when upgrading React

  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      if (this.props.controlled) {
        // if controlled component and zoom props have changed, apply the new zoom props to d3-zoom
        // (unbind handler first so as not to create infinite callback loop)
        var hasChangedZoom = nextProps.zoomX !== this.props.zoomX || nextProps.zoomY !== this.props.zoomY || nextProps.zoomScale !== this.props.zoomScale;

        if (hasChangedZoom) {
          this.zoom.on("zoom", null);
          var nextZoomTransform = zoomTransformFromProps(nextProps);
          this.zoom.transform(this.state.selection, nextZoomTransform);
          this.zoom.on("zoom", this.handleZoom);

          // update state.lastZoomTransform so we can revert d3-zoom to this next time it's changed internally
          this.setState({ lastZoomTransform: nextZoomTransform });
        }
      }
      this._updateZoomProps(nextProps);
    }
  }, {
    key: "render",
    value: function render() {
      var zoomTransform = this.refs.svg ? d3.zoomTransform(this.refs.svg) : null;

      return _react2.default.createElement(
        "svg",
        { ref: "svg", width: this.props.width, height: this.props.height },
        _react2.default.createElement(
          "g",
          {
            width: this.props.width,
            height: this.props.height,
            transform: zoomTransform
          },
          this.props.children
        )
      );
    }
  }]);

  return ZoomContainer;
}(_react2.default.Component);

ZoomContainer.propTypes = {
  /**
   * (outer) width of the chart (SVG element).
   */
  width: _propTypes2.default.number,
  /**
   * (outer) width of the chart (SVG element).
   */
  height: _propTypes2.default.number,
  /**
   * Zoom callback function, called when zoom changes.
   * For controlled version of this component, you should update zoomX, zoomY and zoomScale props in this callback.
   */
  onZoom: _propTypes2.default.func,
  /**
   * Boolean which determines whether the component is "controlled" (true) or "stateful" (false).
   * When true, zoom transformation is controlled entirely by the `zoomX`, `zoomY` and `zoomScale` props, which
   * you are responsible for updating in the `onZoom` callback function.
   * When false, zoom transformation is handled by internal state, and the `zoomX`, `zoomY` and `zoomScale` props
   * specify only the initial X, Y and scale transformation of the component.
   */
  controlled: _propTypes2.default.bool,
  /**
   * The X-coordinate of the zoom transformation (or initial X-coordinate, if `controlled` is false)
   */
  zoomX: _propTypes2.default.number,
  /**
   * The Y-coordinate of the zoom transformation (or initial Y-coordinate, if `controlled` is false)
   */
  zoomY: _propTypes2.default.number,
  /**
   * The scaling factor of the zoom transformation (or initial scaling, if `controlled` is false).
   * 1.0 is normal size, 2.0 is double size, 0.5 is half size.
   */
  zoomScale: _propTypes2.default.number,

  /**
   * Sets the viewport extent to the specified array of points [[x0, y0], [x1, y1]],
   * where [x0, y0] is the top-left corner of the viewport and [x1, y1] is the bottom-right corner of the viewport.
   * See d3-zoom docs for more information.
   */
  extent: _propTypes2.default.array,
  /**
   * Sets the scale extent to the specified array of numbers [k0, k1]
   * where k0 is the minimum allowed scale factor and k1 is the maximum allowed scale factor.
   * See d3-zoom docs for more information.
   */
  scaleExtent: _propTypes2.default.array,
  /**
   * Sets the translate extent to the specified array of points [[x0, y0], [x1, y1]],
   * where [x0, y0] is the top-left corner of the world and [x1, y1] is the bottom-right corner of the world.
   * See d3-zoom docs for more information.
   */
  translateExtent: _propTypes2.default.array,
  /**
   * Sets the maximum distance that the mouse can move between mousedown and mouseup that will trigger
   * a subsequent click event.
   * See d3-zoom docs for more information.
   */
  clickDistance: _propTypes2.default.number,
  /**
   * Sets the duration for zoom transitions on double-click and double-tap to the specified number of milliseconds.
   * See d3-zoom docs for more information.
   */
  duration: _propTypes2.default.number,
  /**
   * Sets the interpolation factory for zoom transitions to the specified function.
   * See d3-zoom docs for more information.
   */
  interpolate: _propTypes2.default.func,
  /**
   * Sets the transform constraint function to the specified function.
   * See d3-zoom docs for more information.
   */
  constrain: _propTypes2.default.func,
  /**
   * Sets the zoom event filter to the specified function.
   * See d3-zoom docs for more information.
   */
  filter: _propTypes2.default.func,
  /**
   * Sets the touch support detector to the specified function.
   * See d3-zoom docs for more information.
   */
  touchable: _propTypes2.default.func,
  /**
   * Sets the wheel delta function to the specified function.
   * See d3-zoom docs for more information.
   */
  wheelDelta: _propTypes2.default.func
};
ZoomContainer.defaultProps = {
  width: 800,
  height: 600,
  controlled: false,
  zoomX: 0,
  zoomY: 0,
  zoomScale: 1
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.state = {
    lastZoomTransform: null,
    selection: null
  };

  this.handleZoom = function () {
    var _props3;

    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var nextZoomTransform = d3.event.transform;

    if (_this2.props.controlled) {
      // zoom transform should be controlled by props, but d3-zoom has already applied new transform to this.zoom
      // (even though props haven't changed), so we must *undo* it by applying lastZoomTransform to this.zoom
      var _state = _this2.state,
          selection = _state.selection,
          lastZoomTransform = _state.lastZoomTransform;

      // unbind zoom event first, so that manually setting transform doesn't trigger handleZoom infinite loop

      _this2.zoom.on("zoom", null);
      _this2.zoom.transform(selection, lastZoomTransform);
      _this2.zoom.on("zoom", _this2.handleZoom);
    } else {
      // *uncontrolled* (stateful) ZoomContainer, we want to keep the transform applied by d3-zoom;
      // but since the state is inside d3-zoom, we need to update something on this.state to trigger re-render
      _this2.setState({ zoomKey: Math.random() });
    }

    if (_this2.props.onZoom) (_props3 = _this2.props).onZoom.apply(_props3, [nextZoomTransform].concat(args));
  };
};

exports.default = ZoomContainer;
//# sourceMappingURL=ZoomContainer.js.map