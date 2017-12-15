'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MAPBOX_LIMITS = undefined;

var _log = require('babel-runtime/core-js/math/log2');

var _log2 = _interopRequireDefault(_log);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _isFinite = require('babel-runtime/core-js/number/is-finite');

var _isFinite2 = _interopRequireDefault(_isFinite);

var _viewportMercatorProject = require('viewport-mercator-project');

var _viewportMercatorProject2 = _interopRequireDefault(_viewportMercatorProject);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// MAPBOX LIMITS
var MAPBOX_LIMITS = exports.MAPBOX_LIMITS = {
  minZoom: 0,
  maxZoom: 20,
  minPitch: 0,
  maxPitch: 60,
  // defined by mapbox-gl
  maxLatitude: 85.05113,
  minLatitude: -85.05113
};

var defaultState = {
  pitch: 0,
  bearing: 0,
  altitude: 1.5
};

/* Utils */
function mod(value, divisor) {
  var modulus = value % divisor;
  return modulus < 0 ? divisor + modulus : modulus;
}

function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

function ensureFinite(value, fallbackValue) {
  return (0, _isFinite2.default)(value) ? value : fallbackValue;
}

var MapState = function () {
  function MapState() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        width = _ref.width,
        height = _ref.height,
        latitude = _ref.latitude,
        longitude = _ref.longitude,
        zoom = _ref.zoom,
        bearing = _ref.bearing,
        pitch = _ref.pitch,
        altitude = _ref.altitude,
        maxZoom = _ref.maxZoom,
        minZoom = _ref.minZoom,
        maxPitch = _ref.maxPitch,
        minPitch = _ref.minPitch,
        maxLatitude = _ref.maxLatitude,
        minLatitude = _ref.minLatitude,
        startPanLngLat = _ref.startPanLngLat,
        startZoomLngLat = _ref.startZoomLngLat,
        startBearing = _ref.startBearing,
        startPitch = _ref.startPitch,
        startZoom = _ref.startZoom;

    (0, _classCallCheck3.default)(this, MapState);

    (0, _assert2.default)((0, _isFinite2.default)(width), '`width` must be supplied');
    (0, _assert2.default)((0, _isFinite2.default)(height), '`height` must be supplied');
    (0, _assert2.default)((0, _isFinite2.default)(longitude), '`longitude` must be supplied');
    (0, _assert2.default)((0, _isFinite2.default)(latitude), '`latitude` must be supplied');
    (0, _assert2.default)((0, _isFinite2.default)(zoom), '`zoom` must be supplied');

    this._viewportProps = this._applyConstraints({
      width: width,
      height: height,
      latitude: latitude,
      longitude: longitude,
      zoom: zoom,
      bearing: ensureFinite(bearing, defaultState.bearing),
      pitch: ensureFinite(pitch, defaultState.pitch),
      altitude: ensureFinite(altitude, defaultState.altitude),
      maxZoom: ensureFinite(maxZoom, MAPBOX_LIMITS.maxZoom),
      minZoom: ensureFinite(minZoom, MAPBOX_LIMITS.minZoom),
      maxPitch: ensureFinite(maxPitch, MAPBOX_LIMITS.maxPitch),
      minPitch: ensureFinite(minPitch, MAPBOX_LIMITS.minPitch),
      maxLatitude: ensureFinite(maxLatitude, MAPBOX_LIMITS.maxLatitude),
      minLatitude: ensureFinite(minLatitude, MAPBOX_LIMITS.minLatitude)
    });

    this._interactiveState = {
      startPanLngLat: startPanLngLat,
      startZoomLngLat: startZoomLngLat,
      startBearing: startBearing,
      startPitch: startPitch,
      startZoom: startZoom
    };
  }

  /* Public API */

  (0, _createClass3.default)(MapState, [{
    key: 'getViewportProps',
    value: function getViewportProps() {
      return this._viewportProps;
    }
  }, {
    key: 'getInteractiveState',
    value: function getInteractiveState() {
      return this._interactiveState;
    }

    /**
     * Start panning
     * @param {[Number, Number]} pos - position on screen where the pointer grabs
     */

  }, {
    key: 'panStart',
    value: function panStart(_ref2) {
      var pos = _ref2.pos;

      return this._getUpdatedMapState({
        startPanLngLat: this._unproject(pos)
      });
    }

    /**
     * Pan
     * @param {[Number, Number]} pos - position on screen where the pointer is
     * @param {[Number, Number], optional} startPos - where the pointer grabbed at
     *   the start of the operation. Must be supplied of `panStart()` was not called
     */

  }, {
    key: 'pan',
    value: function pan(_ref3) {
      var pos = _ref3.pos,
          startPos = _ref3.startPos;

      var startPanLngLat = this._interactiveState.startPanLngLat || this._unproject(startPos);

      if (!startPanLngLat) {
        return this;
      }

      var _calculateNewLngLat2 = this._calculateNewLngLat({ startPanLngLat: startPanLngLat, pos: pos }),
          _calculateNewLngLat3 = (0, _slicedToArray3.default)(_calculateNewLngLat2, 2),
          longitude = _calculateNewLngLat3[0],
          latitude = _calculateNewLngLat3[1];

      return this._getUpdatedMapState({
        longitude: longitude,
        latitude: latitude
      });
    }

    /**
     * End panning
     * Must call if `panStart()` was called
     */

  }, {
    key: 'panEnd',
    value: function panEnd() {
      return this._getUpdatedMapState({
        startPanLngLat: null
      });
    }

    /**
     * Start rotating
     * @param {[Number, Number]} pos - position on screen where the center is
     */

  }, {
    key: 'rotateStart',
    value: function rotateStart(_ref4) {
      var pos = _ref4.pos;

      return this._getUpdatedMapState({
        startBearing: this._viewportProps.bearing,
        startPitch: this._viewportProps.pitch
      });
    }

    /**
     * Rotate
     * @param {Number} deltaScaleX - a number between [-1, 1] specifying the
     *   change to bearing.
     * @param {Number} deltaScaleY - a number between [-1, 1] specifying the
     *   change to pitch. -1 sets to minPitch and 1 sets to maxPitch.
     */

  }, {
    key: 'rotate',
    value: function rotate(_ref5) {
      var _ref5$deltaScaleX = _ref5.deltaScaleX,
          deltaScaleX = _ref5$deltaScaleX === undefined ? 0 : _ref5$deltaScaleX,
          _ref5$deltaScaleY = _ref5.deltaScaleY,
          deltaScaleY = _ref5$deltaScaleY === undefined ? 0 : _ref5$deltaScaleY;
      var _interactiveState = this._interactiveState,
          startBearing = _interactiveState.startBearing,
          startPitch = _interactiveState.startPitch;


      if (!(0, _isFinite2.default)(startBearing) || !(0, _isFinite2.default)(startPitch)) {
        return this;
      }

      var _calculateNewPitchAnd = this._calculateNewPitchAndBearing({
        deltaScaleX: deltaScaleX,
        deltaScaleY: deltaScaleY,
        startBearing: startBearing,
        startPitch: startPitch
      }),
          pitch = _calculateNewPitchAnd.pitch,
          bearing = _calculateNewPitchAnd.bearing;

      return this._getUpdatedMapState({
        bearing: bearing,
        pitch: pitch
      });
    }

    /**
     * End rotating
     * Must call if `rotateStart()` was called
     */

  }, {
    key: 'rotateEnd',
    value: function rotateEnd() {
      return this._getUpdatedMapState({
        startBearing: null,
        startPitch: null
      });
    }

    /**
     * Start zooming
     * @param {[Number, Number]} pos - position on screen where the center is
     */

  }, {
    key: 'zoomStart',
    value: function zoomStart(_ref6) {
      var pos = _ref6.pos;

      return this._getUpdatedMapState({
        startZoomLngLat: this._unproject(pos),
        startZoom: this._viewportProps.zoom
      });
    }

    /**
     * Zoom
     * @param {[Number, Number]} pos - position on screen where the current center is
     * @param {[Number, Number]} startPos - the center position at
     *   the start of the operation. Must be supplied of `zoomStart()` was not called
     * @param {Number} scale - a number between [0, 1] specifying the accumulated
     *   relative scale.
     */

  }, {
    key: 'zoom',
    value: function zoom(_ref7) {
      var pos = _ref7.pos,
          startPos = _ref7.startPos,
          scale = _ref7.scale;

      (0, _assert2.default)(scale > 0, '`scale` must be a positive number');

      // Make sure we zoom around the current mouse position rather than map center
      var _interactiveState2 = this._interactiveState,
          startZoom = _interactiveState2.startZoom,
          startZoomLngLat = _interactiveState2.startZoomLngLat;


      if (!(0, _isFinite2.default)(startZoom)) {
        // We have two modes of zoom:
        // scroll zoom that are discrete events (transform from the current zoom level),
        // and pinch zoom that are continuous events (transform from the zoom level when
        // pinch started).
        // If startZoom state is defined, then use the startZoom state;
        // otherwise assume discrete zooming
        startZoom = this._viewportProps.zoom;
        startZoomLngLat = this._unproject(startPos) || this._unproject(pos);
      }

      // take the start lnglat and put it where the mouse is down.
      (0, _assert2.default)(startZoomLngLat, '`startZoomLngLat` prop is required ' + 'for zoom behavior to calculate where to position the map.');

      var zoom = this._calculateNewZoom({ scale: scale, startZoom: startZoom });

      var zoomedViewport = new _viewportMercatorProject2.default((0, _assign2.default)({}, this._viewportProps, { zoom: zoom }));

      var _zoomedViewport$getLo = zoomedViewport.getLocationAtPoint({ lngLat: startZoomLngLat, pos: pos }),
          _zoomedViewport$getLo2 = (0, _slicedToArray3.default)(_zoomedViewport$getLo, 2),
          longitude = _zoomedViewport$getLo2[0],
          latitude = _zoomedViewport$getLo2[1];

      return this._getUpdatedMapState({
        zoom: zoom,
        longitude: longitude,
        latitude: latitude
      });
    }

    /**
     * End zooming
     * Must call if `zoomStart()` was called
     */

  }, {
    key: 'zoomEnd',
    value: function zoomEnd() {
      return this._getUpdatedMapState({
        startZoomLngLat: null,
        startZoom: null
      });
    }

    /* Private methods */

  }, {
    key: '_getUpdatedMapState',
    value: function _getUpdatedMapState(newProps) {
      // Update _viewportProps
      return new MapState((0, _assign2.default)({}, this._viewportProps, this._interactiveState, newProps));
    }

    // Apply any constraints (mathematical or defined by _viewportProps) to map state
    /* eslint-disable complexity */

  }, {
    key: '_applyConstraints',
    value: function _applyConstraints(props) {
      // Normalize degrees
      var longitude = props.longitude,
          bearing = props.bearing;

      if (longitude < -180 || longitude > 180) {
        props.longitude = mod(longitude + 180, 360) - 180;
      }
      if (bearing < -180 || bearing > 180) {
        props.bearing = mod(bearing + 180, 360) - 180;
      }

      // Ensure zoom is within specified range
      var maxZoom = props.maxZoom,
          minZoom = props.minZoom,
          zoom = props.zoom;

      props.zoom = zoom > maxZoom ? maxZoom : zoom;
      props.zoom = zoom < minZoom ? minZoom : zoom;

      // Ensure pitch is within specified range
      var maxPitch = props.maxPitch,
          minPitch = props.minPitch,
          pitch = props.pitch;


      props.pitch = pitch > maxPitch ? maxPitch : pitch;
      props.pitch = pitch < minPitch ? minPitch : pitch;

      // Constrain zoom and shift center at low zoom levels
      var height = props.height;

      var _getLatitudeRange2 = this._getLatitudeRange(props),
          _getLatitudeRange2$la = (0, _slicedToArray3.default)(_getLatitudeRange2.latitudeRange, 2),
          topY = _getLatitudeRange2$la[0],
          bottomY = _getLatitudeRange2$la[1],
          viewport = _getLatitudeRange2.viewport;

      var shiftY = 0;

      if (bottomY - topY < height) {
        // Map height must not be smaller than viewport height
        props.zoom += (0, _log2.default)(height / (bottomY - topY));
        var newRange = this._getLatitudeRange(props);

        var _newRange$latitudeRan = (0, _slicedToArray3.default)(newRange.latitudeRange, 2);

        topY = _newRange$latitudeRan[0];
        bottomY = _newRange$latitudeRan[1];

        viewport = newRange.viewport;
      }
      if (topY > 0) {
        // Compensate for white gap on top
        shiftY = topY;
      } else if (bottomY < height) {
        // Compensate for white gap on bottom
        shiftY = bottomY - height;
      }
      if (shiftY) {
        props.latitude = viewport.unproject([props.width / 2, height / 2 + shiftY])[1];
      }

      return props;
    }
    /* eslint-enable complexity */

    // Returns {viewport, latitudeRange: [topY, bottomY]} in non-perspective mode

  }, {
    key: '_getLatitudeRange',
    value: function _getLatitudeRange(props) {
      var flatViewport = new _viewportMercatorProject2.default((0, _assign2.default)({}, props, {
        pitch: 0,
        bearing: 0
      }));
      return {
        viewport: flatViewport,
        latitudeRange: [flatViewport.project([props.longitude, props.maxLatitude])[1], flatViewport.project([props.longitude, props.minLatitude])[1]]
      };
    }
  }, {
    key: '_unproject',
    value: function _unproject(pos) {
      var viewport = new _viewportMercatorProject2.default(this._viewportProps);
      return pos && viewport.unproject(pos);
    }

    // Calculate a new lnglat based on pixel dragging position

  }, {
    key: '_calculateNewLngLat',
    value: function _calculateNewLngLat(_ref8) {
      var startPanLngLat = _ref8.startPanLngLat,
          pos = _ref8.pos;

      var viewport = new _viewportMercatorProject2.default(this._viewportProps);
      return viewport.getLocationAtPoint({ lngLat: startPanLngLat, pos: pos });
    }

    // Calculates new zoom

  }, {
    key: '_calculateNewZoom',
    value: function _calculateNewZoom(_ref9) {
      var scale = _ref9.scale,
          startZoom = _ref9.startZoom;
      var _viewportProps = this._viewportProps,
          maxZoom = _viewportProps.maxZoom,
          minZoom = _viewportProps.minZoom;

      var zoom = startZoom + (0, _log2.default)(scale);
      zoom = zoom > maxZoom ? maxZoom : zoom;
      zoom = zoom < minZoom ? minZoom : zoom;
      return zoom;
    }

    // Calculates a new pitch and bearing from a position (coming from an event)

  }, {
    key: '_calculateNewPitchAndBearing',
    value: function _calculateNewPitchAndBearing(_ref10) {
      var deltaScaleX = _ref10.deltaScaleX,
          deltaScaleY = _ref10.deltaScaleY,
          startBearing = _ref10.startBearing,
          startPitch = _ref10.startPitch;

      // clamp deltaScaleY to [-1, 1] so that rotation is constrained between minPitch and maxPitch.
      // deltaScaleX does not need to be clamped as bearing does not have constraints.
      deltaScaleY = clamp(deltaScaleY, -1, 1);

      var _viewportProps2 = this._viewportProps,
          minPitch = _viewportProps2.minPitch,
          maxPitch = _viewportProps2.maxPitch;


      var bearing = startBearing + 180 * deltaScaleX;
      var pitch = startPitch;
      if (deltaScaleY > 0) {
        // Gradually increase pitch
        pitch = startPitch + deltaScaleY * (maxPitch - startPitch);
      } else if (deltaScaleY < 0) {
        // Gradually decrease pitch
        pitch = startPitch - deltaScaleY * (minPitch - startPitch);
      }

      return {
        pitch: pitch,
        bearing: bearing
      };
    }
  }]);
  return MapState;
}();

exports.default = MapState;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9tYXAtc3RhdGUuanMiXSwibmFtZXMiOlsiTUFQQk9YX0xJTUlUUyIsIm1pblpvb20iLCJtYXhab29tIiwibWluUGl0Y2giLCJtYXhQaXRjaCIsIm1heExhdGl0dWRlIiwibWluTGF0aXR1ZGUiLCJkZWZhdWx0U3RhdGUiLCJwaXRjaCIsImJlYXJpbmciLCJhbHRpdHVkZSIsIm1vZCIsInZhbHVlIiwiZGl2aXNvciIsIm1vZHVsdXMiLCJjbGFtcCIsIm1pbiIsIm1heCIsImVuc3VyZUZpbml0ZSIsImZhbGxiYWNrVmFsdWUiLCJNYXBTdGF0ZSIsIndpZHRoIiwiaGVpZ2h0IiwibGF0aXR1ZGUiLCJsb25naXR1ZGUiLCJ6b29tIiwic3RhcnRQYW5MbmdMYXQiLCJzdGFydFpvb21MbmdMYXQiLCJzdGFydEJlYXJpbmciLCJzdGFydFBpdGNoIiwic3RhcnRab29tIiwiX3ZpZXdwb3J0UHJvcHMiLCJfYXBwbHlDb25zdHJhaW50cyIsIl9pbnRlcmFjdGl2ZVN0YXRlIiwicG9zIiwiX2dldFVwZGF0ZWRNYXBTdGF0ZSIsIl91bnByb2plY3QiLCJzdGFydFBvcyIsIl9jYWxjdWxhdGVOZXdMbmdMYXQiLCJkZWx0YVNjYWxlWCIsImRlbHRhU2NhbGVZIiwiX2NhbGN1bGF0ZU5ld1BpdGNoQW5kQmVhcmluZyIsInNjYWxlIiwiX2NhbGN1bGF0ZU5ld1pvb20iLCJ6b29tZWRWaWV3cG9ydCIsImdldExvY2F0aW9uQXRQb2ludCIsImxuZ0xhdCIsIm5ld1Byb3BzIiwicHJvcHMiLCJfZ2V0TGF0aXR1ZGVSYW5nZSIsImxhdGl0dWRlUmFuZ2UiLCJ0b3BZIiwiYm90dG9tWSIsInZpZXdwb3J0Iiwic2hpZnRZIiwibmV3UmFuZ2UiLCJ1bnByb2plY3QiLCJmbGF0Vmlld3BvcnQiLCJwcm9qZWN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7Ozs7O0FBRUE7QUFDTyxJQUFNQSx3Q0FB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dGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgV2ViTWVyY2F0b3JWaWV3cG9ydCBmcm9tICd2aWV3cG9ydC1tZXJjYXRvci1wcm9qZWN0JztcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcblxuLy8gTUFQQk9YIExJTUlUU1xuZXhwb3J0IGNvbnN0IE1BUEJPWF9MSU1JVFMgPSB7XG4gIG1pblpvb206IDAsXG4gIG1heFpvb206IDIwLFxuICBtaW5QaXRjaDogMCxcbiAgbWF4UGl0Y2g6IDYwLFxuICAvLyBkZWZpbmVkIGJ5IG1hcGJveC1nbFxuICBtYXhMYXRpdHVkZTogODUuMDUxMTMsXG4gIG1pbkxhdGl0dWRlOiAtODUuMDUxMTNcbn07XG5cbmNvbnN0IGRlZmF1bHRTdGF0ZSA9IHtcbiAgcGl0Y2g6IDAsXG4gIGJlYXJpbmc6IDAsXG4gIGFsdGl0dWRlOiAxLjVcbn07XG5cbi8qIFV0aWxzICovXG5mdW5jdGlvbiBtb2QodmFsdWUsIGRpdmlzb3IpIHtcbiAgY29uc3QgbW9kdWx1cyA9IHZhbHVlICUgZGl2aXNvcjtcbiAgcmV0dXJuIG1vZHVsdXMgPCAwID8gZGl2aXNvciArIG1vZHVsdXMgOiBtb2R1bHVzO1xufVxuXG5mdW5jdGlvbiBjbGFtcCh2YWx1ZSwgbWluLCBtYXgpIHtcbiAgcmV0dXJuIHZhbHVlIDwgbWluID8gbWluIDogKHZhbHVlID4gbWF4ID8gbWF4IDogdmFsdWUpO1xufVxuXG5mdW5jdGlvbiBlbnN1cmVGaW5pdGUodmFsdWUsIGZhbGxiYWNrVmFsdWUpIHtcbiAgcmV0dXJuIE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkgPyB2YWx1ZSA6IGZhbGxiYWNrVmFsdWU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hcFN0YXRlIHtcblxuICBjb25zdHJ1Y3Rvcih7XG4gICAgLyoqIE1hcGJveCB2aWV3cG9ydCBwcm9wZXJ0aWVzICovXG4gICAgLyoqIFRoZSB3aWR0aCBvZiB0aGUgdmlld3BvcnQgKi9cbiAgICB3aWR0aCxcbiAgICAvKiogVGhlIGhlaWdodCBvZiB0aGUgdmlld3BvcnQgKi9cbiAgICBoZWlnaHQsXG4gICAgLyoqIFRoZSBsYXRpdHVkZSBhdCB0aGUgY2VudGVyIG9mIHRoZSB2aWV3cG9ydCAqL1xuICAgIGxhdGl0dWRlLFxuICAgIC8qKiBUaGUgbG9uZ2l0dWRlIGF0IHRoZSBjZW50ZXIgb2YgdGhlIHZpZXdwb3J0ICovXG4gICAgbG9uZ2l0dWRlLFxuICAgIC8qKiBUaGUgdGlsZSB6b29tIGxldmVsIG9mIHRoZSBtYXAuICovXG4gICAgem9vbSxcbiAgICAvKiogVGhlIGJlYXJpbmcgb2YgdGhlIHZpZXdwb3J0IGluIGRlZ3JlZXMgKi9cbiAgICBiZWFyaW5nLFxuICAgIC8qKiBUaGUgcGl0Y2ggb2YgdGhlIHZpZXdwb3J0IGluIGRlZ3JlZXMgKi9cbiAgICBwaXRjaCxcbiAgICAvKipcbiAgICAqIFNwZWNpZnkgdGhlIGFsdGl0dWRlIG9mIHRoZSB2aWV3cG9ydCBjYW1lcmFcbiAgICAqIFVuaXQ6IG1hcCBoZWlnaHRzLCBkZWZhdWx0IDEuNVxuICAgICogTm9uLXB1YmxpYyBBUEksIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbWFwYm94L21hcGJveC1nbC1qcy9pc3N1ZXMvMTEzN1xuICAgICovXG4gICAgYWx0aXR1ZGUsXG5cbiAgICAvKiogVmlld3BvcnQgY29uc3RyYWludHMgKi9cbiAgICBtYXhab29tLFxuICAgIG1pblpvb20sXG4gICAgbWF4UGl0Y2gsXG4gICAgbWluUGl0Y2gsXG4gICAgbWF4TGF0aXR1ZGUsXG4gICAgbWluTGF0aXR1ZGUsXG5cbiAgICAvKiogSW50ZXJhY3Rpb24gc3RhdGVzLCByZXF1aXJlZCB0byBjYWxjdWxhdGUgY2hhbmdlIGR1cmluZyB0cmFuc2Zvcm0gKi9cbiAgICAvKiBUaGUgcG9pbnQgb24gbWFwIGJlaW5nIGdyYWJiZWQgd2hlbiB0aGUgb3BlcmF0aW9uIGZpcnN0IHN0YXJ0ZWQgKi9cbiAgICBzdGFydFBhbkxuZ0xhdCxcbiAgICAvKiBDZW50ZXIgb2YgdGhlIHpvb20gd2hlbiB0aGUgb3BlcmF0aW9uIGZpcnN0IHN0YXJ0ZWQgKi9cbiAgICBzdGFydFpvb21MbmdMYXQsXG4gICAgLyoqIEJlYXJpbmcgd2hlbiBjdXJyZW50IHBlcnNwZWN0aXZlIHJvdGF0ZSBvcGVyYXRpb24gc3RhcnRlZCAqL1xuICAgIHN0YXJ0QmVhcmluZyxcbiAgICAvKiogUGl0Y2ggd2hlbiBjdXJyZW50IHBlcnNwZWN0aXZlIHJvdGF0ZSBvcGVyYXRpb24gc3RhcnRlZCAqL1xuICAgIHN0YXJ0UGl0Y2gsXG4gICAgLyoqIFpvb20gd2hlbiBjdXJyZW50IHpvb20gb3BlcmF0aW9uIHN0YXJ0ZWQgKi9cbiAgICBzdGFydFpvb21cbiAgfSA9IHt9KSB7XG4gICAgYXNzZXJ0KE51bWJlci5pc0Zpbml0ZSh3aWR0aCksICdgd2lkdGhgIG11c3QgYmUgc3VwcGxpZWQnKTtcbiAgICBhc3NlcnQoTnVtYmVyLmlzRmluaXRlKGhlaWdodCksICdgaGVpZ2h0YCBtdXN0IGJlIHN1cHBsaWVkJyk7XG4gICAgYXNzZXJ0KE51bWJlci5pc0Zpbml0ZShsb25naXR1ZGUpLCAnYGxvbmdpdHVkZWAgbXVzdCBiZSBzdXBwbGllZCcpO1xuICAgIGFzc2VydChOdW1iZXIuaXNGaW5pdGUobGF0aXR1ZGUpLCAnYGxhdGl0dWRlYCBtdXN0IGJlIHN1cHBsaWVkJyk7XG4gICAgYXNzZXJ0KE51bWJlci5pc0Zpbml0ZSh6b29tKSwgJ2B6b29tYCBtdXN0IGJlIHN1cHBsaWVkJyk7XG5cbiAgICB0aGlzLl92aWV3cG9ydFByb3BzID0gdGhpcy5fYXBwbHlDb25zdHJhaW50cyh7XG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIGxhdGl0dWRlLFxuICAgICAgbG9uZ2l0dWRlLFxuICAgICAgem9vbSxcbiAgICAgIGJlYXJpbmc6IGVuc3VyZUZpbml0ZShiZWFyaW5nLCBkZWZhdWx0U3RhdGUuYmVhcmluZyksXG4gICAgICBwaXRjaDogZW5zdXJlRmluaXRlKHBpdGNoLCBkZWZhdWx0U3RhdGUucGl0Y2gpLFxuICAgICAgYWx0aXR1ZGU6IGVuc3VyZUZpbml0ZShhbHRpdHVkZSwgZGVmYXVsdFN0YXRlLmFsdGl0dWRlKSxcbiAgICAgIG1heFpvb206IGVuc3VyZUZpbml0ZShtYXhab29tLCBNQVBCT1hfTElNSVRTLm1heFpvb20pLFxuICAgICAgbWluWm9vbTogZW5zdXJlRmluaXRlKG1pblpvb20sIE1BUEJPWF9MSU1JVFMubWluWm9vbSksXG4gICAgICBtYXhQaXRjaDogZW5zdXJlRmluaXRlKG1heFBpdGNoLCBNQVBCT1hfTElNSVRTLm1heFBpdGNoKSxcbiAgICAgIG1pblBpdGNoOiBlbnN1cmVGaW5pdGUobWluUGl0Y2gsIE1BUEJPWF9MSU1JVFMubWluUGl0Y2gpLFxuICAgICAgbWF4TGF0aXR1ZGU6IGVuc3VyZUZpbml0ZShtYXhMYXRpdHVkZSwgTUFQQk9YX0xJTUlUUy5tYXhMYXRpdHVkZSksXG4gICAgICBtaW5MYXRpdHVkZTogZW5zdXJlRmluaXRlKG1pbkxhdGl0dWRlLCBNQVBCT1hfTElNSVRTLm1pbkxhdGl0dWRlKVxuICAgIH0pO1xuXG4gICAgdGhpcy5faW50ZXJhY3RpdmVTdGF0ZSA9IHtcbiAgICAgIHN0YXJ0UGFuTG5nTGF0LFxuICAgICAgc3RhcnRab29tTG5nTGF0LFxuICAgICAgc3RhcnRCZWFyaW5nLFxuICAgICAgc3RhcnRQaXRjaCxcbiAgICAgIHN0YXJ0Wm9vbVxuICAgIH07XG4gIH1cblxuICAvKiBQdWJsaWMgQVBJICovXG5cbiAgZ2V0Vmlld3BvcnRQcm9wcygpIHtcbiAgICByZXR1cm4gdGhpcy5fdmlld3BvcnRQcm9wcztcbiAgfVxuXG4gIGdldEludGVyYWN0aXZlU3RhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ludGVyYWN0aXZlU3RhdGU7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgcGFubmluZ1xuICAgKiBAcGFyYW0ge1tOdW1iZXIsIE51bWJlcl19IHBvcyAtIHBvc2l0aW9uIG9uIHNjcmVlbiB3aGVyZSB0aGUgcG9pbnRlciBncmFic1xuICAgKi9cbiAgcGFuU3RhcnQoe3Bvc30pIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZE1hcFN0YXRlKHtcbiAgICAgIHN0YXJ0UGFuTG5nTGF0OiB0aGlzLl91bnByb2plY3QocG9zKVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhblxuICAgKiBAcGFyYW0ge1tOdW1iZXIsIE51bWJlcl19IHBvcyAtIHBvc2l0aW9uIG9uIHNjcmVlbiB3aGVyZSB0aGUgcG9pbnRlciBpc1xuICAgKiBAcGFyYW0ge1tOdW1iZXIsIE51bWJlcl0sIG9wdGlvbmFsfSBzdGFydFBvcyAtIHdoZXJlIHRoZSBwb2ludGVyIGdyYWJiZWQgYXRcbiAgICogICB0aGUgc3RhcnQgb2YgdGhlIG9wZXJhdGlvbi4gTXVzdCBiZSBzdXBwbGllZCBvZiBgcGFuU3RhcnQoKWAgd2FzIG5vdCBjYWxsZWRcbiAgICovXG4gIHBhbih7cG9zLCBzdGFydFBvc30pIHtcbiAgICBjb25zdCBzdGFydFBhbkxuZ0xhdCA9IHRoaXMuX2ludGVyYWN0aXZlU3RhdGUuc3RhcnRQYW5MbmdMYXQgfHwgdGhpcy5fdW5wcm9qZWN0KHN0YXJ0UG9zKTtcblxuICAgIGlmICghc3RhcnRQYW5MbmdMYXQpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbnN0IFtsb25naXR1ZGUsIGxhdGl0dWRlXSA9IHRoaXMuX2NhbGN1bGF0ZU5ld0xuZ0xhdCh7c3RhcnRQYW5MbmdMYXQsIHBvc30pO1xuXG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRNYXBTdGF0ZSh7XG4gICAgICBsb25naXR1ZGUsXG4gICAgICBsYXRpdHVkZVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuZCBwYW5uaW5nXG4gICAqIE11c3QgY2FsbCBpZiBgcGFuU3RhcnQoKWAgd2FzIGNhbGxlZFxuICAgKi9cbiAgcGFuRW5kKCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkTWFwU3RhdGUoe1xuICAgICAgc3RhcnRQYW5MbmdMYXQ6IG51bGxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCByb3RhdGluZ1xuICAgKiBAcGFyYW0ge1tOdW1iZXIsIE51bWJlcl19IHBvcyAtIHBvc2l0aW9uIG9uIHNjcmVlbiB3aGVyZSB0aGUgY2VudGVyIGlzXG4gICAqL1xuICByb3RhdGVTdGFydCh7cG9zfSkge1xuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkTWFwU3RhdGUoe1xuICAgICAgc3RhcnRCZWFyaW5nOiB0aGlzLl92aWV3cG9ydFByb3BzLmJlYXJpbmcsXG4gICAgICBzdGFydFBpdGNoOiB0aGlzLl92aWV3cG9ydFByb3BzLnBpdGNoXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUm90YXRlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBkZWx0YVNjYWxlWCAtIGEgbnVtYmVyIGJldHdlZW4gWy0xLCAxXSBzcGVjaWZ5aW5nIHRoZVxuICAgKiAgIGNoYW5nZSB0byBiZWFyaW5nLlxuICAgKiBAcGFyYW0ge051bWJlcn0gZGVsdGFTY2FsZVkgLSBhIG51bWJlciBiZXR3ZWVuIFstMSwgMV0gc3BlY2lmeWluZyB0aGVcbiAgICogICBjaGFuZ2UgdG8gcGl0Y2guIC0xIHNldHMgdG8gbWluUGl0Y2ggYW5kIDEgc2V0cyB0byBtYXhQaXRjaC5cbiAgICovXG4gIHJvdGF0ZSh7ZGVsdGFTY2FsZVggPSAwLCBkZWx0YVNjYWxlWSA9IDB9KSB7XG5cbiAgICBjb25zdCB7c3RhcnRCZWFyaW5nLCBzdGFydFBpdGNofSA9IHRoaXMuX2ludGVyYWN0aXZlU3RhdGU7XG5cbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShzdGFydEJlYXJpbmcpIHx8ICFOdW1iZXIuaXNGaW5pdGUoc3RhcnRQaXRjaCkpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbnN0IHtwaXRjaCwgYmVhcmluZ30gPSB0aGlzLl9jYWxjdWxhdGVOZXdQaXRjaEFuZEJlYXJpbmcoe1xuICAgICAgZGVsdGFTY2FsZVgsXG4gICAgICBkZWx0YVNjYWxlWSxcbiAgICAgIHN0YXJ0QmVhcmluZyxcbiAgICAgIHN0YXJ0UGl0Y2hcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkTWFwU3RhdGUoe1xuICAgICAgYmVhcmluZyxcbiAgICAgIHBpdGNoXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRW5kIHJvdGF0aW5nXG4gICAqIE11c3QgY2FsbCBpZiBgcm90YXRlU3RhcnQoKWAgd2FzIGNhbGxlZFxuICAgKi9cbiAgcm90YXRlRW5kKCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkTWFwU3RhdGUoe1xuICAgICAgc3RhcnRCZWFyaW5nOiBudWxsLFxuICAgICAgc3RhcnRQaXRjaDogbnVsbFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHpvb21pbmdcbiAgICogQHBhcmFtIHtbTnVtYmVyLCBOdW1iZXJdfSBwb3MgLSBwb3NpdGlvbiBvbiBzY3JlZW4gd2hlcmUgdGhlIGNlbnRlciBpc1xuICAgKi9cbiAgem9vbVN0YXJ0KHtwb3N9KSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRNYXBTdGF0ZSh7XG4gICAgICBzdGFydFpvb21MbmdMYXQ6IHRoaXMuX3VucHJvamVjdChwb3MpLFxuICAgICAgc3RhcnRab29tOiB0aGlzLl92aWV3cG9ydFByb3BzLnpvb21cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBab29tXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gcG9zIC0gcG9zaXRpb24gb24gc2NyZWVuIHdoZXJlIHRoZSBjdXJyZW50IGNlbnRlciBpc1xuICAgKiBAcGFyYW0ge1tOdW1iZXIsIE51bWJlcl19IHN0YXJ0UG9zIC0gdGhlIGNlbnRlciBwb3NpdGlvbiBhdFxuICAgKiAgIHRoZSBzdGFydCBvZiB0aGUgb3BlcmF0aW9uLiBNdXN0IGJlIHN1cHBsaWVkIG9mIGB6b29tU3RhcnQoKWAgd2FzIG5vdCBjYWxsZWRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIC0gYSBudW1iZXIgYmV0d2VlbiBbMCwgMV0gc3BlY2lmeWluZyB0aGUgYWNjdW11bGF0ZWRcbiAgICogICByZWxhdGl2ZSBzY2FsZS5cbiAgICovXG4gIHpvb20oe3Bvcywgc3RhcnRQb3MsIHNjYWxlfSkge1xuICAgIGFzc2VydChzY2FsZSA+IDAsICdgc2NhbGVgIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcblxuICAgIC8vIE1ha2Ugc3VyZSB3ZSB6b29tIGFyb3VuZCB0aGUgY3VycmVudCBtb3VzZSBwb3NpdGlvbiByYXRoZXIgdGhhbiBtYXAgY2VudGVyXG4gICAgbGV0IHtzdGFydFpvb20sIHN0YXJ0Wm9vbUxuZ0xhdH0gPSB0aGlzLl9pbnRlcmFjdGl2ZVN0YXRlO1xuXG4gICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUoc3RhcnRab29tKSkge1xuICAgICAgLy8gV2UgaGF2ZSB0d28gbW9kZXMgb2Ygem9vbTpcbiAgICAgIC8vIHNjcm9sbCB6b29tIHRoYXQgYXJlIGRpc2NyZXRlIGV2ZW50cyAodHJhbnNmb3JtIGZyb20gdGhlIGN1cnJlbnQgem9vbSBsZXZlbCksXG4gICAgICAvLyBhbmQgcGluY2ggem9vbSB0aGF0IGFyZSBjb250aW51b3VzIGV2ZW50cyAodHJhbnNmb3JtIGZyb20gdGhlIHpvb20gbGV2ZWwgd2hlblxuICAgICAgLy8gcGluY2ggc3RhcnRlZCkuXG4gICAgICAvLyBJZiBzdGFydFpvb20gc3RhdGUgaXMgZGVmaW5lZCwgdGhlbiB1c2UgdGhlIHN0YXJ0Wm9vbSBzdGF0ZTtcbiAgICAgIC8vIG90aGVyd2lzZSBhc3N1bWUgZGlzY3JldGUgem9vbWluZ1xuICAgICAgc3RhcnRab29tID0gdGhpcy5fdmlld3BvcnRQcm9wcy56b29tO1xuICAgICAgc3RhcnRab29tTG5nTGF0ID0gdGhpcy5fdW5wcm9qZWN0KHN0YXJ0UG9zKSB8fCB0aGlzLl91bnByb2plY3QocG9zKTtcbiAgICB9XG5cbiAgICAvLyB0YWtlIHRoZSBzdGFydCBsbmdsYXQgYW5kIHB1dCBpdCB3aGVyZSB0aGUgbW91c2UgaXMgZG93bi5cbiAgICBhc3NlcnQoc3RhcnRab29tTG5nTGF0LCAnYHN0YXJ0Wm9vbUxuZ0xhdGAgcHJvcCBpcyByZXF1aXJlZCAnICtcbiAgICAgICdmb3Igem9vbSBiZWhhdmlvciB0byBjYWxjdWxhdGUgd2hlcmUgdG8gcG9zaXRpb24gdGhlIG1hcC4nKTtcblxuICAgIGNvbnN0IHpvb20gPSB0aGlzLl9jYWxjdWxhdGVOZXdab29tKHtzY2FsZSwgc3RhcnRab29tfSk7XG5cbiAgICBjb25zdCB6b29tZWRWaWV3cG9ydCA9IG5ldyBXZWJNZXJjYXRvclZpZXdwb3J0KFxuICAgICAgT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5fdmlld3BvcnRQcm9wcywge3pvb219KVxuICAgICk7XG4gICAgY29uc3QgW2xvbmdpdHVkZSwgbGF0aXR1ZGVdID0gem9vbWVkVmlld3BvcnQuZ2V0TG9jYXRpb25BdFBvaW50KHtsbmdMYXQ6IHN0YXJ0Wm9vbUxuZ0xhdCwgcG9zfSk7XG5cbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZE1hcFN0YXRlKHtcbiAgICAgIHpvb20sXG4gICAgICBsb25naXR1ZGUsXG4gICAgICBsYXRpdHVkZVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuZCB6b29taW5nXG4gICAqIE11c3QgY2FsbCBpZiBgem9vbVN0YXJ0KClgIHdhcyBjYWxsZWRcbiAgICovXG4gIHpvb21FbmQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRNYXBTdGF0ZSh7XG4gICAgICBzdGFydFpvb21MbmdMYXQ6IG51bGwsXG4gICAgICBzdGFydFpvb206IG51bGxcbiAgICB9KTtcbiAgfVxuXG4gIC8qIFByaXZhdGUgbWV0aG9kcyAqL1xuXG4gIF9nZXRVcGRhdGVkTWFwU3RhdGUobmV3UHJvcHMpIHtcbiAgICAvLyBVcGRhdGUgX3ZpZXdwb3J0UHJvcHNcbiAgICByZXR1cm4gbmV3IE1hcFN0YXRlKE9iamVjdC5hc3NpZ24oe30sIHRoaXMuX3ZpZXdwb3J0UHJvcHMsIHRoaXMuX2ludGVyYWN0aXZlU3RhdGUsIG5ld1Byb3BzKSk7XG4gIH1cblxuICAvLyBBcHBseSBhbnkgY29uc3RyYWludHMgKG1hdGhlbWF0aWNhbCBvciBkZWZpbmVkIGJ5IF92aWV3cG9ydFByb3BzKSB0byBtYXAgc3RhdGVcbiAgLyogZXNsaW50LWRpc2FibGUgY29tcGxleGl0eSAqL1xuICBfYXBwbHlDb25zdHJhaW50cyhwcm9wcykge1xuICAgIC8vIE5vcm1hbGl6ZSBkZWdyZWVzXG4gICAgY29uc3Qge2xvbmdpdHVkZSwgYmVhcmluZ30gPSBwcm9wcztcbiAgICBpZiAobG9uZ2l0dWRlIDwgLTE4MCB8fCBsb25naXR1ZGUgPiAxODApIHtcbiAgICAgIHByb3BzLmxvbmdpdHVkZSA9IG1vZChsb25naXR1ZGUgKyAxODAsIDM2MCkgLSAxODA7XG4gICAgfVxuICAgIGlmIChiZWFyaW5nIDwgLTE4MCB8fCBiZWFyaW5nID4gMTgwKSB7XG4gICAgICBwcm9wcy5iZWFyaW5nID0gbW9kKGJlYXJpbmcgKyAxODAsIDM2MCkgLSAxODA7XG4gICAgfVxuXG4gICAgLy8gRW5zdXJlIHpvb20gaXMgd2l0aGluIHNwZWNpZmllZCByYW5nZVxuICAgIGNvbnN0IHttYXhab29tLCBtaW5ab29tLCB6b29tfSA9IHByb3BzO1xuICAgIHByb3BzLnpvb20gPSB6b29tID4gbWF4Wm9vbSA/IG1heFpvb20gOiB6b29tO1xuICAgIHByb3BzLnpvb20gPSB6b29tIDwgbWluWm9vbSA/IG1pblpvb20gOiB6b29tO1xuXG4gICAgLy8gRW5zdXJlIHBpdGNoIGlzIHdpdGhpbiBzcGVjaWZpZWQgcmFuZ2VcbiAgICBjb25zdCB7bWF4UGl0Y2gsIG1pblBpdGNoLCBwaXRjaH0gPSBwcm9wcztcblxuICAgIHByb3BzLnBpdGNoID0gcGl0Y2ggPiBtYXhQaXRjaCA/IG1heFBpdGNoIDogcGl0Y2g7XG4gICAgcHJvcHMucGl0Y2ggPSBwaXRjaCA8IG1pblBpdGNoID8gbWluUGl0Y2ggOiBwaXRjaDtcblxuICAgIC8vIENvbnN0cmFpbiB6b29tIGFuZCBzaGlmdCBjZW50ZXIgYXQgbG93IHpvb20gbGV2ZWxzXG4gICAgY29uc3Qge2hlaWdodH0gPSBwcm9wcztcbiAgICBsZXQge2xhdGl0dWRlUmFuZ2U6IFt0b3BZLCBib3R0b21ZXSwgdmlld3BvcnR9ID0gdGhpcy5fZ2V0TGF0aXR1ZGVSYW5nZShwcm9wcyk7XG4gICAgbGV0IHNoaWZ0WSA9IDA7XG5cbiAgICBpZiAoYm90dG9tWSAtIHRvcFkgPCBoZWlnaHQpIHtcbiAgICAgIC8vIE1hcCBoZWlnaHQgbXVzdCBub3QgYmUgc21hbGxlciB0aGFuIHZpZXdwb3J0IGhlaWdodFxuICAgICAgcHJvcHMuem9vbSArPSBNYXRoLmxvZzIoaGVpZ2h0IC8gKGJvdHRvbVkgLSB0b3BZKSk7XG4gICAgICBjb25zdCBuZXdSYW5nZSA9IHRoaXMuX2dldExhdGl0dWRlUmFuZ2UocHJvcHMpO1xuICAgICAgW3RvcFksIGJvdHRvbVldID0gbmV3UmFuZ2UubGF0aXR1ZGVSYW5nZTtcbiAgICAgIHZpZXdwb3J0ID0gbmV3UmFuZ2Uudmlld3BvcnQ7XG4gICAgfVxuICAgIGlmICh0b3BZID4gMCkge1xuICAgICAgLy8gQ29tcGVuc2F0ZSBmb3Igd2hpdGUgZ2FwIG9uIHRvcFxuICAgICAgc2hpZnRZID0gdG9wWTtcbiAgICB9IGVsc2UgaWYgKGJvdHRvbVkgPCBoZWlnaHQpIHtcbiAgICAgIC8vIENvbXBlbnNhdGUgZm9yIHdoaXRlIGdhcCBvbiBib3R0b21cbiAgICAgIHNoaWZ0WSA9IGJvdHRvbVkgLSBoZWlnaHQ7XG4gICAgfVxuICAgIGlmIChzaGlmdFkpIHtcbiAgICAgIHByb3BzLmxhdGl0dWRlID0gdmlld3BvcnQudW5wcm9qZWN0KFtwcm9wcy53aWR0aCAvIDIsIGhlaWdodCAvIDIgKyBzaGlmdFldKVsxXTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvcHM7XG4gIH1cbiAgLyogZXNsaW50LWVuYWJsZSBjb21wbGV4aXR5ICovXG5cbiAgLy8gUmV0dXJucyB7dmlld3BvcnQsIGxhdGl0dWRlUmFuZ2U6IFt0b3BZLCBib3R0b21ZXX0gaW4gbm9uLXBlcnNwZWN0aXZlIG1vZGVcbiAgX2dldExhdGl0dWRlUmFuZ2UocHJvcHMpIHtcbiAgICBjb25zdCBmbGF0Vmlld3BvcnQgPSBuZXcgV2ViTWVyY2F0b3JWaWV3cG9ydChPYmplY3QuYXNzaWduKHt9LCBwcm9wcywge1xuICAgICAgcGl0Y2g6IDAsXG4gICAgICBiZWFyaW5nOiAwXG4gICAgfSkpO1xuICAgIHJldHVybiB7XG4gICAgICB2aWV3cG9ydDogZmxhdFZpZXdwb3J0LFxuICAgICAgbGF0aXR1ZGVSYW5nZTogW1xuICAgICAgICBmbGF0Vmlld3BvcnQucHJvamVjdChbcHJvcHMubG9uZ2l0dWRlLCBwcm9wcy5tYXhMYXRpdHVkZV0pWzFdLFxuICAgICAgICBmbGF0Vmlld3BvcnQucHJvamVjdChbcHJvcHMubG9uZ2l0dWRlLCBwcm9wcy5taW5MYXRpdHVkZV0pWzFdXG4gICAgICBdXG4gICAgfTtcbiAgfVxuXG4gIF91bnByb2plY3QocG9zKSB7XG4gICAgY29uc3Qgdmlld3BvcnQgPSBuZXcgV2ViTWVyY2F0b3JWaWV3cG9ydCh0aGlzLl92aWV3cG9ydFByb3BzKTtcbiAgICByZXR1cm4gcG9zICYmIHZpZXdwb3J0LnVucHJvamVjdChwb3MpO1xuICB9XG5cbiAgLy8gQ2FsY3VsYXRlIGEgbmV3IGxuZ2xhdCBiYXNlZCBvbiBwaXhlbCBkcmFnZ2luZyBwb3NpdGlvblxuICBfY2FsY3VsYXRlTmV3TG5nTGF0KHtzdGFydFBhbkxuZ0xhdCwgcG9zfSkge1xuICAgIGNvbnN0IHZpZXdwb3J0ID0gbmV3IFdlYk1lcmNhdG9yVmlld3BvcnQodGhpcy5fdmlld3BvcnRQcm9wcyk7XG4gICAgcmV0dXJuIHZpZXdwb3J0LmdldExvY2F0aW9uQXRQb2ludCh7bG5nTGF0OiBzdGFydFBhbkxuZ0xhdCwgcG9zfSk7XG4gIH1cblxuICAvLyBDYWxjdWxhdGVzIG5ldyB6b29tXG4gIF9jYWxjdWxhdGVOZXdab29tKHtzY2FsZSwgc3RhcnRab29tfSkge1xuICAgIGNvbnN0IHttYXhab29tLCBtaW5ab29tfSA9IHRoaXMuX3ZpZXdwb3J0UHJvcHM7XG4gICAgbGV0IHpvb20gPSBzdGFydFpvb20gKyBNYXRoLmxvZzIoc2NhbGUpO1xuICAgIHpvb20gPSB6b29tID4gbWF4Wm9vbSA/IG1heFpvb20gOiB6b29tO1xuICAgIHpvb20gPSB6b29tIDwgbWluWm9vbSA/IG1pblpvb20gOiB6b29tO1xuICAgIHJldHVybiB6b29tO1xuICB9XG5cbiAgLy8gQ2FsY3VsYXRlcyBhIG5ldyBwaXRjaCBhbmQgYmVhcmluZyBmcm9tIGEgcG9zaXRpb24gKGNvbWluZyBmcm9tIGFuIGV2ZW50KVxuICBfY2FsY3VsYXRlTmV3UGl0Y2hBbmRCZWFyaW5nKHtkZWx0YVNjYWxlWCwgZGVsdGFTY2FsZVksIHN0YXJ0QmVhcmluZywgc3RhcnRQaXRjaH0pIHtcbiAgICAvLyBjbGFtcCBkZWx0YVNjYWxlWSB0byBbLTEsIDFdIHNvIHRoYXQgcm90YXRpb24gaXMgY29uc3RyYWluZWQgYmV0d2VlbiBtaW5QaXRjaCBhbmQgbWF4UGl0Y2guXG4gICAgLy8gZGVsdGFTY2FsZVggZG9lcyBub3QgbmVlZCB0byBiZSBjbGFtcGVkIGFzIGJlYXJpbmcgZG9lcyBub3QgaGF2ZSBjb25zdHJhaW50cy5cbiAgICBkZWx0YVNjYWxlWSA9IGNsYW1wKGRlbHRhU2NhbGVZLCAtMSwgMSk7XG5cbiAgICBjb25zdCB7bWluUGl0Y2gsIG1heFBpdGNofSA9IHRoaXMuX3ZpZXdwb3J0UHJvcHM7XG5cbiAgICBjb25zdCBiZWFyaW5nID0gc3RhcnRCZWFyaW5nICsgMTgwICogZGVsdGFTY2FsZVg7XG4gICAgbGV0IHBpdGNoID0gc3RhcnRQaXRjaDtcbiAgICBpZiAoZGVsdGFTY2FsZVkgPiAwKSB7XG4gICAgICAvLyBHcmFkdWFsbHkgaW5jcmVhc2UgcGl0Y2hcbiAgICAgIHBpdGNoID0gc3RhcnRQaXRjaCArIGRlbHRhU2NhbGVZICogKG1heFBpdGNoIC0gc3RhcnRQaXRjaCk7XG4gICAgfSBlbHNlIGlmIChkZWx0YVNjYWxlWSA8IDApIHtcbiAgICAgIC8vIEdyYWR1YWxseSBkZWNyZWFzZSBwaXRjaFxuICAgICAgcGl0Y2ggPSBzdGFydFBpdGNoIC0gZGVsdGFTY2FsZVkgKiAobWluUGl0Y2ggLSBzdGFydFBpdGNoKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcGl0Y2gsXG4gICAgICBiZWFyaW5nXG4gICAgfTtcbiAgfVxuXG59XG4iXX0=