'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _sinh = require('babel-runtime/core-js/math/sinh');

var _sinh2 = _interopRequireDefault(_sinh);

var _tanh = require('babel-runtime/core-js/math/tanh');

var _tanh2 = _interopRequireDefault(_tanh);

var _cosh = require('babel-runtime/core-js/math/cosh');

var _cosh2 = _interopRequireDefault(_cosh);

var _log = require('babel-runtime/core-js/math/log2');

var _log2 = _interopRequireDefault(_log);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _transitionInterpolator = require('./transition-interpolator');

var _transitionInterpolator2 = _interopRequireDefault(_transitionInterpolator);

var _math = require('math.gl');

var _viewportMercatorProject = require('viewport-mercator-project');

var _transitionUtils = require('./transition-utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EPSILON = 0.01;
var VIEWPORT_TRANSITION_PROPS = ['longitude', 'latitude', 'zoom', 'bearing', 'pitch'];
var REQUIRED_PROPS = ['latitude', 'longitude', 'zoom', 'width', 'height'];
var LINEARLY_INTERPOLATED_PROPS = ['bearing', 'pitch'];
var LINEARLY_INTERPOLATED_PROPS_ALT = ['latitude', 'longitude', 'zoom'];

/**
 * This class adapts mapbox-gl-js Map#flyTo animation so it can be used in
 * react/redux architecture.
 * mapbox-gl-js flyTo : https://www.mapbox.com/mapbox-gl-js/api/#map#flyto.
 * It implements “Smooth and efficient zooming and panning.” algorithm by
 * "Jarke J. van Wijk and Wim A.A. Nuij"
*/

var ViewportFlyToInterpolator = function (_TransitionInterpolat) {
  (0, _inherits3.default)(ViewportFlyToInterpolator, _TransitionInterpolat);

  function ViewportFlyToInterpolator() {
    (0, _classCallCheck3.default)(this, ViewportFlyToInterpolator);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ViewportFlyToInterpolator.__proto__ || (0, _getPrototypeOf2.default)(ViewportFlyToInterpolator)).call(this));

    _this.propNames = VIEWPORT_TRANSITION_PROPS;
    return _this;
  }

  (0, _createClass3.default)(ViewportFlyToInterpolator, [{
    key: 'initializeProps',
    value: function initializeProps(startProps, endProps) {
      var startViewportProps = {};
      var endViewportProps = {};

      // Check minimum required props
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator3.default)(REQUIRED_PROPS), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var key = _step.value;

          var startValue = startProps[key];
          var endValue = endProps[key];
          (0, _assert2.default)((0, _transitionUtils.isValid)(startValue) && (0, _transitionUtils.isValid)(endValue), key + ' must be supplied for transition');
          startViewportProps[key] = startValue;
          endViewportProps[key] = (0, _transitionUtils.getEndValueByShortestPath)(key, startValue, endValue);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = (0, _getIterator3.default)(LINEARLY_INTERPOLATED_PROPS), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _key = _step2.value;

          var _startValue = startProps[_key] || 0;
          var _endValue = endProps[_key] || 0;
          startViewportProps[_key] = _startValue;
          endViewportProps[_key] = (0, _transitionUtils.getEndValueByShortestPath)(_key, _startValue, _endValue);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return {
        start: startViewportProps,
        end: endViewportProps
      };
    }
  }, {
    key: 'interpolateProps',
    value: function interpolateProps(startProps, endProps, t) {
      return viewportFlyToInterpolator(startProps, endProps, t);
    }
  }]);
  return ViewportFlyToInterpolator;
}(_transitionInterpolator2.default);

/** Util functions */


exports.default = ViewportFlyToInterpolator;
function zoomToScale(zoom) {
  return Math.pow(2, zoom);
}

function scaleToZoom(scale) {
  return (0, _log2.default)(scale);
}

/* eslint-disable max-statements */
function viewportFlyToInterpolator(startProps, endProps, t) {
  // Equations from above paper are referred where needed.

  var viewport = {};

  // TODO: add this as an option for applications.
  var rho = 1.414;

  var startZoom = startProps.zoom;
  var startCenter = [startProps.longitude, startProps.latitude];
  var startScale = zoomToScale(startZoom);
  var endZoom = endProps.zoom;
  var endCenter = [endProps.longitude, endProps.latitude];
  var scale = zoomToScale(endZoom - startZoom);

  var startCenterXY = new _math.Vector2((0, _viewportMercatorProject.projectFlat)(startCenter, startScale));
  var endCenterXY = new _math.Vector2((0, _viewportMercatorProject.projectFlat)(endCenter, startScale));
  var uDelta = endCenterXY.subtract(startCenterXY);

  var w0 = Math.max(startProps.width, startProps.height);
  var w1 = w0 / scale;
  var u1 = Math.sqrt(uDelta.x * uDelta.x + uDelta.y * uDelta.y);
  // u0 is treated as '0' in Eq (9).

  // Linearly interpolate 'bearing' and 'pitch' if exist.
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = (0, _getIterator3.default)(LINEARLY_INTERPOLATED_PROPS), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var _key2 = _step3.value;

      viewport[_key2] = (0, _transitionUtils.lerp)(startProps[_key2], endProps[_key2], t);
    }

    // If change in center is too small, do linear interpolaiton.
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  if (Math.abs(u1) < EPSILON) {
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = (0, _getIterator3.default)(LINEARLY_INTERPOLATED_PROPS_ALT), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var key = _step4.value;

        var startValue = startProps[key];
        var endValue = endProps[key];
        viewport[key] = (0, _transitionUtils.lerp)(startValue, endValue, t);
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }

    return viewport;
  }

  // Implement Equation (9) from above algorithm.
  var rho2 = rho * rho;
  var b0 = (w1 * w1 - w0 * w0 + rho2 * rho2 * u1 * u1) / (2 * w0 * rho2 * u1);
  var b1 = (w1 * w1 - w0 * w0 - rho2 * rho2 * u1 * u1) / (2 * w1 * rho2 * u1);
  var r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
  var r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
  var S = (r1 - r0) / rho;
  var s = t * S;

  var w = (0, _cosh2.default)(r0) / (0, _cosh2.default)(r0 + rho * s);
  var u = w0 * (((0, _cosh2.default)(r0) * (0, _tanh2.default)(r0 + rho * s) - (0, _sinh2.default)(r0)) / rho2) / u1;

  var scaleIncrement = 1 / w; // Using w method for scaling.
  var newZoom = startZoom + scaleToZoom(scaleIncrement);

  var newCenter = (0, _viewportMercatorProject.unprojectFlat)(startCenterXY.add(uDelta.scale(u)).scale(scaleIncrement), zoomToScale(newZoom));
  viewport.longitude = newCenter[0];
  viewport.latitude = newCenter[1];
  viewport.zoom = newZoom;
  return viewport;
}
/* eslint-enable max-statements */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy90cmFuc2l0aW9uL3ZpZXdwb3J0LWZseS10by1pbnRlcnBvbGF0b3IuanMiXSwibmFtZXMiOlsiRVBTSUxPTiIsIlZJRVdQT1JUX1RSQU5TSVRJT05fUFJPUFMiLCJSRVFVSVJFRF9QUk9QUyIsIkxJTkVBUkxZX0lOVEVSUE9MQVRFRF9QUk9QUyIsIkxJTkVBUkxZX0lOVEVSUE9MQVRFRF9QUk9QU19BTFQiLCJWaWV3cG9ydEZseVRvSW50ZXJwb2xhdG9yIiwicHJvcE5hbWVzIiwic3RhcnRQcm9wcyIsImVuZFByb3BzIiwic3RhcnRWaWV3cG9ydFByb3BzIiwiZW5kVmlld3BvcnRQcm9wcyIsImtleSIsInN0YXJ0VmFsdWUiLCJlbmRWYWx1ZSIsInN0YXJ0IiwiZW5kIiwidCIsInZpZXdwb3J0Rmx5VG9JbnRlcnBvbGF0b3IiLCJ6b29tVG9TY2FsZSIsInpvb20iLCJNYXRoIiwicG93Iiwic2NhbGVUb1pvb20iLCJzY2FsZSIsInZpZXdwb3J0IiwicmhvIiwic3RhcnRab29tIiwic3RhcnRDZW50ZXIiLCJsb25naXR1ZGUiLCJsYXRpdHVkZSIsInN0YXJ0U2NhbGUiLCJlbmRab29tIiwiZW5kQ2VudGVyIiwic3RhcnRDZW50ZXJYWSIsImVuZENlbnRlclhZIiwidURlbHRhIiwic3VidHJhY3QiLCJ3MCIsIm1heCIsIndpZHRoIiwiaGVpZ2h0IiwidzEiLCJ1MSIsInNxcnQiLCJ4IiwieSIsImFicyIsInJobzIiLCJiMCIsImIxIiwicjAiLCJsb2ciLCJyMSIsIlMiLCJzIiwidyIsInUiLCJzY2FsZUluY3JlbWVudCIsIm5ld1pvb20iLCJuZXdDZW50ZXIiLCJhZGQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBRUE7O0FBQ0E7O0FBQ0E7Ozs7QUFFQSxJQUFNQSxVQUFVLElBQWhCO0FBQ0EsSUFBTUMsNEJBQTRCLENBQUMsV0FB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QXBGOztBQUVBLE1BQU1lLGlCQUFpQixJQUFJRixDQUEzQixDQW5EMEQsQ0FtRDVCO0FBQzlCLE1BQU1HLFVBQVVoQyxZQUFZSixZQUFZbUMsY0FBWixDQUE1Qjs7QUFFQSxNQUFNRSxZQUFZLDRDQUNmMUIsY0FBYzJCLEdBQWQsQ0FBa0J6QixPQUFPWixLQUFQLENBQWFpQyxDQUFiLENBQWxCLENBQUQsQ0FBcUNqQyxLQUFyQyxDQUEyQ2tDLGNBQTNDLENBRGdCLEVBRWhCdkMsWUFBWXdDLE9BQVosQ0FGZ0IsQ0FBbEI7QUFHQWxDLFdBQVNJLFNBQVQsR0FBcUIrQixVQUFVLENBQVYsQ0FBckI7QUFDQW5DLFdBQVNLLFFBQVQsR0FBb0I4QixVQUFVLENBQVYsQ0FBcEI7QUFDQW5DLFdBQVNMLElBQVQsR0FBZ0J1QyxPQUFoQjtBQUNBLFNBQU9sQyxRQUFQO0FBQ0Q7QUFDRCIsImZpbGUiOiJ2aWV3cG9ydC1mbHktdG8taW50ZXJwb2xhdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IFRyYW5zaXRpb25JbnRlcnBvbGF0b3IgZnJvbSAnLi90cmFuc2l0aW9uLWludGVycG9sYXRvcic7XG5cbmltcG9ydCB7VmVjdG9yMn0gZnJvbSAnbWF0aC5nbCc7XG5pbXBvcnQge3Byb2plY3RGbGF0LCB1bnByb2plY3RGbGF0fSBmcm9tICd2aWV3cG9ydC1tZXJjYXRvci1wcm9qZWN0JztcbmltcG9ydCB7aXNWYWxpZCwgbGVycCwgZ2V0RW5kVmFsdWVCeVNob3J0ZXN0UGF0aH0gZnJvbSAnLi90cmFuc2l0aW9uLXV0aWxzJztcblxuY29uc3QgRVBTSUxPTiA9IDAuMDE7XG5jb25zdCBWSUVXUE9SVF9UUkFOU0lUSU9OX1BST1BTID0gWydsb25naXR1ZGUnLCAnbGF0aXR1ZGUnLCAnem9vbScsICdiZWFyaW5nJywgJ3BpdGNoJ107XG5jb25zdCBSRVFVSVJFRF9QUk9QUyA9IFsnbGF0aXR1ZGUnLCAnbG9uZ2l0dWRlJywgJ3pvb20nLCAnd2lkdGgnLCAnaGVpZ2h0J107XG5jb25zdCBMSU5FQVJMWV9JTlRFUlBPTEFURURfUFJPUFMgPSBbJ2JlYXJpbmcnLCAncGl0Y2gnXTtcbmNvbnN0IExJTkVBUkxZX0lOVEVSUE9MQVRFRF9QUk9QU19BTFQgPSBbJ2xhdGl0dWRlJywgJ2xvbmdpdHVkZScsICd6b29tJ107XG5cbi8qKlxuICogVGhpcyBjbGFzcyBhZGFwdHMgbWFwYm94LWdsLWpzIE1hcCNmbHlUbyBhbmltYXRpb24gc28gaXQgY2FuIGJlIHVzZWQgaW5cbiAqIHJlYWN0L3JlZHV4IGFyY2hpdGVjdHVyZS5cbiAqIG1hcGJveC1nbC1qcyBmbHlUbyA6IGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLWpzL2FwaS8jbWFwI2ZseXRvLlxuICogSXQgaW1wbGVtZW50cyDigJxTbW9vdGggYW5kIGVmZmljaWVudCB6b29taW5nIGFuZCBwYW5uaW5nLuKAnSBhbGdvcml0aG0gYnlcbiAqIFwiSmFya2UgSi4gdmFuIFdpamsgYW5kIFdpbSBBLkEuIE51aWpcIlxuKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZpZXdwb3J0Rmx5VG9JbnRlcnBvbGF0b3IgZXh0ZW5kcyBUcmFuc2l0aW9uSW50ZXJwb2xhdG9yIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucHJvcE5hbWVzID0gVklFV1BPUlRfVFJBTlNJVElPTl9QUk9QUztcbiAgfVxuXG4gIGluaXRpYWxpemVQcm9wcyhzdGFydFByb3BzLCBlbmRQcm9wcykge1xuICAgIGNvbnN0IHN0YXJ0Vmlld3BvcnRQcm9wcyA9IHt9O1xuICAgIGNvbnN0IGVuZFZpZXdwb3J0UHJvcHMgPSB7fTtcblxuICAgIC8vIENoZWNrIG1pbmltdW0gcmVxdWlyZWQgcHJvcHNcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBSRVFVSVJFRF9QUk9QUykge1xuICAgICAgY29uc3Qgc3RhcnRWYWx1ZSA9IHN0YXJ0UHJvcHNba2V5XTtcbiAgICAgIGNvbnN0IGVuZFZhbHVlID0gZW5kUHJvcHNba2V5XTtcbiAgICAgIGFzc2VydChpc1ZhbGlkKHN0YXJ0VmFsdWUpICYmIGlzVmFsaWQoZW5kVmFsdWUpLCBgJHtrZXl9IG11c3QgYmUgc3VwcGxpZWQgZm9yIHRyYW5zaXRpb25gKTtcbiAgICAgIHN0YXJ0Vmlld3BvcnRQcm9wc1trZXldID0gc3RhcnRWYWx1ZTtcbiAgICAgIGVuZFZpZXdwb3J0UHJvcHNba2V5XSA9IGdldEVuZFZhbHVlQnlTaG9ydGVzdFBhdGgoa2V5LCBzdGFydFZhbHVlLCBlbmRWYWx1ZSk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBrZXkgb2YgTElORUFSTFlfSU5URVJQT0xBVEVEX1BST1BTKSB7XG4gICAgICBjb25zdCBzdGFydFZhbHVlID0gc3RhcnRQcm9wc1trZXldIHx8IDA7XG4gICAgICBjb25zdCBlbmRWYWx1ZSA9IGVuZFByb3BzW2tleV0gfHwgMDtcbiAgICAgIHN0YXJ0Vmlld3BvcnRQcm9wc1trZXldID0gc3RhcnRWYWx1ZTtcbiAgICAgIGVuZFZpZXdwb3J0UHJvcHNba2V5XSA9IGdldEVuZFZhbHVlQnlTaG9ydGVzdFBhdGgoa2V5LCBzdGFydFZhbHVlLCBlbmRWYWx1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXJ0OiBzdGFydFZpZXdwb3J0UHJvcHMsXG4gICAgICBlbmQ6IGVuZFZpZXdwb3J0UHJvcHNcbiAgICB9O1xuICB9XG5cbiAgaW50ZXJwb2xhdGVQcm9wcyhzdGFydFByb3BzLCBlbmRQcm9wcywgdCkge1xuICAgIHJldHVybiB2aWV3cG9ydEZseVRvSW50ZXJwb2xhdG9yKHN0YXJ0UHJvcHMsIGVuZFByb3BzLCB0KTtcbiAgfVxuXG59XG5cbi8qKiBVdGlsIGZ1bmN0aW9ucyAqL1xuZnVuY3Rpb24gem9vbVRvU2NhbGUoem9vbSkge1xuICByZXR1cm4gTWF0aC5wb3coMiwgem9vbSk7XG59XG5cbmZ1bmN0aW9uIHNjYWxlVG9ab29tKHNjYWxlKSB7XG4gIHJldHVybiBNYXRoLmxvZzIoc2NhbGUpO1xufVxuXG4vKiBlc2xpbnQtZGlzYWJsZSBtYXgtc3RhdGVtZW50cyAqL1xuZnVuY3Rpb24gdmlld3BvcnRGbHlUb0ludGVycG9sYXRvcihzdGFydFByb3BzLCBlbmRQcm9wcywgdCkge1xuICAvLyBFcXVhdGlvbnMgZnJvbSBhYm92ZSBwYXBlciBhcmUgcmVmZXJyZWQgd2hlcmUgbmVlZGVkLlxuXG4gIGNvbnN0IHZpZXdwb3J0ID0ge307XG5cbiAgLy8gVE9ETzogYWRkIHRoaXMgYXMgYW4gb3B0aW9uIGZvciBhcHBsaWNhdGlvbnMuXG4gIGNvbnN0IHJobyA9IDEuNDE0O1xuXG4gIGNvbnN0IHN0YXJ0Wm9vbSA9IHN0YXJ0UHJvcHMuem9vbTtcbiAgY29uc3Qgc3RhcnRDZW50ZXIgPSBbc3RhcnRQcm9wcy5sb25naXR1ZGUsIHN0YXJ0UHJvcHMubGF0aXR1ZGVdO1xuICBjb25zdCBzdGFydFNjYWxlID0gem9vbVRvU2NhbGUoc3RhcnRab29tKTtcbiAgY29uc3QgZW5kWm9vbSA9IGVuZFByb3BzLnpvb207XG4gIGNvbnN0IGVuZENlbnRlciA9IFtlbmRQcm9wcy5sb25naXR1ZGUsIGVuZFByb3BzLmxhdGl0dWRlXTtcbiAgY29uc3Qgc2NhbGUgPSB6b29tVG9TY2FsZShlbmRab29tIC0gc3RhcnRab29tKTtcblxuICBjb25zdCBzdGFydENlbnRlclhZID0gbmV3IFZlY3RvcjIocHJvamVjdEZsYXQoc3RhcnRDZW50ZXIsIHN0YXJ0U2NhbGUpKTtcbiAgY29uc3QgZW5kQ2VudGVyWFkgPSBuZXcgVmVjdG9yMihwcm9qZWN0RmxhdChlbmRDZW50ZXIsIHN0YXJ0U2NhbGUpKTtcbiAgY29uc3QgdURlbHRhID0gZW5kQ2VudGVyWFkuc3VidHJhY3Qoc3RhcnRDZW50ZXJYWSk7XG5cbiAgY29uc3QgdzAgPSBNYXRoLm1heChzdGFydFByb3BzLndpZHRoLCBzdGFydFByb3BzLmhlaWdodCk7XG4gIGNvbnN0IHcxID0gdzAgLyBzY2FsZTtcbiAgY29uc3QgdTEgPSBNYXRoLnNxcnQoKHVEZWx0YS54ICogdURlbHRhLngpICsgKHVEZWx0YS55ICogdURlbHRhLnkpKTtcbiAgLy8gdTAgaXMgdHJlYXRlZCBhcyAnMCcgaW4gRXEgKDkpLlxuXG4gIC8vIExpbmVhcmx5IGludGVycG9sYXRlICdiZWFyaW5nJyBhbmQgJ3BpdGNoJyBpZiBleGlzdC5cbiAgZm9yIChjb25zdCBrZXkgb2YgTElORUFSTFlfSU5URVJQT0xBVEVEX1BST1BTKSB7XG4gICAgdmlld3BvcnRba2V5XSA9IGxlcnAoc3RhcnRQcm9wc1trZXldLCBlbmRQcm9wc1trZXldLCB0KTtcbiAgfVxuXG4gIC8vIElmIGNoYW5nZSBpbiBjZW50ZXIgaXMgdG9vIHNtYWxsLCBkbyBsaW5lYXIgaW50ZXJwb2xhaXRvbi5cbiAgaWYgKE1hdGguYWJzKHUxKSA8IEVQU0lMT04pIHtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBMSU5FQVJMWV9JTlRFUlBPTEFURURfUFJPUFNfQUxUKSB7XG4gICAgICBjb25zdCBzdGFydFZhbHVlID0gc3RhcnRQcm9wc1trZXldO1xuICAgICAgY29uc3QgZW5kVmFsdWUgPSBlbmRQcm9wc1trZXldO1xuICAgICAgdmlld3BvcnRba2V5XSA9IGxlcnAoc3RhcnRWYWx1ZSwgZW5kVmFsdWUsIHQpO1xuICAgIH1cbiAgICByZXR1cm4gdmlld3BvcnQ7XG4gIH1cblxuICAvLyBJbXBsZW1lbnQgRXF1YXRpb24gKDkpIGZyb20gYWJvdmUgYWxnb3JpdGhtLlxuICBjb25zdCByaG8yID0gcmhvICogcmhvO1xuICBjb25zdCBiMCA9ICh3MSAqIHcxIC0gdzAgKiB3MCArIHJobzIgKiByaG8yICogdTEgKiB1MSkgLyAoMiAqIHcwICogcmhvMiAqIHUxKTtcbiAgY29uc3QgYjEgPSAodzEgKiB3MSAtIHcwICogdzAgLSByaG8yICogcmhvMiAqIHUxICogdTEpIC8gKDIgKiB3MSAqIHJobzIgKiB1MSk7XG4gIGNvbnN0IHIwID0gTWF0aC5sb2coTWF0aC5zcXJ0KGIwICogYjAgKyAxKSAtIGIwKTtcbiAgY29uc3QgcjEgPSBNYXRoLmxvZyhNYXRoLnNxcnQoYjEgKiBiMSArIDEpIC0gYjEpO1xuICBjb25zdCBTID0gKHIxIC0gcjApIC8gcmhvO1xuICBjb25zdCBzID0gdCAqIFM7XG5cbiAgY29uc3QgdyA9IChNYXRoLmNvc2gocjApIC8gTWF0aC5jb3NoKHIwICsgcmhvICogcykpO1xuICBjb25zdCB1ID0gdzAgKiAoKE1hdGguY29zaChyMCkgKiBNYXRoLnRhbmgocjAgKyByaG8gKiBzKSAtIE1hdGguc2luaChyMCkpIC8gcmhvMikgLyB1MTtcblxuICBjb25zdCBzY2FsZUluY3JlbWVudCA9IDEgLyB3OyAvLyBVc2luZyB3IG1ldGhvZCBmb3Igc2NhbGluZy5cbiAgY29uc3QgbmV3Wm9vbSA9IHN0YXJ0Wm9vbSArIHNjYWxlVG9ab29tKHNjYWxlSW5jcmVtZW50KTtcblxuICBjb25zdCBuZXdDZW50ZXIgPSB1bnByb2plY3RGbGF0KFxuICAgIChzdGFydENlbnRlclhZLmFkZCh1RGVsdGEuc2NhbGUodSkpKS5zY2FsZShzY2FsZUluY3JlbWVudCksXG4gICAgem9vbVRvU2NhbGUobmV3Wm9vbSkpO1xuICB2aWV3cG9ydC5sb25naXR1ZGUgPSBuZXdDZW50ZXJbMF07XG4gIHZpZXdwb3J0LmxhdGl0dWRlID0gbmV3Q2VudGVyWzFdO1xuICB2aWV3cG9ydC56b29tID0gbmV3Wm9vbTtcbiAgcmV0dXJuIHZpZXdwb3J0O1xufVxuLyogZXNsaW50LWVuYWJsZSBtYXgtc3RhdGVtZW50cyAqL1xuIl19