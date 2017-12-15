/* eslint max-statements: ["error", 50] */

import { projectFlat, unprojectFlat } from 'viewport-mercator-project';
import { Vector2 } from 'math.gl';

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
  return Math.log2(scale);
}

export function extractViewportFrom(props) {
  var viewport = {};
  VIEWPORT_PROPS.forEach(function (key) {
    if (typeof props[key] !== 'undefined') {
      viewport[key] = props[key];
    }
  });
  return viewport;
}

/* eslint-disable max-depth */
export function areViewportsEqual(startViewport, endViewport) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = VIEWPORT_INTERPOLATION_PROPS[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
export function viewportLinearInterpolator(startViewport, endViewport, t) {
  var viewport = {};

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = VIEWPORT_INTERPOLATION_PROPS[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
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
export function viewportFlyToInterpolator(startViewport, endViewport, t) {
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

  var startCenterXY = new Vector2(projectFlat(startCenter, startScale));
  var endCenterXY = new Vector2(projectFlat(endCenter, startScale));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy92aWV3cG9ydC10cmFuc2l0aW9uLXV0aWxzLmpzIl0sIm5hbWVzIjpbInByb2plY3RGbGF0IiwidW5wcm9qZWN0RmxhdCIsIlZlY3RvcjIiLCJFUFNJTE9OIiwiVklFV1BPUlRfUFJPUFMiLCJWSUVXUE9SVF9JTlRFUlBPTEFUSU9OX1BST1BTIiwibGVycCIsInN0YXJ0IiwiZW5kIiwic3RlcCIsIkFycmF5IiwiaXNBcnJheSIsIm1hcCIsImVsZW1lbnQiLCJpbmRleCIsInpvb21Ub1NjYWxlIiwiem9vbSIsIk1hdGgiLCJwb3ciLCJzY2FsZVRvWm9vbSIsInNjYWxlIiwibG9nMiIsImV4dHJhY3RWaWV3cG9ydEZyb20iLCJwcm9wcyIsInZpZXdwb3J0IiwiZm9yRWFjaCIsImtleSIsImFyZVZpZXdwb3J0c0VxdWFsIiwic3RhcnRWaWV3cG9ydCIsImVuZFZpZXdwb3J0IiwicCIsImkiLCJsZW5ndGgiLCJ2aWV3cG9ydExpbmVhckludGVycG9sYXRvciIsInQiLCJzdGFydFZhbHVlIiwiZW5kVmFsdWUiLCJ2aWV3cG9ydEZseVRvSW50ZXJwb2xhdG9yIiwicmhvIiwic3RhcnRab29tIiwic3RhcnRDZW50ZXIiLCJsb25naXR1ZGUiLCJsYXRpdHVkZSIsInN0YXJ0U2NhbGUiLCJlbmRab29tIiwiZW5kQ2VudGVyIiwic3RhcnRDZW50ZXJYWSIsImVuZENlbnRlclhZIiwidURlbHRhIiwic3VidHJhY3QiLCJ3MCIsIm1heCIsIndpZHRoIiwiaGVpZ2h0IiwidzEiLCJ1MSIsInNxcnQiLCJ4IiwieSIsImFicyIsInJobzIiLCJiMCIsImIxIiwicjAiLCJsb2ciLCJyMSIsIlMiLCJzIiwidyIsImNvc2giLCJ1IiwidGFuaCIsInNpbmgiLCJzY2FsZUluY3JlbWVudCIsIm5ld1pvb20iLCJuZXdDZW50ZXIiLCJhZGQiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBLFNBQVFBLFdBQVIsRUFBcUJDLGFBQXJCLFFBQXlDLDJCQUF6QztBQUNBLFNBQVFDLE9BQVIsUUFBc0IsU0FBdEI7O0FBRUEsSUFBTUMsVUFBVSxJQUFoQjtBQUNBLElBQU1DLGlCQUFpQixDQUFDLFdBQUQsRUFBYyxVQUFkLEVBQTBCLE1BQTFCLEVBQWtDLFNBQWxDLEVBQTZDLE9BQTdDLEVBQ3JCLFVBRHFCLEVBQ1QsT0FEUyxFQUNBLFFBREEsQ0FBdkI7QUFFQSxJQUFNQywrQkFDSixDQUFDLFdBQUQsRUFBYyxVQUFkLEVBQTBCLE1BQTFCLEVBQWtDLFNBQWxDLEVBQTZDLE9BQTdDLEVBQXNELFVBQXRELENBREY7O0FBR0E7QUFDQSxTQUFTQyxJQUFULENBQWNDLEtBQWQsRUFBcUJDLEdBQXJCLEVBQTBCQyxJQUExQixFQUFnQztBQUM5QixNQUFJQyxNQUFNQyxPQUFOLENBQWNKLEtBQWQsQ0FBSixFQUEwQjtBQUN4QixXQUFPQSxNQUFNSyxHQUFOLENBQVUsVUFBQ0MsT0FBRCxFQUFVQyxLQUFWLEVBQW9CO0FBQ25DLGFBQU9SLEtBQUtPLE9BQUwsRUFBY0wsSUFBSU0sS0FBSixDQUFkLEVBQTBCTCxJQUExQixDQUFQO0FBQ0QsS0FGTSxDQUFQO0FBR0Q7QUFDRCxTQUFPQSxPQUFPRCxHQUFQLEdBQWEsQ0FBQyxJQUFJQyxJQUFMLElBQWFGLEtBQWpDO0FBQ0Q7O0FBRUQsU0FBU1EsV0FBVCxDQUFxQkMsSUFBckIsRUFBMkI7QUFDekIsU0FBT0MsS0FBS0MsR0FBTCxDQUFTLENBQVQsRUFBWUYsSUFBWixDQUFQO0FBQ0Q7O0FBRUQsU0FBU0csV0FBVCxDQUFxQkMsS0FBckIsRUFBNEI7QUFDMUIsU0FBT0gsS0FBS0ksSUFBTCxDQUFVRCxLQUFWLENBQVA7QUFDRDs7QUFFRCxPQUFPLFNBQVNFLG1CQUFULENBQTZCQyxLQUE3QixFQUFvQztBQUN6QyxNQUFNQyxXQUFXLEVBQWpCO0FBQ0FwQixpQkFBZXFCLE9BQWYsQ0FBdUIsVUFBQ0MsR0FBRCxFQUFTO0FBQzlCLFFBQUksT0FBT0gsTUFBTUcsR0FBTixDQUFQLEtBQXNCLFdBQTFCLEVBQXVDO0FBQ3JDRixlQUFTRSxHQUFULElBQWdCSCxNQUFNRyxHQUFOLENBQWhCO0FBQ0Q7QUFDRixHQUpEO0FBS0EsU0FBT0YsUUFBUDtBQUNEOztBQUVEO0FBQ0EsT0FBTyxTQUFTRyxpQkFBVCxDQUEyQkMsYUFBM0IsRUFBMENDLFdBQTFDLEVBQXVEO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQzVELHlCQUFnQnhCLDRCQUFoQiw4SEFBOEM7QUFBQSxVQUFuQ3lCLENBQW1DOztBQUM1QyxVQUFJcEIsTUFBTUMsT0FBTixDQUFjaUIsY0FBY0UsQ0FBZCxDQUFkLENBQUosRUFBcUM7QUFDbkMsYUFBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlILGNBQWNFLENBQWQsRUFBaUJFLE1BQXJDLEVBQTZDLEVBQUVELENBQS9DLEVBQWtEO0FBQ2hELGNBQUlILGNBQWNFLENBQWQsRUFBaUJDLENBQWpCLE1BQXdCRixZQUFZQyxDQUFaLEVBQWVDLENBQWYsQ0FBNUIsRUFBK0M7QUFDN0MsbUJBQU8sS0FBUDtBQUNEO0FBQ0Y7QUFDRixPQU5ELE1BTU8sSUFBSUgsY0FBY0UsQ0FBZCxNQUFxQkQsWUFBWUMsQ0FBWixDQUF6QixFQUF5QztBQUM5QyxlQUFPLEtBQVA7QUFDRDtBQUNGO0FBWDJEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBWTVELFNBQU8sSUFBUDtBQUNEO0FBQ0Q7O0FBRUE7Ozs7Ozs7QUFPQSxPQUFPLFNBQVNHLDBCQUFULENBQW9DTCxhQUFwQyxFQUFtREMsV0FBbkQsRUFBZ0VLLENBQWhFLEVBQW1FO0FBQ3hFLE1BQU1WLFdBQVcsRUFBakI7O0FBRHdFO0FBQUE7QUFBQTs7QUFBQTtBQUd4RSwwQkFBZ0JuQiw0QkFBaEIsbUlBQThDO0FBQUEsVUFBbkN5QixDQUFtQzs7QUFDNUMsVUFBTUssYUFBYVAsY0FBY0UsQ0FBZCxDQUFuQjtBQUNBLFVBQU1NLFdBQVdQLFlBQVlDLENBQVosQ0FBakI7QUFDQTtBQUNBLFVBQUksT0FBT0ssVUFBUCxLQUFzQixXQUF0QixJQUFxQyxPQUFPQyxRQUFQLEtBQW9CLFdBQTdELEVBQTBFO0FBQ3hFWixpQkFBU00sQ0FBVCxJQUFjeEIsS0FBSzZCLFVBQUwsRUFBaUJDLFFBQWpCLEVBQTJCRixDQUEzQixDQUFkO0FBQ0Q7QUFDRjtBQVZ1RTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQVd4RSxTQUFPVixRQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozs7OztBQVlBLE9BQU8sU0FBU2EseUJBQVQsQ0FBbUNULGFBQW5DLEVBQWtEQyxXQUFsRCxFQUErREssQ0FBL0QsRUFBa0U7QUFDdkU7O0FBRUEsTUFBTVYsV0FBVyxFQUFqQjs7QUFFQTtBQUNBLE1BQU1jLE1BQU0sS0FBWjs7QUFFQSxNQUFNQyxZQUFZWCxjQUFjWixJQUFoQztBQUNBLE1BQU13QixjQUFjLENBQUNaLGNBQWNhLFNBQWYsRUFBMEJiLGNBQWNjLFFBQXhDLENBQXBCO0FBQ0EsTUFBTUMsYUFBYTVCLFlBQVl3QixTQUFaLENBQW5CO0FBQ0EsTUFBTUssVUFBVWYsWUFBWWIsSUFBNUI7QUFDQSxNQUFNNkIsWUFBWSxDQUFDaEIsWUFBWVksU0FBYixFQUF3QlosWUFBWWEsUUFBcEMsQ0FBbEI7QUFDQSxNQUFNdEIsUUFBUUwsWUFBWTZCLFVBQVVMLFNBQXRCLENBQWQ7O0FBRUEsTUFBTU8sZ0JBQWdCLElBQUk1QyxPQUFKLENBQVlGLFlBQVl3QyxXQUFaLEVBQXlCRyxVQUF6QixDQUFaLENBQXRCO0FBQ0EsTUFBTUksY0FBYyxJQUFJN0MsT0FBSixDQUFZRixZQUFZNkMsU0FBWixFQUF1QkYsVUFBdkIsQ0FBWixDQUFwQjtBQUNBLE1BQU1LLFNBQVNELFlBQVlFLFFBQVosQ0FBcUJILGFBQXJCLENBQWY7O0FBRUEsTUFBTUksS0FBS2pDLEtBQUtrQyxHQUFMLENBQVN2QixjQUFjd0IsS0FBdkIsRUFBOEJ4QixjQUFjeUIsTUFBNUMsQ0FBWDtBQUNBLE1BQU1DLEtBQUtKLEtBQUs5QixLQUFoQjtBQUNBLE1BQU1tQyxLQUFLdEMsS0FBS3VDLElBQUwsQ0FBV1IsT0FBT1MsQ0FBUCxHQUFXVCxPQUFPUyxDQUFuQixHQUF5QlQsT0FBT1UsQ0FBUCxHQUFXVixPQUFPVSxDQUFyRCxDQUFYO0FBQ0E7O0FBRUE7QUF4QnVFLGFBeUJ2RCxDQUFDLFNBQUQsRUFBWSxPQUFaLENBekJ1RDtBQXlCdkUsMkNBQXNDO0FBQWpDLFFBQU01QixhQUFOO0FBQ0gsUUFBTUssY0FBYVAsY0FBY0UsRUFBZCxDQUFuQjtBQUNBLFFBQU1NLFlBQVdQLFlBQVlDLEVBQVosQ0FBakI7QUFDQU4sYUFBU00sRUFBVCxJQUFjeEIsS0FBSzZCLFdBQUwsRUFBaUJDLFNBQWpCLEVBQTJCRixDQUEzQixDQUFkO0FBQ0Q7O0FBRUQ7QUFDQSxNQUFJakIsS0FBSzBDLEdBQUwsQ0FBU0osRUFBVCxJQUFlcEQsT0FBbkIsRUFBNEI7QUFBQSxnQkFDVixDQUFDLFVBQUQsRUFBYSxXQUFiLEVBQTBCLE1BQTFCLENBRFU7O0FBQzFCLGlEQUFtRDtBQUE5QyxVQUFNMkIsY0FBTjtBQUNILFVBQU1LLGFBQWFQLGNBQWNFLENBQWQsQ0FBbkI7QUFDQSxVQUFNTSxXQUFXUCxZQUFZQyxDQUFaLENBQWpCO0FBQ0FOLGVBQVNNLENBQVQsSUFBY3hCLEtBQUs2QixVQUFMLEVBQWlCQyxRQUFqQixFQUEyQkYsQ0FBM0IsQ0FBZDtBQUNEO0FBQ0QsV0FBT1YsUUFBUDtBQUNEOztBQUVEO0FBQ0EsTUFBTW9DLE9BQU90QixNQUFNQSxHQUFuQjtBQUNBLE1BQU11QixLQUFLLENBQUNQLEtBQUtBLEVBQUwsR0FBVUosS0FBS0EsRUFBZixHQUFvQlUsT0FBT0EsSUFBUCxHQUFjTCxFQUFkLEdBQW1CQSxFQUF4QyxLQUErQyxJQUFJTCxFQUFKLEdBQVNVLElBQVQsR0FBZ0JMLEVBQS9ELENBQVg7QUFDQSxNQUFNTyxLQUFLLENBQUNSLEtBQUtBLEVBQUwsR0FBVUosS0FBS0EsRUFBZixHQUFvQlUsT0FBT0EsSUFBUCxHQUFjTCxFQUFkLEdBQW1CQSxFQUF4QyxLQUErQyxJQUFJRCxFQUFKLEdBQVNNLElBQVQsR0FBZ0JMLEVBQS9ELENBQVg7QUFDQSxNQUFNUSxLQUFLOUMsS0FBSytDLEdBQUwsQ0FBUy9DLEtBQUt1QyxJQUFMLENBQVVLLEtBQUtBLEVBQUwsR0FBVSxDQUFwQixJQUF5QkEsRUFBbEMsQ0FBWDtBQUNBLE1BQU1JLEtBQUtoRCxLQUFLK0MsR0FBTCxDQUFTL0MsS0FBS3VDLElBQUwsQ0FBVU0sS0FBS0EsRUFBTCxHQUFVLENBQXBCLElBQXlCQSxFQUFsQyxDQUFYO0FBQ0EsTUFBTUksSUFBSSxDQUFDRCxLQUFLRixFQUFOLElBQVl6QixHQUF0QjtBQUNBLE1BQU02QixJQUFJakMsSUFBSWdDLENBQWQ7O0FBRUEsTUFBTUUsSUFBS25ELEtBQUtvRCxJQUFMLENBQVVOLEVBQVYsSUFBZ0I5QyxLQUFLb0QsSUFBTCxDQUFVTixLQUFLekIsTUFBTTZCLENBQXJCLENBQTNCO0FBQ0EsTUFBTUcsSUFBSXBCLE1BQU0sQ0FBQ2pDLEtBQUtvRCxJQUFMLENBQVVOLEVBQVYsSUFBZ0I5QyxLQUFLc0QsSUFBTCxDQUFVUixLQUFLekIsTUFBTTZCLENBQXJCLENBQWhCLEdBQTBDbEQsS0FBS3VELElBQUwsQ0FBVVQsRUFBVixDQUEzQyxJQUE0REgsSUFBbEUsSUFBMEVMLEVBQXBGOztBQUVBLE1BQU1rQixpQkFBaUIsSUFBSUwsQ0FBM0IsQ0FyRHVFLENBcUR6QztBQUM5QixNQUFNTSxVQUFVbkMsWUFBWXBCLFlBQVlzRCxjQUFaLENBQTVCOztBQUVBLE1BQU1FLFlBQVkxRSxjQUNmNkMsY0FBYzhCLEdBQWQsQ0FBa0I1QixPQUFPNUIsS0FBUCxDQUFha0QsQ0FBYixDQUFsQixDQUFELENBQXFDbEQsS0FBckMsQ0FBMkNxRCxjQUEzQyxDQURnQixFQUVoQjFELFlBQVkyRCxPQUFaLENBRmdCLENBQWxCO0FBR0FsRCxXQUFTaUIsU0FBVCxHQUFxQmtDLFVBQVUsQ0FBVixDQUFyQjtBQUNBbkQsV0FBU2tCLFFBQVQsR0FBb0JpQyxVQUFVLENBQVYsQ0FBcEI7QUFDQW5ELFdBQVNSLElBQVQsR0FBZ0IwRCxPQUFoQjtBQUNBLFNBQU9sRCxRQUFQO0FBQ0QiLCJmaWxlIjoidmlld3BvcnQtdHJhbnNpdGlvbi11dGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludCBtYXgtc3RhdGVtZW50czogW1wiZXJyb3JcIiwgNTBdICovXG5cbmltcG9ydCB7cHJvamVjdEZsYXQsIHVucHJvamVjdEZsYXR9IGZyb20gJ3ZpZXdwb3J0LW1lcmNhdG9yLXByb2plY3QnO1xuaW1wb3J0IHtWZWN0b3IyfSBmcm9tICdtYXRoLmdsJztcblxuY29uc3QgRVBTSUxPTiA9IDAuMDE7XG5jb25zdCBWSUVXUE9SVF9QUk9QUyA9IFsnbG9uZ2l0dWRlJywgJ2xhdGl0dWRlJywgJ3pvb20nLCAnYmVhcmluZycsICdwaXRjaCcsXG4gICdwb3NpdGlvbicsICd3aWR0aCcsICdoZWlnaHQnXTtcbmNvbnN0IFZJRVdQT1JUX0lOVEVSUE9MQVRJT05fUFJPUFMgPVxuICBbJ2xvbmdpdHVkZScsICdsYXRpdHVkZScsICd6b29tJywgJ2JlYXJpbmcnLCAncGl0Y2gnLCAncG9zaXRpb24nXTtcblxuLyoqIFV0aWwgZnVuY3Rpb25zICovXG5mdW5jdGlvbiBsZXJwKHN0YXJ0LCBlbmQsIHN0ZXApIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoc3RhcnQpKSB7XG4gICAgcmV0dXJuIHN0YXJ0Lm1hcCgoZWxlbWVudCwgaW5kZXgpID0+IHtcbiAgICAgIHJldHVybiBsZXJwKGVsZW1lbnQsIGVuZFtpbmRleF0sIHN0ZXApO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBzdGVwICogZW5kICsgKDEgLSBzdGVwKSAqIHN0YXJ0O1xufVxuXG5mdW5jdGlvbiB6b29tVG9TY2FsZSh6b29tKSB7XG4gIHJldHVybiBNYXRoLnBvdygyLCB6b29tKTtcbn1cblxuZnVuY3Rpb24gc2NhbGVUb1pvb20oc2NhbGUpIHtcbiAgcmV0dXJuIE1hdGgubG9nMihzY2FsZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0Vmlld3BvcnRGcm9tKHByb3BzKSB7XG4gIGNvbnN0IHZpZXdwb3J0ID0ge307XG4gIFZJRVdQT1JUX1BST1BTLmZvckVhY2goKGtleSkgPT4ge1xuICAgIGlmICh0eXBlb2YgcHJvcHNba2V5XSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHZpZXdwb3J0W2tleV0gPSBwcm9wc1trZXldO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiB2aWV3cG9ydDtcbn1cblxuLyogZXNsaW50LWRpc2FibGUgbWF4LWRlcHRoICovXG5leHBvcnQgZnVuY3Rpb24gYXJlVmlld3BvcnRzRXF1YWwoc3RhcnRWaWV3cG9ydCwgZW5kVmlld3BvcnQpIHtcbiAgZm9yIChjb25zdCBwIG9mIFZJRVdQT1JUX0lOVEVSUE9MQVRJT05fUFJPUFMpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShzdGFydFZpZXdwb3J0W3BdKSkge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdGFydFZpZXdwb3J0W3BdLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGlmIChzdGFydFZpZXdwb3J0W3BdW2ldICE9PSBlbmRWaWV3cG9ydFtwXVtpXSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoc3RhcnRWaWV3cG9ydFtwXSAhPT0gZW5kVmlld3BvcnRbcF0pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG4vKiBlc2xpbnQtZW5hYmxlIG1heC1kZXB0aCAqL1xuXG4vKipcbiAqIFBlcmZvcm1zIGxpbmVhciBpbnRlcnBvbGF0aW9uIG9mIHR3byB2aWV3cG9ydHMuXG4gKiBAcGFyYW0ge09iamVjdH0gc3RhcnRWaWV3cG9ydCAtIG9iamVjdCBjb250YWluaW5nIHN0YXJ0aW5nIHZpZXdwb3J0IHBhcmFtZXRlcnMuXG4gKiBAcGFyYW0ge09iamVjdH0gZW5kVmlld3BvcnQgLSBvYmplY3QgY29udGFpbmluZyBlbmRpbmcgdmlld3BvcnQgcGFyYW1ldGVycy5cbiAqIEBwYXJhbSB7TnVtYmVyfSB0IC0gaW50ZXJwb2xhdGlvbiBzdGVwLlxuICogQHJldHVybiB7T2JqZWN0fSAtIGludGVycG9sYXRlZCB2aWV3cG9ydCBmb3IgZ2l2ZW4gc3RlcC5cbiovXG5leHBvcnQgZnVuY3Rpb24gdmlld3BvcnRMaW5lYXJJbnRlcnBvbGF0b3Ioc3RhcnRWaWV3cG9ydCwgZW5kVmlld3BvcnQsIHQpIHtcbiAgY29uc3Qgdmlld3BvcnQgPSB7fTtcblxuICBmb3IgKGNvbnN0IHAgb2YgVklFV1BPUlRfSU5URVJQT0xBVElPTl9QUk9QUykge1xuICAgIGNvbnN0IHN0YXJ0VmFsdWUgPSBzdGFydFZpZXdwb3J0W3BdO1xuICAgIGNvbnN0IGVuZFZhbHVlID0gZW5kVmlld3BvcnRbcF07XG4gICAgLy8gVE9ETzogJ3Bvc2l0aW9uJyBpcyBub3QgYWx3YXlzIHNwZWNpZmllZFxuICAgIGlmICh0eXBlb2Ygc3RhcnRWYWx1ZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGVuZFZhbHVlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdmlld3BvcnRbcF0gPSBsZXJwKHN0YXJ0VmFsdWUsIGVuZFZhbHVlLCB0KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZpZXdwb3J0O1xufVxuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGFkYXB0cyBtYXBib3gtZ2wtanMgTWFwI2ZseVRvIGFuaW1hdGlvbiBzbyBpdCBjYW4gYmUgdXNlZCBpblxuICogcmVhY3QvcmVkdXggYXJjaGl0ZWN0dXJlLlxuICogbWFwYm94LWdsLWpzIGZseVRvIDogaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtanMvYXBpLyNtYXAjZmx5dG8uXG4gKiBJdCBpbXBsZW1lbnRzIOKAnFNtb290aCBhbmQgZWZmaWNpZW50IHpvb21pbmcgYW5kIHBhbm5pbmcu4oCdIGFsZ29yaXRobSBieVxuICogXCJKYXJrZSBKLiB2YW4gV2lqayBhbmQgV2ltIEEuQS4gTnVpalwiXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHN0YXJ0Vmlld3BvcnQgLSBvYmplY3QgY29udGFpbmluZyBzdGFydGluZyB2aWV3cG9ydCBwYXJhbWV0ZXJzLlxuICogQHBhcmFtIHtPYmplY3R9IGVuZFZpZXdwb3J0IC0gb2JqZWN0IGNvbnRhaW5pbmcgZW5kaW5nIHZpZXdwb3J0IHBhcmFtZXRlcnMuXG4gKiBAcGFyYW0ge051bWJlcn0gdCAtIGludGVycG9sYXRpb24gc3RlcC5cbiAqIEByZXR1cm4ge09iamVjdH0gLSBpbnRlcnBvbGF0ZWQgdmlld3BvcnQgZm9yIGdpdmVuIHN0ZXAuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHZpZXdwb3J0Rmx5VG9JbnRlcnBvbGF0b3Ioc3RhcnRWaWV3cG9ydCwgZW5kVmlld3BvcnQsIHQpIHtcbiAgLy8gRXF1YXRpb25zIGZyb20gYWJvdmUgcGFwZXIgYXJlIHJlZmVycmVkIHdoZXJlIG5lZWRlZC5cblxuICBjb25zdCB2aWV3cG9ydCA9IHt9O1xuXG4gIC8vIFRPRE86IGFkZCB0aGlzIGFzIGFuIG9wdGlvbiBmb3IgYXBwbGljYXRpb25zLlxuICBjb25zdCByaG8gPSAxLjQxNDtcblxuICBjb25zdCBzdGFydFpvb20gPSBzdGFydFZpZXdwb3J0Lnpvb207XG4gIGNvbnN0IHN0YXJ0Q2VudGVyID0gW3N0YXJ0Vmlld3BvcnQubG9uZ2l0dWRlLCBzdGFydFZpZXdwb3J0LmxhdGl0dWRlXTtcbiAgY29uc3Qgc3RhcnRTY2FsZSA9IHpvb21Ub1NjYWxlKHN0YXJ0Wm9vbSk7XG4gIGNvbnN0IGVuZFpvb20gPSBlbmRWaWV3cG9ydC56b29tO1xuICBjb25zdCBlbmRDZW50ZXIgPSBbZW5kVmlld3BvcnQubG9uZ2l0dWRlLCBlbmRWaWV3cG9ydC5sYXRpdHVkZV07XG4gIGNvbnN0IHNjYWxlID0gem9vbVRvU2NhbGUoZW5kWm9vbSAtIHN0YXJ0Wm9vbSk7XG5cbiAgY29uc3Qgc3RhcnRDZW50ZXJYWSA9IG5ldyBWZWN0b3IyKHByb2plY3RGbGF0KHN0YXJ0Q2VudGVyLCBzdGFydFNjYWxlKSk7XG4gIGNvbnN0IGVuZENlbnRlclhZID0gbmV3IFZlY3RvcjIocHJvamVjdEZsYXQoZW5kQ2VudGVyLCBzdGFydFNjYWxlKSk7XG4gIGNvbnN0IHVEZWx0YSA9IGVuZENlbnRlclhZLnN1YnRyYWN0KHN0YXJ0Q2VudGVyWFkpO1xuXG4gIGNvbnN0IHcwID0gTWF0aC5tYXgoc3RhcnRWaWV3cG9ydC53aWR0aCwgc3RhcnRWaWV3cG9ydC5oZWlnaHQpO1xuICBjb25zdCB3MSA9IHcwIC8gc2NhbGU7XG4gIGNvbnN0IHUxID0gTWF0aC5zcXJ0KCh1RGVsdGEueCAqIHVEZWx0YS54KSArICh1RGVsdGEueSAqIHVEZWx0YS55KSk7XG4gIC8vIHUwIGlzIHRyZWF0ZWQgYXMgJzAnIGluIEVxICg5KS5cblxuICAvLyBMaW5lYXJseSBpbnRlcnBvbGF0ZSAnYmVhcmluZycgYW5kICdwaXRjaCdcbiAgZm9yIChjb25zdCBwIG9mIFsnYmVhcmluZycsICdwaXRjaCddKSB7XG4gICAgY29uc3Qgc3RhcnRWYWx1ZSA9IHN0YXJ0Vmlld3BvcnRbcF07XG4gICAgY29uc3QgZW5kVmFsdWUgPSBlbmRWaWV3cG9ydFtwXTtcbiAgICB2aWV3cG9ydFtwXSA9IGxlcnAoc3RhcnRWYWx1ZSwgZW5kVmFsdWUsIHQpO1xuICB9XG5cbiAgLy8gSWYgY2hhbmdlIGluIGNlbnRlciBpcyB0b28gc21hbGwsIGRvIGxpbmVhciBpbnRlcnBvbGFpdG9uLlxuICBpZiAoTWF0aC5hYnModTEpIDwgRVBTSUxPTikge1xuICAgIGZvciAoY29uc3QgcCBvZiBbJ2xhdGl0dWRlJywgJ2xvbmdpdHVkZScsICd6b29tJ10pIHtcbiAgICAgIGNvbnN0IHN0YXJ0VmFsdWUgPSBzdGFydFZpZXdwb3J0W3BdO1xuICAgICAgY29uc3QgZW5kVmFsdWUgPSBlbmRWaWV3cG9ydFtwXTtcbiAgICAgIHZpZXdwb3J0W3BdID0gbGVycChzdGFydFZhbHVlLCBlbmRWYWx1ZSwgdCk7XG4gICAgfVxuICAgIHJldHVybiB2aWV3cG9ydDtcbiAgfVxuXG4gIC8vIEltcGxlbWVudCBFcXVhdGlvbiAoOSkgZnJvbSBhYm92ZSBhbGdvcml0aG0uXG4gIGNvbnN0IHJobzIgPSByaG8gKiByaG87XG4gIGNvbnN0IGIwID0gKHcxICogdzEgLSB3MCAqIHcwICsgcmhvMiAqIHJobzIgKiB1MSAqIHUxKSAvICgyICogdzAgKiByaG8yICogdTEpO1xuICBjb25zdCBiMSA9ICh3MSAqIHcxIC0gdzAgKiB3MCAtIHJobzIgKiByaG8yICogdTEgKiB1MSkgLyAoMiAqIHcxICogcmhvMiAqIHUxKTtcbiAgY29uc3QgcjAgPSBNYXRoLmxvZyhNYXRoLnNxcnQoYjAgKiBiMCArIDEpIC0gYjApO1xuICBjb25zdCByMSA9IE1hdGgubG9nKE1hdGguc3FydChiMSAqIGIxICsgMSkgLSBiMSk7XG4gIGNvbnN0IFMgPSAocjEgLSByMCkgLyByaG87XG4gIGNvbnN0IHMgPSB0ICogUztcblxuICBjb25zdCB3ID0gKE1hdGguY29zaChyMCkgLyBNYXRoLmNvc2gocjAgKyByaG8gKiBzKSk7XG4gIGNvbnN0IHUgPSB3MCAqICgoTWF0aC5jb3NoKHIwKSAqIE1hdGgudGFuaChyMCArIHJobyAqIHMpIC0gTWF0aC5zaW5oKHIwKSkgLyByaG8yKSAvIHUxO1xuXG4gIGNvbnN0IHNjYWxlSW5jcmVtZW50ID0gMSAvIHc7IC8vIFVzaW5nIHcgbWV0aG9kIGZvciBzY2FsaW5nLlxuICBjb25zdCBuZXdab29tID0gc3RhcnRab29tICsgc2NhbGVUb1pvb20oc2NhbGVJbmNyZW1lbnQpO1xuXG4gIGNvbnN0IG5ld0NlbnRlciA9IHVucHJvamVjdEZsYXQoXG4gICAgKHN0YXJ0Q2VudGVyWFkuYWRkKHVEZWx0YS5zY2FsZSh1KSkpLnNjYWxlKHNjYWxlSW5jcmVtZW50KSxcbiAgICB6b29tVG9TY2FsZShuZXdab29tKSk7XG4gIHZpZXdwb3J0LmxvbmdpdHVkZSA9IG5ld0NlbnRlclswXTtcbiAgdmlld3BvcnQubGF0aXR1ZGUgPSBuZXdDZW50ZXJbMV07XG4gIHZpZXdwb3J0Lnpvb20gPSBuZXdab29tO1xuICByZXR1cm4gdmlld3BvcnQ7XG59XG4iXX0=