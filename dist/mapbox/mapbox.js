'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

exports.getAccessToken = getAccessToken;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isBrowser = !((typeof process === 'undefined' ? 'undefined' : (0, _typeof3.default)(process)) === 'object' && String(process) === '[object process]' && !process.browser); // Copyright (c) 2015 Uber Technologies, Inc.

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


var mapboxgl = isBrowser ? require('mapbox-gl') : null;

function noop() {}

var propTypes = {
  // Creation parameters
  // container: PropTypes.DOMElement || String

  mapboxApiAccessToken: _propTypes2.default.string, /** Mapbox API access token for Mapbox tiles/styles. */
  attributionControl: _propTypes2.default.bool, /** Show attribution control or not. */
  preserveDrawingBuffer: _propTypes2.default.bool, /** Useful when you want to export the canvas as a PNG. */
  onLoad: _propTypes2.default.func, /** The onLoad callback for the map */
  onError: _propTypes2.default.func, /** The onError callback for the map */
  reuseMaps: _propTypes2.default.bool,
  transformRequest: _propTypes2.default.func, /** The transformRequest callback for the map */

  mapStyle: _propTypes2.default.string, /** The Mapbox style. A string url to a MapboxGL style */
  visible: _propTypes2.default.bool, /** Whether the map is visible */

  // Map view state
  width: _propTypes2.default.number.isRequired, /** The width of the map. */
  height: _propTypes2.default.number.isRequired, /** The height of the map. */
  longitude: _propTypes2.default.number.isRequired, /** The longitude of the center of the map. */
  latitude: _propTypes2.default.number.isRequired, /** The latitude of the center of the map. */
  zoom: _propTypes2.default.number.isRequired, /** The tile zoom level of the map. */
  bearing: _propTypes2.default.number, /** Specify the bearing of the viewport */
  pitch: _propTypes2.default.number, /** Specify the pitch of the viewport */

  // Note: Non-public API, see https://github.com/mapbox/mapbox-gl-js/issues/1137
  altitude: _propTypes2.default.number /** Altitude of the viewport camera. Default 1.5 "screen heights" */
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
function getAccessToken() {
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
    _propTypes2.default.checkPropTypes(propTypes, props, 'prop', component);
  }
}

// A small wrapper class for mapbox-gl
// - Provides a prop style interface (that can be trivially used by a React wrapper)
// - Makes sure mapbox doesn't crash under Node
// - Handles map reuse (to work around Mapbox resource leak issues)
// - Provides support for specifying tokens during development

var Mapbox = function () {
  (0, _createClass3.default)(Mapbox, null, [{
    key: 'supported',
    value: function supported() {
      return mapboxgl && mapboxgl.supported();
    }
  }]);

  function Mapbox(props) {
    (0, _classCallCheck3.default)(this, Mapbox);

    if (!mapboxgl) {
      throw new Error('Mapbox not supported');
    }

    this.props = {};
    this._initialize(props);
  }

  (0, _createClass3.default)(Mapbox, [{
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
      props = (0, _assign2.default)({}, defaultProps, props);
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
      newProps = (0, _assign2.default)({}, this.props, newProps);
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

exports.default = Mapbox;


Mapbox.propTypes = propTypes;
Mapbox.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYXBib3gvbWFwYm94LmpzIl0sIm5hbWVzIjpbImdldEFjY2Vzc1Rva2VuIiwiaXNCcm93c2VyIiwicHJvY2VzcyIsIlN0cmluZyIsImJyb3dzZXIiLCJtYXBib3hnbCIsInJlcXVpcmUiLCJub29wIiwicHJvcFR5cGVzIiwibWFwYm94QXBpQWNjZXNzVG9rZW4iLCJzdHJpbmciLCJhdHRyaWJ1dGlvbkNvbnRyb2wiLCJib29sIiwicHJlc2VydmVEcmF3aW5nQnVmZmVyIiwib25Mb2FkIiwiZnVuYyIsIm9uRXJyb3IiLCJyZXVzZU1hcHMiLCJ0cmFuc2Zvcm1SZXF1ZXN0IiwibWFwU3R5bGUiLCJ2aXNpYmxlIiwid2lkdGgiLCJudW1iZXIiLCJpc1JlcXVpcmVkIiwiaGVpZ2h0IiwibG9uZ2l0dWRlIiwibGF0aXR1ZGUiLCJ6b29tIiwiYmVhcmluZyIsInBpdGNoIiwiYWx0aXR1ZGUiLCJkZWZhdWx0UHJvcHMiLCJwcmV2ZW50U3R5bGVEaWZmaW5nIiwidW5kZWZpbmVkIiwiYWNjZXNzVG9rZW4iLCJ3aW5kb3ciLCJsb2NhdGlvbiIsIm1hdGNoIiwic2VhcmNoIiwiZW52IiwiTWFwYm94QWNjZXNzVG9rZW4iLCJjaGVja1Byb3BUeXBlcyIsInByb3BzIiwiY29tcG9uZW50IiwiZGVidWciLCJNYXBib3giLCJzdXBwb3J0ZWQiLCJFcnJvciIsIl9pbml0aWFsaXplIiwiX21hcCIsIl9kZXN0cm95IiwiX3VwZGF0ZSIsInJlc2l6ZSIsInNhdmVkTWFwIiwibWFwIiwiY29uc29sZSIsIk1hcCIsImNvbnRhaW5lciIsImRvY3VtZW50IiwiYm9keSIsImNlbnRlciIsInN0eWxlIiwiaW50ZXJhY3RpdmUiLCJvbmNlIiwib24iLCJyZW1vdmUiLCJfY3JlYXRlIiwiY2FudmFzIiwiZ2V0Q2FudmFzIiwib3V0bGluZSIsIl91cGRhdGVNYXBWaWV3cG9ydCIsIl91cGRhdGVNYXBTaXplIiwib2xkUHJvcHMiLCJuZXdQcm9wcyIsInZpZXdwb3J0Q2hh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LFNBQVMvQyxTQURoQyxJQUVBZ0QsU0FBUzlDLElBQVQsS0FBa0I2QyxTQUFTN0MsSUFGM0IsSUFHQThDLFNBQVM1QyxLQUFULEtBQW1CMkMsU0FBUzNDLEtBSDVCLElBSUE0QyxTQUFTN0MsT0FBVCxLQUFxQjRDLFNBQVM1QyxPQUo5QixJQUtBNkMsU0FBUzNDLFFBQVQsS0FBc0IwQyxTQUFTMUMsUUFOakM7O0FBUUEsVUFBSTRDLGVBQUosRUFBcUI7QUFDbkIsYUFBS3pCLElBQUwsQ0FBVTBCLE1BQVYsQ0FBaUI7QUFDZmYsa0JBQVEsQ0FBQ2EsU0FBU2hELFNBQVYsRUFBcUJnRCxTQUFTL0MsUUFBOUIsQ0FETztBQUVmQyxnQkFBTThDLFNBQVM5QyxJQUZBO0FBR2ZDLG1CQUFTNkMsU0FBUzdDLE9BSEg7QUFJZkMsaUJBQU80QyxTQUFTNUM7QUFKRCxTQUFqQjs7QUFPQTtBQUNBLFlBQUk0QyxTQUFTM0MsUUFBVCxLQUFzQjBDLFNBQVMxQyxRQUFuQyxFQUE2QztBQUMzQyxlQUFLbUIsSUFBTCxDQUFVMkIsU0FBVixDQUFvQjlDLFFBQXBCLEdBQStCMkMsU0FBUzNDLFFBQXhDO0FBQ0Q7QUFDRjtBQUNGOztBQUVEOzs7O21DQUNlMEMsUSxFQUFVQyxRLEVBQVU7QUFDakMsVUFBTUksY0FBY0wsU0FBU25ELEtBQVQsS0FBbUJvRCxTQUFTcEQsS0FBNUIsSUFBcUNtRCxTQUFTaEQsTUFBVCxLQUFvQmlELFNBQVNqRCxNQUF0RjtBQUNBLFVBQUlxRCxXQUFKLEVBQWlCO0FBQ2YsYUFBSzVCLElBQUwsQ0FBVUcsTUFBVjtBQUNEO0FBQ0Y7Ozs7O2tCQS9Ka0JQLE07OztBQWtLckJBLE9BQU9yQyxTQUFQLEdBQW1CQSxTQUFuQjtBQUNBcUMsT0FBT2QsWUFBUCxHQUFzQkEsWUFBdEIiLCJmaWxlIjoibWFwYm94LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG5cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuLyogZ2xvYmFsIHdpbmRvdywgZG9jdW1lbnQsIHByb2Nlc3MgKi9cbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5cbmNvbnN0IGlzQnJvd3NlciA9ICEoXG4gIHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJlxuICBTdHJpbmcocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJyAmJlxuICAhcHJvY2Vzcy5icm93c2VyXG4pO1xuXG5jb25zdCBtYXBib3hnbCA9IGlzQnJvd3NlciA/IHJlcXVpcmUoJ21hcGJveC1nbCcpIDogbnVsbDtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbmNvbnN0IHByb3BUeXBlcyA9IHtcbiAgLy8gQ3JlYXRpb24gcGFyYW1ldGVyc1xuICAvLyBjb250YWluZXI6IFByb3BUeXBlcy5ET01FbGVtZW50IHx8IFN0cmluZ1xuXG4gIG1hcGJveEFwaUFjY2Vzc1Rva2VuOiBQcm9wVHlwZXMuc3RyaW5nLCAvKiogTWFwYm94IEFQSSBhY2Nlc3MgdG9rZW4gZm9yIE1hcGJveCB0aWxlcy9zdHlsZXMuICovXG4gIGF0dHJpYnV0aW9uQ29udHJvbDogUHJvcFR5cGVzLmJvb2wsIC8qKiBTaG93IGF0dHJpYnV0aW9uIGNvbnRyb2wgb3Igbm90LiAqL1xuICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IFByb3BUeXBlcy5ib29sLCAvKiogVXNlZnVsIHdoZW4geW91IHdhbnQgdG8gZXhwb3J0IHRoZSBjYW52YXMgYXMgYSBQTkcuICovXG4gIG9uTG9hZDogUHJvcFR5cGVzLmZ1bmMsIC8qKiBUaGUgb25Mb2FkIGNhbGxiYWNrIGZvciB0aGUgbWFwICovXG4gIG9uRXJyb3I6IFByb3BUeXBlcy5mdW5jLCAvKiogVGhlIG9uRXJyb3IgY2FsbGJhY2sgZm9yIHRoZSBtYXAgKi9cbiAgcmV1c2VNYXBzOiBQcm9wVHlwZXMuYm9vbCxcbiAgdHJhbnNmb3JtUmVxdWVzdDogUHJvcFR5cGVzLmZ1bmMsIC8qKiBUaGUgdHJhbnNmb3JtUmVxdWVzdCBjYWxsYmFjayBmb3IgdGhlIG1hcCAqL1xuXG4gIG1hcFN0eWxlOiBQcm9wVHlwZXMuc3RyaW5nLCAvKiogVGhlIE1hcGJveCBzdHlsZS4gQSBzdHJpbmcgdXJsIHRvIGEgTWFwYm94R0wgc3R5bGUgKi9cbiAgdmlzaWJsZTogUHJvcFR5cGVzLmJvb2wsIC8qKiBXaGV0aGVyIHRoZSBtYXAgaXMgdmlzaWJsZSAqL1xuXG4gIC8vIE1hcCB2aWV3IHN0YXRlXG4gIHdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsIC8qKiBUaGUgd2lkdGggb2YgdGhlIG1hcC4gKi9cbiAgaGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsIC8qKiBUaGUgaGVpZ2h0IG9mIHRoZSBtYXAuICovXG4gIGxvbmdpdHVkZTogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLCAvKiogVGhlIGxvbmdpdHVkZSBvZiB0aGUgY2VudGVyIG9mIHRoZSBtYXAuICovXG4gIGxhdGl0dWRlOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsIC8qKiBUaGUgbGF0aXR1ZGUgb2YgdGhlIGNlbnRlciBvZiB0aGUgbWFwLiAqL1xuICB6b29tOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsIC8qKiBUaGUgdGlsZSB6b29tIGxldmVsIG9mIHRoZSBtYXAuICovXG4gIGJlYXJpbmc6IFByb3BUeXBlcy5udW1iZXIsIC8qKiBTcGVjaWZ5IHRoZSBiZWFyaW5nIG9mIHRoZSB2aWV3cG9ydCAqL1xuICBwaXRjaDogUHJvcFR5cGVzLm51bWJlciwgLyoqIFNwZWNpZnkgdGhlIHBpdGNoIG9mIHRoZSB2aWV3cG9ydCAqL1xuXG4gIC8vIE5vdGU6IE5vbi1wdWJsaWMgQVBJLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL21hcGJveC9tYXBib3gtZ2wtanMvaXNzdWVzLzExMzdcbiAgYWx0aXR1ZGU6IFByb3BUeXBlcy5udW1iZXIgLyoqIEFsdGl0dWRlIG9mIHRoZSB2aWV3cG9ydCBjYW1lcmEuIERlZmF1bHQgMS41IFwic2NyZWVuIGhlaWdodHNcIiAqL1xufTtcblxuY29uc3QgZGVmYXVsdFByb3BzID0ge1xuICBtYXBib3hBcGlBY2Nlc3NUb2tlbjogZ2V0QWNjZXNzVG9rZW4oKSxcbiAgcHJlc2VydmVEcmF3aW5nQnVmZmVyOiBmYWxzZSxcbiAgYXR0cmlidXRpb25Db250cm9sOiB0cnVlLFxuICBwcmV2ZW50U3R5bGVEaWZmaW5nOiBmYWxzZSxcbiAgb25Mb2FkOiBub29wLFxuICBvbkVycm9yOiBub29wLFxuICByZXVzZU1hcHM6IGZhbHNlLFxuICB0cmFuc2Zvcm1SZXF1ZXN0OiB1bmRlZmluZWQsXG5cbiAgbWFwU3R5bGU6ICdtYXBib3g6Ly9zdHlsZXMvbWFwYm94L2xpZ2h0LXY4JyxcbiAgdmlzaWJsZTogdHJ1ZSxcblxuICBiZWFyaW5nOiAwLFxuICBwaXRjaDogMCxcbiAgYWx0aXR1ZGU6IDEuNVxufTtcblxuLy8gVHJ5IHRvIGdldCBhY2Nlc3MgdG9rZW4gZnJvbSBVUkwsIGVudiwgbG9jYWwgc3RvcmFnZSBvciBjb25maWdcbmV4cG9ydCBmdW5jdGlvbiBnZXRBY2Nlc3NUb2tlbigpIHtcbiAgbGV0IGFjY2Vzc1Rva2VuID0gbnVsbDtcblxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmxvY2F0aW9uKSB7XG4gICAgY29uc3QgbWF0Y2ggPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoLm1hdGNoKC9hY2Nlc3NfdG9rZW49KFteJlxcL10qKS8pO1xuICAgIGFjY2Vzc1Rva2VuID0gbWF0Y2ggJiYgbWF0Y2hbMV07XG4gIH1cblxuICBpZiAoIWFjY2Vzc1Rva2VuICYmIHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIE5vdGU6IFRoaXMgZGVwZW5kcyBvbiBidW5kbGVyIHBsdWdpbnMgKGUuZy4gd2VicGFjaykgaW5tcG9ydGluZyBlbnZpcm9ubWVudCBjb3JyZWN0bHlcbiAgICBhY2Nlc3NUb2tlbiA9IGFjY2Vzc1Rva2VuIHx8IHByb2Nlc3MuZW52Lk1hcGJveEFjY2Vzc1Rva2VuOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gIH1cblxuICByZXR1cm4gYWNjZXNzVG9rZW4gfHwgbnVsbDtcbn1cblxuLy8gSGVscGVyIGZ1bmN0aW9uIHRvIG1lcmdlIGRlZmF1bHRQcm9wcyBhbmQgY2hlY2sgcHJvcCB0eXBlc1xuZnVuY3Rpb24gY2hlY2tQcm9wVHlwZXMocHJvcHMsIGNvbXBvbmVudCA9ICdjb21wb25lbnQnKSB7XG4gIC8vIFRPRE8gLSBjaGVjayBmb3IgcHJvZHVjdGlvbiAodW5sZXNzIGRvbmUgYnkgcHJvcCB0eXBlcyBwYWNrYWdlPylcbiAgaWYgKHByb3BzLmRlYnVnKSB7XG4gICAgUHJvcFR5cGVzLmNoZWNrUHJvcFR5cGVzKHByb3BUeXBlcywgcHJvcHMsICdwcm9wJywgY29tcG9uZW50KTtcbiAgfVxufVxuXG4vLyBBIHNtYWxsIHdyYXBwZXIgY2xhc3MgZm9yIG1hcGJveC1nbFxuLy8gLSBQcm92aWRlcyBhIHByb3Agc3R5bGUgaW50ZXJmYWNlICh0aGF0IGNhbiBiZSB0cml2aWFsbHkgdXNlZCBieSBhIFJlYWN0IHdyYXBwZXIpXG4vLyAtIE1ha2VzIHN1cmUgbWFwYm94IGRvZXNuJ3QgY3Jhc2ggdW5kZXIgTm9kZVxuLy8gLSBIYW5kbGVzIG1hcCByZXVzZSAodG8gd29yayBhcm91bmQgTWFwYm94IHJlc291cmNlIGxlYWsgaXNzdWVzKVxuLy8gLSBQcm92aWRlcyBzdXBwb3J0IGZvciBzcGVjaWZ5aW5nIHRva2VucyBkdXJpbmcgZGV2ZWxvcG1lbnRcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFwYm94IHtcbiAgc3RhdGljIHN1cHBvcnRlZCgpIHtcbiAgICByZXR1cm4gbWFwYm94Z2wgJiYgbWFwYm94Z2wuc3VwcG9ydGVkKCk7XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIGlmICghbWFwYm94Z2wpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWFwYm94IG5vdCBzdXBwb3J0ZWQnKTtcbiAgICB9XG5cbiAgICB0aGlzLnByb3BzID0ge307XG4gICAgdGhpcy5faW5pdGlhbGl6ZShwcm9wcyk7XG4gIH1cblxuICBmaW5hbGl6ZSgpIHtcbiAgICBpZiAoIW1hcGJveGdsIHx8ICF0aGlzLl9tYXApIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuX2Rlc3Ryb3koKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldFByb3BzKHByb3BzKSB7XG4gICAgaWYgKCFtYXBib3hnbCB8fCAhdGhpcy5fbWFwKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLl91cGRhdGUodGhpcy5wcm9wcywgcHJvcHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gTWFwYm94J3MgbWFwLnJlc2l6ZSgpIHJlYWRzIHNpemUgZnJvbSBET00sIHNvIERPTSBlbGVtZW50IG11c3QgYWxyZWFkeSBiZSByZXNpemVkXG4gIC8vIEluIGEgc3lzdGVtIGxpa2UgUmVhY3Qgd2UgbXVzdCB3YWl0IHRvIHJlYWQgc2l6ZSB1bnRpbCBhZnRlciByZW5kZXJcbiAgLy8gKGUuZy4gdW50aWwgXCJjb21wb25lbnREaWRVcGRhdGVcIilcbiAgcmVzaXplKCkge1xuICAgIGlmICghbWFwYm94Z2wgfHwgIXRoaXMuX21hcCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5fbWFwLnJlc2l6ZSgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gRXh0ZXJuYWwgYXBwcyBjYW4gYWNjZXNzIG1hcCB0aGlzIHdheVxuICBnZXRNYXAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcDtcbiAgfVxuXG4gIC8vIFBSSVZBVEUgQVBJXG5cbiAgX2NyZWF0ZShwcm9wcykge1xuICAgIC8vIFJldXNlIGEgc2F2ZWQgbWFwLCBpZiBhdmFpbGFibGVcbiAgICBpZiAocHJvcHMucmV1c2VNYXBzICYmIE1hcGJveC5zYXZlZE1hcCkge1xuICAgICAgdGhpcy5fbWFwID0gdGhpcy5tYXAgPSBNYXBib3guc2F2ZWRNYXA7XG4gICAgICBNYXBib3guc2F2ZWRNYXAgPSBudWxsO1xuICAgICAgLy8gVE9ETyAtIG5lZWQgdG8gY2FsbCBvbmxvYWQgYWdhaW4sIG5lZWQgdG8gdHJhY2sgd2l0aCBQcm9taXNlP1xuICAgICAgcHJvcHMub25Mb2FkKCk7XG4gICAgICBjb25zb2xlLmRlYnVnKCdSZXVzZWQgZXhpc3RpbmcgbWFwYm94IG1hcCcsIHRoaXMuX21hcCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbWFwID0gdGhpcy5tYXAgPSBuZXcgbWFwYm94Z2wuTWFwKHtcbiAgICAgICAgY29udGFpbmVyOiBwcm9wcy5jb250YWluZXIgfHwgZG9jdW1lbnQuYm9keSxcbiAgICAgICAgY2VudGVyOiBbcHJvcHMubG9uZ2l0dWRlLCBwcm9wcy5sYXRpdHVkZV0sXG4gICAgICAgIHpvb206IHByb3BzLnpvb20sXG4gICAgICAgIHBpdGNoOiBwcm9wcy5waXRjaCxcbiAgICAgICAgYmVhcmluZzogcHJvcHMuYmVhcmluZyxcbiAgICAgICAgc3R5bGU6IHByb3BzLm1hcFN0eWxlLFxuICAgICAgICBpbnRlcmFjdGl2ZTogZmFsc2UsXG4gICAgICAgIGF0dHJpYnV0aW9uQ29udHJvbDogcHJvcHMuYXR0cmlidXRpb25Db250cm9sLFxuICAgICAgICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IHByb3BzLnByZXNlcnZlRHJhd2luZ0J1ZmZlcixcbiAgICAgICAgdHJhbnNmb3JtUmVxdWVzdDogcHJvcHMudHJhbnNmb3JtUmVxdWVzdFxuICAgICAgfSk7XG4gICAgICAvLyBBdHRhY2ggb3B0aW9uYWwgb25Mb2FkIGZ1bmN0aW9uXG4gICAgICB0aGlzLm1hcC5vbmNlKCdsb2FkJywgcHJvcHMub25Mb2FkKTtcbiAgICAgIHRoaXMubWFwLm9uKCdlcnJvcicsIHByb3BzLm9uRXJyb3IpO1xuICAgICAgY29uc29sZS5kZWJ1ZygnQ3JlYXRlZCBuZXcgbWFwYm94IG1hcCcsIHRoaXMuX21hcCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9kZXN0cm95KCkge1xuICAgIGlmICghTWFwYm94LnNhdmVkTWFwKSB7XG4gICAgICBNYXBib3guc2F2ZWRNYXAgPSB0aGlzLl9tYXA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX21hcC5yZW1vdmUoKTtcbiAgICB9XG4gIH1cblxuICBfaW5pdGlhbGl6ZShwcm9wcykge1xuICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdFByb3BzLCBwcm9wcyk7XG4gICAgY2hlY2tQcm9wVHlwZXMocHJvcHMsICdNYXBib3gnKTtcblxuICAgIC8vIE1ha2UgZW1wdHkgc3RyaW5nIHBpY2sgdXAgZGVmYXVsdCBwcm9wXG4gICAgdGhpcy5hY2Nlc3NUb2tlbiA9IHByb3BzLm1hcGJveEFwaUFjY2Vzc1Rva2VuIHx8IGRlZmF1bHRQcm9wcy5tYXBib3hBcGlBY2Nlc3NUb2tlbjtcblxuICAgIC8vIENyZWF0aW9uIG9ubHkgcHJvcHNcbiAgICBpZiAobWFwYm94Z2wpIHtcbiAgICAgIGlmICghdGhpcy5hY2Nlc3NUb2tlbikge1xuICAgICAgICBtYXBib3hnbC5hY2Nlc3NUb2tlbiA9ICduby10b2tlbic7IC8vIFByZXZlbnRzIG1hcGJveCBmcm9tIHRocm93aW5nXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXBib3hnbC5hY2Nlc3NUb2tlbiA9IHRoaXMuYWNjZXNzVG9rZW47XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fY3JlYXRlKHByb3BzKTtcblxuICAgIC8vIERpc2FibGUgb3V0bGluZSBzdHlsZVxuICAgIGNvbnN0IGNhbnZhcyA9IHRoaXMubWFwLmdldENhbnZhcygpO1xuICAgIGlmIChjYW52YXMpIHtcbiAgICAgIGNhbnZhcy5zdHlsZS5vdXRsaW5lID0gJ25vbmUnO1xuICAgIH1cblxuICAgIHRoaXMuX3VwZGF0ZU1hcFZpZXdwb3J0KHt9LCBwcm9wcyk7XG4gICAgdGhpcy5fdXBkYXRlTWFwU2l6ZSh7fSwgcHJvcHMpO1xuXG4gICAgdGhpcy5wcm9wcyA9IHByb3BzO1xuICB9XG5cbiAgX3VwZGF0ZShvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICBuZXdQcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMucHJvcHMsIG5ld1Byb3BzKTtcbiAgICBjaGVja1Byb3BUeXBlcyhuZXdQcm9wcywgJ01hcGJveCcpO1xuXG4gICAgdGhpcy5fdXBkYXRlTWFwVmlld3BvcnQob2xkUHJvcHMsIG5ld1Byb3BzKTtcbiAgICB0aGlzLl91cGRhdGVNYXBTaXplKG9sZFByb3BzLCBuZXdQcm9wcyk7XG5cbiAgICB0aGlzLnByb3BzID0gbmV3UHJvcHM7XG4gIH1cblxuICBfdXBkYXRlTWFwVmlld3BvcnQob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgY29uc3Qgdmlld3BvcnRDaGFuZ2VkID1cbiAgICAgIG5ld1Byb3BzLmxhdGl0dWRlICE9PSBvbGRQcm9wcy5sYXRpdHVkZSB8fFxuICAgICAgbmV3UHJvcHMubG9uZ2l0dWRlICE9PSBvbGRQcm9wcy5sb25naXR1ZGUgfHxcbiAgICAgIG5ld1Byb3BzLnpvb20gIT09IG9sZFByb3BzLnpvb20gfHxcbiAgICAgIG5ld1Byb3BzLnBpdGNoICE9PSBvbGRQcm9wcy5waXRjaCB8fFxuICAgICAgbmV3UHJvcHMuYmVhcmluZyAhPT0gb2xkUHJvcHMuYmVhcmluZyB8fFxuICAgICAgbmV3UHJvcHMuYWx0aXR1ZGUgIT09IG9sZFByb3BzLmFsdGl0dWRlO1xuXG4gICAgaWYgKHZpZXdwb3J0Q2hhbmdlZCkge1xuICAgICAgdGhpcy5fbWFwLmp1bXBUbyh7XG4gICAgICAgIGNlbnRlcjogW25ld1Byb3BzLmxvbmdpdHVkZSwgbmV3UHJvcHMubGF0aXR1ZGVdLFxuICAgICAgICB6b29tOiBuZXdQcm9wcy56b29tLFxuICAgICAgICBiZWFyaW5nOiBuZXdQcm9wcy5iZWFyaW5nLFxuICAgICAgICBwaXRjaDogbmV3UHJvcHMucGl0Y2hcbiAgICAgIH0pO1xuXG4gICAgICAvLyBUT0RPIC0ganVtcFRvIGRvZXNuJ3QgaGFuZGxlIGFsdGl0dWRlXG4gICAgICBpZiAobmV3UHJvcHMuYWx0aXR1ZGUgIT09IG9sZFByb3BzLmFsdGl0dWRlKSB7XG4gICAgICAgIHRoaXMuX21hcC50cmFuc2Zvcm0uYWx0aXR1ZGUgPSBuZXdQcm9wcy5hbHRpdHVkZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBOb3RlOiBuZWVkcyB0byBiZSBjYWxsZWQgYWZ0ZXIgcmVuZGVyIChlLmcuIGluIGNvbXBvbmVudERpZFVwZGF0ZSlcbiAgX3VwZGF0ZU1hcFNpemUob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgY29uc3Qgc2l6ZUNoYW5nZWQgPSBvbGRQcm9wcy53aWR0aCAhPT0gbmV3UHJvcHMud2lkdGggfHwgb2xkUHJvcHMuaGVpZ2h0ICE9PSBuZXdQcm9wcy5oZWlnaHQ7XG4gICAgaWYgKHNpemVDaGFuZ2VkKSB7XG4gICAgICB0aGlzLl9tYXAucmVzaXplKCk7XG4gICAgfVxuICB9XG59XG5cbk1hcGJveC5wcm9wVHlwZXMgPSBwcm9wVHlwZXM7XG5NYXBib3guZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuIl19