'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = resolveXYScales;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

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

function hasGoodXY(obj) {
  var isValid = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (v) {
    return !_lodash2.default.isUndefined(v);
  };

  return _lodash2.default.isObject(obj) && isValid(obj.x);
}

function mapStaticOnChildren(children, methodName) {
  var passProps = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  // returns the result of looping over all children and calling a static method on each one
  return _lodash2.default.compact(_react2.default.Children.map(children, function (child) {
    console.log(_lodash2.default.keys(child.type));
    return _lodash2.default.isFunction(child.type[methodName]) ? child.type[methodName](_extends({}, child.props, passProps)) : null;
  }));
}

function omitNullUndefined(obj) {
  return _lodash2.default.omitBy(obj, function (v) {
    return _lodash2.default.isUndefined(v) || _lodash2.default.isNull(v);
  });
}

function resolveXYPropsOnComponentOrChildren(propKeys, props) {
  var reducers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var validators = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var result = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  var isDone = function isDone(o) {
    return _lodash2.default.every(propKeys, function (k) {
      return _lodash2.default.isObject(o[k]) && _lodash2.default.every(['x', 'y'], function (xy) {
        return _lodash2.default.has(o[k][xy]);
      });
    });
  };
  result = _lodash2.default.pick(_extends({}, props, result), propKeys);

  var resolved = {};
  _lodash2.default.forEach(propKeys, function (propKey) {
    _lodash2.default.forEach(['x', 'y'], function (k) {
      var isValid = validators[propKey] || function () {
        return true;
      };
      if (_lodash2.default.isObject(props[propKey]) && _lodash2.default.has(props[propKey], k) && isValid(props[propKey][k])) {
        if (!_lodash2.default.has(result, propKey)) result[propKey] = {};
        result[propKey][k] = props[propKey][k];
      }
    });
  });

  if (isDone(result)) return result;

  if (_react2.default.Children.count(props.children)) {
    var childProps = [];
    _react2.default.Children.forEach(props.children, function (child) {
      if (!child) return;
      childProps.push(resolveXYPropsOnComponentOrChildren(propKeys, child.props, result));
    });

    // let childDomains = [];
    // React.Children.forEach(props.children, child => {
    //   childDomains = childDomains.concat(this._resolveDomain(child.props, child.type, scaleType));
    // });
    //
    // console.log('combining domains', childDomains);
    // const childDomain =  _.fromPairs(['x', 'y'].map(k => {
    //   console.log(_.compact(_.map(childDomains, k)), scaleType[k]);
    //   const kDomain = combineDomains(_.compact(_.map(childDomains, k)), dataTypeFromScaleType(scaleType[k]));
    //   console.log(kDomain);
    //   return [k, kDomain];
    // }));
    // console.log('combined domains', childDomain);
    //
    // domain = _.assign(childDomain, domain);
    // return domain;
  }

  propKeys.forEach(function (k) {
    result[propKeys] = props;
  });
}

function resolveXYScales(ComposedComponent) {
  var _class, _temp2;

  return _temp2 = _class = function (_React$Component) {
    _inherits(_class, _React$Component);

    function _class() {
      var _ref;

      var _temp, _this, _ret;

      _classCallCheck(this, _class);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
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
            scale = _ref2$scale === undefined ? {} : _ref2$scale;
        var _this$props = _this.props,
            invertScale = _this$props.invertScale,
            nice = _this$props.nice,
            tickCount = _this$props.tickCount,
            ticks = _this$props.ticks;

        var range = {
          x: (0, _Margin.innerRangeX)(width, margin).map(function (v) {
            return v - (margin.left || 0);
          }),
          y: (0, _Margin.innerRangeY)(height, margin).map(function (v) {
            return v - (margin.top || 0);
          })
        };
        // console.log(height, margin, innerRangeY(height, margin));


        // console.log('range', range);
        return _lodash2.default.fromPairs(['x', 'y'].map(function (k) {
          // use existing scales if provided, otherwise create new
          if (hasScaleFor(scale, k)) return [k, scale[k]];

          // create scale from domain/range
          var rangeMethod = scaleType[k] === 'ordinal' ? 'rangePoints' : 'range';
          var kScale = (0, _Scale.initScale)(scaleType[k]).domain(domain[k])[rangeMethod](range[k]);

          // todo - ticks, nice and getDomain should be an axis prop instead, and axis should have getDomain

          // set `nice` option to round scale domains to nicer numbers
          // if(nice[k] && _.isFunction(kScale.nice)) kScale.nice(tickCount[k] || 10);

          // extend scale domain to include custom `ticks` if passed
          //
          // if(ticks[k]) {
          //   const dataType = dataTypeFromScaleType(scaleType[k]);
          //   const tickDomain = domainFromData(ticks[k], _.identity, dataType);
          //   kScale.domain(combineDomains([kScale.domain(), tickDomain]), dataType);
          // }

          // reverse scale domain if `invertScale` is passed
          if (invertScale[k]) kScale.domain(kScale.domain().reverse());

          return [k, kScale];
        }));
      }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    // todo better way for HOC's to pass statics through?


    _createClass(_class, [{
      key: '_resolveScaleType',
      value: function _resolveScaleType(props, Component) {
        var _this2 = this;

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
          var childScaleTypes = [];
          _react2.default.Children.forEach(props.children, function (child) {
            if (!child) return;
            childScaleTypes.push(_this2._resolveScaleType(child.props, child.type));
          });
          // console.log('childScaleTypes', childScaleTypes);


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

      // _resolveTicks(props, Component) {
      //   const propsTicks = props.ticks || {};
      //   const hasTicksOrTickCount = (v, k) =>
      //     (_.isArray(_.get(v, `ticks.${k}`)) || _.isFinite(_.get(v, `tickCount.${k}`)));
      //   if(_.every(['x', 'y'], k => hasTicksOrTickCount(props)))
      //     return _.pick(props, ['tick', 'tickCount'])
      //
      // }


    }, {
      key: '_resolveDomain',
      value: function _resolveDomain(props, Component, scaleType) {
        var _this3 = this;

        var propsDomain = props.domain || {};

        // short-circuit if all domains provided
        if (hasXYDomains(propsDomain)) return propsDomain;

        // start with any domains in props, and try to resolve the rest
        var domain = omitNullUndefined(propsDomain);

        // if Component provides a custom static getDomain method
        // use it to determine remaining domains
        if (_lodash2.default.isFunction(Component.getDomain)) {
          var componentDomain = omitNullUndefined(Component.getDomain(_extends({ scaleType: scaleType }, props)));
          // console.log('Component.getDomain', componentDomain);
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
          // console.log('datasetDomain', datasetDomain);

          domain = _lodash2.default.assign(datasetDomain, domain);
          if (hasXYDomains(domain)) return domain;
        }

        // if Component has children,
        // recurse through descendants to resolve their domains the same way,
        // and combine them into a single domain, if there are multiple
        if (_react2.default.Children.count(props.children)) {
          var childDomains = [];
          _react2.default.Children.forEach(props.children, function (child) {
            if (!child) return;
            childDomains = childDomains.concat(_this3._resolveDomain(child.props, child.type, scaleType));
          });

          // console.log('combining domains', childDomains);
          var childDomain = _lodash2.default.fromPairs(['x', 'y'].map(function (k) {
            var kDomain = (0, _Data.combineDomains)(_lodash2.default.compact(_lodash2.default.map(childDomains, k)), (0, _Scale.dataTypeFromScaleType)(scaleType[k]));
            return [k, kDomain];
          }));
          // console.log('combined domains', childDomain);

          domain = _lodash2.default.assign(childDomain, domain);
          return domain;
        }
      }
    }, {
      key: '_resolveTickDomain',
      value: function _resolveTickDomain(props, Component, scaleType, domain, scale) {
        var _this4 = this;

        // todo resolve directly from ticks/tickCount props?
        if (_lodash2.default.isFunction(Component.getTickDomain)) {
          return omitNullUndefined(Component.getTickDomain(_extends({ scaleType: scaleType, domain: domain, scale: scale }, props)));
        }

        if (_react2.default.Children.count(props.children)) {
          var childTickDomains = [];
          _react2.default.Children.forEach(props.children, function (child) {
            if (!child) return;
            childTickDomains.push(_this4._resolveTickDomain(child.props, child.type, scaleType, domain, scale));
          });

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
      key: '_resolveMargin',
      value: function _resolveMargin(props, Component, scaleType, domain, scale) {
        var _this5 = this;

        var propsMargin = props.margin || {};

        // short-circuit if all margins provided
        if (hasAllMargins(propsMargin)) return propsMargin;

        // start with any margins in props, and try to resolve the rest
        var margin = omitNullUndefined(propsMargin);

        // if Component provides a custom static getMargin method
        // use it to determine remaining domains
        if (_lodash2.default.isFunction(Component.getMargin)) {
          var componentMargin = omitNullUndefined(Component.getMargin(_extends({ scaleType: scaleType, domain: domain, scale: scale }, props)));
          // console.log('Component.getMargin', componentMargin);
          margin = _lodash2.default.assign(componentMargin, margin);
          if (hasAllMargins(margin)) return margin;
        }

        // if Component has children,
        // recurse through descendants to resolve their margins the same way,
        // and combine them into a single margin, if there are multiple
        if (_react2.default.Children.count(props.children)) {
          var childMargins = [];
          _react2.default.Children.forEach(props.children, function (child) {
            if (!child) return;
            childMargins = childMargins.concat(_this5._resolveMargin(child.props, child.type, scaleType, domain, scale));
          });

          // console.log('combining child margins', childMargins);
          var childMargin = _lodash2.default.fromPairs(['top', 'bottom', 'left', 'right'].map(function (k) {
            // combine margins by taking the max value of each margin direction
            return [k, _lodash2.default.get(_lodash2.default.maxBy(childMargins, k), k)];
          }));
          // console.log('combined margins', childMargin);

          margin = _lodash2.default.assign(childMargin, margin);
        }
        return margin;
      }
    }, {
      key: 'render',
      value: function render() {
        // console.log('xyScales Props', this.props);
        var props = this.props;
        var width = props.width,
            height = props.height,
            nice = props.nice;

        var scaleFromProps = this.props.scale || {};

        // short-circuit if scales provided
        // todo warn/throw if bad scales are passed
        if (hasXYScales(scaleFromProps)) return _react2.default.createElement(ComposedComponent, this.props);

        // scales not provided, so we have to resolve them
        // first resolve scale types and domains
        var scaleType = this._resolveScaleType(props, ComposedComponent);
        var domain = this._resolveDomain(props, ComposedComponent, scaleType);
        // console.log('scaleType', scaleType);
        // console.log('domain ', domain);

        // create a temporary scale with size & domain, which may be used by the Component to calculate margin/tickDomain
        // (eg. to create and measure labels for the scales)
        var tempScale = this._makeScales({ width: width, height: height, scaleType: scaleType, domain: domain, margin: props.margin, scale: props.scale });

        // getTickDomain gives children the opportunity to modify the domain to include their scale ticks
        // (can't happen in getDomain, because it can't be done until the base domain/tempScale has been created)
        var tickDomain = this._resolveTickDomain(props, ComposedComponent, scaleType, domain, tempScale);
        if (_lodash2.default.isObject(tickDomain)) {
          ['x', 'y'].forEach(function (k) {
            var dataType = (0, _Scale.dataTypeFromScaleType)(scaleType[k]);
            if ((0, _Data.isValidDomain)(tickDomain[k], dataType)) domain[k] = (0, _Data.combineDomains)([domain[k], tickDomain[k]], dataType);
          });
        }
        // update tempScale to use new domain before creating margins
        tempScale = this._makeScales({ width: width, height: height, scaleType: scaleType, domain: domain, margin: props.margin, scale: props.scale });

        // then resolve the margins
        var margin = _lodash2.default.defaults(this._resolveMargin(props, ComposedComponent, scaleType, domain, tempScale), { top: 0, bottom: 0, left: 0, right: 0 });
        // console.log('margin', margin);

        // create real scales from resolved margins
        var scaleOptions = { scale: props.scale, width: width, height: height, scaleType: scaleType, domain: domain, margin: margin, nice: nice };
        // console.log('making scales', scaleOptions);
        var scale = _lodash2.default.isEqual(margin, props.margin) ? tempScale : // don't re-create scales if margin hasn't changed (ie. was passed in props)
        this._makeScales(scaleOptions);

        // and pass scales to wrapped component
        var passedProps = _lodash2.default.assign({}, this.props, { scale: scale, scaleType: scaleType, margin: margin, domain: domain });
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
    // nice: {x: true, y: true},
    // tickCount: {x: 10, y: 10},
    // ticks: {x: null, y: null}
  }), _class.getScaleType = ComposedComponent.getScaleType, _class.getDomain = ComposedComponent.getDomain, _class.getMargin = ComposedComponent.getMargin, _temp2;
}