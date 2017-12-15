var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
import { PureComponent, createElement } from 'react';
import PropTypes from 'prop-types';
import autobind from '../utils/autobind';

import { getInteractiveLayerIds, setDiffStyle } from '../utils/style-utils';
import Immutable from 'immutable';

import WebMercatorViewport from 'viewport-mercator-project';

import Mapbox from '../mapbox/mapbox';

/* eslint-disable max-len */
var TOKEN_DOC_URL = 'https://uber.github.io/react-map-gl/#/Documentation/getting-started/about-mapbox-tokens';
var NO_TOKEN_WARNING = 'A valid API access token is required to use Mapbox data';
/* eslint-disable max-len */

function noop() {}

var UNAUTHORIZED_ERROR_CODE = 401;

var propTypes = Object.assign({}, Mapbox.propTypes, {
  /** The Mapbox style. A string url or a MapboxGL style Immutable.Map object. */
  mapStyle: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.instanceOf(Immutable.Map)]),
  /** There are known issues with style diffing. As stopgap, add option to prevent style diffing. */
  preventStyleDiffing: PropTypes.bool,
  /** Whether the map is visible */
  visible: PropTypes.bool
});

var defaultProps = Object.assign({}, Mapbox.defaultProps, {
  mapStyle: 'mapbox://styles/mapbox/light-v8',
  preventStyleDiffing: false,
  visible: true
});

var childContextTypes = {
  viewport: PropTypes.instanceOf(WebMercatorViewport)
};

var StaticMap = function (_PureComponent) {
  _inherits(StaticMap, _PureComponent);

  _createClass(StaticMap, null, [{
    key: 'supported',
    value: function supported() {
      return Mapbox && Mapbox.supported();
    }
  }]);

  function StaticMap(props) {
    _classCallCheck(this, StaticMap);

    var _this = _possibleConstructorReturn(this, (StaticMap.__proto__ || Object.getPrototypeOf(StaticMap)).call(this, props));

    _this._queryParams = {};
    if (!StaticMap.supported()) {
      _this.componentDidMount = noop;
      _this.componentWillReceiveProps = noop;
      _this.componentDidUpdate = noop;
      _this.componentWillUnmount = noop;
    }
    _this.state = {
      accessTokenInvalid: false
    };
    autobind(_this);
    return _this;
  }

  _createClass(StaticMap, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        viewport: new WebMercatorViewport(this.props)
      };
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var mapStyle = this.props.mapStyle;


      this._mapbox = new Mapbox(Object.assign({}, this.props, {
        container: this._mapboxMap,
        onError: this._mapboxMapError,
        mapStyle: Immutable.Map.isMap(mapStyle) ? mapStyle.toJS() : mapStyle
      }));
      this._map = this._mapbox.getMap();
      this._updateQueryParams(mapStyle);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(newProps) {
      this._mapbox.setProps(newProps);
      this._updateMapStyle(this.props, newProps);

      // this._updateMapViewport(this.props, newProps);

      // Save width/height so that we can check them in componentDidUpdate
      this.setState({
        width: this.props.width,
        height: this.props.height
      });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      // Since Mapbox's map.resize() reads size from DOM
      // we must wait to read size until after render (i.e. here in "didUpdate")
      this._updateMapSize(this.state, this.props);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._mapbox.finalize();
      this._mapbox = null;
      this._map = null;
    }

    // External apps can access map this way

  }, {
    key: 'getMap',
    value: function getMap() {
      return this._map;
    }

    /** Uses Mapbox's
      * queryRenderedFeatures API to find features at point or in a bounding box.
      * https://www.mapbox.com/mapbox-gl-js/api/#Map#queryRenderedFeatures
      * To query only some of the layers, set the `interactive` property in the
      * layer style to `true`.
      * @param {[Number, Number]|[[Number, Number], [Number, Number]]} geometry -
      *   Point or an array of two points defining the bounding box
      * @param {Object} parameters - query options
      */

  }, {
    key: 'queryRenderedFeatures',
    value: function queryRenderedFeatures(geometry, parameters) {
      var queryParams = parameters || this._queryParams;
      if (queryParams.layers && queryParams.layers.length === 0) {
        return [];
      }
      return this._map.queryRenderedFeatures(geometry, queryParams);
    }

    // Hover and click only query layers whose interactive property is true

  }, {
    key: '_updateQueryParams',
    value: function _updateQueryParams(mapStyle) {
      var interactiveLayerIds = getInteractiveLayerIds(mapStyle);
      this._queryParams = { layers: interactiveLayerIds };
    }

    // Note: needs to be called after render (e.g. in componentDidUpdate)

  }, {
    key: '_updateMapSize',
    value: function _updateMapSize(oldProps, newProps) {
      var sizeChanged = oldProps.width !== newProps.width || oldProps.height !== newProps.height;

      if (sizeChanged) {
        this._map.resize();
        // this._callOnChangeViewport(this._map.transform);
      }
    }
  }, {
    key: '_updateMapStyle',
    value: function _updateMapStyle(oldProps, newProps) {
      var mapStyle = newProps.mapStyle;
      var oldMapStyle = oldProps.mapStyle;
      if (mapStyle !== oldMapStyle) {
        if (Immutable.Map.isMap(mapStyle)) {
          if (this.props.preventStyleDiffing) {
            this._map.setStyle(mapStyle.toJS());
          } else {
            setDiffStyle(oldMapStyle, mapStyle, this._map);
          }
        } else {
          this._map.setStyle(mapStyle);
        }
        this._updateQueryParams(mapStyle);
      }
    }
  }, {
    key: '_mapboxMapLoaded',
    value: function _mapboxMapLoaded(ref) {
      this._mapboxMap = ref;
    }

    // Handle map error

  }, {
    key: '_mapboxMapError',
    value: function _mapboxMapError(evt) {
      var statusCode = evt.error && evt.error.status || evt.status;
      if (statusCode === UNAUTHORIZED_ERROR_CODE && !this.state.accessTokenInvalid) {
        // Mapbox throws unauthorized error - invalid token
        console.error(NO_TOKEN_WARNING); // eslint-disable-line
        this.setState({ accessTokenInvalid: true });
      }
    }
  }, {
    key: '_renderNoTokenWarning',
    value: function _renderNoTokenWarning() {
      if (this.state.accessTokenInvalid) {
        var style = {
          position: 'absolute',
          left: 0,
          top: 0
        };
        return createElement('div', { key: 'warning', id: 'no-token-warning', style: style }, [createElement('h3', { key: 'header' }, NO_TOKEN_WARNING), createElement('div', { key: 'text' }, 'For information on setting up your basemap, read'), createElement('a', { key: 'link', href: TOKEN_DOC_URL }, 'Note on Map Tokens')]);
      }

      return null;
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          className = _props.className,
          width = _props.width,
          height = _props.height,
          style = _props.style,
          visible = _props.visible;

      var mapContainerStyle = Object.assign({}, style, { width: width, height: height, position: 'relative' });
      var mapStyle = Object.assign({}, style, {
        width: width,
        height: height,
        visibility: visible ? 'visible' : 'hidden'
      });
      var overlayContainerStyle = {
        position: 'absolute',
        left: 0,
        top: 0,
        width: width,
        height: height,
        overflow: 'hidden'
      };

      // Note: a static map still handles clicks and hover events
      return createElement('div', {
        key: 'map-container',
        style: mapContainerStyle,
        children: [createElement('div', {
          key: 'map-mapbox',
          ref: this._mapboxMapLoaded,
          style: mapStyle,
          className: className
        }), createElement('div', {
          key: 'map-overlays',
          // Same as interactive map's overlay container
          className: 'overlays',
          style: overlayContainerStyle,
          children: this.props.children
        }), this._renderNoTokenWarning()]
      });
    }
  }]);

  return StaticMap;
}(PureComponent);

export default StaticMap;


StaticMap.displayName = 'StaticMap';
StaticMap.propTypes = propTypes;
StaticMap.defaultProps = defaultProps;
StaticMap.childContextTypes = childContextTypes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL3N0YXRpYy1tYXAuanMiXSwibmFtZXMiOlsiUHVyZUNvbXBvbmVudCIsImNyZWF0ZUVsZW1lbnQiLCJQcm9wVHlwZXMiLCJhdXRvYmluZCIsImdldEludGVyYWN0aXZlTGF5ZXJJZHMiLCJzZXREaWZmU3R5bGUiLCJJbW11dGFibGUiLCJXZWJNZXJjYXRvclZpZXdwb3J0IiwiTWFwYm94IiwiVE9LRU5fRE9DX1VSTCIsIk5PX1RPS0VOX1dBUk5JTkciLCJub29wIiwiVU5BVVRIT1JJWkVEX0VSUk9SX0NPREUiLCJwcm9wVHlwZXMiLCJPYmplY3QiLCJhc3NpZ24iLCJtYXBTdHlsZSIsIm9uZU9mVHlwZSIsInN0cmluZyIsIm9iamVjdCIsImluc3RhbmNlT2YiLCJNYXAiLCJwcmV2ZW50U3R5bGVEaWZmaW5nIiwiYm9vbCIsInZpc2libGUiLCJkZWZhdWx0UHJvcHMiLCJjaGlsZENvbnRleHRUeXBlcyIsInZpZXdwb3J0IiwiU3RhdGljTWFwIiwic3VwcG9ydGVkIiwicHJvcHMiLCJfcXVlcnlQYXJhbXMiLCJjb21wb25lbnREaWRNb3VudCIsImNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJjb21wb25lbnREaWRVcGRhdGUiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInN0YXRlIiwiYWNjZXNzVG9rZW5JbnZhbGlkIiwiX21hcGJveCIsImNvbnRhaW5lciIsIl9tYXBib3hNYXAiLCJvbkVycm9yIiwiX21hcGJveE1hcEVycm9yIiwiaXNNYXAiLCJ0b0pTIiwiX21hcCIsImdldE1hcCIsIl91cGRhdGVRdWVyeVBhcmFtcyIsIm5ld1Byb3BzIiwic2V0UHJvcHMiLCJfdXBkYXRlTWFwU3R5bGUiLCJzZXRTdGF0ZSIsIndpZHRoIiwiaGVpZ2h0IiwiX3VwZGF0ZU1hcFNpemUiLCJmaW5hbGl6ZSIsImdlb21ldHJ5IiwicGFyYW1ldGVycyIsInF1ZXJ5UGFyYW1zIiwibGF5ZXJzIiwibGVuZ3RoIiwicXVlcnlSZW5kZXJlZEZlYXR1cmVzIiwiaW50ZXJhY3RpdmVMYXllcklkcyIsIm9sZFByb3BzIiwic2l6ZUNoYW5nZWQiLCJyZXNpemUiLCJvbGRNYXBTdHlsZSIsInNldFN0eWxlIiwicmVmIiwiZXZ0Iiwic3RhdHVzQ29kZSIsImVycm9yIiwic3RhdHVzIiwiY29uc29sZSIsInN0eWxlIiwicG9zaXRpb24iLCJsZWZ0IiwidG9wIiwia2V5IiwiaWQiLCJocmVmIiwiY2xhc3NOYW1lIiwibWFwQ29udGFpbmVyU3R5bGUiLCJ2aXNpYmlsaXR5Iiwib3ZlcmxheUNvbnRhaW5lclN0eWxlIiwib3ZlcmZsb3ciLCJjaGlsZHJlbiIsIl9tYXBib3hNYXBMb2FkZWQiLCJfcmVuZGVyTm9Ub2tlbldhcm5pbmciLCJkaXNwbGF5TmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVFBLGFBQVIsRUFBdUJDLGFBQXZCLFFBQTJDLE9BQTNDO0FBQ0EsT0FBT0MsU0FBUCxNQUFzQixZQUF0QjtBQUNBLE9BQU9DLFFBQVAsTUFBcUIsbUJBQXJCOztBQUVBLFNBQVFDLHNCQUFSLEVBQWdDQyxZQUFoQyxRQUFtRCxzQkFBbkQ7QUFDQSxPQUFPQyxTQUFQLE1BQXNCLFdBQXRCOztBQUVBLE9BQU9DLG1CQUFQLE1BQWdDLDJCQUFoQzs7QUFFQSxPQUFPQyxNQUFQLE1BQW1CLGtCQUFuQjs7QUFFQTtBQUNBLElBQU1DLGdCQUFnQix5RkFBdEI7QUFDQSxJQUFNQyxtQkFBbUIseURBQXpCO0FBQ0E7O0FBRUEsU0FBU0MsSUFBVCxHQUFnQixDQUFFOztBQUVsQixJQUFNQywwQkFBMEIsR0FBaEM7O0FBRUEsSUFBTUMsWUFBWUMsT0FBT0MsTUFBUCxDQUFjLEVBQWQsRUFBa0JQLE9BQU9LLFNBQXpCLEVBQW9DO0FBQ3BEO0FBQ0FHLFlBQVVkLFVBQVVlLFNBQVYsQ0FBb0IsQ0FDNUJmLFVB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VUFBVUYsaUJBQVYsR0FBOEJBLGlCQUE5QiIsImZpbGUiOiJzdGF0aWMtbWFwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG5cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cbmltcG9ydCB7UHVyZUNvbXBvbmVudCwgY3JlYXRlRWxlbWVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBhdXRvYmluZCBmcm9tICcuLi91dGlscy9hdXRvYmluZCc7XG5cbmltcG9ydCB7Z2V0SW50ZXJhY3RpdmVMYXllcklkcywgc2V0RGlmZlN0eWxlfSBmcm9tICcuLi91dGlscy9zdHlsZS11dGlscyc7XG5pbXBvcnQgSW1tdXRhYmxlIGZyb20gJ2ltbXV0YWJsZSc7XG5cbmltcG9ydCBXZWJNZXJjYXRvclZpZXdwb3J0IGZyb20gJ3ZpZXdwb3J0LW1lcmNhdG9yLXByb2plY3QnO1xuXG5pbXBvcnQgTWFwYm94IGZyb20gJy4uL21hcGJveC9tYXBib3gnO1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBtYXgtbGVuICovXG5jb25zdCBUT0tFTl9ET0NfVVJMID0gJ2h0dHBzOi8vdWJlci5naXRodWIuaW8vcmVhY3QtbWFwLWdsLyMvRG9jdW1lbnRhdGlvbi9nZXR0aW5nLXN0YXJ0ZWQvYWJvdXQtbWFwYm94LXRva2Vucyc7XG5jb25zdCBOT19UT0tFTl9XQVJOSU5HID0gJ0EgdmFsaWQgQVBJIGFjY2VzcyB0b2tlbiBpcyByZXF1aXJlZCB0byB1c2UgTWFwYm94IGRhdGEnO1xuLyogZXNsaW50LWRpc2FibGUgbWF4LWxlbiAqL1xuXG5mdW5jdGlvbiBub29wKCkge31cblxuY29uc3QgVU5BVVRIT1JJWkVEX0VSUk9SX0NPREUgPSA0MDE7XG5cbmNvbnN0IHByb3BUeXBlcyA9IE9iamVjdC5hc3NpZ24oe30sIE1hcGJveC5wcm9wVHlwZXMsIHtcbiAgLyoqIFRoZSBNYXBib3ggc3R5bGUuIEEgc3RyaW5nIHVybCBvciBhIE1hcGJveEdMIHN0eWxlIEltbXV0YWJsZS5NYXAgb2JqZWN0LiAqL1xuICBtYXBTdHlsZTogUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgUHJvcFR5cGVzLnN0cmluZyxcbiAgICBQcm9wVHlwZXMub2JqZWN0LFxuICAgIFByb3BUeXBlcy5pbnN0YW5jZU9mKEltbXV0YWJsZS5NYXApXG4gIF0pLFxuICAvKiogVGhlcmUgYXJlIGtub3duIGlzc3VlcyB3aXRoIHN0eWxlIGRpZmZpbmcuIEFzIHN0b3BnYXAsIGFkZCBvcHRpb24gdG8gcHJldmVudCBzdHlsZSBkaWZmaW5nLiAqL1xuICBwcmV2ZW50U3R5bGVEaWZmaW5nOiBQcm9wVHlwZXMuYm9vbCxcbiAgLyoqIFdoZXRoZXIgdGhlIG1hcCBpcyB2aXNpYmxlICovXG4gIHZpc2libGU6IFByb3BUeXBlcy5ib29sXG59KTtcblxuY29uc3QgZGVmYXVsdFByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgTWFwYm94LmRlZmF1bHRQcm9wcywge1xuICBtYXBTdHlsZTogJ21hcGJveDovL3N0eWxlcy9tYXBib3gvbGlnaHQtdjgnLFxuICBwcmV2ZW50U3R5bGVEaWZmaW5nOiBmYWxzZSxcbiAgdmlzaWJsZTogdHJ1ZVxufSk7XG5cbmNvbnN0IGNoaWxkQ29udGV4dFR5cGVzID0ge1xuICB2aWV3cG9ydDogUHJvcFR5cGVzLmluc3RhbmNlT2YoV2ViTWVyY2F0b3JWaWV3cG9ydClcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXRpY01hcCBleHRlbmRzIFB1cmVDb21wb25lbnQge1xuICBzdGF0aWMgc3VwcG9ydGVkKCkge1xuICAgIHJldHVybiBNYXBib3ggJiYgTWFwYm94LnN1cHBvcnRlZCgpO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5fcXVlcnlQYXJhbXMgPSB7fTtcbiAgICBpZiAoIVN0YXRpY01hcC5zdXBwb3J0ZWQoKSkge1xuICAgICAgdGhpcy5jb21wb25lbnREaWRNb3VudCA9IG5vb3A7XG4gICAgICB0aGlzLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMgPSBub29wO1xuICAgICAgdGhpcy5jb21wb25lbnREaWRVcGRhdGUgPSBub29wO1xuICAgICAgdGhpcy5jb21wb25lbnRXaWxsVW5tb3VudCA9IG5vb3A7XG4gICAgfVxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBhY2Nlc3NUb2tlbkludmFsaWQ6IGZhbHNlXG4gICAgfTtcbiAgICBhdXRvYmluZCh0aGlzKTtcbiAgfVxuXG4gIGdldENoaWxkQ29udGV4dCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmlld3BvcnQ6IG5ldyBXZWJNZXJjYXRvclZpZXdwb3J0KHRoaXMucHJvcHMpXG4gICAgfTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGNvbnN0IHttYXBTdHlsZX0gPSB0aGlzLnByb3BzO1xuXG4gICAgdGhpcy5fbWFwYm94ID0gbmV3IE1hcGJveChPYmplY3QuYXNzaWduKHt9LCB0aGlzLnByb3BzLCB7XG4gICAgICBjb250YWluZXI6IHRoaXMuX21hcGJveE1hcCxcbiAgICAgIG9uRXJyb3I6IHRoaXMuX21hcGJveE1hcEVycm9yLFxuICAgICAgbWFwU3R5bGU6IEltbXV0YWJsZS5NYXAuaXNNYXAobWFwU3R5bGUpID8gbWFwU3R5bGUudG9KUygpIDogbWFwU3R5bGVcbiAgICB9KSk7XG4gICAgdGhpcy5fbWFwID0gdGhpcy5fbWFwYm94LmdldE1hcCgpO1xuICAgIHRoaXMuX3VwZGF0ZVF1ZXJ5UGFyYW1zKG1hcFN0eWxlKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV3UHJvcHMpIHtcbiAgICB0aGlzLl9tYXBib3guc2V0UHJvcHMobmV3UHJvcHMpO1xuICAgIHRoaXMuX3VwZGF0ZU1hcFN0eWxlKHRoaXMucHJvcHMsIG5ld1Byb3BzKTtcblxuICAgIC8vIHRoaXMuX3VwZGF0ZU1hcFZpZXdwb3J0KHRoaXMucHJvcHMsIG5ld1Byb3BzKTtcblxuICAgIC8vIFNhdmUgd2lkdGgvaGVpZ2h0IHNvIHRoYXQgd2UgY2FuIGNoZWNrIHRoZW0gaW4gY29tcG9uZW50RGlkVXBkYXRlXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICB3aWR0aDogdGhpcy5wcm9wcy53aWR0aCxcbiAgICAgIGhlaWdodDogdGhpcy5wcm9wcy5oZWlnaHRcbiAgICB9KTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICAvLyBTaW5jZSBNYXBib3gncyBtYXAucmVzaXplKCkgcmVhZHMgc2l6ZSBmcm9tIERPTVxuICAgIC8vIHdlIG11c3Qgd2FpdCB0byByZWFkIHNpemUgdW50aWwgYWZ0ZXIgcmVuZGVyIChpLmUuIGhlcmUgaW4gXCJkaWRVcGRhdGVcIilcbiAgICB0aGlzLl91cGRhdGVNYXBTaXplKHRoaXMuc3RhdGUsIHRoaXMucHJvcHMpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgdGhpcy5fbWFwYm94LmZpbmFsaXplKCk7XG4gICAgdGhpcy5fbWFwYm94ID0gbnVsbDtcbiAgICB0aGlzLl9tYXAgPSBudWxsO1xuICB9XG5cbiAgLy8gRXh0ZXJuYWwgYXBwcyBjYW4gYWNjZXNzIG1hcCB0aGlzIHdheVxuICBnZXRNYXAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcDtcbiAgfVxuXG4gIC8qKiBVc2VzIE1hcGJveCdzXG4gICAgKiBxdWVyeVJlbmRlcmVkRmVhdHVyZXMgQVBJIHRvIGZpbmQgZmVhdHVyZXMgYXQgcG9pbnQgb3IgaW4gYSBib3VuZGluZyBib3guXG4gICAgKiBodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1qcy9hcGkvI01hcCNxdWVyeVJlbmRlcmVkRmVhdHVyZXNcbiAgICAqIFRvIHF1ZXJ5IG9ubHkgc29tZSBvZiB0aGUgbGF5ZXJzLCBzZXQgdGhlIGBpbnRlcmFjdGl2ZWAgcHJvcGVydHkgaW4gdGhlXG4gICAgKiBsYXllciBzdHlsZSB0byBgdHJ1ZWAuXG4gICAgKiBAcGFyYW0ge1tOdW1iZXIsIE51bWJlcl18W1tOdW1iZXIsIE51bWJlcl0sIFtOdW1iZXIsIE51bWJlcl1dfSBnZW9tZXRyeSAtXG4gICAgKiAgIFBvaW50IG9yIGFuIGFycmF5IG9mIHR3byBwb2ludHMgZGVmaW5pbmcgdGhlIGJvdW5kaW5nIGJveFxuICAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtZXRlcnMgLSBxdWVyeSBvcHRpb25zXG4gICAgKi9cbiAgcXVlcnlSZW5kZXJlZEZlYXR1cmVzKGdlb21ldHJ5LCBwYXJhbWV0ZXJzKSB7XG4gICAgY29uc3QgcXVlcnlQYXJhbXMgPSBwYXJhbWV0ZXJzIHx8IHRoaXMuX3F1ZXJ5UGFyYW1zO1xuICAgIGlmIChxdWVyeVBhcmFtcy5sYXllcnMgJiYgcXVlcnlQYXJhbXMubGF5ZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fbWFwLnF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyhnZW9tZXRyeSwgcXVlcnlQYXJhbXMpO1xuICB9XG5cbiAgLy8gSG92ZXIgYW5kIGNsaWNrIG9ubHkgcXVlcnkgbGF5ZXJzIHdob3NlIGludGVyYWN0aXZlIHByb3BlcnR5IGlzIHRydWVcbiAgX3VwZGF0ZVF1ZXJ5UGFyYW1zKG1hcFN0eWxlKSB7XG4gICAgY29uc3QgaW50ZXJhY3RpdmVMYXllcklkcyA9IGdldEludGVyYWN0aXZlTGF5ZXJJZHMobWFwU3R5bGUpO1xuICAgIHRoaXMuX3F1ZXJ5UGFyYW1zID0ge2xheWVyczogaW50ZXJhY3RpdmVMYXllcklkc307XG4gIH1cblxuICAvLyBOb3RlOiBuZWVkcyB0byBiZSBjYWxsZWQgYWZ0ZXIgcmVuZGVyIChlLmcuIGluIGNvbXBvbmVudERpZFVwZGF0ZSlcbiAgX3VwZGF0ZU1hcFNpemUob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgY29uc3Qgc2l6ZUNoYW5nZWQgPVxuICAgICAgb2xkUHJvcHMud2lkdGggIT09IG5ld1Byb3BzLndpZHRoIHx8IG9sZFByb3BzLmhlaWdodCAhPT0gbmV3UHJvcHMuaGVpZ2h0O1xuXG4gICAgaWYgKHNpemVDaGFuZ2VkKSB7XG4gICAgICB0aGlzLl9tYXAucmVzaXplKCk7XG4gICAgICAvLyB0aGlzLl9jYWxsT25DaGFuZ2VWaWV3cG9ydCh0aGlzLl9tYXAudHJhbnNmb3JtKTtcbiAgICB9XG4gIH1cblxuICBfdXBkYXRlTWFwU3R5bGUob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgY29uc3QgbWFwU3R5bGUgPSBuZXdQcm9wcy5tYXBTdHlsZTtcbiAgICBjb25zdCBvbGRNYXBTdHlsZSA9IG9sZFByb3BzLm1hcFN0eWxlO1xuICAgIGlmIChtYXBTdHlsZSAhPT0gb2xkTWFwU3R5bGUpIHtcbiAgICAgIGlmIChJbW11dGFibGUuTWFwLmlzTWFwKG1hcFN0eWxlKSkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5wcmV2ZW50U3R5bGVEaWZmaW5nKSB7XG4gICAgICAgICAgdGhpcy5fbWFwLnNldFN0eWxlKG1hcFN0eWxlLnRvSlMoKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2V0RGlmZlN0eWxlKG9sZE1hcFN0eWxlLCBtYXBTdHlsZSwgdGhpcy5fbWFwKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fbWFwLnNldFN0eWxlKG1hcFN0eWxlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3VwZGF0ZVF1ZXJ5UGFyYW1zKG1hcFN0eWxlKTtcbiAgICB9XG4gIH1cblxuICBfbWFwYm94TWFwTG9hZGVkKHJlZikge1xuICAgIHRoaXMuX21hcGJveE1hcCA9IHJlZjtcbiAgfVxuXG4gIC8vIEhhbmRsZSBtYXAgZXJyb3JcbiAgX21hcGJveE1hcEVycm9yKGV2dCkge1xuICAgIGNvbnN0IHN0YXR1c0NvZGUgPSBldnQuZXJyb3IgJiYgZXZ0LmVycm9yLnN0YXR1cyB8fCBldnQuc3RhdHVzO1xuICAgIGlmIChzdGF0dXNDb2RlID09PSBVTkFVVEhPUklaRURfRVJST1JfQ09ERSAmJiAhdGhpcy5zdGF0ZS5hY2Nlc3NUb2tlbkludmFsaWQpIHtcbiAgICAgIC8vIE1hcGJveCB0aHJvd3MgdW5hdXRob3JpemVkIGVycm9yIC0gaW52YWxpZCB0b2tlblxuICAgICAgY29uc29sZS5lcnJvcihOT19UT0tFTl9XQVJOSU5HKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7YWNjZXNzVG9rZW5JbnZhbGlkOiB0cnVlfSk7XG4gICAgfVxuICB9XG5cbiAgX3JlbmRlck5vVG9rZW5XYXJuaW5nKCkge1xuICAgIGlmICh0aGlzLnN0YXRlLmFjY2Vzc1Rva2VuSW52YWxpZCkge1xuICAgICAgY29uc3Qgc3R5bGUgPSB7XG4gICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICBsZWZ0OiAwLFxuICAgICAgICB0b3A6IDBcbiAgICAgIH07XG4gICAgICByZXR1cm4gKFxuICAgICAgICBjcmVhdGVFbGVtZW50KCdkaXYnLCB7a2V5OiAnd2FybmluZycsIGlkOiAnbm8tdG9rZW4td2FybmluZycsIHN0eWxlfSwgW1xuICAgICAgICAgIGNyZWF0ZUVsZW1lbnQoJ2gzJywge2tleTogJ2hlYWRlcid9LCBOT19UT0tFTl9XQVJOSU5HKSxcbiAgICAgICAgICBjcmVhdGVFbGVtZW50KCdkaXYnLCB7a2V5OiAndGV4dCd9LCAnRm9yIGluZm9ybWF0aW9uIG9uIHNldHRpbmcgdXAgeW91ciBiYXNlbWFwLCByZWFkJyksXG4gICAgICAgICAgY3JlYXRlRWxlbWVudCgnYScsIHtrZXk6ICdsaW5rJywgaHJlZjogVE9LRU5fRE9DX1VSTH0sICdOb3RlIG9uIE1hcCBUb2tlbnMnKVxuICAgICAgICBdKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7Y2xhc3NOYW1lLCB3aWR0aCwgaGVpZ2h0LCBzdHlsZSwgdmlzaWJsZX0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IG1hcENvbnRhaW5lclN0eWxlID0gT2JqZWN0LmFzc2lnbih7fSwgc3R5bGUsIHt3aWR0aCwgaGVpZ2h0LCBwb3NpdGlvbjogJ3JlbGF0aXZlJ30pO1xuICAgIGNvbnN0IG1hcFN0eWxlID0gT2JqZWN0LmFzc2lnbih7fSwgc3R5bGUsIHtcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgdmlzaWJpbGl0eTogdmlzaWJsZSA/ICd2aXNpYmxlJyA6ICdoaWRkZW4nXG4gICAgfSk7XG4gICAgY29uc3Qgb3ZlcmxheUNvbnRhaW5lclN0eWxlID0ge1xuICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICBsZWZ0OiAwLFxuICAgICAgdG9wOiAwLFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBvdmVyZmxvdzogJ2hpZGRlbidcbiAgICB9O1xuXG4gICAgLy8gTm90ZTogYSBzdGF0aWMgbWFwIHN0aWxsIGhhbmRsZXMgY2xpY2tzIGFuZCBob3ZlciBldmVudHNcbiAgICByZXR1cm4gKFxuICAgICAgY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBrZXk6ICdtYXAtY29udGFpbmVyJyxcbiAgICAgICAgc3R5bGU6IG1hcENvbnRhaW5lclN0eWxlLFxuICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAgIGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgICAgIGtleTogJ21hcC1tYXBib3gnLFxuICAgICAgICAgICAgcmVmOiB0aGlzLl9tYXBib3hNYXBMb2FkZWQsXG4gICAgICAgICAgICBzdHlsZTogbWFwU3R5bGUsXG4gICAgICAgICAgICBjbGFzc05hbWVcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgICAgICBrZXk6ICdtYXAtb3ZlcmxheXMnLFxuICAgICAgICAgICAgLy8gU2FtZSBhcyBpbnRlcmFjdGl2ZSBtYXAncyBvdmVybGF5IGNvbnRhaW5lclxuICAgICAgICAgICAgY2xhc3NOYW1lOiAnb3ZlcmxheXMnLFxuICAgICAgICAgICAgc3R5bGU6IG92ZXJsYXlDb250YWluZXJTdHlsZSxcbiAgICAgICAgICAgIGNoaWxkcmVuOiB0aGlzLnByb3BzLmNoaWxkcmVuXG4gICAgICAgICAgfSksXG4gICAgICAgICAgdGhpcy5fcmVuZGVyTm9Ub2tlbldhcm5pbmcoKVxuICAgICAgICBdXG4gICAgICB9KVxuICAgICk7XG4gIH1cbn1cblxuU3RhdGljTWFwLmRpc3BsYXlOYW1lID0gJ1N0YXRpY01hcCc7XG5TdGF0aWNNYXAucHJvcFR5cGVzID0gcHJvcFR5cGVzO1xuU3RhdGljTWFwLmRlZmF1bHRQcm9wcyA9IGRlZmF1bHRQcm9wcztcblN0YXRpY01hcC5jaGlsZENvbnRleHRUeXBlcyA9IGNoaWxkQ29udGV4dFR5cGVzO1xuIl19