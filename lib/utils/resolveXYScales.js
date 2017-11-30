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

function isValidScaleType(scaleType) {
  // todo: check against whitelist?
  return _lodash2.default.isString(scaleType);
}
function areValidScales(scales) {
  return _lodash2.default.every(scales, _Scale.isValidScale);
}
function areValidScaleTypes(scaleTypes) {
  return _lodash2.default.every(scaleTypes, isValidScaleType);
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
            xScaleType = _ref2.xScaleType,
            yScaleType = _ref2.yScaleType,
            xDomain = _ref2.xDomain,
            yDomain = _ref2.yDomain,
            xScale = _ref2.xScale,
            yScale = _ref2.yScale,
            marginTop = _ref2.marginTop,
            marginBottom = _ref2.marginBottom,
            marginLeft = _ref2.marginLeft,
            marginRight = _ref2.marginRight,
            spacingTop = _ref2.spacingTop,
            spacingBottom = _ref2.spacingBottom,
            spacingLeft = _ref2.spacingLeft,
            spacingRight = _ref2.spacingRight;

        var spacing = { top: spacingTop, bottom: spacingBottom, left: spacingLeft, right: spacingRight };
        var margin = { top: marginTop, bottom: marginBottom, left: marginLeft, right: marginRight };
        var innerChartWidth = (0, _Margin.innerWidth)(width, margin);
        var innerChartHeight = (0, _Margin.innerHeight)(height, margin);

        // use existing scales if provided, otherwise create new
        if (!(0, _Scale.isValidScale)(xScale)) {
          //innerRange functions produce range (i.e. [5,20]) and map function normalizes to 0 (i.e. [0,15])
          var xRange = (0, _Margin.innerRangeX)(innerChartWidth, spacing).map(function (v) {
            return v - (spacing.left || 0);
          });
          xScale = (0, _Scale.initScale)(xScaleType).domain(xDomain).range(xRange);
        }
        if (!(0, _Scale.isValidScale)(yScale)) {
          var yRange = (0, _Margin.innerRangeY)(innerChartHeight, spacing).map(function (v) {
            return v - (spacing.top || 0);
          });
          yScale = (0, _Scale.initScale)(yScaleType).domain(yDomain).range(yRange);
        }

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

        return { xScale: xScale, yScale: yScale };
      }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    // todo better way for HOC's to pass statics through?


    _createClass(_class, [{
      key: '_resolveScaleType',
      value: function _resolveScaleType(props, Component) {
        var xScaleType = props.xScaleType,
            yScaleType = props.yScaleType;


        var isDone = function isDone() {
          return areValidScaleTypes([xScaleType, yScaleType]);
        };

        // short-circuit if both scale types provided
        if (isDone()) return { xScaleType: xScaleType, yScaleType: yScaleType };

        // if Component provides a custom static getScaleType method
        // use it to determine remaining scale types
        if (_lodash2.default.isFunction(Component.getScaleType)) {
          var componentScaleTypes = omitNullUndefined(Component.getScaleType(props));

          var _$assign = _lodash2.default.assign(componentScaleTypes, omitNullUndefined({ xScaleType: xScaleType, yScaleType: yScaleType }));

          xScaleType = _$assign.xScaleType;
          yScaleType = _$assign.yScaleType;

          if (isDone()) return { xScaleType: xScaleType, yScaleType: yScaleType };
        }

        // if component has domain props,
        // infer the data type, & use that to get scale type
        if (!isValidScaleType(xScaleType) && (0, _Data.isValidDomain)(props.xDomain)) {
          xScaleType = (0, _Scale.scaleTypeFromDataType)((0, _Scale.inferDataTypeFromDomain)(props.xDomain));
        }
        if (!isValidScaleType(yScaleType) && (0, _Data.isValidDomain)(props.yDomain)) {
          yScaleType = (0, _Scale.scaleTypeFromDataType)((0, _Scale.inferDataTypeFromDomain)(props.yDomain));
        }
        if (isDone()) return { xScaleType: xScaleType, yScaleType: yScaleType };

        // if Component has data or datasets props,
        // infer the data type, & use that to get scale type
        if (_lodash2.default.isArray(props.data) || _lodash2.default.isArray(props.datasets)) {
          var datasets = _lodash2.default.isArray(props.datasets) ? props.datasets : [props.data];

          if (!isValidScaleType(xScaleType)) {
            xScaleType = (0, _Scale.scaleTypeFromDataType)((0, _Data.inferDatasetsType)(datasets, (0, _Data.makeAccessor2)(props.x)));
          }
          if (!isValidScaleType(yScaleType)) {
            yScaleType = (0, _Scale.scaleTypeFromDataType)((0, _Data.inferDatasetsType)(datasets, (0, _Data.makeAccessor2)(props.y)));
          }
          if (isDone()) return { xScaleType: xScaleType, yScaleType: yScaleType };
        }

        // if Component has children,
        // recurse through descendants to resolve their scale types the same way
        if (_react2.default.Children.count(props.children)) {
          var childrenScaleTypes = mapOverChildren(props.children, this._resolveScaleType.bind(this));

          if (!isValidScaleType(xScaleType)) {
            var childXScaleTypes = _lodash2.default.compact(_lodash2.default.uniq(childrenScaleTypes.map(function (childScaleTypes) {
              return childScaleTypes.xScaleType;
            })));
            if (!childXScaleTypes.length === 1) console.warn("Multiple children with different X scale types found - defaulting to 'ordinal'");
            xScaleType = childXScaleTypes.length === 1 ? childXScaleTypes[0] : "ordinal";
          }
          if (!isValidScaleType(yScaleType)) {
            var childYScaleTypes = _lodash2.default.compact(_lodash2.default.uniq(childrenScaleTypes.map(function (childScaleTypes) {
              return childScaleTypes.yScaleType;
            })));
            if (!childYScaleTypes.length === 1) console.warn("Multiple children with different Y scale types found - defaulting to 'ordinal'");
            yScaleType = childYScaleTypes.length === 1 ? childYScaleTypes[0] : "ordinal";
          }
        }

        if (!isDone()) console.warn('resolveXYScales was unable to resolve both scale types. xScaleType: ' + xScaleType + ', yScaleType: ' + yScaleType);

        return { xScaleType: xScaleType, yScaleType: yScaleType };
      }
    }, {
      key: '_resolveDomain',
      value: function _resolveDomain(props, Component, xScaleType, yScaleType) {
        var xDomain = props.xDomain,
            yDomain = props.yDomain;

        var xDataType = (0, _Scale.dataTypeFromScaleType)(xScaleType);
        var yDataType = (0, _Scale.dataTypeFromScaleType)(yScaleType);

        var isXDone = function isXDone() {
          return (0, _Data.isValidDomain)(xDomain, xDataType);
        };
        var isYDone = function isYDone() {
          return (0, _Data.isValidDomain)(yDomain, yDataType);
        };
        var isDone = function isDone() {
          return isXDone() && isYDone();
        };

        // short-circuit if all domains provided
        if (isDone()) return { xDomain: xDomain, yDomain: yDomain };

        // if Component provides a custom static getScaleType method
        // use it to determine remaining scale types
        if (_lodash2.default.isFunction(Component.getDomain)) {
          var _Component$getDomain = Component.getDomain(_extends({}, props, { xScaleType: xScaleType, yScaleType: yScaleType })),
              componentXDomain = _Component$getDomain.xDomain,
              componentYDomain = _Component$getDomain.yDomain;

          if (!isXDone() && componentXDomain && !(0, _Data.isValidDomain)(componentXDomain, xDataType)) console.warn('Component.getDomain returned an invalid domain for data type \'' + xDataType + '\': ' + componentXDomain + ' - ignoring');
          if (!isXDone() && (0, _Data.isValidDomain)(componentXDomain, xDataType)) xDomain = componentXDomain;

          if (!isYDone() && componentYDomain && !(0, _Data.isValidDomain)(componentYDomain, yDataType)) console.warn('Component.getDomain returned an invalid domain for data type \'' + yDataType + '\': ' + componentYDomain + ' - ignoring');
          if (!isYDone() && (0, _Data.isValidDomain)(componentYDomain, yDataType)) yDomain = componentYDomain;

          if (isDone()) return { xDomain: xDomain, yDomain: yDomain };
        }

        // if Component has data or datasets props,
        // use the default domainFromDatasets function to determine a domain from them
        if (_lodash2.default.isArray(props.data) || _lodash2.default.isArray(props.datasets)) {
          var datasets = _lodash2.default.isArray(props.datasets) ? props.datasets : [props.data];
          if (!isXDone()) {
            xDomain = (0, _Data.domainFromDatasets)(datasets, (0, _Data.makeAccessor2)(props.x), xDataType);
          }
          if (!isYDone()) {
            yDomain = (0, _Data.domainFromDatasets)(datasets, (0, _Data.makeAccessor2)(props.y), yDataType);
          }
          if (isDone()) return { xDomain: xDomain, yDomain: yDomain };
        }

        // if Component has children,
        // recurse through descendants to resolve their domains the same way,
        // and combine them into a single domain, if there are multiple
        if (_react2.default.Children.count(props.children)) {
          var childrenDomains = mapOverChildren(props.children, this._resolveDomain.bind(this), xScaleType, yScaleType);

          if (!isXDone()) {
            var childXDomains = _lodash2.default.compact(childrenDomains.map(function (childDomains) {
              return childDomains.xDomain;
            }));
            xDomain = (0, _Data.combineDomains)(childXDomains, xDataType);
          }
          if (!isYDone()) {
            var childYDomains = _lodash2.default.compact(childrenDomains.map(function (childDomains) {
              return childDomains.yDomain;
            }));
            yDomain = (0, _Data.combineDomains)(childYDomains, yDataType);
          }
        }

        if (!isDone()) console.warn('resolveXYScales was unable to resolve both domains. xDomain: ' + xDomain + ', yDomain: ' + yDomain);

        return { xDomain: xDomain, yDomain: yDomain };
      }
    }, {
      key: '_resolveTickDomain',
      value: function _resolveTickDomain(props, Component, _ref3) {
        var xScaleType = _ref3.xScaleType,
            yScaleType = _ref3.yScaleType,
            xDomain = _ref3.xDomain,
            yDomain = _ref3.yDomain,
            xScale = _ref3.xScale,
            yScale = _ref3.yScale;

        // todo resolve directly from ticks/tickCount props?
        if (_lodash2.default.isFunction(Component.getTickDomain)) {
          var componentTickDomains = Component.getTickDomain(_extends({ xScaleType: xScaleType, yScaleType: yScaleType, xDomain: xDomain, yDomain: yDomain, xScale: xScale, yScale: yScale }, props));
          return omitNullUndefined(componentTickDomains);
        }

        if (_react2.default.Children.count(props.children)) {
          var childrenTickDomains = mapOverChildren(props.children, this._resolveTickDomain.bind(this), { xScaleType: xScaleType, yScaleType: yScaleType, xDomain: xDomain, yDomain: yDomain, xScale: xScale, yScale: yScale });

          var childrenXTickDomains = _lodash2.default.compact(childrenTickDomains.map(function (childTickDomains) {
            return childTickDomains.xTickDomain;
          }));
          var xTickDomain = childrenXTickDomains.length ? (0, _Data.combineDomains)(childrenXTickDomains, (0, _Scale.dataTypeFromScaleType)(xScaleType)) : undefined;

          var childrenYTickDomains = _lodash2.default.compact(childrenTickDomains.map(function (childTickDomains) {
            return childTickDomains.yTickDomain;
          }));
          var yTickDomain = childrenYTickDomains.length ? (0, _Data.combineDomains)(childrenYTickDomains, (0, _Scale.dataTypeFromScaleType)(yScaleType)) : undefined;

          return omitNullUndefined({ xTickDomain: xTickDomain, yTickDomain: yTickDomain });
        }

        return {};
      }
    }, {
      key: '_resolveMargin',
      value: function _resolveMargin(props, Component, _ref4) {
        var xScaleType = _ref4.xScaleType,
            yScaleType = _ref4.yScaleType,
            xDomain = _ref4.xDomain,
            yDomain = _ref4.yDomain,
            xScale = _ref4.xScale,
            yScale = _ref4.yScale;
        var marginTop = props.marginTop,
            marginBottom = props.marginBottom,
            marginLeft = props.marginLeft,
            marginRight = props.marginRight;


        var isDone = function isDone() {
          return _lodash2.default.every([marginTop, marginBottom, marginLeft, marginRight], _lodash2.default.isNumber);
        };

        // short-circuit if all margins provided
        if (isDone()) return { marginTop: marginTop, marginBottom: marginBottom, marginLeft: marginLeft, marginRight: marginRight };

        // if Component provides a custom static getMargin method
        // use it to determine remaining domains
        if (_lodash2.default.isFunction(Component.getMargin)) {
          var componentMargin = omitNullUndefined(Component.getMargin(_extends({}, props, { xScaleType: xScaleType, yScaleType: yScaleType, xDomain: xDomain, yDomain: yDomain, xScale: xScale, yScale: yScale })));

          var _$assign2 = _lodash2.default.assign(componentMargin, omitNullUndefined({ marginTop: marginTop, marginBottom: marginBottom, marginLeft: marginLeft, marginRight: marginRight }));

          marginTop = _$assign2.marginTop;
          marginBottom = _$assign2.marginBottom;
          marginLeft = _$assign2.marginLeft;
          marginRight = _$assign2.marginRight;

          if (isDone()) return { marginTop: marginTop, marginBottom: marginBottom, marginLeft: marginLeft, marginRight: marginRight };
        }

        // if Component has children,
        // recurse through descendants to resolve their margins the same way,
        // and combine them into a single margin, if there are multiple
        if (_react2.default.Children.count(props.children)) {
          var childrenMargins = mapOverChildren(props.children, this._resolveMargin.bind(this), { xScaleType: xScaleType, yScaleType: yScaleType, xDomain: xDomain, yDomain: yDomain, xScale: xScale, yScale: yScale });

          // console.log('combining child margins', childMargins);
          var childrenMargin = (0, _Data.combineBorderObjects)(childrenMargins.map(function (childMargins) {
            return { top: childMargins.marginTop, bottom: childMargins.marginBottom, left: childMargins.marginLeft, right: childMargins.marginRight };
          }));

          marginTop = _lodash2.default.isUndefined(marginTop) ? childrenMargin.top : marginTop;
          marginBottom = _lodash2.default.isUndefined(marginBottom) ? childrenMargin.bottom : marginBottom;
          marginLeft = _lodash2.default.isUndefined(marginLeft) ? childrenMargin.left : marginLeft;
          marginRight = _lodash2.default.isUndefined(marginRight) ? childrenMargin.right : marginRight;
        }

        return { marginTop: marginTop, marginBottom: marginBottom, marginLeft: marginLeft, marginRight: marginRight };
      }
    }, {
      key: '_resolveSpacing',
      value: function _resolveSpacing(props, Component, _ref5) {
        var xScaleType = _ref5.xScaleType,
            yScaleType = _ref5.yScaleType,
            xDomain = _ref5.xDomain,
            yDomain = _ref5.yDomain,
            xScale = _ref5.xScale,
            yScale = _ref5.yScale;
        var spacingTop = props.spacingTop,
            spacingBottom = props.spacingBottom,
            spacingLeft = props.spacingLeft,
            spacingRight = props.spacingRight;


        var isDone = function isDone() {
          return _lodash2.default.every([spacingTop, spacingBottom, spacingLeft, spacingRight], _lodash2.default.isNumber);
        };

        // short-circuit if all spacing provided
        if (isDone()) return { spacingTop: spacingTop, spacingBottom: spacingBottom, spacingLeft: spacingLeft, spacingRight: spacingRight };

        // if Component provides a custom static getSpacing method
        // use it to determine remaining domains
        if (_lodash2.default.isFunction(Component.getSpacing)) {
          var componentSpacing = omitNullUndefined(Component.getSpacing(_extends({}, props, { xScaleType: xScaleType, yScaleType: yScaleType, xDomain: xDomain, yDomain: yDomain, xScale: xScale, yScale: yScale })));

          var _$assign3 = _lodash2.default.assign(componentSpacing, omitNullUndefined({ spacingTop: spacingTop, spacingBottom: spacingBottom, spacingLeft: spacingLeft, spacingRight: spacingRight }));

          spacingTop = _$assign3.spacingTop;
          spacingBottom = _$assign3.spacingBottom;
          spacingLeft = _$assign3.spacingLeft;
          spacingRight = _$assign3.spacingRight;

          if (isDone()) return { spacingTop: spacingTop, spacingBottom: spacingBottom, spacingLeft: spacingLeft, spacingRight: spacingRight };
        }

        // if Component has children,
        // recurse through descendants to resolve their spacings the same way,
        // and combine them into a single spacing, if there are multiple
        if (_react2.default.Children.count(props.children)) {
          var childrenSpacings = mapOverChildren(props.children, this._resolveSpacing.bind(this), { xScaleType: xScaleType, yScaleType: yScaleType, xDomain: xDomain, yDomain: yDomain, xScale: xScale, yScale: yScale });

          var childrenSpacing = (0, _Data.combineBorderObjects)(childrenSpacings.map(function (childSpacing) {
            return { top: childSpacing.spacingTop, bottom: childSpacing.spacingBottom, left: childSpacing.spacingLeft, right: childSpacing.spacingRight };
          }));

          spacingTop = _lodash2.default.isUndefined(spacingTop) ? childrenSpacing.top : spacingTop;
          spacingBottom = _lodash2.default.isUndefined(spacingBottom) ? childrenSpacing.bottom : spacingBottom;
          spacingLeft = _lodash2.default.isUndefined(spacingLeft) ? childrenSpacing.left : spacingLeft;
          spacingRight = _lodash2.default.isUndefined(spacingRight) ? childrenSpacing.right : spacingRight;
        }

        if (isDone()) return { spacingTop: spacingTop, spacingBottom: spacingBottom, spacingLeft: spacingLeft, spacingRight: spacingRight };
      }
    }, {
      key: 'render',
      value: function render() {
        var props = this.props;
        var width = props.width,
            height = props.height,
            invertXScale = props.invertXScale,
            invertYScale = props.invertYScale;

        // short-circuit if scales provided
        // todo warn/throw if bad scales are passed
        // todo also pass domain/scaleType/etc from scales??

        if ((0, _Scale.isValidScale)(props.xScale) && (0, _Scale.isValidScale)(props.yScale)) return _react2.default.createElement(ComposedComponent, this.props);

        // scales not provided, so we have to resolve them
        // first resolve scale types and domains
        // const scaleType = this._resolveScaleType(props, ComposedComponent);

        var _resolveScaleType2 = this._resolveScaleType(props, ComposedComponent),
            xScaleType = _resolveScaleType2.xScaleType,
            yScaleType = _resolveScaleType2.yScaleType;

        // const domain = this._resolveDomain(props, ComposedComponent, scaleType);


        var _resolveDomain2 = this._resolveDomain(props, ComposedComponent, xScaleType, yScaleType),
            xDomain = _resolveDomain2.xDomain,
            yDomain = _resolveDomain2.yDomain;

        if (invertXScale) xDomain = xDomain.slice().reverse();
        if (invertYScale) yDomain = yDomain.slice().reverse();

        // create a temporary scale with size & domain, which may be used by the Component to calculate margin/tickDomain
        // (eg. to create and measure labels for the scales)
        // let tempScale = this._makeScales(scaleOptions);
        var scaleOptions = {
          width: width, height: height, xScaleType: xScaleType, yScaleType: yScaleType, xDomain: xDomain, yDomain: yDomain, scaleX: props.scaleX, scaleY: props.scaleY,
          marginTop: props.marginTop, marginBottom: props.marginBottom, marginLeft: props.marginLeft, marginRight: props.marginRight,
          spacingTop: props.spacingTop, spacingBottom: props.spacingBottom, spacingLeft: props.spacingLeft, spacingRight: props.spacingRight,
          xScale: props.xScale, yScale: props.yScale
        };
        // create a temporary scale with size & domain, which may be used by the Component to calculate margin/tickDomain
        // (eg. to create and measure labels for the scales)
        var tempScale = this._makeScales(scaleOptions);
        var _tempScale = tempScale,
            tempXScale = _tempScale.xScale,
            tempYScale = _tempScale.yScale;

        // getTickDomain gives children the opportunity to modify the domain to include their scale ticks
        // (can't happen in getDomain, because it can't be done until the base domain/tempScale has been created)
        // nice-ing happens in the getTickDomain function inside of _resolveTickDomain

        var _resolveTickDomain2 = this._resolveTickDomain(props, ComposedComponent, { xScaleType: xScaleType, yScaleType: yScaleType, xDomain: xDomain, yDomain: yDomain, xScale: tempXScale, yScale: tempYScale }),
            xTickDomain = _resolveTickDomain2.xTickDomain,
            yTickDomain = _resolveTickDomain2.yTickDomain;

        if ((0, _Data.isValidDomain)(xTickDomain, (0, _Scale.dataTypeFromScaleType)(xScaleType))) {
          xDomain = (0, _Data.combineDomains)([xDomain, xTickDomain], (0, _Scale.dataTypeFromScaleType)(xScaleType));
        }
        if ((0, _Data.isValidDomain)(yTickDomain, (0, _Scale.dataTypeFromScaleType)(yScaleType))) {
          yDomain = (0, _Data.combineDomains)([yDomain, yTickDomain], (0, _Scale.dataTypeFromScaleType)(yScaleType));
        }

        // update tempScale to use new domain before creating margins
        scaleOptions = _extends({}, scaleOptions, { xDomain: xDomain, yDomain: yDomain });
        tempScale = this._makeScales(scaleOptions);

        // then resolve the margins

        var _$defaults = _lodash2.default.defaults(this._resolveMargin(props, ComposedComponent, { xScaleType: xScaleType, yScaleType: yScaleType, xDomain: xDomain, yDomain: yDomain, xScale: tempScale.xScale, yScale: tempScale.yScale }), { marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0 }),
            marginTop = _$defaults.marginTop,
            marginBottom = _$defaults.marginBottom,
            marginLeft = _$defaults.marginLeft,
            marginRight = _$defaults.marginRight;

        var _$defaults2 = _lodash2.default.defaults(this._resolveSpacing(props, ComposedComponent, { xScaleType: xScaleType, yScaleType: yScaleType, xDomain: xDomain, yDomain: yDomain, xScale: tempScale.xScale, yScale: tempScale.yScale }), { spacingTop: 0, spacingBottom: 0, spacingLeft: 0, spacingRight: 0 }),
            spacingTop = _$defaults2.spacingTop,
            spacingBottom = _$defaults2.spacingBottom,
            spacingLeft = _$defaults2.spacingLeft,
            spacingRight = _$defaults2.spacingRight;

        // create real scales from resolved margins


        scaleOptions = _extends({}, scaleOptions, { marginTop: marginTop, marginBottom: marginBottom, marginLeft: marginLeft, marginRight: marginRight, spacingTop: spacingTop, spacingBottom: spacingBottom, spacingLeft: spacingLeft, spacingRight: spacingRight });

        var _makeScales = this._makeScales(scaleOptions),
            xScale = _makeScales.xScale,
            yScale = _makeScales.yScale;

        var passedProps = _lodash2.default.assign({}, this.props, {
          //legacy
          // scale: {x: xScale, y: yScale},
          // domain: {x: xDomain, y: yDomain},
          // scaleType: {x: xScaleType, y: yScaleType},
          // margin: {top: marginTop, bottom: marginBottom, left: marginLeft, right: marginRight},
          // 0.4.0
          xScale: xScale, yScale: yScale,
          xDomain: xDomain, yDomain: yDomain,
          xScaleType: xScaleType, yScaleType: yScaleType,
          marginTop: marginTop, marginBottom: marginBottom, marginLeft: marginLeft, marginRight: marginRight,
          spacingTop: spacingTop, spacingBottom: spacingBottom, spacingLeft: spacingLeft, spacingRight: spacingRight
        });
        return _react2.default.createElement(ComposedComponent, passedProps);

        // todo spacing/padding
        // todo includeZero
        // todo purerender/shouldcomponentupdate?
        // todo resolve margins if scales are present
        // todo throw if cannot resolve scaleType
        // todo throw if cannot resolve domain
        // todo check to make sure margins didn't change after scales resolved?
      }
    }]);

    return _class;
  }(_react2.default.Component), _class.defaultProps = _lodash2.default.defaults(ComposedComponent.defaultProps, {
    invertXScale: false,
    invertYScale: false
  }), _class.getScaleType = ComposedComponent.getScaleType, _class.getSpacing = ComposedComponent.getSpacing, _class.getDomain = ComposedComponent.getDomain, _class.getMargin = ComposedComponent.getMargin, _temp2;
}
//# sourceMappingURL=resolveXYScales.js.map