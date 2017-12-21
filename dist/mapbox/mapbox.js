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
  transformRequest: null,

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
      } else {
        var mapOptions = {
          container: props.container || document.body,
          center: [props.longitude, props.latitude],
          zoom: props.zoom,
          pitch: props.pitch,
          bearing: props.bearing,
          style: props.mapStyle,
          interactive: false,
          attributionControl: props.attributionControl,
          preserveDrawingBuffer: props.preserveDrawingBuffer
        };
        // We don't want to pass a null or no-op transformRequest function.
        if (props.transformRequest) {
          mapOptions.transformRequest = props.transformRequest;
        }
        this._map = this.map = new mapboxgl.Map(mapOptions);
        // Attach optional onLoad function
        this.map.once('load', props.onLoad);
        this.map.on('error', props.onError);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYXBib3gvbWFwYm94LmpzIl0sIm5hbWVzIjpbImdldEFjY2Vzc1Rva2VuIiwiaXNCcm93c2VyIiwicHJvY2VzcyIsIlN0cmluZyIsImJyb3dzZXIiLCJtYXBib3hnbCIsInJlcXVpcmUiLCJub29wIiwicHJvcFR5cGVzIiwibWFwYm94QXBpQWNjZXNzVG9rZW4iLCJzdHJpbmciLCJhdHRyaWJ1dGlvbkNvbnRyb2wiLCJib29sIiwicHJlc2VydmVEcmF3aW5nQnVmZmVyIiwib25Mb2FkIiwiZnVuYyIsIm9uRXJyb3IiLCJyZXVzZU1hcHMiLCJ0cmFuc2Zvcm1SZXF1ZXN0IiwibWFwU3R5bGUiLCJ2aXNpYmxlIiwid2lkdGgiLCJudW1iZXIiLCJpc1JlcXVpcmVkIiwiaGVpZ2h0IiwibG9uZ2l0dWRlIiwibGF0aXR1ZGUiLCJ6b29tIiwiYmVhcmluZyIsInBpdGNoIiwiYWx0aXR1ZGUiLCJkZWZhdWx0UHJvcHMiLCJwcmV2ZW50U3R5bGVEaWZmaW5nIiwiYWNjZXNzVG9rZW4iLCJ3aW5kb3ciLCJsb2NhdGlvbiIsIm1hdGNoIiwic2VhcmNoIiwiZW52IiwiTWFwYm94QWNjZXNzVG9rZW4iLCJjaGVja1Byb3BUeXBlcyIsInByb3BzIiwiY29tcG9uZW50IiwiZGVidWciLCJNYXBib3giLCJzdXBwb3J0ZWQiLCJFcnJvciIsIl9pbml0aWFsaXplIiwiX21hcCIsIl9kZXN0cm95IiwiX3VwZGF0ZSIsInJlc2l6ZSIsInNhdmVkTWFwIiwibWFwIiwibWFwT3B0aW9ucyIsImNvbnRhaW5lciIsImRvY3VtZW50IiwiYm9keSIsImNlbnRlciIsInN0eWxlIiwiaW50ZXJhY3RpdmUiLCJNYXAiLCJvbmNlIiwib24iLCJyZW1vdmUiLCJfY3JlYXRlIiwiY2FudmFzIiwiZ2V0Q2FudmFzIiwib3V0bGluZSIsIl91cGRhdGVNYXBWaWV3cG9ydCIsIl91cGRhdGVNYXBTaXplIiwib2xkUHJvcHMiLCJuZXdQcm9wcyIsInZpZXdwb3J0Q2hhbmdlZCIsImp1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NkMsU0FBUzNDLEtBQVQsS0FBbUIwQyxTQUFTMUMsS0FINUIsSUFJQTJDLFNBQVM1QyxPQUFULEtBQXFCMkMsU0FBUzNDLE9BSjlCLElBS0E0QyxTQUFTMUMsUUFBVCxLQUFzQnlDLFNBQVN6QyxRQU5qQzs7QUFRQSxVQUFJMkMsZUFBSixFQUFxQjtBQUNuQixhQUFLekIsSUFBTCxDQUFVMEIsTUFBVixDQUFpQjtBQUNmaEIsa0JBQVEsQ0FBQ2MsU0FBUy9DLFNBQVYsRUFBcUIrQyxTQUFTOUMsUUFBOUIsQ0FETztBQUVmQyxnQkFBTTZDLFNBQVM3QyxJQUZBO0FBR2ZDLG1CQUFTNEMsU0FBUzVDLE9BSEg7QUFJZkMsaUJBQU8yQyxTQUFTM0M7QUFKRCxTQUFqQjs7QUFPQTtBQUNBLFlBQUkyQyxTQUFTMUMsUUFBVCxLQUFzQnlDLFNBQVN6QyxRQUFuQyxFQUE2QztBQUMzQyxlQUFLa0IsSUFBTCxDQUFVMkIsU0FBVixDQUFvQjdDLFFBQXBCLEdBQStCMEMsU0FBUzFDLFFBQXhDO0FBQ0Q7QUFDRjtBQUNGOztBQUVEOzs7O21DQUNleUMsUSxFQUFVQyxRLEVBQVU7QUFDakMsVUFBTUksY0FBY0wsU0FBU2xELEtBQVQsS0FBbUJtRCxTQUFTbkQsS0FBNUIsSUFBcUNrRCxTQUFTL0MsTUFBVCxLQUFvQmdELFNBQVNoRCxNQUF0RjtBQUNBLFVBQUlvRCxXQUFKLEVBQWlCO0FBQ2YsYUFBSzVCLElBQUwsQ0FBVUcsTUFBVjtBQUNEO0FBQ0Y7Ozs7O2tCQWpLa0JQLE07OztBQW9LckJBLE9BQU9wQyxTQUFQLEdBQW1CQSxTQUFuQjtBQUNBb0MsT0FBT2IsWUFBUCxHQUFzQkEsWUFBdEIiLCJmaWxlIjoibWFwYm94LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG5cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuLyogZ2xvYmFsIHdpbmRvdywgZG9jdW1lbnQsIHByb2Nlc3MgKi9cbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5cbmNvbnN0IGlzQnJvd3NlciA9ICEoXG4gIHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJlxuICBTdHJpbmcocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJyAmJlxuICAhcHJvY2Vzcy5icm93c2VyXG4pO1xuXG5jb25zdCBtYXBib3hnbCA9IGlzQnJvd3NlciA/IHJlcXVpcmUoJ21hcGJveC1nbCcpIDogbnVsbDtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbmNvbnN0IHByb3BUeXBlcyA9IHtcbiAgLy8gQ3JlYXRpb24gcGFyYW1ldGVyc1xuICAvLyBjb250YWluZXI6IFByb3BUeXBlcy5ET01FbGVtZW50IHx8IFN0cmluZ1xuXG4gIG1hcGJveEFwaUFjY2Vzc1Rva2VuOiBQcm9wVHlwZXMuc3RyaW5nLCAvKiogTWFwYm94IEFQSSBhY2Nlc3MgdG9rZW4gZm9yIE1hcGJveCB0aWxlcy9zdHlsZXMuICovXG4gIGF0dHJpYnV0aW9uQ29udHJvbDogUHJvcFR5cGVzLmJvb2wsIC8qKiBTaG93IGF0dHJpYnV0aW9uIGNvbnRyb2wgb3Igbm90LiAqL1xuICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IFByb3BUeXBlcy5ib29sLCAvKiogVXNlZnVsIHdoZW4geW91IHdhbnQgdG8gZXhwb3J0IHRoZSBjYW52YXMgYXMgYSBQTkcuICovXG4gIG9uTG9hZDogUHJvcFR5cGVzLmZ1bmMsIC8qKiBUaGUgb25Mb2FkIGNhbGxiYWNrIGZvciB0aGUgbWFwICovXG4gIG9uRXJyb3I6IFByb3BUeXBlcy5mdW5jLCAvKiogVGhlIG9uRXJyb3IgY2FsbGJhY2sgZm9yIHRoZSBtYXAgKi9cbiAgcmV1c2VNYXBzOiBQcm9wVHlwZXMuYm9vbCxcbiAgdHJhbnNmb3JtUmVxdWVzdDogUHJvcFR5cGVzLmZ1bmMsIC8qKiBUaGUgdHJhbnNmb3JtUmVxdWVzdCBjYWxsYmFjayBmb3IgdGhlIG1hcCAqL1xuXG4gIG1hcFN0eWxlOiBQcm9wVHlwZXMuc3RyaW5nLCAvKiogVGhlIE1hcGJveCBzdHlsZS4gQSBzdHJpbmcgdXJsIHRvIGEgTWFwYm94R0wgc3R5bGUgKi9cbiAgdmlzaWJsZTogUHJvcFR5cGVzLmJvb2wsIC8qKiBXaGV0aGVyIHRoZSBtYXAgaXMgdmlzaWJsZSAqL1xuXG4gIC8vIE1hcCB2aWV3IHN0YXRlXG4gIHdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsIC8qKiBUaGUgd2lkdGggb2YgdGhlIG1hcC4gKi9cbiAgaGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsIC8qKiBUaGUgaGVpZ2h0IG9mIHRoZSBtYXAuICovXG4gIGxvbmdpdHVkZTogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLCAvKiogVGhlIGxvbmdpdHVkZSBvZiB0aGUgY2VudGVyIG9mIHRoZSBtYXAuICovXG4gIGxhdGl0dWRlOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsIC8qKiBUaGUgbGF0aXR1ZGUgb2YgdGhlIGNlbnRlciBvZiB0aGUgbWFwLiAqL1xuICB6b29tOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsIC8qKiBUaGUgdGlsZSB6b29tIGxldmVsIG9mIHRoZSBtYXAuICovXG4gIGJlYXJpbmc6IFByb3BUeXBlcy5udW1iZXIsIC8qKiBTcGVjaWZ5IHRoZSBiZWFyaW5nIG9mIHRoZSB2aWV3cG9ydCAqL1xuICBwaXRjaDogUHJvcFR5cGVzLm51bWJlciwgLyoqIFNwZWNpZnkgdGhlIHBpdGNoIG9mIHRoZSB2aWV3cG9ydCAqL1xuXG4gIC8vIE5vdGU6IE5vbi1wdWJsaWMgQVBJLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL21hcGJveC9tYXBib3gtZ2wtanMvaXNzdWVzLzExMzdcbiAgYWx0aXR1ZGU6IFByb3BUeXBlcy5udW1iZXIgLyoqIEFsdGl0dWRlIG9mIHRoZSB2aWV3cG9ydCBjYW1lcmEuIERlZmF1bHQgMS41IFwic2NyZWVuIGhlaWdodHNcIiAqL1xufTtcblxuY29uc3QgZGVmYXVsdFByb3BzID0ge1xuICBtYXBib3hBcGlBY2Nlc3NUb2tlbjogZ2V0QWNjZXNzVG9rZW4oKSxcbiAgcHJlc2VydmVEcmF3aW5nQnVmZmVyOiBmYWxzZSxcbiAgYXR0cmlidXRpb25Db250cm9sOiB0cnVlLFxuICBwcmV2ZW50U3R5bGVEaWZmaW5nOiBmYWxzZSxcbiAgb25Mb2FkOiBub29wLFxuICBvbkVycm9yOiBub29wLFxuICByZXVzZU1hcHM6IGZhbHNlLFxuICB0cmFuc2Zvcm1SZXF1ZXN0OiBudWxsLFxuXG4gIG1hcFN0eWxlOiAnbWFwYm94Oi8vc3R5bGVzL21hcGJveC9saWdodC12OCcsXG4gIHZpc2libGU6IHRydWUsXG5cbiAgYmVhcmluZzogMCxcbiAgcGl0Y2g6IDAsXG4gIGFsdGl0dWRlOiAxLjVcbn07XG5cbi8vIFRyeSB0byBnZXQgYWNjZXNzIHRva2VuIGZyb20gVVJMLCBlbnYsIGxvY2FsIHN0b3JhZ2Ugb3IgY29uZmlnXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWNjZXNzVG9rZW4oKSB7XG4gIGxldCBhY2Nlc3NUb2tlbiA9IG51bGw7XG5cbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5sb2NhdGlvbikge1xuICAgIGNvbnN0IG1hdGNoID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaC5tYXRjaCgvYWNjZXNzX3Rva2VuPShbXiZcXC9dKikvKTtcbiAgICBhY2Nlc3NUb2tlbiA9IG1hdGNoICYmIG1hdGNoWzFdO1xuICB9XG5cbiAgaWYgKCFhY2Nlc3NUb2tlbiAmJiB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBOb3RlOiBUaGlzIGRlcGVuZHMgb24gYnVuZGxlciBwbHVnaW5zIChlLmcuIHdlYnBhY2spIGlubXBvcnRpbmcgZW52aXJvbm1lbnQgY29ycmVjdGx5XG4gICAgYWNjZXNzVG9rZW4gPSBhY2Nlc3NUb2tlbiB8fCBwcm9jZXNzLmVudi5NYXBib3hBY2Nlc3NUb2tlbjsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICB9XG5cbiAgcmV0dXJuIGFjY2Vzc1Rva2VuIHx8IG51bGw7XG59XG5cbi8vIEhlbHBlciBmdW5jdGlvbiB0byBtZXJnZSBkZWZhdWx0UHJvcHMgYW5kIGNoZWNrIHByb3AgdHlwZXNcbmZ1bmN0aW9uIGNoZWNrUHJvcFR5cGVzKHByb3BzLCBjb21wb25lbnQgPSAnY29tcG9uZW50Jykge1xuICAvLyBUT0RPIC0gY2hlY2sgZm9yIHByb2R1Y3Rpb24gKHVubGVzcyBkb25lIGJ5IHByb3AgdHlwZXMgcGFja2FnZT8pXG4gIGlmIChwcm9wcy5kZWJ1Zykge1xuICAgIFByb3BUeXBlcy5jaGVja1Byb3BUeXBlcyhwcm9wVHlwZXMsIHByb3BzLCAncHJvcCcsIGNvbXBvbmVudCk7XG4gIH1cbn1cblxuLy8gQSBzbWFsbCB3cmFwcGVyIGNsYXNzIGZvciBtYXBib3gtZ2xcbi8vIC0gUHJvdmlkZXMgYSBwcm9wIHN0eWxlIGludGVyZmFjZSAodGhhdCBjYW4gYmUgdHJpdmlhbGx5IHVzZWQgYnkgYSBSZWFjdCB3cmFwcGVyKVxuLy8gLSBNYWtlcyBzdXJlIG1hcGJveCBkb2Vzbid0IGNyYXNoIHVuZGVyIE5vZGVcbi8vIC0gSGFuZGxlcyBtYXAgcmV1c2UgKHRvIHdvcmsgYXJvdW5kIE1hcGJveCByZXNvdXJjZSBsZWFrIGlzc3Vlcylcbi8vIC0gUHJvdmlkZXMgc3VwcG9ydCBmb3Igc3BlY2lmeWluZyB0b2tlbnMgZHVyaW5nIGRldmVsb3BtZW50XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hcGJveCB7XG4gIHN0YXRpYyBzdXBwb3J0ZWQoKSB7XG4gICAgcmV0dXJuIG1hcGJveGdsICYmIG1hcGJveGdsLnN1cHBvcnRlZCgpO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBpZiAoIW1hcGJveGdsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01hcGJveCBub3Qgc3VwcG9ydGVkJyk7XG4gICAgfVxuXG4gICAgdGhpcy5wcm9wcyA9IHt9O1xuICAgIHRoaXMuX2luaXRpYWxpemUocHJvcHMpO1xuICB9XG5cbiAgZmluYWxpemUoKSB7XG4gICAgaWYgKCFtYXBib3hnbCB8fCAhdGhpcy5fbWFwKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLl9kZXN0cm95KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRQcm9wcyhwcm9wcykge1xuICAgIGlmICghbWFwYm94Z2wgfHwgIXRoaXMuX21hcCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5fdXBkYXRlKHRoaXMucHJvcHMsIHByb3BzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIE1hcGJveCdzIG1hcC5yZXNpemUoKSByZWFkcyBzaXplIGZyb20gRE9NLCBzbyBET00gZWxlbWVudCBtdXN0IGFscmVhZHkgYmUgcmVzaXplZFxuICAvLyBJbiBhIHN5c3RlbSBsaWtlIFJlYWN0IHdlIG11c3Qgd2FpdCB0byByZWFkIHNpemUgdW50aWwgYWZ0ZXIgcmVuZGVyXG4gIC8vIChlLmcuIHVudGlsIFwiY29tcG9uZW50RGlkVXBkYXRlXCIpXG4gIHJlc2l6ZSgpIHtcbiAgICBpZiAoIW1hcGJveGdsIHx8ICF0aGlzLl9tYXApIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuX21hcC5yZXNpemUoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIEV4dGVybmFsIGFwcHMgY2FuIGFjY2VzcyBtYXAgdGhpcyB3YXlcbiAgZ2V0TWFwKCkge1xuICAgIHJldHVybiB0aGlzLl9tYXA7XG4gIH1cblxuICAvLyBQUklWQVRFIEFQSVxuXG4gIF9jcmVhdGUocHJvcHMpIHtcbiAgICAvLyBSZXVzZSBhIHNhdmVkIG1hcCwgaWYgYXZhaWxhYmxlXG4gICAgaWYgKHByb3BzLnJldXNlTWFwcyAmJiBNYXBib3guc2F2ZWRNYXApIHtcbiAgICAgIHRoaXMuX21hcCA9IHRoaXMubWFwID0gTWFwYm94LnNhdmVkTWFwO1xuICAgICAgTWFwYm94LnNhdmVkTWFwID0gbnVsbDtcbiAgICAgIC8vIFRPRE8gLSBuZWVkIHRvIGNhbGwgb25sb2FkIGFnYWluLCBuZWVkIHRvIHRyYWNrIHdpdGggUHJvbWlzZT9cbiAgICAgIHByb3BzLm9uTG9hZCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBtYXBPcHRpb25zID0ge1xuICAgICAgICBjb250YWluZXI6IHByb3BzLmNvbnRhaW5lciB8fCBkb2N1bWVudC5ib2R5LFxuICAgICAgICBjZW50ZXI6IFtwcm9wcy5sb25naXR1ZGUsIHByb3BzLmxhdGl0dWRlXSxcbiAgICAgICAgem9vbTogcHJvcHMuem9vbSxcbiAgICAgICAgcGl0Y2g6IHByb3BzLnBpdGNoLFxuICAgICAgICBiZWFyaW5nOiBwcm9wcy5iZWFyaW5nLFxuICAgICAgICBzdHlsZTogcHJvcHMubWFwU3R5bGUsXG4gICAgICAgIGludGVyYWN0aXZlOiBmYWxzZSxcbiAgICAgICAgYXR0cmlidXRpb25Db250cm9sOiBwcm9wcy5hdHRyaWJ1dGlvbkNvbnRyb2wsXG4gICAgICAgIHByZXNlcnZlRHJhd2luZ0J1ZmZlcjogcHJvcHMucHJlc2VydmVEcmF3aW5nQnVmZmVyXG4gICAgICB9O1xuICAgICAgLy8gV2UgZG9uJ3Qgd2FudCB0byBwYXNzIGEgbnVsbCBvciBuby1vcCB0cmFuc2Zvcm1SZXF1ZXN0IGZ1bmN0aW9uLlxuICAgICAgaWYgKHByb3BzLnRyYW5zZm9ybVJlcXVlc3QpIHtcbiAgICAgICAgbWFwT3B0aW9ucy50cmFuc2Zvcm1SZXF1ZXN0ID0gcHJvcHMudHJhbnNmb3JtUmVxdWVzdDtcbiAgICAgIH1cbiAgICAgIHRoaXMuX21hcCA9IHRoaXMubWFwID0gbmV3IG1hcGJveGdsLk1hcChtYXBPcHRpb25zKTtcbiAgICAgIC8vIEF0dGFjaCBvcHRpb25hbCBvbkxvYWQgZnVuY3Rpb25cbiAgICAgIHRoaXMubWFwLm9uY2UoJ2xvYWQnLCBwcm9wcy5vbkxvYWQpO1xuICAgICAgdGhpcy5tYXAub24oJ2Vycm9yJywgcHJvcHMub25FcnJvcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfZGVzdHJveSgpIHtcbiAgICBpZiAoIU1hcGJveC5zYXZlZE1hcCkge1xuICAgICAgTWFwYm94LnNhdmVkTWFwID0gdGhpcy5fbWFwO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9tYXAucmVtb3ZlKCk7XG4gICAgfVxuICB9XG5cbiAgX2luaXRpYWxpemUocHJvcHMpIHtcbiAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRQcm9wcywgcHJvcHMpO1xuICAgIGNoZWNrUHJvcFR5cGVzKHByb3BzLCAnTWFwYm94Jyk7XG5cbiAgICAvLyBNYWtlIGVtcHR5IHN0cmluZyBwaWNrIHVwIGRlZmF1bHQgcHJvcFxuICAgIHRoaXMuYWNjZXNzVG9rZW4gPSBwcm9wcy5tYXBib3hBcGlBY2Nlc3NUb2tlbiB8fCBkZWZhdWx0UHJvcHMubWFwYm94QXBpQWNjZXNzVG9rZW47XG5cbiAgICAvLyBDcmVhdGlvbiBvbmx5IHByb3BzXG4gICAgaWYgKG1hcGJveGdsKSB7XG4gICAgICBpZiAoIXRoaXMuYWNjZXNzVG9rZW4pIHtcbiAgICAgICAgbWFwYm94Z2wuYWNjZXNzVG9rZW4gPSAnbm8tdG9rZW4nOyAvLyBQcmV2ZW50cyBtYXBib3ggZnJvbSB0aHJvd2luZ1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWFwYm94Z2wuYWNjZXNzVG9rZW4gPSB0aGlzLmFjY2Vzc1Rva2VuO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX2NyZWF0ZShwcm9wcyk7XG5cbiAgICAvLyBEaXNhYmxlIG91dGxpbmUgc3R5bGVcbiAgICBjb25zdCBjYW52YXMgPSB0aGlzLm1hcC5nZXRDYW52YXMoKTtcbiAgICBpZiAoY2FudmFzKSB7XG4gICAgICBjYW52YXMuc3R5bGUub3V0bGluZSA9ICdub25lJztcbiAgICB9XG5cbiAgICB0aGlzLl91cGRhdGVNYXBWaWV3cG9ydCh7fSwgcHJvcHMpO1xuICAgIHRoaXMuX3VwZGF0ZU1hcFNpemUoe30sIHByb3BzKTtcblxuICAgIHRoaXMucHJvcHMgPSBwcm9wcztcbiAgfVxuXG4gIF91cGRhdGUob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgbmV3UHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnByb3BzLCBuZXdQcm9wcyk7XG4gICAgY2hlY2tQcm9wVHlwZXMobmV3UHJvcHMsICdNYXBib3gnKTtcblxuICAgIHRoaXMuX3VwZGF0ZU1hcFZpZXdwb3J0KG9sZFByb3BzLCBuZXdQcm9wcyk7XG4gICAgdGhpcy5fdXBkYXRlTWFwU2l6ZShvbGRQcm9wcywgbmV3UHJvcHMpO1xuXG4gICAgdGhpcy5wcm9wcyA9IG5ld1Byb3BzO1xuICB9XG5cbiAgX3VwZGF0ZU1hcFZpZXdwb3J0KG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIGNvbnN0IHZpZXdwb3J0Q2hhbmdlZCA9XG4gICAgICBuZXdQcm9wcy5sYXRpdHVkZSAhPT0gb2xkUHJvcHMubGF0aXR1ZGUgfHxcbiAgICAgIG5ld1Byb3BzLmxvbmdpdHVkZSAhPT0gb2xkUHJvcHMubG9uZ2l0dWRlIHx8XG4gICAgICBuZXdQcm9wcy56b29tICE9PSBvbGRQcm9wcy56b29tIHx8XG4gICAgICBuZXdQcm9wcy5waXRjaCAhPT0gb2xkUHJvcHMucGl0Y2ggfHxcbiAgICAgIG5ld1Byb3BzLmJlYXJpbmcgIT09IG9sZFByb3BzLmJlYXJpbmcgfHxcbiAgICAgIG5ld1Byb3BzLmFsdGl0dWRlICE9PSBvbGRQcm9wcy5hbHRpdHVkZTtcblxuICAgIGlmICh2aWV3cG9ydENoYW5nZWQpIHtcbiAgICAgIHRoaXMuX21hcC5qdW1wVG8oe1xuICAgICAgICBjZW50ZXI6IFtuZXdQcm9wcy5sb25naXR1ZGUsIG5ld1Byb3BzLmxhdGl0dWRlXSxcbiAgICAgICAgem9vbTogbmV3UHJvcHMuem9vbSxcbiAgICAgICAgYmVhcmluZzogbmV3UHJvcHMuYmVhcmluZyxcbiAgICAgICAgcGl0Y2g6IG5ld1Byb3BzLnBpdGNoXG4gICAgICB9KTtcblxuICAgICAgLy8gVE9ETyAtIGp1bXBUbyBkb2Vzbid0IGhhbmRsZSBhbHRpdHVkZVxuICAgICAgaWYgKG5ld1Byb3BzLmFsdGl0dWRlICE9PSBvbGRQcm9wcy5hbHRpdHVkZSkge1xuICAgICAgICB0aGlzLl9tYXAudHJhbnNmb3JtLmFsdGl0dWRlID0gbmV3UHJvcHMuYWx0aXR1ZGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gTm90ZTogbmVlZHMgdG8gYmUgY2FsbGVkIGFmdGVyIHJlbmRlciAoZS5nLiBpbiBjb21wb25lbnREaWRVcGRhdGUpXG4gIF91cGRhdGVNYXBTaXplKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIGNvbnN0IHNpemVDaGFuZ2VkID0gb2xkUHJvcHMud2lkdGggIT09IG5ld1Byb3BzLndpZHRoIHx8IG9sZFByb3BzLmhlaWdodCAhPT0gbmV3UHJvcHMuaGVpZ2h0O1xuICAgIGlmIChzaXplQ2hhbmdlZCkge1xuICAgICAgdGhpcy5fbWFwLnJlc2l6ZSgpO1xuICAgIH1cbiAgfVxufVxuXG5NYXBib3gucHJvcFR5cGVzID0gcHJvcFR5cGVzO1xuTWFwYm94LmRlZmF1bHRQcm9wcyA9IGRlZmF1bHRQcm9wcztcbiJdfQ==