var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Copyright (c) 2015 Uber Technologies, Inc.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* global window, document, process */
import PropTypes from 'prop-types';

var isBrowser = !((typeof process === 'undefined' ? 'undefined' : _typeof(process)) === 'object' && String(process) === '[object process]' && !process.browser);

var mapboxgl = isBrowser ? require('mapbox-gl') : null;

function noop() {}

var propTypes = {
  // Creation parameters
  // container: PropTypes.DOMElement || String

  mapboxApiAccessToken: PropTypes.string, /** Mapbox API access token for Mapbox tiles/styles. */
  attributionControl: PropTypes.bool, /** Show attribution control or not. */
  preserveDrawingBuffer: PropTypes.bool, /** Useful when you want to export the canvas as a PNG. */
  onLoad: PropTypes.func, /** The onLoad callback for the map */
  onError: PropTypes.func, /** The onError callback for the map */
  reuseMaps: PropTypes.bool,
  transformRequest: PropTypes.func, /** The transformRequest callback for the map */

  mapStyle: PropTypes.string, /** The Mapbox style. A string url to a MapboxGL style */
  visible: PropTypes.bool, /** Whether the map is visible */

  // Map view state
  width: PropTypes.number.isRequired, /** The width of the map. */
  height: PropTypes.number.isRequired, /** The height of the map. */
  longitude: PropTypes.number.isRequired, /** The longitude of the center of the map. */
  latitude: PropTypes.number.isRequired, /** The latitude of the center of the map. */
  zoom: PropTypes.number.isRequired, /** The tile zoom level of the map. */
  bearing: PropTypes.number, /** Specify the bearing of the viewport */
  pitch: PropTypes.number, /** Specify the pitch of the viewport */

  // Note: Non-public API, see https://github.com/mapbox/mapbox-gl-js/issues/1137
  altitude: PropTypes.number /** Altitude of the viewport camera. Default 1.5 "screen heights" */
};

var defaultProps = {
  mapboxApiAccessToken: getAccessToken(),
  preserveDrawingBuffer: false,
  attributionControl: true,
  preventStyleDiffing: false,
  onLoad: noop,
  onError: noop,
  reuseMaps: false,
  transformRequest: undefined,

  mapStyle: 'mapbox://styles/mapbox/light-v8',
  visible: true,

  bearing: 0,
  pitch: 0,
  altitude: 1.5
};

// Try to get access token from URL, env, local storage or config
export function getAccessToken() {
  var accessToken = null;

  if (typeof window !== 'undefined' && window.location) {
    var match = window.location.search.match(/access_token=([^&\/]*)/);
    accessToken = match && match[1];
  }

  if (!accessToken && typeof process !== 'undefined') {
    // Note: This depends on bundler plugins (e.g. webpack) inmporting environment correctly
    accessToken = accessToken || process.env.MapboxAccessToken; // eslint-disable-line
  }

  return accessToken || null;
}

// Helper function to merge defaultProps and check prop types
function checkPropTypes(props) {
  var component = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'component';

  // TODO - check for production (unless done by prop types package?)
  if (props.debug) {
    PropTypes.checkPropTypes(propTypes, props, 'prop', component);
  }
}

// A small wrapper class for mapbox-gl
// - Provides a prop style interface (that can be trivially used by a React wrapper)
// - Makes sure mapbox doesn't crash under Node
// - Handles map reuse (to work around Mapbox resource leak issues)
// - Provides support for specifying tokens during development

var Mapbox = function () {
  _createClass(Mapbox, null, [{
    key: 'supported',
    value: function supported() {
      return mapboxgl && mapboxgl.supported();
    }
  }]);

  function Mapbox(props) {
    _classCallCheck(this, Mapbox);

    if (!mapboxgl) {
      throw new Error('Mapbox not supported');
    }

    this.props = {};
    this._initialize(props);
  }

  _createClass(Mapbox, [{
    key: 'finalize',
    value: function finalize() {
      if (!mapboxgl || !this._map) {
        return this;
      }

      this._destroy();
      return this;
    }
  }, {
    key: 'setProps',
    value: function setProps(props) {
      if (!mapboxgl || !this._map) {
        return this;
      }

      this._update(this.props, props);
      return this;
    }

    // Mapbox's map.resize() reads size from DOM, so DOM element must already be resized
    // In a system like React we must wait to read size until after render
    // (e.g. until "componentDidUpdate")

  }, {
    key: 'resize',
    value: function resize() {
      if (!mapboxgl || !this._map) {
        return this;
      }

      this._map.resize();
      return this;
    }

    // External apps can access map this way

  }, {
    key: 'getMap',
    value: function getMap() {
      return this._map;
    }

    // PRIVATE API

  }, {
    key: '_create',
    value: function _create(props) {
      // Reuse a saved map, if available
      if (props.reuseMaps && Mapbox.savedMap) {
        this._map = this.map = Mapbox.savedMap;
        Mapbox.savedMap = null;
        // TODO - need to call onload again, need to track with Promise?
        props.onLoad();
        console.debug('Reused existing mapbox map', this._map); // eslint-disable-line
      } else {
        this._map = this.map = new mapboxgl.Map({
          container: props.container || document.body,
          center: [props.longitude, props.latitude],
          zoom: props.zoom,
          pitch: props.pitch,
          bearing: props.bearing,
          style: props.mapStyle,
          interactive: false,
          attributionControl: props.attributionControl,
          preserveDrawingBuffer: props.preserveDrawingBuffer,
          transformRequest: props.transformRequest
        });
        // Attach optional onLoad function
        this.map.once('load', props.onLoad);
        this.map.on('error', props.onError);
        console.debug('Created new mapbox map', this._map); // eslint-disable-line
      }

      return this;
    }
  }, {
    key: '_destroy',
    value: function _destroy() {
      if (!Mapbox.savedMap) {
        Mapbox.savedMap = this._map;
      } else {
        this._map.remove();
      }
    }
  }, {
    key: '_initialize',
    value: function _initialize(props) {
      props = Object.assign({}, defaultProps, props);
      checkPropTypes(props, 'Mapbox');

      // Make empty string pick up default prop
      this.accessToken = props.mapboxApiAccessToken || defaultProps.mapboxApiAccessToken;

      // Creation only props
      if (mapboxgl) {
        if (!this.accessToken) {
          mapboxgl.accessToken = 'no-token'; // Prevents mapbox from throwing
        } else {
          mapboxgl.accessToken = this.accessToken;
        }
      }

      this._create(props);

      // Disable outline style
      var canvas = this.map.getCanvas();
      if (canvas) {
        canvas.style.outline = 'none';
      }

      this._updateMapViewport({}, props);
      this._updateMapSize({}, props);

      this.props = props;
    }
  }, {
    key: '_update',
    value: function _update(oldProps, newProps) {
      newProps = Object.assign({}, this.props, newProps);
      checkPropTypes(newProps, 'Mapbox');

      this._updateMapViewport(oldProps, newProps);
      this._updateMapSize(oldProps, newProps);

      this.props = newProps;
    }
  }, {
    key: '_updateMapViewport',
    value: function _updateMapViewport(oldProps, newProps) {
      var viewportChanged = newProps.latitude !== oldProps.latitude || newProps.longitude !== oldProps.longitude || newProps.zoom !== oldProps.zoom || newProps.pitch !== oldProps.pitch || newProps.bearing !== oldProps.bearing || newProps.altitude !== oldProps.altitude;

      if (viewportChanged) {
        this._map.jumpTo({
          center: [newProps.longitude, newProps.latitude],
          zoom: newProps.zoom,
          bearing: newProps.bearing,
          pitch: newProps.pitch
        });

        // TODO - jumpTo doesn't handle altitude
        if (newProps.altitude !== oldProps.altitude) {
          this._map.transform.altitude = newProps.altitude;
        }
      }
    }

    // Note: needs to be called after render (e.g. in componentDidUpdate)

  }, {
    key: '_updateMapSize',
    value: function _updateMapSize(oldProps, newProps) {
      var sizeChanged = oldProps.width !== newProps.width || oldProps.height !== newProps.height;
      if (sizeChanged) {
        this._map.resize();
      }
    }
  }]);

  return Mapbox;
}();

export default Mapbox;


Mapbox.propTypes = propTypes;
Mapbox.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYXBib3gvbWFwYm94LmpzIl0sIm5hbWVzIjpbIlByb3BUeXBlcyIsImlzQnJvd3NlciIsInByb2Nlc3MiLCJTdHJpbmciLCJicm93c2VyIiwibWFwYm94Z2wiLCJyZXF1aXJlIiwibm9vcCIsInByb3BUeXBlcyIsIm1hcGJveEFwaUFjY2Vzc1Rva2VuIiwic3RyaW5nIiwiYXR0cmlidXRpb25Db250cm9sIiwiYm9vbCIsInByZXNlcnZlRHJhd2luZ0J1ZmZlciIsIm9uTG9hZCIsImZ1bmMiLCJvbkVycm9yIiwicmV1c2VNYXBzIiwidHJhbnNmb3JtUmVxdWVzdCIsIm1hcFN0eWxlIiwidmlzaWJsZSIsIndpZHRoIiwibnVtYmVyIiwiaXNSZXF1aXJlZCIsImhlaWdodCIsImxvbmdpdHVkZSIsImxhdGl0dWRlIiwiem9vbSIsImJlYXJpbmciLCJwaXRjaCIsImFsdGl0dWRlIiwiZGVmYXVsdFByb3BzIiwiZ2V0QWNjZXNzVG9rZW4iLCJwcmV2ZW50U3R5bGVEaWZmaW5nIiwidW5kZWZpbmVkIiwiYWNjZXNzVG9rZW4iLCJ3aW5kb3ciLCJsb2NhdGlvbiIsIm1hdGNoIiwic2VhcmNoIiwiZW52IiwiTWFwYm94QWNjZXNzVG9rZW4iLCJjaGVja1Byb3BUeXBlcyIsInByb3BzIiwiY29tcG9uZW50IiwiZGVidWciLCJNYXBib3giLCJzdXBwb3J0ZWQiLCJFcnJvciIsIl9pbml0aWFsaXplIiwiX21hcCIsIl9kZXN0cm95IiwiX3VwZGF0ZSIsInJlc2l6ZSIsInNhdmVkTWFwIiwibWFwIiwiY29uc29sZSIsIk1hcCIsImNvbnRhaW5lciIsImRvY3VtZW50IiwiYm9keSIsImNlbnRlciIsInN0eWxlIiwiaW50ZXJhY3RpdmUiLCJvbmNlIiwib24iLCJyZW1vdmUiLCJPYmplY3QiLCJhc3NpZ24iLCJfY3JlYXRlIiwiY2FudmFzIiwiZ2V0Q2FudmFzIiwib3V0bGluZSIsIl91cGRhdGVNYXBWaWV3cG9ydCIsIl91cGRhdGVNYXBTaXplIiwib2xkUHJvcHMiLCJuZXdQcm9wcyIsInZpZXdwb3J0Q2hhbmdlZCIsImp1bXBUbyIsInRyYW5zZm9ybSIsInNpemVDaGFuZ2VkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLE9BQU9BLFNBQVAsTUFBc0IsWUFBdEI7O0FBRUEsSUFBTUMsWUFBWSxFQUNoQixRQUFPQyxPQUFQLHlDQUFPQSxPQUFQLE9BQW1CLFFBQW5CLElBQ0FDLE9BQU9ELE9BQVAsTUFBb0Isa0JBRHBCLElBRUEsQ0FBQ0EsUUFBUUUsT0FITyxDQUFsQjs7QUFNQSxJQUFNQyxXQUFXSixZQUFZSyxRQUFRLFdBQVIsQ0FBWixHQUFtQyxJQUFwRDs7QUFFQSxTQUFTQyxJQUFULEdBQWdCLENBQUU7O0FBRWxCLElBQU1DLFlBQVk7QUFDaEI7QUFDQTs7QUFFQUMsd0JBQXNCVCxVQUFVVSxNQUpoQixFQUl3QjtBQUN4Q0Msc0JBQW9CWCxVQUFVWSxJQUxkLEVBS29CO0FBQ3BDQyx5QkFBdUJiLFVBQVVZLElBTmpCLEVBTXVCO0FBQ3ZDRSxVQUFRZCxVQUFVZSxJQVBGLEVBT1E7QUFDeEJDLFdBQVNoQixVQUFVZSxJQVJILEVBUVM7QUFDekJFLGFBQVdqQixVQUFVWSxJQVRMO0FBVWhCTSxvQkFBa0JsQixVQUFVZSxJQVZaLEVBVWtCOztBQUVsQ0ksWUFBVW5CLFVBQVVVLE1BWkosRUFZWTtBQUM1QlUsV0FBU3BCLFVBQVVZLElBYkgsRUFhUzs7QUFFekI7QUFDQVMsU0FBT3JCLFVBQVVzQixNQUFWLENBQWlCQyxVQWhCUixFQWdCb0I7QUFDcENDLFVBQVF4QixVQUFVc0IsTUFBVixDQUFpQkMsVUFqQlQsRUFpQnFCO0FBQ3JDRSxhQUFXekIsVUFBVXNCLE1BQVYsQ0FBaUJDLFVBbEJaLEVBa0J3QjtBQUN4Q0csWUFBVTFCLFVBQVVzQixNQUFWLENBQWlCQyxVQW5CWCxFQW1CdUI7QUFD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MTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cblxuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG4vKiBnbG9iYWwgd2luZG93LCBkb2N1bWVudCwgcHJvY2VzcyAqL1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcblxuY29uc3QgaXNCcm93c2VyID0gIShcbiAgdHlwZW9mIHByb2Nlc3MgPT09ICdvYmplY3QnICYmXG4gIFN0cmluZyhwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nICYmXG4gICFwcm9jZXNzLmJyb3dzZXJcbik7XG5cbmNvbnN0IG1hcGJveGdsID0gaXNCcm93c2VyID8gcmVxdWlyZSgnbWFwYm94LWdsJykgOiBudWxsO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxuY29uc3QgcHJvcFR5cGVzID0ge1xuICAvLyBDcmVhdGlvbiBwYXJhbWV0ZXJzXG4gIC8vIGNvbnRhaW5lcjogUHJvcFR5cGVzLkRPTUVsZW1lbnQgfHwgU3RyaW5nXG5cbiAgbWFwYm94QXBpQWNjZXNzVG9rZW46IFByb3BUeXBlcy5zdHJpbmcsIC8qKiBNYXBib3ggQVBJIGFjY2VzcyB0b2tlbiBmb3IgTWFwYm94IHRpbGVzL3N0eWxlcy4gKi9cbiAgYXR0cmlidXRpb25Db250cm9sOiBQcm9wVHlwZXMuYm9vbCwgLyoqIFNob3cgYXR0cmlidXRpb24gY29udHJvbCBvciBub3QuICovXG4gIHByZXNlcnZlRHJhd2luZ0J1ZmZlcjogUHJvcFR5cGVzLmJvb2wsIC8qKiBVc2VmdWwgd2hlbiB5b3Ugd2FudCB0byBleHBvcnQgdGhlIGNhbnZhcyBhcyBhIFBORy4gKi9cbiAgb25Mb2FkOiBQcm9wVHlwZXMuZnVuYywgLyoqIFRoZSBvbkxvYWQgY2FsbGJhY2sgZm9yIHRoZSBtYXAgKi9cbiAgb25FcnJvcjogUHJvcFR5cGVzLmZ1bmMsIC8qKiBUaGUgb25FcnJvciBjYWxsYmFjayBmb3IgdGhlIG1hcCAqL1xuICByZXVzZU1hcHM6IFByb3BUeXBlcy5ib29sLFxuICB0cmFuc2Zvcm1SZXF1ZXN0OiBQcm9wVHlwZXMuZnVuYywgLyoqIFRoZSB0cmFuc2Zvcm1SZXF1ZXN0IGNhbGxiYWNrIGZvciB0aGUgbWFwICovXG5cbiAgbWFwU3R5bGU6IFByb3BUeXBlcy5zdHJpbmcsIC8qKiBUaGUgTWFwYm94IHN0eWxlLiBBIHN0cmluZyB1cmwgdG8gYSBNYXBib3hHTCBzdHlsZSAqL1xuICB2aXNpYmxlOiBQcm9wVHlwZXMuYm9vbCwgLyoqIFdoZXRoZXIgdGhlIG1hcCBpcyB2aXNpYmxlICovXG5cbiAgLy8gTWFwIHZpZXcgc3RhdGVcbiAgd2lkdGg6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCwgLyoqIFRoZSB3aWR0aCBvZiB0aGUgbWFwLiAqL1xuICBoZWlnaHQ6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCwgLyoqIFRoZSBoZWlnaHQgb2YgdGhlIG1hcC4gKi9cbiAgbG9uZ2l0dWRlOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsIC8qKiBUaGUgbG9uZ2l0dWRlIG9mIHRoZSBjZW50ZXIgb2YgdGhlIG1hcC4gKi9cbiAgbGF0aXR1ZGU6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCwgLyoqIFRoZSBsYXRpdHVkZSBvZiB0aGUgY2VudGVyIG9mIHRoZSBtYXAuICovXG4gIHpvb206IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCwgLyoqIFRoZSB0aWxlIHpvb20gbGV2ZWwgb2YgdGhlIG1hcC4gKi9cbiAgYmVhcmluZzogUHJvcFR5cGVzLm51bWJlciwgLyoqIFNwZWNpZnkgdGhlIGJlYXJpbmcgb2YgdGhlIHZpZXdwb3J0ICovXG4gIHBpdGNoOiBQcm9wVHlwZXMubnVtYmVyLCAvKiogU3BlY2lmeSB0aGUgcGl0Y2ggb2YgdGhlIHZpZXdwb3J0ICovXG5cbiAgLy8gTm90ZTogTm9uLXB1YmxpYyBBUEksIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbWFwYm94L21hcGJveC1nbC1qcy9pc3N1ZXMvMTEzN1xuICBhbHRpdHVkZTogUHJvcFR5cGVzLm51bWJlciAvKiogQWx0aXR1ZGUgb2YgdGhlIHZpZXdwb3J0IGNhbWVyYS4gRGVmYXVsdCAxLjUgXCJzY3JlZW4gaGVpZ2h0c1wiICovXG59O1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gIG1hcGJveEFwaUFjY2Vzc1Rva2VuOiBnZXRBY2Nlc3NUb2tlbigpLFxuICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IGZhbHNlLFxuICBhdHRyaWJ1dGlvbkNvbnRyb2w6IHRydWUsXG4gIHByZXZlbnRTdHlsZURpZmZpbmc6IGZhbHNlLFxuICBvbkxvYWQ6IG5vb3AsXG4gIG9uRXJyb3I6IG5vb3AsXG4gIHJldXNlTWFwczogZmFsc2UsXG4gIHRyYW5zZm9ybVJlcXVlc3Q6IHVuZGVmaW5lZCxcblxuICBtYXBTdHlsZTogJ21hcGJveDovL3N0eWxlcy9tYXBib3gvbGlnaHQtdjgnLFxuICB2aXNpYmxlOiB0cnVlLFxuXG4gIGJlYXJpbmc6IDAsXG4gIHBpdGNoOiAwLFxuICBhbHRpdHVkZTogMS41XG59O1xuXG4vLyBUcnkgdG8gZ2V0IGFjY2VzcyB0b2tlbiBmcm9tIFVSTCwgZW52LCBsb2NhbCBzdG9yYWdlIG9yIGNvbmZpZ1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFjY2Vzc1Rva2VuKCkge1xuICBsZXQgYWNjZXNzVG9rZW4gPSBudWxsO1xuXG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cubG9jYXRpb24pIHtcbiAgICBjb25zdCBtYXRjaCA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gubWF0Y2goL2FjY2Vzc190b2tlbj0oW14mXFwvXSopLyk7XG4gICAgYWNjZXNzVG9rZW4gPSBtYXRjaCAmJiBtYXRjaFsxXTtcbiAgfVxuXG4gIGlmICghYWNjZXNzVG9rZW4gJiYgdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gTm90ZTogVGhpcyBkZXBlbmRzIG9uIGJ1bmRsZXIgcGx1Z2lucyAoZS5nLiB3ZWJwYWNrKSBpbm1wb3J0aW5nIGVudmlyb25tZW50IGNvcnJlY3RseVxuICAgIGFjY2Vzc1Rva2VuID0gYWNjZXNzVG9rZW4gfHwgcHJvY2Vzcy5lbnYuTWFwYm94QWNjZXNzVG9rZW47IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgfVxuXG4gIHJldHVybiBhY2Nlc3NUb2tlbiB8fCBudWxsO1xufVxuXG4vLyBIZWxwZXIgZnVuY3Rpb24gdG8gbWVyZ2UgZGVmYXVsdFByb3BzIGFuZCBjaGVjayBwcm9wIHR5cGVzXG5mdW5jdGlvbiBjaGVja1Byb3BUeXBlcyhwcm9wcywgY29tcG9uZW50ID0gJ2NvbXBvbmVudCcpIHtcbiAgLy8gVE9ETyAtIGNoZWNrIGZvciBwcm9kdWN0aW9uICh1bmxlc3MgZG9uZSBieSBwcm9wIHR5cGVzIHBhY2thZ2U/KVxuICBpZiAocHJvcHMuZGVidWcpIHtcbiAgICBQcm9wVHlwZXMuY2hlY2tQcm9wVHlwZXMocHJvcFR5cGVzLCBwcm9wcywgJ3Byb3AnLCBjb21wb25lbnQpO1xuICB9XG59XG5cbi8vIEEgc21hbGwgd3JhcHBlciBjbGFzcyBmb3IgbWFwYm94LWdsXG4vLyAtIFByb3ZpZGVzIGEgcHJvcCBzdHlsZSBpbnRlcmZhY2UgKHRoYXQgY2FuIGJlIHRyaXZpYWxseSB1c2VkIGJ5IGEgUmVhY3Qgd3JhcHBlcilcbi8vIC0gTWFrZXMgc3VyZSBtYXBib3ggZG9lc24ndCBjcmFzaCB1bmRlciBOb2RlXG4vLyAtIEhhbmRsZXMgbWFwIHJldXNlICh0byB3b3JrIGFyb3VuZCBNYXBib3ggcmVzb3VyY2UgbGVhayBpc3N1ZXMpXG4vLyAtIFByb3ZpZGVzIHN1cHBvcnQgZm9yIHNwZWNpZnlpbmcgdG9rZW5zIGR1cmluZyBkZXZlbG9wbWVudFxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYXBib3gge1xuICBzdGF0aWMgc3VwcG9ydGVkKCkge1xuICAgIHJldHVybiBtYXBib3hnbCAmJiBtYXBib3hnbC5zdXBwb3J0ZWQoKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgaWYgKCFtYXBib3hnbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNYXBib3ggbm90IHN1cHBvcnRlZCcpO1xuICAgIH1cblxuICAgIHRoaXMucHJvcHMgPSB7fTtcbiAgICB0aGlzLl9pbml0aWFsaXplKHByb3BzKTtcbiAgfVxuXG4gIGZpbmFsaXplKCkge1xuICAgIGlmICghbWFwYm94Z2wgfHwgIXRoaXMuX21hcCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5fZGVzdHJveSgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0UHJvcHMocHJvcHMpIHtcbiAgICBpZiAoIW1hcGJveGdsIHx8ICF0aGlzLl9tYXApIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuX3VwZGF0ZSh0aGlzLnByb3BzLCBwcm9wcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBNYXBib3gncyBtYXAucmVzaXplKCkgcmVhZHMgc2l6ZSBmcm9tIERPTSwgc28gRE9NIGVsZW1lbnQgbXVzdCBhbHJlYWR5IGJlIHJlc2l6ZWRcbiAgLy8gSW4gYSBzeXN0ZW0gbGlrZSBSZWFjdCB3ZSBtdXN0IHdhaXQgdG8gcmVhZCBzaXplIHVudGlsIGFmdGVyIHJlbmRlclxuICAvLyAoZS5nLiB1bnRpbCBcImNvbXBvbmVudERpZFVwZGF0ZVwiKVxuICByZXNpemUoKSB7XG4gICAgaWYgKCFtYXBib3hnbCB8fCAhdGhpcy5fbWFwKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLl9tYXAucmVzaXplKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBFeHRlcm5hbCBhcHBzIGNhbiBhY2Nlc3MgbWFwIHRoaXMgd2F5XG4gIGdldE1hcCgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFwO1xuICB9XG5cbiAgLy8gUFJJVkFURSBBUElcblxuICBfY3JlYXRlKHByb3BzKSB7XG4gICAgLy8gUmV1c2UgYSBzYXZlZCBtYXAsIGlmIGF2YWlsYWJsZVxuICAgIGlmIChwcm9wcy5yZXVzZU1hcHMgJiYgTWFwYm94LnNhdmVkTWFwKSB7XG4gICAgICB0aGlzLl9tYXAgPSB0aGlzLm1hcCA9IE1hcGJveC5zYXZlZE1hcDtcbiAgICAgIE1hcGJveC5zYXZlZE1hcCA9IG51bGw7XG4gICAgICAvLyBUT0RPIC0gbmVlZCB0byBjYWxsIG9ubG9hZCBhZ2FpbiwgbmVlZCB0byB0cmFjayB3aXRoIFByb21pc2U/XG4gICAgICBwcm9wcy5vbkxvYWQoKTtcbiAgICAgIGNvbnNvbGUuZGVidWcoJ1JldXNlZCBleGlzdGluZyBtYXBib3ggbWFwJywgdGhpcy5fbWFwKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9tYXAgPSB0aGlzLm1hcCA9IG5ldyBtYXBib3hnbC5NYXAoe1xuICAgICAgICBjb250YWluZXI6IHByb3BzLmNvbnRhaW5lciB8fCBkb2N1bWVudC5ib2R5LFxuICAgICAgICBjZW50ZXI6IFtwcm9wcy5sb25naXR1ZGUsIHByb3BzLmxhdGl0dWRlXSxcbiAgICAgICAgem9vbTogcHJvcHMuem9vbSxcbiAgICAgICAgcGl0Y2g6IHByb3BzLnBpdGNoLFxuICAgICAgICBiZWFyaW5nOiBwcm9wcy5iZWFyaW5nLFxuICAgICAgICBzdHlsZTogcHJvcHMubWFwU3R5bGUsXG4gICAgICAgIGludGVyYWN0aXZlOiBmYWxzZSxcbiAgICAgICAgYXR0cmlidXRpb25Db250cm9sOiBwcm9wcy5hdHRyaWJ1dGlvbkNvbnRyb2wsXG4gICAgICAgIHByZXNlcnZlRHJhd2luZ0J1ZmZlcjogcHJvcHMucHJlc2VydmVEcmF3aW5nQnVmZmVyLFxuICAgICAgICB0cmFuc2Zvcm1SZXF1ZXN0OiBwcm9wcy50cmFuc2Zvcm1SZXF1ZXN0XG4gICAgICB9KTtcbiAgICAgIC8vIEF0dGFjaCBvcHRpb25hbCBvbkxvYWQgZnVuY3Rpb25cbiAgICAgIHRoaXMubWFwLm9uY2UoJ2xvYWQnLCBwcm9wcy5vbkxvYWQpO1xuICAgICAgdGhpcy5tYXAub24oJ2Vycm9yJywgcHJvcHMub25FcnJvcik7XG4gICAgICBjb25zb2xlLmRlYnVnKCdDcmVhdGVkIG5ldyBtYXBib3ggbWFwJywgdGhpcy5fbWFwKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX2Rlc3Ryb3koKSB7XG4gICAgaWYgKCFNYXBib3guc2F2ZWRNYXApIHtcbiAgICAgIE1hcGJveC5zYXZlZE1hcCA9IHRoaXMuX21hcDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbWFwLnJlbW92ZSgpO1xuICAgIH1cbiAgfVxuXG4gIF9pbml0aWFsaXplKHByb3BzKSB7XG4gICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0UHJvcHMsIHByb3BzKTtcbiAgICBjaGVja1Byb3BUeXBlcyhwcm9wcywgJ01hcGJveCcpO1xuXG4gICAgLy8gTWFrZSBlbXB0eSBzdHJpbmcgcGljayB1cCBkZWZhdWx0IHByb3BcbiAgICB0aGlzLmFjY2Vzc1Rva2VuID0gcHJvcHMubWFwYm94QXBpQWNjZXNzVG9rZW4gfHwgZGVmYXVsdFByb3BzLm1hcGJveEFwaUFjY2Vzc1Rva2VuO1xuXG4gICAgLy8gQ3JlYXRpb24gb25seSBwcm9wc1xuICAgIGlmIChtYXBib3hnbCkge1xuICAgICAgaWYgKCF0aGlzLmFjY2Vzc1Rva2VuKSB7XG4gICAgICAgIG1hcGJveGdsLmFjY2Vzc1Rva2VuID0gJ25vLXRva2VuJzsgLy8gUHJldmVudHMgbWFwYm94IGZyb20gdGhyb3dpbmdcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1hcGJveGdsLmFjY2Vzc1Rva2VuID0gdGhpcy5hY2Nlc3NUb2tlbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9jcmVhdGUocHJvcHMpO1xuXG4gICAgLy8gRGlzYWJsZSBvdXRsaW5lIHN0eWxlXG4gICAgY29uc3QgY2FudmFzID0gdGhpcy5tYXAuZ2V0Q2FudmFzKCk7XG4gICAgaWYgKGNhbnZhcykge1xuICAgICAgY2FudmFzLnN0eWxlLm91dGxpbmUgPSAnbm9uZSc7XG4gICAgfVxuXG4gICAgdGhpcy5fdXBkYXRlTWFwVmlld3BvcnQoe30sIHByb3BzKTtcbiAgICB0aGlzLl91cGRhdGVNYXBTaXplKHt9LCBwcm9wcyk7XG5cbiAgICB0aGlzLnByb3BzID0gcHJvcHM7XG4gIH1cblxuICBfdXBkYXRlKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIG5ld1Byb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5wcm9wcywgbmV3UHJvcHMpO1xuICAgIGNoZWNrUHJvcFR5cGVzKG5ld1Byb3BzLCAnTWFwYm94Jyk7XG5cbiAgICB0aGlzLl91cGRhdGVNYXBWaWV3cG9ydChvbGRQcm9wcywgbmV3UHJvcHMpO1xuICAgIHRoaXMuX3VwZGF0ZU1hcFNpemUob2xkUHJvcHMsIG5ld1Byb3BzKTtcblxuICAgIHRoaXMucHJvcHMgPSBuZXdQcm9wcztcbiAgfVxuXG4gIF91cGRhdGVNYXBWaWV3cG9ydChvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICBjb25zdCB2aWV3cG9ydENoYW5nZWQgPVxuICAgICAgbmV3UHJvcHMubGF0aXR1ZGUgIT09IG9sZFByb3BzLmxhdGl0dWRlIHx8XG4gICAgICBuZXdQcm9wcy5sb25naXR1ZGUgIT09IG9sZFByb3BzLmxvbmdpdHVkZSB8fFxuICAgICAgbmV3UHJvcHMuem9vbSAhPT0gb2xkUHJvcHMuem9vbSB8fFxuICAgICAgbmV3UHJvcHMucGl0Y2ggIT09IG9sZFByb3BzLnBpdGNoIHx8XG4gICAgICBuZXdQcm9wcy5iZWFyaW5nICE9PSBvbGRQcm9wcy5iZWFyaW5nIHx8XG4gICAgICBuZXdQcm9wcy5hbHRpdHVkZSAhPT0gb2xkUHJvcHMuYWx0aXR1ZGU7XG5cbiAgICBpZiAodmlld3BvcnRDaGFuZ2VkKSB7XG4gICAgICB0aGlzLl9tYXAuanVtcFRvKHtcbiAgICAgICAgY2VudGVyOiBbbmV3UHJvcHMubG9uZ2l0dWRlLCBuZXdQcm9wcy5sYXRpdHVkZV0sXG4gICAgICAgIHpvb206IG5ld1Byb3BzLnpvb20sXG4gICAgICAgIGJlYXJpbmc6IG5ld1Byb3BzLmJlYXJpbmcsXG4gICAgICAgIHBpdGNoOiBuZXdQcm9wcy5waXRjaFxuICAgICAgfSk7XG5cbiAgICAgIC8vIFRPRE8gLSBqdW1wVG8gZG9lc24ndCBoYW5kbGUgYWx0aXR1ZGVcbiAgICAgIGlmIChuZXdQcm9wcy5hbHRpdHVkZSAhPT0gb2xkUHJvcHMuYWx0aXR1ZGUpIHtcbiAgICAgICAgdGhpcy5fbWFwLnRyYW5zZm9ybS5hbHRpdHVkZSA9IG5ld1Byb3BzLmFsdGl0dWRlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIE5vdGU6IG5lZWRzIHRvIGJlIGNhbGxlZCBhZnRlciByZW5kZXIgKGUuZy4gaW4gY29tcG9uZW50RGlkVXBkYXRlKVxuICBfdXBkYXRlTWFwU2l6ZShvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICBjb25zdCBzaXplQ2hhbmdlZCA9IG9sZFByb3BzLndpZHRoICE9PSBuZXdQcm9wcy53aWR0aCB8fCBvbGRQcm9wcy5oZWlnaHQgIT09IG5ld1Byb3BzLmhlaWdodDtcbiAgICBpZiAoc2l6ZUNoYW5nZWQpIHtcbiAgICAgIHRoaXMuX21hcC5yZXNpemUoKTtcbiAgICB9XG4gIH1cbn1cblxuTWFwYm94LnByb3BUeXBlcyA9IHByb3BUeXBlcztcbk1hcGJveC5kZWZhdWx0UHJvcHMgPSBkZWZhdWx0UHJvcHM7XG4iXX0=