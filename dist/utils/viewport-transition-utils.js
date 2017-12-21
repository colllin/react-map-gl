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

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _log = require('babel-runtime/core-js/math/log2');

var _log2 = _interopRequireDefault(_log);

exports.extractViewportFrom = extractViewportFrom;
exports.areViewportsEqual = areViewportsEqual;
exports.viewportLinearInterpolator = viewportLinearInterpolator;
exports.viewportFlyToInterpolator = viewportFlyToInterpolator;

var _viewportMercatorProject = require('viewport-mercator-project');

var _math = require('math.gl');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint max-statements: ["error", 50] */

var EPSILON = 0.01;
var VIEWPORT_PROPS = ['longitude', 'latitude', 'zoom', 'bearing', 'pitch', 'position', 'width', 'height'];
var VIEWPORT_INTERPOLATION_PROPS = ['longitude', 'latitude', 'zoom', 'bearing', 'pitch', 'position'];

/** Util functions */
function lerp(start, end, step) {
  if (Array.isArray(start)) {
    return start.map(function (element, index) {
      return lerp(element, end[index], step);
    });
  }
  return step * end + (1 - step) * start;
}

function zoomToScale(zoom) {
  return Math.pow(2, zoom);
}

function scaleToZoom(scale) {
  return (0, _log2.default)(scale);
}

function extractViewportFrom(props) {
  var viewport = {};
  VIEWPORT_PROPS.forEach(function (key) {
    if (typeof props[key] !== 'undefined') {
      viewport[key] = props[key];
    }
  });
  return viewport;
}

/* eslint-disable max-depth */
function areViewportsEqual(startViewport, endViewport) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = (0, _getIterator3.default)(VIEWPORT_INTERPOLATION_PROPS), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var p = _step.value;

      if (Array.isArray(startViewport[p])) {
        for (var i = 0; i < startViewport[p].length; ++i) {
          if (startViewport[p][i] !== endViewport[p][i]) {
            return false;
          }
        }
      } else if (startViewport[p] !== endViewport[p]) {
        return false;
      }
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

  return true;
}
/* eslint-enable max-depth */

/**
 * Performs linear interpolation of two viewports.
 * @param {Object} startViewport - object containing starting viewport parameters.
 * @param {Object} endViewport - object containing ending viewport parameters.
 * @param {Number} t - interpolation step.
 * @return {Object} - interpolated viewport for given step.
*/
function viewportLinearInterpolator(startViewport, endViewport, t) {
  var viewport = {};

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = (0, _getIterator3.default)(VIEWPORT_INTERPOLATION_PROPS), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var p = _step2.value;

      var startValue = startViewport[p];
      var endValue = endViewport[p];
      // TODO: 'position' is not always specified
      if (typeof startValue !== 'undefined' && typeof endValue !== 'undefined') {
        viewport[p] = lerp(startValue, endValue, t);
      }
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

  return viewport;
}

/**
 * This method adapts mapbox-gl-js Map#flyTo animation so it can be used in
 * react/redux architecture.
 * mapbox-gl-js flyTo : https://www.mapbox.com/mapbox-gl-js/api/#map#flyto.
 * It implements “Smooth and efficient zooming and panning.” algorithm by
 * "Jarke J. van Wijk and Wim A.A. Nuij"
 *
 * @param {Object} startViewport - object containing starting viewport parameters.
 * @param {Object} endViewport - object containing ending viewport parameters.
 * @param {Number} t - interpolation step.
 * @return {Object} - interpolated viewport for given step.
*/
function viewportFlyToInterpolator(startViewport, endViewport, t) {
  // Equations from above paper are referred where needed.

  var viewport = {};

  // TODO: add this as an option for applications.
  var rho = 1.414;

  var startZoom = startViewport.zoom;
  var startCenter = [startViewport.longitude, startViewport.latitude];
  var startScale = zoomToScale(startZoom);
  var endZoom = endViewport.zoom;
  var endCenter = [endViewport.longitude, endViewport.latitude];
  var scale = zoomToScale(endZoom - startZoom);

  var startCenterXY = new _math.Vector2((0, _viewportMercatorProject.projectFlat)(startCenter, startScale));
  var endCenterXY = new _math.Vector2((0, _viewportMercatorProject.projectFlat)(endCenter, startScale));
  var uDelta = endCenterXY.subtract(startCenterXY);

  var w0 = Math.max(startViewport.width, startViewport.height);
  var w1 = w0 / scale;
  var u1 = Math.sqrt(uDelta.x * uDelta.x + uDelta.y * uDelta.y);
  // u0 is treated as '0' in Eq (9).

  // Linearly interpolate 'bearing' and 'pitch'
  var _arr = ['bearing', 'pitch'];
  for (var _i = 0; _i < _arr.length; _i++) {
    var _p = _arr[_i];
    var _startValue = startViewport[_p];
    var _endValue = endViewport[_p];
    viewport[_p] = lerp(_startValue, _endValue, t);
  }

  // If change in center is too small, do linear interpolaiton.
  if (Math.abs(u1) < EPSILON) {
    var _arr2 = ['latitude', 'longitude', 'zoom'];

    for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
      var p = _arr2[_i2];
      var startValue = startViewport[p];
      var endValue = endViewport[p];
      viewport[p] = lerp(startValue, endValue, t);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy92aWV3cG9ydC10cmFuc2l0aW9uLXV0aWxzLmpzIl0sIm5hbWVzIjpbImV4dHJhY3RWaWV3cG9ydEZyb20iLCJhcmVWaWV3cG9ydHNFcXVhbCIsInZpZXdwb3J0TGluZWFySW50ZXJwb2xhdG9yIiwidmlld3BvcnRGbHlUb0ludGVycG9sYXRvciIsIkVQU0lMT04iLCJWSUVXUE9SVF9QUk9QUyIsIlZJRVdQT1JUX0lOVEVSUE9MQVRJT05fUFJPUFMiLCJsZXJwIiwic3RhcnQiLCJlbmQiLCJzdGVwIiwiQXJyYXkiLCJpc0FycmF5IiwibWFwIiwiZWxlbWVudCIsImluZGV4Iiwiem9vbVRvU2NhbGUiLCJ6b29tIiwiTWF0aCIsInBvdyIsInNjYWxlVG9ab29tIiwic2NhbGUiLCJwcm9wcyIsInZpZXdwb3J0IiwiZm9yRWFjaCIsImtleSIsInN0YXJ0Vmlld3BvcnQiLCJlbmRWaWV3cG9ydCIsInAiLCJpIiwibGVuZ3RoIiwidCIsInN0YXJ0VmFsdWUiLCJlbmRWYWx1ZSIsInJobyIsInN0YXJ0Wm9vbSIsInN0YXJ0Q2VudGVyIiwibG9uZ2l0dWRlIiwibGF0aXR1ZGUiLCJzdGFydFNjYWxlIiwiZW5kWm9vbSIsImVuZENlbnRlciIsInN0YXJ0Q2VudGVyWFkiLCJlbmRDZW50ZXJYWSIsInVEZWx0YSIsInN1YnRyYWN0IiwidzAiLCJtYXgiLCJ3aWR0aCIsImhlaWdodCIsIncxIiwidTEiLCJzcXJ0IiwieCIsInkiLCJhYnMiLCJyaG8yIiwiYjAiLCJiMSIsInIwIiwibG9nIiwicjEiLCJTIiwicyIsInciLCJ1Iiwic2NhbGVJbmNyZW1lbnQiLCJuZXdab29tIiwibmV3Q2VudGVyIiwiYWRkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztRQTZCZ0JBLG1CLEdBQUFBLG1CO1FBV0FDLGlCLEdBQUFBLGlCO1FBdUJBQywwQixHQUFBQSwwQjtRQTBCQUMseUIsR0FBQUEseUI7O0FBdkZoQjs7QUFDQTs7OztB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QUt6QyxLQUFLMEMsR0FBTCxDQUFTMUMsS0FBS2tDLElBQUwsQ0FBVUssS0FBS0EsRUFBTCxHQUFVLENBQXBCLElBQXlCQSxFQUFsQyxDQUFYO0FBQ0EsTUFBTUksS0FBSzNDLEtBQUswQyxHQUFMLENBQVMxQyxLQUFLa0MsSUFBTCxDQUFVTSxLQUFLQSxFQUFMLEdBQVUsQ0FBcEIsSUFBeUJBLEVBQWxDLENBQVg7QUFDQSxNQUFNSSxJQUFJLENBQUNELEtBQUtGLEVBQU4sSUFBWXpCLEdBQXRCO0FBQ0EsTUFBTTZCLElBQUloQyxJQUFJK0IsQ0FBZDs7QUFFQSxNQUFNRSxJQUFLLG9CQUFVTCxFQUFWLElBQWdCLG9CQUFVQSxLQUFLekIsTUFBTTZCLENBQXJCLENBQTNCO0FBQ0EsTUFBTUUsSUFBSW5CLE1BQU0sQ0FBQyxvQkFBVWEsRUFBVixJQUFnQixvQkFBVUEsS0FBS3pCLE1BQU02QixDQUFyQixDQUFoQixHQUEwQyxvQkFBVUosRUFBVixDQUEzQyxJQUE0REgsSUFBbEUsSUFBMEVMLEVBQXBGOztBQUVBLE1BQU1lLGlCQUFpQixJQUFJRixDQUEzQixDQXJEdUUsQ0FxRHpDO0FBQzlCLE1BQU1HLFVBQVVoQyxZQUFZZixZQUFZOEMsY0FBWixDQUE1Qjs7QUFFQSxNQUFNRSxZQUFZLDRDQUNmMUIsY0FBYzJCLEdBQWQsQ0FBa0J6QixPQUFPdkIsS0FBUCxDQUFhNEMsQ0FBYixDQUFsQixDQUFELENBQXFDNUMsS0FBckMsQ0FBMkM2QyxjQUEzQyxDQURnQixFQUVoQmxELFlBQVltRCxPQUFaLENBRmdCLENBQWxCO0FBR0E1QyxXQUFTYyxTQUFULEdBQXFCK0IsVUFBVSxDQUFWLENBQXJCO0FBQ0E3QyxXQUFTZSxRQUFULEdBQW9COEIsVUFBVSxDQUFWLENBQXBCO0FBQ0E3QyxXQUFTTixJQUFULEdBQWdCa0QsT0FBaEI7QUFDQSxTQUFPNUMsUUFBUDtBQUNEIiwiZmlsZSI6InZpZXdwb3J0LXRyYW5zaXRpb24tdXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQgbWF4LXN0YXRlbWVudHM6IFtcImVycm9yXCIsIDUwXSAqL1xuXG5pbXBvcnQge3Byb2plY3RGbGF0LCB1bnByb2plY3RGbGF0fSBmcm9tICd2aWV3cG9ydC1tZXJjYXRvci1wcm9qZWN0JztcbmltcG9ydCB7VmVjdG9yMn0gZnJvbSAnbWF0aC5nbCc7XG5cbmNvbnN0IEVQU0lMT04gPSAwLjAxO1xuY29uc3QgVklFV1BPUlRfUFJPUFMgPSBbJ2xvbmdpdHVkZScsICdsYXRpdHVkZScsICd6b29tJywgJ2JlYXJpbmcnLCAncGl0Y2gnLFxuICAncG9zaXRpb24nLCAnd2lkdGgnLCAnaGVpZ2h0J107XG5jb25zdCBWSUVXUE9SVF9JTlRFUlBPTEFUSU9OX1BST1BTID1cbiAgWydsb25naXR1ZGUnLCAnbGF0aXR1ZGUnLCAnem9vbScsICdiZWFyaW5nJywgJ3BpdGNoJywgJ3Bvc2l0aW9uJ107XG5cbi8qKiBVdGlsIGZ1bmN0aW9ucyAqL1xuZnVuY3Rpb24gbGVycChzdGFydCwgZW5kLCBzdGVwKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KHN0YXJ0KSkge1xuICAgIHJldHVybiBzdGFydC5tYXAoKGVsZW1lbnQsIGluZGV4KSA9PiB7XG4gICAgICByZXR1cm4gbGVycChlbGVtZW50LCBlbmRbaW5kZXhdLCBzdGVwKTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gc3RlcCAqIGVuZCArICgxIC0gc3RlcCkgKiBzdGFydDtcbn1cblxuZnVuY3Rpb24gem9vbVRvU2NhbGUoem9vbSkge1xuICByZXR1cm4gTWF0aC5wb3coMiwgem9vbSk7XG59XG5cbmZ1bmN0aW9uIHNjYWxlVG9ab29tKHNjYWxlKSB7XG4gIHJldHVybiBNYXRoLmxvZzIoc2NhbGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdFZpZXdwb3J0RnJvbShwcm9wcykge1xuICBjb25zdCB2aWV3cG9ydCA9IHt9O1xuICBWSUVXUE9SVF9QUk9QUy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBpZiAodHlwZW9mIHByb3BzW2tleV0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB2aWV3cG9ydFtrZXldID0gcHJvcHNba2V5XTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gdmlld3BvcnQ7XG59XG5cbi8qIGVzbGludC1kaXNhYmxlIG1heC1kZXB0aCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFyZVZpZXdwb3J0c0VxdWFsKHN0YXJ0Vmlld3BvcnQsIGVuZFZpZXdwb3J0KSB7XG4gIGZvciAoY29uc3QgcCBvZiBWSUVXUE9SVF9JTlRFUlBPTEFUSU9OX1BST1BTKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc3RhcnRWaWV3cG9ydFtwXSkpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RhcnRWaWV3cG9ydFtwXS5sZW5ndGg7ICsraSkge1xuICAgICAgICBpZiAoc3RhcnRWaWV3cG9ydFtwXVtpXSAhPT0gZW5kVmlld3BvcnRbcF1baV0pIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHN0YXJ0Vmlld3BvcnRbcF0gIT09IGVuZFZpZXdwb3J0W3BdKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuLyogZXNsaW50LWVuYWJsZSBtYXgtZGVwdGggKi9cblxuLyoqXG4gKiBQZXJmb3JtcyBsaW5lYXIgaW50ZXJwb2xhdGlvbiBvZiB0d28gdmlld3BvcnRzLlxuICogQHBhcmFtIHtPYmplY3R9IHN0YXJ0Vmlld3BvcnQgLSBvYmplY3QgY29udGFpbmluZyBzdGFydGluZyB2aWV3cG9ydCBwYXJhbWV0ZXJzLlxuICogQHBhcmFtIHtPYmplY3R9IGVuZFZpZXdwb3J0IC0gb2JqZWN0IGNvbnRhaW5pbmcgZW5kaW5nIHZpZXdwb3J0IHBhcmFtZXRlcnMuXG4gKiBAcGFyYW0ge051bWJlcn0gdCAtIGludGVycG9sYXRpb24gc3RlcC5cbiAqIEByZXR1cm4ge09iamVjdH0gLSBpbnRlcnBvbGF0ZWQgdmlld3BvcnQgZm9yIGdpdmVuIHN0ZXAuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHZpZXdwb3J0TGluZWFySW50ZXJwb2xhdG9yKHN0YXJ0Vmlld3BvcnQsIGVuZFZpZXdwb3J0LCB0KSB7XG4gIGNvbnN0IHZpZXdwb3J0ID0ge307XG5cbiAgZm9yIChjb25zdCBwIG9mIFZJRVdQT1JUX0lOVEVSUE9MQVRJT05fUFJPUFMpIHtcbiAgICBjb25zdCBzdGFydFZhbHVlID0gc3RhcnRWaWV3cG9ydFtwXTtcbiAgICBjb25zdCBlbmRWYWx1ZSA9IGVuZFZpZXdwb3J0W3BdO1xuICAgIC8vIFRPRE86ICdwb3NpdGlvbicgaXMgbm90IGFsd2F5cyBzcGVjaWZpZWRcbiAgICBpZiAodHlwZW9mIHN0YXJ0VmFsdWUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBlbmRWYWx1ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHZpZXdwb3J0W3BdID0gbGVycChzdGFydFZhbHVlLCBlbmRWYWx1ZSwgdCk7XG4gICAgfVxuICB9XG4gIHJldHVybiB2aWV3cG9ydDtcbn1cblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBhZGFwdHMgbWFwYm94LWdsLWpzIE1hcCNmbHlUbyBhbmltYXRpb24gc28gaXQgY2FuIGJlIHVzZWQgaW5cbiAqIHJlYWN0L3JlZHV4IGFyY2hpdGVjdHVyZS5cbiAqIG1hcGJveC1nbC1qcyBmbHlUbyA6IGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLWpzL2FwaS8jbWFwI2ZseXRvLlxuICogSXQgaW1wbGVtZW50cyDigJxTbW9vdGggYW5kIGVmZmljaWVudCB6b29taW5nIGFuZCBwYW5uaW5nLuKAnSBhbGdvcml0aG0gYnlcbiAqIFwiSmFya2UgSi4gdmFuIFdpamsgYW5kIFdpbSBBLkEuIE51aWpcIlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBzdGFydFZpZXdwb3J0IC0gb2JqZWN0IGNvbnRhaW5pbmcgc3RhcnRpbmcgdmlld3BvcnQgcGFyYW1ldGVycy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBlbmRWaWV3cG9ydCAtIG9iamVjdCBjb250YWluaW5nIGVuZGluZyB2aWV3cG9ydCBwYXJhbWV0ZXJzLlxuICogQHBhcmFtIHtOdW1iZXJ9IHQgLSBpbnRlcnBvbGF0aW9uIHN0ZXAuXG4gKiBAcmV0dXJuIHtPYmplY3R9IC0gaW50ZXJwb2xhdGVkIHZpZXdwb3J0IGZvciBnaXZlbiBzdGVwLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiB2aWV3cG9ydEZseVRvSW50ZXJwb2xhdG9yKHN0YXJ0Vmlld3BvcnQsIGVuZFZpZXdwb3J0LCB0KSB7XG4gIC8vIEVxdWF0aW9ucyBmcm9tIGFib3ZlIHBhcGVyIGFyZSByZWZlcnJlZCB3aGVyZSBuZWVkZWQuXG5cbiAgY29uc3Qgdmlld3BvcnQgPSB7fTtcblxuICAvLyBUT0RPOiBhZGQgdGhpcyBhcyBhbiBvcHRpb24gZm9yIGFwcGxpY2F0aW9ucy5cbiAgY29uc3QgcmhvID0gMS40MTQ7XG5cbiAgY29uc3Qgc3RhcnRab29tID0gc3RhcnRWaWV3cG9ydC56b29tO1xuICBjb25zdCBzdGFydENlbnRlciA9IFtzdGFydFZpZXdwb3J0LmxvbmdpdHVkZSwgc3RhcnRWaWV3cG9ydC5sYXRpdHVkZV07XG4gIGNvbnN0IHN0YXJ0U2NhbGUgPSB6b29tVG9TY2FsZShzdGFydFpvb20pO1xuICBjb25zdCBlbmRab29tID0gZW5kVmlld3BvcnQuem9vbTtcbiAgY29uc3QgZW5kQ2VudGVyID0gW2VuZFZpZXdwb3J0LmxvbmdpdHVkZSwgZW5kVmlld3BvcnQubGF0aXR1ZGVdO1xuICBjb25zdCBzY2FsZSA9IHpvb21Ub1NjYWxlKGVuZFpvb20gLSBzdGFydFpvb20pO1xuXG4gIGNvbnN0IHN0YXJ0Q2VudGVyWFkgPSBuZXcgVmVjdG9yMihwcm9qZWN0RmxhdChzdGFydENlbnRlciwgc3RhcnRTY2FsZSkpO1xuICBjb25zdCBlbmRDZW50ZXJYWSA9IG5ldyBWZWN0b3IyKHByb2plY3RGbGF0KGVuZENlbnRlciwgc3RhcnRTY2FsZSkpO1xuICBjb25zdCB1RGVsdGEgPSBlbmRDZW50ZXJYWS5zdWJ0cmFjdChzdGFydENlbnRlclhZKTtcblxuICBjb25zdCB3MCA9IE1hdGgubWF4KHN0YXJ0Vmlld3BvcnQud2lkdGgsIHN0YXJ0Vmlld3BvcnQuaGVpZ2h0KTtcbiAgY29uc3QgdzEgPSB3MCAvIHNjYWxlO1xuICBjb25zdCB1MSA9IE1hdGguc3FydCgodURlbHRhLnggKiB1RGVsdGEueCkgKyAodURlbHRhLnkgKiB1RGVsdGEueSkpO1xuICAvLyB1MCBpcyB0cmVhdGVkIGFzICcwJyBpbiBFcSAoOSkuXG5cbiAgLy8gTGluZWFybHkgaW50ZXJwb2xhdGUgJ2JlYXJpbmcnIGFuZCAncGl0Y2gnXG4gIGZvciAoY29uc3QgcCBvZiBbJ2JlYXJpbmcnLCAncGl0Y2gnXSkge1xuICAgIGNvbnN0IHN0YXJ0VmFsdWUgPSBzdGFydFZpZXdwb3J0W3BdO1xuICAgIGNvbnN0IGVuZFZhbHVlID0gZW5kVmlld3BvcnRbcF07XG4gICAgdmlld3BvcnRbcF0gPSBsZXJwKHN0YXJ0VmFsdWUsIGVuZFZhbHVlLCB0KTtcbiAgfVxuXG4gIC8vIElmIGNoYW5nZSBpbiBjZW50ZXIgaXMgdG9vIHNtYWxsLCBkbyBsaW5lYXIgaW50ZXJwb2xhaXRvbi5cbiAgaWYgKE1hdGguYWJzKHUxKSA8IEVQU0lMT04pIHtcbiAgICBmb3IgKGNvbnN0IHAgb2YgWydsYXRpdHVkZScsICdsb25naXR1ZGUnLCAnem9vbSddKSB7XG4gICAgICBjb25zdCBzdGFydFZhbHVlID0gc3RhcnRWaWV3cG9ydFtwXTtcbiAgICAgIGNvbnN0IGVuZFZhbHVlID0gZW5kVmlld3BvcnRbcF07XG4gICAgICB2aWV3cG9ydFtwXSA9IGxlcnAoc3RhcnRWYWx1ZSwgZW5kVmFsdWUsIHQpO1xuICAgIH1cbiAgICByZXR1cm4gdmlld3BvcnQ7XG4gIH1cblxuICAvLyBJbXBsZW1lbnQgRXF1YXRpb24gKDkpIGZyb20gYWJvdmUgYWxnb3JpdGhtLlxuICBjb25zdCByaG8yID0gcmhvICogcmhvO1xuICBjb25zdCBiMCA9ICh3MSAqIHcxIC0gdzAgKiB3MCArIHJobzIgKiByaG8yICogdTEgKiB1MSkgLyAoMiAqIHcwICogcmhvMiAqIHUxKTtcbiAgY29uc3QgYjEgPSAodzEgKiB3MSAtIHcwICogdzAgLSByaG8yICogcmhvMiAqIHUxICogdTEpIC8gKDIgKiB3MSAqIHJobzIgKiB1MSk7XG4gIGNvbnN0IHIwID0gTWF0aC5sb2coTWF0aC5zcXJ0KGIwICogYjAgKyAxKSAtIGIwKTtcbiAgY29uc3QgcjEgPSBNYXRoLmxvZyhNYXRoLnNxcnQoYjEgKiBiMSArIDEpIC0gYjEpO1xuICBjb25zdCBTID0gKHIxIC0gcjApIC8gcmhvO1xuICBjb25zdCBzID0gdCAqIFM7XG5cbiAgY29uc3QgdyA9IChNYXRoLmNvc2gocjApIC8gTWF0aC5jb3NoKHIwICsgcmhvICogcykpO1xuICBjb25zdCB1ID0gdzAgKiAoKE1hdGguY29zaChyMCkgKiBNYXRoLnRhbmgocjAgKyByaG8gKiBzKSAtIE1hdGguc2luaChyMCkpIC8gcmhvMikgLyB1MTtcblxuICBjb25zdCBzY2FsZUluY3JlbWVudCA9IDEgLyB3OyAvLyBVc2luZyB3IG1ldGhvZCBmb3Igc2NhbGluZy5cbiAgY29uc3QgbmV3Wm9vbSA9IHN0YXJ0Wm9vbSArIHNjYWxlVG9ab29tKHNjYWxlSW5jcmVtZW50KTtcblxuICBjb25zdCBuZXdDZW50ZXIgPSB1bnByb2plY3RGbGF0KFxuICAgIChzdGFydENlbnRlclhZLmFkZCh1RGVsdGEuc2NhbGUodSkpKS5zY2FsZShzY2FsZUluY3JlbWVudCksXG4gICAgem9vbVRvU2NhbGUobmV3Wm9vbSkpO1xuICB2aWV3cG9ydC5sb25naXR1ZGUgPSBuZXdDZW50ZXJbMF07XG4gIHZpZXdwb3J0LmxhdGl0dWRlID0gbmV3Q2VudGVyWzFdO1xuICB2aWV3cG9ydC56b29tID0gbmV3Wm9vbTtcbiAgcmV0dXJuIHZpZXdwb3J0O1xufVxuIl19