var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import assert from 'assert';
import TransitionInterpolator from './transition-interpolator';

import { Vector2 } from 'math.gl';
import { projectFlat, unprojectFlat } from 'viewport-mercator-project';
import { isValid, lerp, getEndValueByShortestPath } from './transition-utils';

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
  _inherits(ViewportFlyToInterpolator, _TransitionInterpolat);

  function ViewportFlyToInterpolator() {
    _classCallCheck(this, ViewportFlyToInterpolator);

    var _this = _possibleConstructorReturn(this, (ViewportFlyToInterpolator.__proto__ || Object.getPrototypeOf(ViewportFlyToInterpolator)).call(this));

    _this.propNames = VIEWPORT_TRANSITION_PROPS;
    return _this;
  }

  _createClass(ViewportFlyToInterpolator, [{
    key: 'initializeProps',
    value: function initializeProps(startProps, endProps) {
      var startViewportProps = {};
      var endViewportProps = {};

      // Check minimum required props
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = REQUIRED_PROPS[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var key = _step.value;

          var startValue = startProps[key];
          var endValue = endProps[key];
          assert(isValid(startValue) && isValid(endValue), key + ' must be supplied for transition');
          startViewportProps[key] = startValue;
          endViewportProps[key] = getEndValueByShortestPath(key, startValue, endValue);
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
        for (var _iterator2 = LINEARLY_INTERPOLATED_PROPS[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _key = _step2.value;

          var _startValue = startProps[_key] || 0;
          var _endValue = endProps[_key] || 0;
          startViewportProps[_key] = _startValue;
          endViewportProps[_key] = getEndValueByShortestPath(_key, _startValue, _endValue);
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
}(TransitionInterpolator);

/** Util functions */


export default ViewportFlyToInterpolator;
function zoomToScale(zoom) {
  return Math.pow(2, zoom);
}

function scaleToZoom(scale) {
  return Math.log2(scale);
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

  var startCenterXY = new Vector2(projectFlat(startCenter, startScale));
  var endCenterXY = new Vector2(projectFlat(endCenter, startScale));
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
    for (var _iterator3 = LINEARLY_INTERPOLATED_PROPS[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var _key2 = _step3.value;

      viewport[_key2] = lerp(startProps[_key2], endProps[_key2], t);
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
      for (var _iterator4 = LINEARLY_INTERPOLATED_PROPS_ALT[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var key = _step4.value;

        var startValue = startProps[key];
        var endValue = endProps[key];
        viewport[key] = lerp(startValue, endValue, t);
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

  var w = Math.cosh(r0) / Math.cosh(r0 + rho * s);
  var u = w0 * ((Math.cosh(r0) * Math.tanh(r0 + rho * s) - Math.sinh(r0)) / rho2) / u1;

  var scaleIncrement = 1 / w; // Using w method for scaling.
  var newZoom = startZoom + scaleToZoom(scaleIncrement);

  var newCenter = unprojectFlat(startCenterXY.add(uDelta.scale(u)).scale(scaleIncrement), zoomToScale(newZoom));
  viewport.longitude = newCenter[0];
  viewport.latitude = newCenter[1];
  viewport.zoom = newZoom;
  return viewport;
}
/* eslint-enable max-statements */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy90cmFuc2l0aW9uL3ZpZXdwb3J0LWZseS10by1pbnRlcnBvbGF0b3IuanMiXSwibmFtZXMiOlsiYXNzZXJ0IiwiVHJhbnNpdGlvbkludGVycG9sYXRvciIsIlZlY3RvcjIiLCJwcm9qZWN0RmxhdCIsInVucHJvamVjdEZsYXQiLCJpc1ZhbGlkIiwibGVycCIsImdldEVuZFZhbHVlQnlTaG9ydGVzdFBhdGgiLCJFUFNJTE9OIiwiVklFV1BPUlRfVFJBTlNJVElPTl9QUk9QUyIsIlJFUVVJUkVEX1BST1BTIiwiTElORUFSTFlfSU5URVJQT0xBVEVEX1BST1BTIiwiTElORUFSTFlfSU5URVJQT0xBVEVEX1BST1BTX0FMVCIsIlZpZXdwb3J0Rmx5VG9JbnRlcnBvbGF0b3IiLCJwcm9wTmFtZXMiLCJzdGFydFByb3BzIiwiZW5kUHJvcHMiLCJzdGFydFZpZXdwb3J0UHJvcHMiLCJlbmRWaWV3cG9ydFByb3BzIiwia2V5Iiwic3RhcnRWYWx1ZSIsImVuZFZhbHVlIiwic3RhcnQiLCJlbmQiLCJ0Iiwidmlld3BvcnRGbHlUb0ludGVycG9sYXRvciIsInpvb21Ub1NjYWxlIiwiem9vbSIsIk1hdGgiLCJwb3ciLCJzY2FsZVRvWm9vbSIsInNjYWxlIiwibG9nMiIsInZpZXdwb3J0IiwicmhvIiwic3RhcnRab29tIiwic3RhcnRDZW50ZXIiLCJsb25naXR1ZGUiLCJsYXRpdHVkZSIsInN0YXJ0U2NhbGUiLCJlbmRab29tIiwiZW5kQ2VudGVyIiwic3RhcnRDZW50ZXJYWSIsImVuZENlbnRlclhZIiwidURlbHRhIiwic3VidHJhY3QiLCJ3MCIsIm1heCIsIndpZHRoIiwiaGVpZ2h0IiwidzEiLCJ1MSIsInNxcnQiLCJ4IiwieSIsImFicyIsInJobzIiLCJiMCIsImIxIiwicjAiLCJsb2ciLCJyMSIsIlMiLCJzIiwidyIsImNvc2giLCJ1IiwidGFuaCIsInNpbmgiLCJzY2FsZUluY3JlbWVudCIsIm5ld1pvb20iLCJuZXdDZW50ZXIiLCJh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TSxLQUFLQSxFQUFMLEdBQVUsQ0FBcEIsSUFBeUJBLEVBQWxDLENBQVg7QUFDQSxNQUFNSSxJQUFJLENBQUNELEtBQUtGLEVBQU4sSUFBWXpCLEdBQXRCO0FBQ0EsTUFBTTZCLElBQUl2QyxJQUFJc0MsQ0FBZDs7QUFFQSxNQUFNRSxJQUFLcEMsS0FBS3FDLElBQUwsQ0FBVU4sRUFBVixJQUFnQi9CLEtBQUtxQyxJQUFMLENBQVVOLEtBQUt6QixNQUFNNkIsQ0FBckIsQ0FBM0I7QUFDQSxNQUFNRyxJQUFJcEIsTUFBTSxDQUFDbEIsS0FBS3FDLElBQUwsQ0FBVU4sRUFBVixJQUFnQi9CLEtBQUt1QyxJQUFMLENBQVVSLEtBQUt6QixNQUFNNkIsQ0FBckIsQ0FBaEIsR0FBMENuQyxLQUFLd0MsSUFBTCxDQUFVVCxFQUFWLENBQTNDLElBQTRESCxJQUFsRSxJQUEwRUwsRUFBcEY7O0FBRUEsTUFBTWtCLGlCQUFpQixJQUFJTCxDQUEzQixDQW5EMEQsQ0FtRDVCO0FBQzlCLE1BQU1NLFVBQVVuQyxZQUFZTCxZQUFZdUMsY0FBWixDQUE1Qjs7QUFFQSxNQUFNRSxZQUFZbkUsY0FDZnNDLGNBQWM4QixHQUFkLENBQWtCNUIsT0FBT2IsS0FBUCxDQUFhbUMsQ0FBYixDQUFsQixDQUFELENBQXFDbkMsS0FBckMsQ0FBMkNzQyxjQUEzQyxDQURnQixFQUVoQjNDLFlBQVk0QyxPQUFaLENBRmdCLENBQWxCO0FBR0FyQyxXQUFTSSxTQUFULEdBQXFCa0MsVUFBVSxDQUFWLENBQXJCO0FBQ0F0QyxXQUFTSyxRQUFULEdBQW9CaUMsVUFBVSxDQUFWLENBQXBCO0FBQ0F0QyxXQUFTTixJQUFULEdBQWdCMkMsT0FBaEI7QUFDQSxTQUFPckMsUUFBUDtBQUNEO0FBQ0QiLCJmaWxlIjoidmlld3BvcnQtZmx5LXRvLWludGVycG9sYXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBUcmFuc2l0aW9uSW50ZXJwb2xhdG9yIGZyb20gJy4vdHJhbnNpdGlvbi1pbnRlcnBvbGF0b3InO1xuXG5pbXBvcnQge1ZlY3RvcjJ9IGZyb20gJ21hdGguZ2wnO1xuaW1wb3J0IHtwcm9qZWN0RmxhdCwgdW5wcm9qZWN0RmxhdH0gZnJvbSAndmlld3BvcnQtbWVyY2F0b3ItcHJvamVjdCc7XG5pbXBvcnQge2lzVmFsaWQsIGxlcnAsIGdldEVuZFZhbHVlQnlTaG9ydGVzdFBhdGh9IGZyb20gJy4vdHJhbnNpdGlvbi11dGlscyc7XG5cbmNvbnN0IEVQU0lMT04gPSAwLjAxO1xuY29uc3QgVklFV1BPUlRfVFJBTlNJVElPTl9QUk9QUyA9IFsnbG9uZ2l0dWRlJywgJ2xhdGl0dWRlJywgJ3pvb20nLCAnYmVhcmluZycsICdwaXRjaCddO1xuY29uc3QgUkVRVUlSRURfUFJPUFMgPSBbJ2xhdGl0dWRlJywgJ2xvbmdpdHVkZScsICd6b29tJywgJ3dpZHRoJywgJ2hlaWdodCddO1xuY29uc3QgTElORUFSTFlfSU5URVJQT0xBVEVEX1BST1BTID0gWydiZWFyaW5nJywgJ3BpdGNoJ107XG5jb25zdCBMSU5FQVJMWV9JTlRFUlBPTEFURURfUFJPUFNfQUxUID0gWydsYXRpdHVkZScsICdsb25naXR1ZGUnLCAnem9vbSddO1xuXG4vKipcbiAqIFRoaXMgY2xhc3MgYWRhcHRzIG1hcGJveC1nbC1qcyBNYXAjZmx5VG8gYW5pbWF0aW9uIHNvIGl0IGNhbiBiZSB1c2VkIGluXG4gKiByZWFjdC9yZWR1eCBhcmNoaXRlY3R1cmUuXG4gKiBtYXBib3gtZ2wtanMgZmx5VG8gOiBodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1qcy9hcGkvI21hcCNmbHl0by5cbiAqIEl0IGltcGxlbWVudHMg4oCcU21vb3RoIGFuZCBlZmZpY2llbnQgem9vbWluZyBhbmQgcGFubmluZy7igJ0gYWxnb3JpdGhtIGJ5XG4gKiBcIkphcmtlIEouIHZhbiBXaWprIGFuZCBXaW0gQS5BLiBOdWlqXCJcbiovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWaWV3cG9ydEZseVRvSW50ZXJwb2xhdG9yIGV4dGVuZHMgVHJhbnNpdGlvbkludGVycG9sYXRvciB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnByb3BOYW1lcyA9IFZJRVdQT1JUX1RSQU5TSVRJT05fUFJPUFM7XG4gIH1cblxuICBpbml0aWFsaXplUHJvcHMoc3RhcnRQcm9wcywgZW5kUHJvcHMpIHtcbiAgICBjb25zdCBzdGFydFZpZXdwb3J0UHJvcHMgPSB7fTtcbiAgICBjb25zdCBlbmRWaWV3cG9ydFByb3BzID0ge307XG5cbiAgICAvLyBDaGVjayBtaW5pbXVtIHJlcXVpcmVkIHByb3BzXG4gICAgZm9yIChjb25zdCBrZXkgb2YgUkVRVUlSRURfUFJPUFMpIHtcbiAgICAgIGNvbnN0IHN0YXJ0VmFsdWUgPSBzdGFydFByb3BzW2tleV07XG4gICAgICBjb25zdCBlbmRWYWx1ZSA9IGVuZFByb3BzW2tleV07XG4gICAgICBhc3NlcnQoaXNWYWxpZChzdGFydFZhbHVlKSAmJiBpc1ZhbGlkKGVuZFZhbHVlKSwgYCR7a2V5fSBtdXN0IGJlIHN1cHBsaWVkIGZvciB0cmFuc2l0aW9uYCk7XG4gICAgICBzdGFydFZpZXdwb3J0UHJvcHNba2V5XSA9IHN0YXJ0VmFsdWU7XG4gICAgICBlbmRWaWV3cG9ydFByb3BzW2tleV0gPSBnZXRFbmRWYWx1ZUJ5U2hvcnRlc3RQYXRoKGtleSwgc3RhcnRWYWx1ZSwgZW5kVmFsdWUpO1xuICAgIH1cblxuICAgIGZvciAoY29uc3Qga2V5IG9mIExJTkVBUkxZX0lOVEVSUE9MQVRFRF9QUk9QUykge1xuICAgICAgY29uc3Qgc3RhcnRWYWx1ZSA9IHN0YXJ0UHJvcHNba2V5XSB8fCAwO1xuICAgICAgY29uc3QgZW5kVmFsdWUgPSBlbmRQcm9wc1trZXldIHx8IDA7XG4gICAgICBzdGFydFZpZXdwb3J0UHJvcHNba2V5XSA9IHN0YXJ0VmFsdWU7XG4gICAgICBlbmRWaWV3cG9ydFByb3BzW2tleV0gPSBnZXRFbmRWYWx1ZUJ5U2hvcnRlc3RQYXRoKGtleSwgc3RhcnRWYWx1ZSwgZW5kVmFsdWUpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBzdGFydDogc3RhcnRWaWV3cG9ydFByb3BzLFxuICAgICAgZW5kOiBlbmRWaWV3cG9ydFByb3BzXG4gICAgfTtcbiAgfVxuXG4gIGludGVycG9sYXRlUHJvcHMoc3RhcnRQcm9wcywgZW5kUHJvcHMsIHQpIHtcbiAgICByZXR1cm4gdmlld3BvcnRGbHlUb0ludGVycG9sYXRvcihzdGFydFByb3BzLCBlbmRQcm9wcywgdCk7XG4gIH1cblxufVxuXG4vKiogVXRpbCBmdW5jdGlvbnMgKi9cbmZ1bmN0aW9uIHpvb21Ub1NjYWxlKHpvb20pIHtcbiAgcmV0dXJuIE1hdGgucG93KDIsIHpvb20pO1xufVxuXG5mdW5jdGlvbiBzY2FsZVRvWm9vbShzY2FsZSkge1xuICByZXR1cm4gTWF0aC5sb2cyKHNjYWxlKTtcbn1cblxuLyogZXNsaW50LWRpc2FibGUgbWF4LXN0YXRlbWVudHMgKi9cbmZ1bmN0aW9uIHZpZXdwb3J0Rmx5VG9JbnRlcnBvbGF0b3Ioc3RhcnRQcm9wcywgZW5kUHJvcHMsIHQpIHtcbiAgLy8gRXF1YXRpb25zIGZyb20gYWJvdmUgcGFwZXIgYXJlIHJlZmVycmVkIHdoZXJlIG5lZWRlZC5cblxuICBjb25zdCB2aWV3cG9ydCA9IHt9O1xuXG4gIC8vIFRPRE86IGFkZCB0aGlzIGFzIGFuIG9wdGlvbiBmb3IgYXBwbGljYXRpb25zLlxuICBjb25zdCByaG8gPSAxLjQxNDtcblxuICBjb25zdCBzdGFydFpvb20gPSBzdGFydFByb3BzLnpvb207XG4gIGNvbnN0IHN0YXJ0Q2VudGVyID0gW3N0YXJ0UHJvcHMubG9uZ2l0dWRlLCBzdGFydFByb3BzLmxhdGl0dWRlXTtcbiAgY29uc3Qgc3RhcnRTY2FsZSA9IHpvb21Ub1NjYWxlKHN0YXJ0Wm9vbSk7XG4gIGNvbnN0IGVuZFpvb20gPSBlbmRQcm9wcy56b29tO1xuICBjb25zdCBlbmRDZW50ZXIgPSBbZW5kUHJvcHMubG9uZ2l0dWRlLCBlbmRQcm9wcy5sYXRpdHVkZV07XG4gIGNvbnN0IHNjYWxlID0gem9vbVRvU2NhbGUoZW5kWm9vbSAtIHN0YXJ0Wm9vbSk7XG5cbiAgY29uc3Qgc3RhcnRDZW50ZXJYWSA9IG5ldyBWZWN0b3IyKHByb2plY3RGbGF0KHN0YXJ0Q2VudGVyLCBzdGFydFNjYWxlKSk7XG4gIGNvbnN0IGVuZENlbnRlclhZID0gbmV3IFZlY3RvcjIocHJvamVjdEZsYXQoZW5kQ2VudGVyLCBzdGFydFNjYWxlKSk7XG4gIGNvbnN0IHVEZWx0YSA9IGVuZENlbnRlclhZLnN1YnRyYWN0KHN0YXJ0Q2VudGVyWFkpO1xuXG4gIGNvbnN0IHcwID0gTWF0aC5tYXgoc3RhcnRQcm9wcy53aWR0aCwgc3RhcnRQcm9wcy5oZWlnaHQpO1xuICBjb25zdCB3MSA9IHcwIC8gc2NhbGU7XG4gIGNvbnN0IHUxID0gTWF0aC5zcXJ0KCh1RGVsdGEueCAqIHVEZWx0YS54KSArICh1RGVsdGEueSAqIHVEZWx0YS55KSk7XG4gIC8vIHUwIGlzIHRyZWF0ZWQgYXMgJzAnIGluIEVxICg5KS5cblxuICAvLyBMaW5lYXJseSBpbnRlcnBvbGF0ZSAnYmVhcmluZycgYW5kICdwaXRjaCcgaWYgZXhpc3QuXG4gIGZvciAoY29uc3Qga2V5IG9mIExJTkVBUkxZX0lOVEVSUE9MQVRFRF9QUk9QUykge1xuICAgIHZpZXdwb3J0W2tleV0gPSBsZXJwKHN0YXJ0UHJvcHNba2V5XSwgZW5kUHJvcHNba2V5XSwgdCk7XG4gIH1cblxuICAvLyBJZiBjaGFuZ2UgaW4gY2VudGVyIGlzIHRvbyBzbWFsbCwgZG8gbGluZWFyIGludGVycG9sYWl0b24uXG4gIGlmIChNYXRoLmFicyh1MSkgPCBFUFNJTE9OKSB7XG4gICAgZm9yIChjb25zdCBrZXkgb2YgTElORUFSTFlfSU5URVJQT0xBVEVEX1BST1BTX0FMVCkge1xuICAgICAgY29uc3Qgc3RhcnRWYWx1ZSA9IHN0YXJ0UHJvcHNba2V5XTtcbiAgICAgIGNvbnN0IGVuZFZhbHVlID0gZW5kUHJvcHNba2V5XTtcbiAgICAgIHZpZXdwb3J0W2tleV0gPSBsZXJwKHN0YXJ0VmFsdWUsIGVuZFZhbHVlLCB0KTtcbiAgICB9XG4gICAgcmV0dXJuIHZpZXdwb3J0O1xuICB9XG5cbiAgLy8gSW1wbGVtZW50IEVxdWF0aW9uICg5KSBmcm9tIGFib3ZlIGFsZ29yaXRobS5cbiAgY29uc3QgcmhvMiA9IHJobyAqIHJobztcbiAgY29uc3QgYjAgPSAodzEgKiB3MSAtIHcwICogdzAgKyByaG8yICogcmhvMiAqIHUxICogdTEpIC8gKDIgKiB3MCAqIHJobzIgKiB1MSk7XG4gIGNvbnN0IGIxID0gKHcxICogdzEgLSB3MCAqIHcwIC0gcmhvMiAqIHJobzIgKiB1MSAqIHUxKSAvICgyICogdzEgKiByaG8yICogdTEpO1xuICBjb25zdCByMCA9IE1hdGgubG9nKE1hdGguc3FydChiMCAqIGIwICsgMSkgLSBiMCk7XG4gIGNvbnN0IHIxID0gTWF0aC5sb2coTWF0aC5zcXJ0KGIxICogYjEgKyAxKSAtIGIxKTtcbiAgY29uc3QgUyA9IChyMSAtIHIwKSAvIHJobztcbiAgY29uc3QgcyA9IHQgKiBTO1xuXG4gIGNvbnN0IHcgPSAoTWF0aC5jb3NoKHIwKSAvIE1hdGguY29zaChyMCArIHJobyAqIHMpKTtcbiAgY29uc3QgdSA9IHcwICogKChNYXRoLmNvc2gocjApICogTWF0aC50YW5oKHIwICsgcmhvICogcykgLSBNYXRoLnNpbmgocjApKSAvIHJobzIpIC8gdTE7XG5cbiAgY29uc3Qgc2NhbGVJbmNyZW1lbnQgPSAxIC8gdzsgLy8gVXNpbmcgdyBtZXRob2QgZm9yIHNjYWxpbmcuXG4gIGNvbnN0IG5ld1pvb20gPSBzdGFydFpvb20gKyBzY2FsZVRvWm9vbShzY2FsZUluY3JlbWVudCk7XG5cbiAgY29uc3QgbmV3Q2VudGVyID0gdW5wcm9qZWN0RmxhdChcbiAgICAoc3RhcnRDZW50ZXJYWS5hZGQodURlbHRhLnNjYWxlKHUpKSkuc2NhbGUoc2NhbGVJbmNyZW1lbnQpLFxuICAgIHpvb21Ub1NjYWxlKG5ld1pvb20pKTtcbiAgdmlld3BvcnQubG9uZ2l0dWRlID0gbmV3Q2VudGVyWzBdO1xuICB2aWV3cG9ydC5sYXRpdHVkZSA9IG5ld0NlbnRlclsxXTtcbiAgdmlld3BvcnQuem9vbSA9IG5ld1pvb207XG4gIHJldHVybiB2aWV3cG9ydDtcbn1cbi8qIGVzbGludC1lbmFibGUgbWF4LXN0YXRlbWVudHMgKi9cbiJdfQ==