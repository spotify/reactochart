'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = resolveObjectProps;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _depthEqual = require('./depthEqual');

var _depthEqual2 = _interopRequireDefault(_depthEqual);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * `resolveObjectProps` is a higher-order-component.
 * It wraps Components which expect some object props of a certain shape, eg. {a,b,c}.
 *
 * It allows those props to be passed normally as an object like `{a: 5, b: [2], c: 'foo'}`,
 * or as an incompletely specified object like `{a: 5}`
 *   -> the specified value will be used and the missing values will be filled from defaultProps object
 * or as a single value like `5`
 *   -> an object with be created with all expected keys equal to this value (`{a: 5, b: 5, c: 5}`)
 * or not passed at all
 *   -> defaultProps will be used normally
 *
 * Note that the Component must specify defaultProps for defaults to be resolved correctly.
 *
 * @example
 * class BoxThing extends React.Component {...}
 * export default resolveObjectProps(BoxThing, ['margin', 'padding'], ['top', 'left', 'bottom', 'right']);
 * // then you can use <BoxThing> with incompletely specified props:
 * render() { return <BoxThing margin={5} padding={top: 10, bottom: 20} />; }
 *
 * @param {Component} Component - The React Component (class) which should be wrapped by this HOC
 * @param {string[]} propKeys - A list of keys for all the object props it is expected to resolve.
 * @param {string[]} objKeys - A list of keys for which values will be resolved on each object prop (object shape).
 * @returns {Component} - A Component which auto-resolves the specified object props.
 */

var errs = {
  badDefault: function badDefault(Component, key, objKeys) {
    return 'Bad defaultProp in ' + componentName(Component) + ': Prop \'' + key + '\' is expected to be a ' + ('{' + objKeys.join(',') + '}-shaped object, but it has a defaultProp which is not this shape.');
  }
};
function componentName(Component) {
  return Component.displayName || "Component wrapped by resolveObjectProps";
}

function hasSome(obj, keys) {
  return _lodash2.default.isObject(obj) && _lodash2.default.some(keys, function (k) {
    return _lodash2.default.has(obj, k);
  });
}
function hasAll(obj, keys) {
  return _lodash2.default.isObject(obj) && _lodash2.default.every(keys, function (k) {
    return _lodash2.default.has(obj, k);
  });
}

function resolveProp(prop, objKeys, defaultProp) {
  // pass through objects which are already fully specified
  if (hasAll(prop, objKeys)) return prop;
  // for partially specified objects, use default for the other (unspecified) values
  if (hasSome(prop, objKeys)) return _lodash2.default.defaults(prop, defaultProp);
  // for single values, create an object with the same value for each expected key
  return _lodash2.default.isUndefined(prop) ? defaultProp :
  // for undefined prop values, return the entire defaultProp
  _lodash2.default.fromPairs(objKeys.map(function (k) {
    return [k, prop];
  }));
}

function resolveObjectProps(ComposedComponent, propKeys, objKeys) {
  var _class, _temp;

  return _temp = _class = function (_React$Component) {
    _inherits(_class, _React$Component);

    function _class() {
      _classCallCheck(this, _class);

      return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
    }

    _createClass(_class, [{
      key: 'shouldComponentUpdate',

      // attach static reference to default props so that we can compose multiple resolveObjectProps wrappers,
      // but don't call it defaultProps, to avoid actually triggering the default behavior
      value: function shouldComponentUpdate(nextProps) {
        // 2-level-deep object compare for props which we expect to be objects
        // so that parent can pass object literals efficiently
        // shallow compare for all other props


        // todo fix this????
        // broken for InteractiveLineExample, maybe for anything with children?
        return true;

        var shouldUpdate = !((0, _depthEqual2.default)(_lodash2.default.omit(this.props, propKeys), _lodash2.default.omit(this.props, propKeys), 1) && (0, _depthEqual2.default)(_lodash2.default.pick(this.props, propKeys), _lodash2.default.pick(nextProps, propKeys), 2));
        console.log('resolveObjectProps shouldComponentUpdate', shouldUpdate);
        return shouldUpdate;
      }
    }, {
      key: 'render',
      value: function render() {
        var _this2 = this;

        var defaultProps = ComposedComponent.defaultProps || ComposedComponent._defaultProps || {};

        var resolvedProps = _lodash2.default.fromPairs(propKeys.map(function (k) {
          (0, _invariant2.default)( // ensure ComposedComponent has undefined or good default for each prop
          _lodash2.default.isUndefined(defaultProps[k]) || _lodash2.default.isObject(defaultProps[k]), errs.badDefault(ComposedComponent, k, objKeys));

          var resolved = resolveProp(_this2.props[k], objKeys, defaultProps[k]);
          return [k, resolved];
        }));

        var props = _lodash2.default.assign({}, this.props, resolvedProps);
        return _react2.default.createElement(ComposedComponent, props);
      }
    }]);

    return _class;
  }(_react2.default.Component), _class._defaultProps = ComposedComponent.defaultProps, _class.getScaleType = ComposedComponent.getScaleType, _class.getDomain = ComposedComponent.getDomain, _class.getMargin = ComposedComponent.getMargin, _temp;
}