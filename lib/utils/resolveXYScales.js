'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = resolveXYScales;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d = require('d3');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _Data = require('./Data');

var _Scale = require('./Scale');

var _Margin = require('./Margin');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * `resolveXYScales` is a higher-order-component.
 *
 * @param {Component} Component - The React Component (class) which should be wrapped by this HOC
 * @returns {Component} - A Component which auto-resolves XY scales from given props
*/

var errs = {
  getDomain: function getDomain(C) {
    return 'Components enhanced by resolveXYScales must have a static getDomain method, ' + componentName(C) + ' does not have one';
  }
};
function componentName(Component) {
  return Component.displayName || "Component wrapped by resolveXYScales";
}
function hasScaleFor(scalesObj, key) {
  return _lodash2.default.isObject(scalesObj) && (0, _Scale.isValidScale)(scalesObj[key]);
}
function hasPaddingFor(paddingObj, key) {
  return _lodash2.default.isObject(paddingObj) && _lodash2.default.isNumber(paddingObj[key]);
}
function hasXYScales(scale) {
  return _lodash2.default.isObject(scale) && (0, _Scale.isValidScale)(scale.x) && (0, _Scale.isValidScale)(scale.y);
}
function hasXYDomains(domain) {
  return _lodash2.default.isObject(domain) && (0, _Data.isValidDomain)(domain.x) && (0, _Data.isValidDomain)(domain.y);
}
function hasXYScaleTypes(scaleType) {
  return _lodash2.default.isObject(scaleType) && _lodash2.default.isString(scaleType.x) && _lodash2.default.isString(scaleType.y);
}
function hasAllMargins(margin) {
  var marginKeys = ['top', 'bottom', 'left', 'right'];
  return _lodash2.default.isObject(margin) && _lodash2.default.every(marginKeys, function (k) {
    return _lodash2.default.has(margin, k);
  });
}
function hasAllSpacing(spacing) {
  var spacingKeys = ['top', 'bottom', 'left', 'right'];
  return _lodash2.default.isObject(spacing) && _lodash2.default.every(spacingKeys, function (k) {
    return _lodash2.default.has(spacing, k);
  });
}

function mapOverChildren(children, iteratee) {
  for (var _len = arguments.length, iterateeArgs = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    iterateeArgs[_key - 2] = arguments[_key];
  }

  // loop over all children (react elements) and call iteratee (a function) on each one
  // iteratee is called with parameters (child.props, child.type, ...iterateeArgs)
  if (!_lodash2.default.isFunction(iteratee)) throw new Error('mapOverChildren iteratee must be a function');

  return _lodash2.default.compact(_react2.default.Children.map(children, function (child) {
    if (!child || !_react2.default.isValidElement(child)) return null;
    return iteratee.apply(undefined, [child.props, child.type].concat(iterateeArgs));
  }));
}
function omitNullUndefined(obj) {
  return _lodash2.default.omitBy(obj, function (v) {
    return _lodash2.default.isUndefined(v) || _lodash2.default.isNull(v);
  });
}

// not currently being used but potentially has some learnings
// function resolveXYPropsOnComponentOrChildren(propKeys, props, reducers = {}, validators = {}, result = {}) {
//   const isDone = (o) => (_.every(propKeys, k => _.isObject(o[k]) && _.every(['x', 'y'], xy => _.has(o[k][xy]))));
//   result = _.pick({...props, ...result}, propKeys);

//   let resolved = {};
//   _.forEach(propKeys, propKey => {
//     _.forEach(['x', 'y'], k => {
//       const isValid = validators[propKey] || (() => true);
//       if(_.isObject(props[propKey]) && _.has(props[propKey], k) && isValid(props[propKey][k])) {
//         if(!_.has(result, propKey)) result[propKey] = {};
//         result[propKey][k] = props[propKey][k];
//       }
//     });
//   });

//   if(isDone(result)) return result;

//   if(React.Children.count(props.children)) {
//     let childProps = mapOverChildren(props.children, resolveXYPropsOnComponentOrChildren, propKeys, 'props', result);
//     React.Children.forEach(props.children, child => {
//       if(!child) return;
//       childProps.push(resolveXYPropsOnComponentOrChildren(propKeys, child.props, result));
//     });
//       let childDomains = [];
//       React.Children.forEach(props.children, child => {
//         childDomains = childDomains.concat(this._resolveDomain(child.props, child.type, scaleType));
//       });

//       console.log('combining domains', childDomains);
//       const childDomain =  _.fromPairs(['x', 'y'].map(k => {
//         console.log(_.compact(_.map(childDomains, k)), scaleType[k]);
//         const kDomain = combineDomains(_.compact(_.map(childDomains, k)), dataTypeFromScaleType(scaleType[k]));
//         console.log(kDomain);
//         return [k, kDomain];
//       }));
//       console.log('combined domains', childDomain);

//       domain = _.assign(childDomain, domain);
//       return domain;
//   }

//   propKeys.forEach(k => {
//     result[propKeys] = props
//   })
// }


function resolveXYScales(ComposedComponent) {
  var _class, _temp2;

  return _temp2 = _class = function (_React$Component) {
    _inherits(_class, _React$Component);

    function _class() {
      var _ref;

      var _temp, _this, _ret;

      _classCallCheck(this, _class);

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = _class.__proto__ || Object.getPrototypeOf(_class)).call.apply(_ref, [this].concat(args))), _this), _this._makeScales = function (_ref2) {
        var width = _ref2.width,
            height = _ref2.height,
            _ref2$scaleType = _ref2.scaleType,
            scaleType = _ref2$scaleType === undefined ? {} : _ref2$scaleType,
            _ref2$domain = _ref2.domain,
            domain = _ref2$domain === undefined ? {} : _ref2$domain,
            _ref2$margin = _ref2.margin,
            margin = _ref2$margin === undefined ? {} : _ref2$margin,
            _ref2$scale = _ref2.scale,
            scale = _ref2$scale === undefined ? {} : _ref2$scale,
            _ref2$spacing = _ref2.spacing,
            spacing = _ref2$spacing === undefined ? {} : _ref2$spacing;
        var _this$props = _this.props,
            invertScale = _this$props.invertScale,
            nice = _this$props.nice,
            tickCount = _this$props.tickCount,
            ticks = _this$props.ticks;


        var innerChartWidth = (0, _Margin.innerWidth)(width, margin);
        var innerChartHeight = (0, _Margin.innerHeight)(height, margin);

        var range = {
          x: (0, _Margin.innerRangeX)(innerChartWidth, spacing).map(function (v) {
            return v - (spacing.left || 0);
          }),
          y: (0, _Margin.innerRangeY)(innerChartHeight, spacing).map(function (v) {
            return v - (spacing.top || 0);
          })
        };
        //innerRange functions produce range (i.e. [5,20]) and map function normalizes to 0 (i.e. [0,15])

        return _lodash2.default.fromPairs(['x', 'y'].map(function (k) {
          // use existing scales if provided, otherwise create new
          if (hasScaleFor(scale, k)) return [k, scale[k]];

          // create scale from domain/range
          var kScale = (0, _Scale.initScale)(scaleType[k]).domain(domain[k]).range(range[k]);

          // todo - ticks, nice and getDomain should be an axis prop instead, and axis should have getDomain

          // set `nice` option to round scale domains to nicer numbers
          // const kTickCount = tickCount ? tickCount[k] : 10;
          // if(nice && nice[k] && _.isFunction(kScale.nice)) kScale.nice(kTickCount);

          // extend scale domain to include custom `ticks` if passed
          //
          // if(ticks[k]) {
          //   const dataType = dataTypeFromScaleType(scaleType[k]);
          //   const tickDomain = domainFromData(ticks[k], _.identity, dataType);
          //   kScale.domain(combineDomains([kScale.domain(), tickDomain]), dataType);
          // }

          // reverse scale domain if `invertScale` is passed
          // if(invertScale[k]) kScale.domain(kScale.domain().reverse());

          return [k, kScale];
        }));
      }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    // todo better way for HOC's to pass statics through?


    _createClass(_class, [{
      key: '_resolveScaleType',
      value: function _resolveScaleType(props, Component) {
        var propsScaleType = props.scaleType || {};

        // short-circuit if all scale types provided
        if (hasXYScaleTypes(propsScaleType)) return propsScaleType;

        // start with any scale types in props, try to resolve the rest
        var scaleType = omitNullUndefined(propsScaleType);

        // if Component provides a custom static getScaleType method
        // use it to determine remaining scale types
        if (_lodash2.default.isFunction(Component.getScaleType)) {
          var componentScaleType = omitNullUndefined(Component.getScaleType(props));
          scaleType = _lodash2.default.assign(componentScaleType, scaleType);
          if (hasXYScaleTypes(scaleType)) return scaleType;
        }

        // todo infer scaleType from domain?
        // if component has domain props,
        // infer the data type, & use that to get scale type
        if (_lodash2.default.isObject(props.domain) && ((0, _Data.isValidDomain)(props.domain.x) || (0, _Data.isValidDomain)(props.domain.y))) {
          // console.log('inferring scale type from domain');
          var domainScaleType = _lodash2.default.fromPairs(['x', 'y'].map(function (k) {
            var domain = props.domain[k];
            return (0, _Data.isValidDomain)(domain) ? [k, (0, _Scale.scaleTypeFromDataType)((0, _Scale.inferDataTypeFromDomain)(domain))] : [k, undefined];
          }));
          scaleType = _lodash2.default.assign(domainScaleType, scaleType);
          if (hasXYScaleTypes(scaleType)) return scaleType;
        }

        // if Component has data or datasets props,
        // infer the data type, & use that to get scale type
        if (_lodash2.default.isArray(props.data) || _lodash2.default.isArray(props.datasets)) {
          var datasets = _lodash2.default.isArray(props.datasets) ? props.datasets : [props.data];
          var datasetScaleType = _lodash2.default.fromPairs(['x', 'y'].map(function (k) {
            // const kAccessor = makeAccessor(_.get(props, `getValue.${k}`));
            var kAccessor = (0, _Data.makeAccessor)(_lodash2.default.get(props, 'get' + k.toUpperCase()));
            var kDataType = (0, _Data.inferDatasetsType)(datasets, kAccessor);
            var kScaleType = (0, _Scale.scaleTypeFromDataType)(kDataType);
            return [k, kScaleType];
          }));

          scaleType = _lodash2.default.assign(datasetScaleType, scaleType);
          return scaleType;
        }

        // if Component has children,
        // recurse through descendants to resolve their scale types the same way
        if (_react2.default.Children.count(props.children)) {
          // console.log('get scaletype from children')
          var childScaleTypes = mapOverChildren(props.children, this._resolveScaleType.bind(this));

          var childScaleType = _lodash2.default.fromPairs(['x', 'y'].map(function (k) {
            // todo warn on multiple scale types, probably not what you want
            var kScaleTypes = _lodash2.default.compact(_lodash2.default.uniq(_lodash2.default.map(childScaleTypes, k)));
            var kScaleType = kScaleTypes.length === 1 ? kScaleTypes[0] : "ordinal";
            return [k, kScaleType];
          }));

          scaleType = _lodash2.default.assign(childScaleType, scaleType);
          return scaleType;
        }
      }
    }, {
      key: '_resolveDomain',
      value: function _resolveDomain(props, Component, scaleType) {
        var propsDomain = props.domain || {};

        // short-circuit if all domains provided
        if (hasXYDomains(propsDomain)) return { x: propsDomain.x, y: propsDomain.y };

        // start with any domains in props, and try to resolve the rest
        var domain = omitNullUndefined(propsDomain);

        // if Component provides a custom static getDomain method
        // use it to determine remaining domains
        if (_lodash2.default.isFunction(Component.getDomain)) {
          var componentDomain = omitNullUndefined(Component.getDomain(_extends({ scaleType: scaleType }, props)));
          domain = _lodash2.default.assign(componentDomain, domain);
          if (hasXYDomains(domain)) return domain;
        }

        // if Component has data or datasets props,
        // use the default domainFromDatasets function to determine a domain from them
        if (_lodash2.default.isArray(props.data) || _lodash2.default.isArray(props.datasets)) {
          var datasets = _lodash2.default.isArray(props.datasets) ? props.datasets : [props.data];
          var datasetDomain = _lodash2.default.fromPairs(['x', 'y'].map(function (k) {
            // const kAccessor = makeAccessor(_.get(props, `getValue.${k}`));
            var kAccessor = (0, _Data.makeAccessor)(_lodash2.default.get(props, 'get' + k.toUpperCase()));
            var dataType = (0, _Scale.dataTypeFromScaleType)(scaleType[k]);
            var kDomain = (0, _Data.domainFromDatasets)(datasets, kAccessor, dataType);
            return [k, kDomain];
          }));

          domain = _lodash2.default.assign(datasetDomain, domain);
          if (hasXYDomains(domain)) return domain;
        }

        // if Component has children,
        // recurse through descendants to resolve their domains the same way,
        // and combine them into a single domain, if there are multiple
        if (_react2.default.Children.count(props.children)) {
          var childDomains = mapOverChildren(props.children, this._resolveDomain.bind(this), scaleType);

          var childDomain = _lodash2.default.fromPairs(['x', 'y'].map(function (k) {
            var kDomain = (0, _Data.combineDomains)(_lodash2.default.compact(_lodash2.default.map(childDomains, k)), (0, _Scale.dataTypeFromScaleType)(scaleType[k]));
            return [k, kDomain];
          }));

          domain = _lodash2.default.assign(childDomain, domain);
          return domain;
        }
      }
    }, {
      key: '_resolveTickDomain',
      value: function _resolveTickDomain(props, Component, scaleType, domain, scale) {
        // todo resolve directly from ticks/tickCount props?
        if (_lodash2.default.isFunction(Component.getTickDomain)) {
          return omitNullUndefined(Component.getTickDomain(_extends({ scaleType: scaleType, domain: domain, scale: scale }, props)));
        }

        if (_react2.default.Children.count(props.children)) {
          var childTickDomains = mapOverChildren(props.children, this._resolveTickDomain.bind(this), scaleType, domain, scale);

          var tickDomain = _lodash2.default.fromPairs(['x', 'y'].map(function (k) {
            var kChildTickDomains = _lodash2.default.compact(childTickDomains.map(function (v) {
              return _lodash2.default.get(v, k);
            }));
            var kTickDomain = kChildTickDomains.length ? (0, _Data.combineDomains)(kChildTickDomains, (0, _Scale.dataTypeFromScaleType)(scaleType[k])) : undefined;
            return [k, kTickDomain];
          }));
          return omitNullUndefined(tickDomain);
        }
      }
    }, {
      key: '_resolveLabels',
      value: function _resolveLabels(props) {}
    }, {
      key: '_resolveSpacing',
      value: function _resolveSpacing(props, Component, scaleType, domain, scale) {
        var propsSpacing = props.spacing || {};

        // short-circuit if all spacings provided
        if (hasAllSpacing(propsSpacing)) return propsSpacing;

        var spacing = omitNullUndefined(propsSpacing);

        if (_lodash2.default.isFunction(Component.getSpacing)) {
          var componentSpacing = omitNullUndefined(Component.getSpacing(_extends({ scaleType: scaleType, domain: domain, scale: scale }, props)));
          spacing = _lodash2.default.assign(componentSpacing, spacing);
          if (hasAllSpacing(spacing)) return spacing;
        }

        // if Component has children,
        // recurse through descendants to resolve their spacings the same way,
        // and combine them into a single spacing, if there are multiple
        if (_react2.default.Children.count(props.children)) {
          var childSpacings = mapOverChildren(props.children, this._resolveSpacing.bind(this), scaleType, domain, scale);

          var childSpacing = (0, _Data.combineBorderObjects)(childSpacings);

          spacing = _lodash2.default.assign(childSpacing, spacing);
        }
        return spacing;
      }
    }, {
      key: '_resolveMargin',
      value: function _resolveMargin(props, Component, scaleType, domain, scale) {
        var propsMargin = props.margin || {};

        // short-circuit if all margins provided
        if (hasAllMargins(propsMargin)) return propsMargin;

        // start with any margins in props, and try to resolve the rest
        var margin = omitNullUndefined(propsMargin);

        // if Component provides a custom static getMargin method
        // use it to determine remaining domains
        if (_lodash2.default.isFunction(Component.getMargin)) {
          var componentMargin = omitNullUndefined(Component.getMargin(_extends({ scaleType: scaleType, domain: domain, scale: scale }, props)));
          margin = _lodash2.default.assign(componentMargin, margin);
          if (hasAllMargins(margin)) return margin;
        }

        // if Component has children,
        // recurse through descendants to resolve their margins the same way,
        // and combine them into a single margin, if there are multiple
        if (_react2.default.Children.count(props.children)) {
          var childMargins = mapOverChildren(props.children, this._resolveMargin.bind(this), scaleType, domain, scale);

          // console.log('combining child margins', childMargins);
          var childMargin = (0, _Data.combineBorderObjects)(childMargins);

          margin = _lodash2.default.assign(childMargin, margin);
        }
        return margin;
      }
    }, {
      key: 'render',
      value: function render() {
        var props = this.props;
        var width = props.width,
            height = props.height,
            invertScale = props.invertScale;

        var scaleFromProps = this.props.scale || {};

        // short-circuit if scales provided
        // todo warn/throw if bad scales are passed
        if (hasXYScales(scaleFromProps)) return _react2.default.createElement(ComposedComponent, this.props);

        // scales not provided, so we have to resolve them
        // first resolve scale types and domains
        var scaleType = this._resolveScaleType(props, ComposedComponent);
        var domain = this._resolveDomain(props, ComposedComponent, scaleType);
        if (_lodash2.default.isObject(invertScale)) {
          ['x', 'y'].forEach(function (k) {
            if (invertScale[k]) domain[k] = domain[k].slice().reverse();
          });
        }

        var scaleOptions = { width: width, height: height, scaleType: scaleType, domain: domain, margin: props.margin, scale: props.scale, padding: props.padding, spacing: props.spacing };
        // create a temporary scale with size & domain, which may be used by the Component to calculate margin/tickDomain
        // (eg. to create and measure labels for the scales)
        var tempScale = this._makeScales(scaleOptions);

        // getTickDomain gives children the opportunity to modify the domain to include their scale ticks
        // (can't happen in getDomain, because it can't be done until the base domain/tempScale has been created)
        //nice-ing happens in the getTickDomain function inside of _resolveTickDomain
        var tickDomain = this._resolveTickDomain(props, ComposedComponent, scaleType, domain, tempScale);
        if (_lodash2.default.isObject(tickDomain)) {
          ['x', 'y'].forEach(function (k) {
            var dataType = (0, _Scale.dataTypeFromScaleType)(scaleType[k]);
            if ((0, _Data.isValidDomain)(tickDomain[k], dataType)) domain[k] = (0, _Data.combineDomains)([domain[k], tickDomain[k]], dataType);
          });
        }
        // update tempScale to use new domain before creating margins
        tempScale = this._makeScales(scaleOptions);

        // then resolve the margins
        var margin = _lodash2.default.defaults(this._resolveMargin(props, ComposedComponent, scaleType, domain, tempScale), { top: 0, bottom: 0, left: 0, right: 0 });

        var spacing = _lodash2.default.defaults(this._resolveSpacing(props, ComposedComponent, scaleType, domain, tempScale), { top: 0, bottom: 0, left: 0, right: 0 });

        // create real scales from resolved margins
        scaleOptions = _extends({}, scaleOptions, { margin: margin, spacing: spacing });
        var scale = this._makeScales(scaleOptions);

        var passedProps = _lodash2.default.assign({}, this.props, { scale: scale, scaleType: scaleType, margin: margin, domain: domain, spacing: spacing });
        return _react2.default.createElement(ComposedComponent, passedProps);

        // todo spacing/padding
        // todo includeZero
        // todo purerender/shouldcomponentupdate?
        // todo resolve margins if scales are present
        // todo use zero for any margins which can't be resolved
        // todo throw if cannot resolve scaleType
        // todo throw if cannot resolve domain
        // todo check to make sure margins didn't change after scales resolved?
      }
    }]);

    return _class;
  }(_react2.default.Component), _class.defaultProps = _lodash2.default.defaults(ComposedComponent.defaultProps, {
    invertScale: { x: false, y: false }
  }), _class.getScaleType = ComposedComponent.getScaleType, _class.getSpacing = ComposedComponent.getSpacing, _class.getDomain = ComposedComponent.getDomain, _class.getMargin = ComposedComponent.getMargin, _temp2;
}
//# sourceMappingURL=resolveXYScales.js.map