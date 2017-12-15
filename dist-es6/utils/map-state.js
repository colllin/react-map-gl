var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import WebMercatorViewport from 'viewport-mercator-project';
import assert from 'assert';

// MAPBOX LIMITS
export var MAPBOX_LIMITS = {
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
  return Number.isFinite(value) ? value : fallbackValue;
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

    _classCallCheck(this, MapState);

    assert(Number.isFinite(width), '`width` must be supplied');
    assert(Number.isFinite(height), '`height` must be supplied');
    assert(Number.isFinite(longitude), '`longitude` must be supplied');
    assert(Number.isFinite(latitude), '`latitude` must be supplied');
    assert(Number.isFinite(zoom), '`zoom` must be supplied');

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

  _createClass(MapState, [{
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
          _calculateNewLngLat3 = _slicedToArray(_calculateNewLngLat2, 2),
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


      if (!Number.isFinite(startBearing) || !Number.isFinite(startPitch)) {
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

      assert(scale > 0, '`scale` must be a positive number');

      // Make sure we zoom around the current mouse position rather than map center
      var _interactiveState2 = this._interactiveState,
          startZoom = _interactiveState2.startZoom,
          startZoomLngLat = _interactiveState2.startZoomLngLat;


      if (!Number.isFinite(startZoom)) {
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
      assert(startZoomLngLat, '`startZoomLngLat` prop is required ' + 'for zoom behavior to calculate where to position the map.');

      var zoom = this._calculateNewZoom({ scale: scale, startZoom: startZoom });

      var zoomedViewport = new WebMercatorViewport(Object.assign({}, this._viewportProps, { zoom: zoom }));

      var _zoomedViewport$getLo = zoomedViewport.getLocationAtPoint({ lngLat: startZoomLngLat, pos: pos }),
          _zoomedViewport$getLo2 = _slicedToArray(_zoomedViewport$getLo, 2),
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
      return new MapState(Object.assign({}, this._viewportProps, this._interactiveState, newProps));
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
          _getLatitudeRange2$la = _slicedToArray(_getLatitudeRange2.latitudeRange, 2),
          topY = _getLatitudeRange2$la[0],
          bottomY = _getLatitudeRange2$la[1],
          viewport = _getLatitudeRange2.viewport;

      var shiftY = 0;

      if (bottomY - topY < height) {
        // Map height must not be smaller than viewport height
        props.zoom += Math.log2(height / (bottomY - topY));
        var newRange = this._getLatitudeRange(props);

        var _newRange$latitudeRan = _slicedToArray(newRange.latitudeRange, 2);

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
      var flatViewport = new WebMercatorViewport(Object.assign({}, props, {
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
      var viewport = new WebMercatorViewport(this._viewportProps);
      return pos && viewport.unproject(pos);
    }

    // Calculate a new lnglat based on pixel dragging position

  }, {
    key: '_calculateNewLngLat',
    value: function _calculateNewLngLat(_ref8) {
      var startPanLngLat = _ref8.startPanLngLat,
          pos = _ref8.pos;

      var viewport = new WebMercatorViewport(this._viewportProps);
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

      var zoom = startZoom + Math.log2(scale);
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

export default MapState;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9tYXAtc3RhdGUuanMiXSwibmFtZXMiOlsiV2ViTWVyY2F0b3JWaWV3cG9ydCIsImFzc2VydCIsIk1BUEJPWF9MSU1JVFMiLCJtaW5ab29tIiwibWF4Wm9vbSIsIm1pblBpdGNoIiwibWF4UGl0Y2giLCJtYXhMYXRpdHVkZSIsIm1pbkxhdGl0dWRlIiwiZGVmYXVsdFN0YXRlIiwicGl0Y2giLCJiZWFyaW5nIiwiYWx0aXR1ZGUiLCJtb2QiLCJ2YWx1ZSIsImRpdmlzb3IiLCJtb2R1bHVzIiwiY2xhbXAiLCJtaW4iLCJtYXgiLCJlbnN1cmVGaW5pdGUiLCJmYWxsYmFja1ZhbHVlIiwiTnVtYmVyIiwiaXNGaW5pdGUiLCJNYXBTdGF0ZSIsIndpZHRoIiwiaGVpZ2h0IiwibGF0aXR1ZGUiLCJsb25naXR1ZGUiLCJ6b29tIiwic3RhcnRQYW5MbmdMYXQiLCJzdGFydFpvb21MbmdMYXQiLCJzdGFydEJlYXJpbmciLCJzdGFydFBpdGNoIiwic3RhcnRab29tIiwiX3ZpZXdwb3J0UHJvcHMiLCJfYXBwbHlDb25zdHJhaW50cyIsIl9pbnRlcmFjdGl2ZVN0YXRlIiwicG9zIiwiX2dldFVwZGF0ZWRNYXBTdGF0ZSIsIl91bnByb2plY3QiLCJzdGFydFBvcyIsIl9jYWxjdWxhdGVOZXdMbmdMYXQiLCJkZWx0YVNjYWxlWCIsImRlbHRhU2NhbGVZIiwiX2NhbGN1bGF0ZU5ld1BpdGNoQW5kQmVhcmluZyIsInNjYWxlIiwiX2NhbGN1bGF0ZU5ld1pvb20iLCJ6b29tZWRWaWV3cG9ydCIsIk9iamVjdCIsImFzc2lnbiIsImdldExvY2F0aW9uQXRQb2ludCIsImxuZ0xhdCIsIm5ld1Byb3BzIiwicHJvcHMiLCJfZ2V0TGF0aXR1ZGVSYW5nZSIsImxhdGl0dWRlUmFuZ2UiLCJ0b3BZIiwiYm90dG9tWSIsInZpZXdwb3J0Iiwic2hpZnRZIiwiTWF0aCIsImxvZzIiLCJuZXdSYW5nZSIsInVucHJvamVjdCIsImZsYXRWaWV3cG9ydCIsInByb2plY3Qi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Z0UsbUJBS2hFQSxRQUxnRTs7O0FBT2pGLFVBQU1LLFVBQVVxQixlQUFlLE1BQU1XLFdBQXJDO0FBQ0EsVUFBSWpDLFFBQVF1QixVQUFaO0FBQ0EsVUFBSVcsY0FBYyxDQUFsQixFQUFxQjtBQUNuQjtBQUNBbEMsZ0JBQVF1QixhQUFhVyxlQUFldEMsV0FBVzJCLFVBQTFCLENBQXJCO0FBQ0QsT0FIRCxNQUdPLElBQUlXLGNBQWMsQ0FBbEIsRUFBcUI7QUFDMUI7QUFDQWxDLGdCQUFRdUIsYUFBYVcsZUFBZXZDLFdBQVc0QixVQUExQixDQUFyQjtBQUNEOztBQUVELGFBQU87QUFDTHZCLG9CQURLO0FBRUxDO0FBRkssT0FBUDtBQUlEOzs7Ozs7ZUFyV2tCYSxRIiwiZmlsZSI6Im1hcC1zdGF0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBXZWJNZXJjYXRvclZpZXdwb3J0IGZyb20gJ3ZpZXdwb3J0LW1lcmNhdG9yLXByb2plY3QnO1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuXG4vLyBNQVBCT1ggTElNSVRTXG5leHBvcnQgY29uc3QgTUFQQk9YX0xJTUlUUyA9IHtcbiAgbWluWm9vbTogMCxcbiAgbWF4Wm9vbTogMjAsXG4gIG1pblBpdGNoOiAwLFxuICBtYXhQaXRjaDogNjAsXG4gIC8vIGRlZmluZWQgYnkgbWFwYm94LWdsXG4gIG1heExhdGl0dWRlOiA4NS4wNTExMyxcbiAgbWluTGF0aXR1ZGU6IC04NS4wNTExM1xufTtcblxuY29uc3QgZGVmYXVsdFN0YXRlID0ge1xuICBwaXRjaDogMCxcbiAgYmVhcmluZzogMCxcbiAgYWx0aXR1ZGU6IDEuNVxufTtcblxuLyogVXRpbHMgKi9cbmZ1bmN0aW9uIG1vZCh2YWx1ZSwgZGl2aXNvcikge1xuICBjb25zdCBtb2R1bHVzID0gdmFsdWUgJSBkaXZpc29yO1xuICByZXR1cm4gbW9kdWx1cyA8IDAgPyBkaXZpc29yICsgbW9kdWx1cyA6IG1vZHVsdXM7XG59XG5cbmZ1bmN0aW9uIGNsYW1wKHZhbHVlLCBtaW4sIG1heCkge1xuICByZXR1cm4gdmFsdWUgPCBtaW4gPyBtaW4gOiAodmFsdWUgPiBtYXggPyBtYXggOiB2YWx1ZSk7XG59XG5cbmZ1bmN0aW9uIGVuc3VyZUZpbml0ZSh2YWx1ZSwgZmFsbGJhY2tWYWx1ZSkge1xuICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKHZhbHVlKSA/IHZhbHVlIDogZmFsbGJhY2tWYWx1ZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFwU3RhdGUge1xuXG4gIGNvbnN0cnVjdG9yKHtcbiAgICAvKiogTWFwYm94IHZpZXdwb3J0IHByb3BlcnRpZXMgKi9cbiAgICAvKiogVGhlIHdpZHRoIG9mIHRoZSB2aWV3cG9ydCAqL1xuICAgIHdpZHRoLFxuICAgIC8qKiBUaGUgaGVpZ2h0IG9mIHRoZSB2aWV3cG9ydCAqL1xuICAgIGhlaWdodCxcbiAgICAvKiogVGhlIGxhdGl0dWRlIGF0IHRoZSBjZW50ZXIgb2YgdGhlIHZpZXdwb3J0ICovXG4gICAgbGF0aXR1ZGUsXG4gICAgLyoqIFRoZSBsb25naXR1ZGUgYXQgdGhlIGNlbnRlciBvZiB0aGUgdmlld3BvcnQgKi9cbiAgICBsb25naXR1ZGUsXG4gICAgLyoqIFRoZSB0aWxlIHpvb20gbGV2ZWwgb2YgdGhlIG1hcC4gKi9cbiAgICB6b29tLFxuICAgIC8qKiBUaGUgYmVhcmluZyBvZiB0aGUgdmlld3BvcnQgaW4gZGVncmVlcyAqL1xuICAgIGJlYXJpbmcsXG4gICAgLyoqIFRoZSBwaXRjaCBvZiB0aGUgdmlld3BvcnQgaW4gZGVncmVlcyAqL1xuICAgIHBpdGNoLFxuICAgIC8qKlxuICAgICogU3BlY2lmeSB0aGUgYWx0aXR1ZGUgb2YgdGhlIHZpZXdwb3J0IGNhbWVyYVxuICAgICogVW5pdDogbWFwIGhlaWdodHMsIGRlZmF1bHQgMS41XG4gICAgKiBOb24tcHVibGljIEFQSSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXBib3gvbWFwYm94LWdsLWpzL2lzc3Vlcy8xMTM3XG4gICAgKi9cbiAgICBhbHRpdHVkZSxcblxuICAgIC8qKiBWaWV3cG9ydCBjb25zdHJhaW50cyAqL1xuICAgIG1heFpvb20sXG4gICAgbWluWm9vbSxcbiAgICBtYXhQaXRjaCxcbiAgICBtaW5QaXRjaCxcbiAgICBtYXhMYXRpdHVkZSxcbiAgICBtaW5MYXRpdHVkZSxcblxuICAgIC8qKiBJbnRlcmFjdGlvbiBzdGF0ZXMsIHJlcXVpcmVkIHRvIGNhbGN1bGF0ZSBjaGFuZ2UgZHVyaW5nIHRyYW5zZm9ybSAqL1xuICAgIC8qIFRoZSBwb2ludCBvbiBtYXAgYmVpbmcgZ3JhYmJlZCB3aGVuIHRoZSBvcGVyYXRpb24gZmlyc3Qgc3RhcnRlZCAqL1xuICAgIHN0YXJ0UGFuTG5nTGF0LFxuICAgIC8qIENlbnRlciBvZiB0aGUgem9vbSB3aGVuIHRoZSBvcGVyYXRpb24gZmlyc3Qgc3RhcnRlZCAqL1xuICAgIHN0YXJ0Wm9vbUxuZ0xhdCxcbiAgICAvKiogQmVhcmluZyB3aGVuIGN1cnJlbnQgcGVyc3BlY3RpdmUgcm90YXRlIG9wZXJhdGlvbiBzdGFydGVkICovXG4gICAgc3RhcnRCZWFyaW5nLFxuICAgIC8qKiBQaXRjaCB3aGVuIGN1cnJlbnQgcGVyc3BlY3RpdmUgcm90YXRlIG9wZXJhdGlvbiBzdGFydGVkICovXG4gICAgc3RhcnRQaXRjaCxcbiAgICAvKiogWm9vbSB3aGVuIGN1cnJlbnQgem9vbSBvcGVyYXRpb24gc3RhcnRlZCAqL1xuICAgIHN0YXJ0Wm9vbVxuICB9ID0ge30pIHtcbiAgICBhc3NlcnQoTnVtYmVyLmlzRmluaXRlKHdpZHRoKSwgJ2B3aWR0aGAgbXVzdCBiZSBzdXBwbGllZCcpO1xuICAgIGFzc2VydChOdW1iZXIuaXNGaW5pdGUoaGVpZ2h0KSwgJ2BoZWlnaHRgIG11c3QgYmUgc3VwcGxpZWQnKTtcbiAgICBhc3NlcnQoTnVtYmVyLmlzRmluaXRlKGxvbmdpdHVkZSksICdgbG9uZ2l0dWRlYCBtdXN0IGJlIHN1cHBsaWVkJyk7XG4gICAgYXNzZXJ0KE51bWJlci5pc0Zpbml0ZShsYXRpdHVkZSksICdgbGF0aXR1ZGVgIG11c3QgYmUgc3VwcGxpZWQnKTtcbiAgICBhc3NlcnQoTnVtYmVyLmlzRmluaXRlKHpvb20pLCAnYHpvb21gIG11c3QgYmUgc3VwcGxpZWQnKTtcblxuICAgIHRoaXMuX3ZpZXdwb3J0UHJvcHMgPSB0aGlzLl9hcHBseUNvbnN0cmFpbnRzKHtcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgbGF0aXR1ZGUsXG4gICAgICBsb25naXR1ZGUsXG4gICAgICB6b29tLFxuICAgICAgYmVhcmluZzogZW5zdXJlRmluaXRlKGJlYXJpbmcsIGRlZmF1bHRTdGF0ZS5iZWFyaW5nKSxcbiAgICAgIHBpdGNoOiBlbnN1cmVGaW5pdGUocGl0Y2gsIGRlZmF1bHRTdGF0ZS5waXRjaCksXG4gICAgICBhbHRpdHVkZTogZW5zdXJlRmluaXRlKGFsdGl0dWRlLCBkZWZhdWx0U3RhdGUuYWx0aXR1ZGUpLFxuICAgICAgbWF4Wm9vbTogZW5zdXJlRmluaXRlKG1heFpvb20sIE1BUEJPWF9MSU1JVFMubWF4Wm9vbSksXG4gICAgICBtaW5ab29tOiBlbnN1cmVGaW5pdGUobWluWm9vbSwgTUFQQk9YX0xJTUlUUy5taW5ab29tKSxcbiAgICAgIG1heFBpdGNoOiBlbnN1cmVGaW5pdGUobWF4UGl0Y2gsIE1BUEJPWF9MSU1JVFMubWF4UGl0Y2gpLFxuICAgICAgbWluUGl0Y2g6IGVuc3VyZUZpbml0ZShtaW5QaXRjaCwgTUFQQk9YX0xJTUlUUy5taW5QaXRjaCksXG4gICAgICBtYXhMYXRpdHVkZTogZW5zdXJlRmluaXRlKG1heExhdGl0dWRlLCBNQVBCT1hfTElNSVRTLm1heExhdGl0dWRlKSxcbiAgICAgIG1pbkxhdGl0dWRlOiBlbnN1cmVGaW5pdGUobWluTGF0aXR1ZGUsIE1BUEJPWF9MSU1JVFMubWluTGF0aXR1ZGUpXG4gICAgfSk7XG5cbiAgICB0aGlzLl9pbnRlcmFjdGl2ZVN0YXRlID0ge1xuICAgICAgc3RhcnRQYW5MbmdMYXQsXG4gICAgICBzdGFydFpvb21MbmdMYXQsXG4gICAgICBzdGFydEJlYXJpbmcsXG4gICAgICBzdGFydFBpdGNoLFxuICAgICAgc3RhcnRab29tXG4gICAgfTtcbiAgfVxuXG4gIC8qIFB1YmxpYyBBUEkgKi9cblxuICBnZXRWaWV3cG9ydFByb3BzKCkge1xuICAgIHJldHVybiB0aGlzLl92aWV3cG9ydFByb3BzO1xuICB9XG5cbiAgZ2V0SW50ZXJhY3RpdmVTdGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5faW50ZXJhY3RpdmVTdGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBwYW5uaW5nXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gcG9zIC0gcG9zaXRpb24gb24gc2NyZWVuIHdoZXJlIHRoZSBwb2ludGVyIGdyYWJzXG4gICAqL1xuICBwYW5TdGFydCh7cG9zfSkge1xuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkTWFwU3RhdGUoe1xuICAgICAgc3RhcnRQYW5MbmdMYXQ6IHRoaXMuX3VucHJvamVjdChwb3MpXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUGFuXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gcG9zIC0gcG9zaXRpb24gb24gc2NyZWVuIHdoZXJlIHRoZSBwb2ludGVyIGlzXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXSwgb3B0aW9uYWx9IHN0YXJ0UG9zIC0gd2hlcmUgdGhlIHBvaW50ZXIgZ3JhYmJlZCBhdFxuICAgKiAgIHRoZSBzdGFydCBvZiB0aGUgb3BlcmF0aW9uLiBNdXN0IGJlIHN1cHBsaWVkIG9mIGBwYW5TdGFydCgpYCB3YXMgbm90IGNhbGxlZFxuICAgKi9cbiAgcGFuKHtwb3MsIHN0YXJ0UG9zfSkge1xuICAgIGNvbnN0IHN0YXJ0UGFuTG5nTGF0ID0gdGhpcy5faW50ZXJhY3RpdmVTdGF0ZS5zdGFydFBhbkxuZ0xhdCB8fCB0aGlzLl91bnByb2plY3Qoc3RhcnRQb3MpO1xuXG4gICAgaWYgKCFzdGFydFBhbkxuZ0xhdCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29uc3QgW2xvbmdpdHVkZSwgbGF0aXR1ZGVdID0gdGhpcy5fY2FsY3VsYXRlTmV3TG5nTGF0KHtzdGFydFBhbkxuZ0xhdCwgcG9zfSk7XG5cbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZE1hcFN0YXRlKHtcbiAgICAgIGxvbmdpdHVkZSxcbiAgICAgIGxhdGl0dWRlXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRW5kIHBhbm5pbmdcbiAgICogTXVzdCBjYWxsIGlmIGBwYW5TdGFydCgpYCB3YXMgY2FsbGVkXG4gICAqL1xuICBwYW5FbmQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRNYXBTdGF0ZSh7XG4gICAgICBzdGFydFBhbkxuZ0xhdDogbnVsbFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHJvdGF0aW5nXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gcG9zIC0gcG9zaXRpb24gb24gc2NyZWVuIHdoZXJlIHRoZSBjZW50ZXIgaXNcbiAgICovXG4gIHJvdGF0ZVN0YXJ0KHtwb3N9KSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRNYXBTdGF0ZSh7XG4gICAgICBzdGFydEJlYXJpbmc6IHRoaXMuX3ZpZXdwb3J0UHJvcHMuYmVhcmluZyxcbiAgICAgIHN0YXJ0UGl0Y2g6IHRoaXMuX3ZpZXdwb3J0UHJvcHMucGl0Y2hcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSb3RhdGVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGRlbHRhU2NhbGVYIC0gYSBudW1iZXIgYmV0d2VlbiBbLTEsIDFdIHNwZWNpZnlpbmcgdGhlXG4gICAqICAgY2hhbmdlIHRvIGJlYXJpbmcuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBkZWx0YVNjYWxlWSAtIGEgbnVtYmVyIGJldHdlZW4gWy0xLCAxXSBzcGVjaWZ5aW5nIHRoZVxuICAgKiAgIGNoYW5nZSB0byBwaXRjaC4gLTEgc2V0cyB0byBtaW5QaXRjaCBhbmQgMSBzZXRzIHRvIG1heFBpdGNoLlxuICAgKi9cbiAgcm90YXRlKHtkZWx0YVNjYWxlWCA9IDAsIGRlbHRhU2NhbGVZID0gMH0pIHtcblxuICAgIGNvbnN0IHtzdGFydEJlYXJpbmcsIHN0YXJ0UGl0Y2h9ID0gdGhpcy5faW50ZXJhY3RpdmVTdGF0ZTtcblxuICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHN0YXJ0QmVhcmluZykgfHwgIU51bWJlci5pc0Zpbml0ZShzdGFydFBpdGNoKSkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29uc3Qge3BpdGNoLCBiZWFyaW5nfSA9IHRoaXMuX2NhbGN1bGF0ZU5ld1BpdGNoQW5kQmVhcmluZyh7XG4gICAgICBkZWx0YVNjYWxlWCxcbiAgICAgIGRlbHRhU2NhbGVZLFxuICAgICAgc3RhcnRCZWFyaW5nLFxuICAgICAgc3RhcnRQaXRjaFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRNYXBTdGF0ZSh7XG4gICAgICBiZWFyaW5nLFxuICAgICAgcGl0Y2hcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbmQgcm90YXRpbmdcbiAgICogTXVzdCBjYWxsIGlmIGByb3RhdGVTdGFydCgpYCB3YXMgY2FsbGVkXG4gICAqL1xuICByb3RhdGVFbmQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRNYXBTdGF0ZSh7XG4gICAgICBzdGFydEJlYXJpbmc6IG51bGwsXG4gICAgICBzdGFydFBpdGNoOiBudWxsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgem9vbWluZ1xuICAgKiBAcGFyYW0ge1tOdW1iZXIsIE51bWJlcl19IHBvcyAtIHBvc2l0aW9uIG9uIHNjcmVlbiB3aGVyZSB0aGUgY2VudGVyIGlzXG4gICAqL1xuICB6b29tU3RhcnQoe3Bvc30pIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZE1hcFN0YXRlKHtcbiAgICAgIHN0YXJ0Wm9vbUxuZ0xhdDogdGhpcy5fdW5wcm9qZWN0KHBvcyksXG4gICAgICBzdGFydFpvb206IHRoaXMuX3ZpZXdwb3J0UHJvcHMuem9vbVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFpvb21cbiAgICogQHBhcmFtIHtbTnVtYmVyLCBOdW1iZXJdfSBwb3MgLSBwb3NpdGlvbiBvbiBzY3JlZW4gd2hlcmUgdGhlIGN1cnJlbnQgY2VudGVyIGlzXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gc3RhcnRQb3MgLSB0aGUgY2VudGVyIHBvc2l0aW9uIGF0XG4gICAqICAgdGhlIHN0YXJ0IG9mIHRoZSBvcGVyYXRpb24uIE11c3QgYmUgc3VwcGxpZWQgb2YgYHpvb21TdGFydCgpYCB3YXMgbm90IGNhbGxlZFxuICAgKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgLSBhIG51bWJlciBiZXR3ZWVuIFswLCAxXSBzcGVjaWZ5aW5nIHRoZSBhY2N1bXVsYXRlZFxuICAgKiAgIHJlbGF0aXZlIHNjYWxlLlxuICAgKi9cbiAgem9vbSh7cG9zLCBzdGFydFBvcywgc2NhbGV9KSB7XG4gICAgYXNzZXJ0KHNjYWxlID4gMCwgJ2BzY2FsZWAgbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuXG4gICAgLy8gTWFrZSBzdXJlIHdlIHpvb20gYXJvdW5kIHRoZSBjdXJyZW50IG1vdXNlIHBvc2l0aW9uIHJhdGhlciB0aGFuIG1hcCBjZW50ZXJcbiAgICBsZXQge3N0YXJ0Wm9vbSwgc3RhcnRab29tTG5nTGF0fSA9IHRoaXMuX2ludGVyYWN0aXZlU3RhdGU7XG5cbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShzdGFydFpvb20pKSB7XG4gICAgICAvLyBXZSBoYXZlIHR3byBtb2RlcyBvZiB6b29tOlxuICAgICAgLy8gc2Nyb2xsIHpvb20gdGhhdCBhcmUgZGlzY3JldGUgZXZlbnRzICh0cmFuc2Zvcm0gZnJvbSB0aGUgY3VycmVudCB6b29tIGxldmVsKSxcbiAgICAgIC8vIGFuZCBwaW5jaCB6b29tIHRoYXQgYXJlIGNvbnRpbnVvdXMgZXZlbnRzICh0cmFuc2Zvcm0gZnJvbSB0aGUgem9vbSBsZXZlbCB3aGVuXG4gICAgICAvLyBwaW5jaCBzdGFydGVkKS5cbiAgICAgIC8vIElmIHN0YXJ0Wm9vbSBzdGF0ZSBpcyBkZWZpbmVkLCB0aGVuIHVzZSB0aGUgc3RhcnRab29tIHN0YXRlO1xuICAgICAgLy8gb3RoZXJ3aXNlIGFzc3VtZSBkaXNjcmV0ZSB6b29taW5nXG4gICAgICBzdGFydFpvb20gPSB0aGlzLl92aWV3cG9ydFByb3BzLnpvb207XG4gICAgICBzdGFydFpvb21MbmdMYXQgPSB0aGlzLl91bnByb2plY3Qoc3RhcnRQb3MpIHx8IHRoaXMuX3VucHJvamVjdChwb3MpO1xuICAgIH1cblxuICAgIC8vIHRha2UgdGhlIHN0YXJ0IGxuZ2xhdCBhbmQgcHV0IGl0IHdoZXJlIHRoZSBtb3VzZSBpcyBkb3duLlxuICAgIGFzc2VydChzdGFydFpvb21MbmdMYXQsICdgc3RhcnRab29tTG5nTGF0YCBwcm9wIGlzIHJlcXVpcmVkICcgK1xuICAgICAgJ2ZvciB6b29tIGJlaGF2aW9yIHRvIGNhbGN1bGF0ZSB3aGVyZSB0byBwb3NpdGlvbiB0aGUgbWFwLicpO1xuXG4gICAgY29uc3Qgem9vbSA9IHRoaXMuX2NhbGN1bGF0ZU5ld1pvb20oe3NjYWxlLCBzdGFydFpvb219KTtcblxuICAgIGNvbnN0IHpvb21lZFZpZXdwb3J0ID0gbmV3IFdlYk1lcmNhdG9yVmlld3BvcnQoXG4gICAgICBPYmplY3QuYXNzaWduKHt9LCB0aGlzLl92aWV3cG9ydFByb3BzLCB7em9vbX0pXG4gICAgKTtcbiAgICBjb25zdCBbbG9uZ2l0dWRlLCBsYXRpdHVkZV0gPSB6b29tZWRWaWV3cG9ydC5nZXRMb2NhdGlvbkF0UG9pbnQoe2xuZ0xhdDogc3RhcnRab29tTG5nTGF0LCBwb3N9KTtcblxuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkTWFwU3RhdGUoe1xuICAgICAgem9vbSxcbiAgICAgIGxvbmdpdHVkZSxcbiAgICAgIGxhdGl0dWRlXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRW5kIHpvb21pbmdcbiAgICogTXVzdCBjYWxsIGlmIGB6b29tU3RhcnQoKWAgd2FzIGNhbGxlZFxuICAgKi9cbiAgem9vbUVuZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZE1hcFN0YXRlKHtcbiAgICAgIHN0YXJ0Wm9vbUxuZ0xhdDogbnVsbCxcbiAgICAgIHN0YXJ0Wm9vbTogbnVsbFxuICAgIH0pO1xuICB9XG5cbiAgLyogUHJpdmF0ZSBtZXRob2RzICovXG5cbiAgX2dldFVwZGF0ZWRNYXBTdGF0ZShuZXdQcm9wcykge1xuICAgIC8vIFVwZGF0ZSBfdmlld3BvcnRQcm9wc1xuICAgIHJldHVybiBuZXcgTWFwU3RhdGUoT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5fdmlld3BvcnRQcm9wcywgdGhpcy5faW50ZXJhY3RpdmVTdGF0ZSwgbmV3UHJvcHMpKTtcbiAgfVxuXG4gIC8vIEFwcGx5IGFueSBjb25zdHJhaW50cyAobWF0aGVtYXRpY2FsIG9yIGRlZmluZWQgYnkgX3ZpZXdwb3J0UHJvcHMpIHRvIG1hcCBzdGF0ZVxuICAvKiBlc2xpbnQtZGlzYWJsZSBjb21wbGV4aXR5ICovXG4gIF9hcHBseUNvbnN0cmFpbnRzKHByb3BzKSB7XG4gICAgLy8gTm9ybWFsaXplIGRlZ3JlZXNcbiAgICBjb25zdCB7bG9uZ2l0dWRlLCBiZWFyaW5nfSA9IHByb3BzO1xuICAgIGlmIChsb25naXR1ZGUgPCAtMTgwIHx8IGxvbmdpdHVkZSA+IDE4MCkge1xuICAgICAgcHJvcHMubG9uZ2l0dWRlID0gbW9kKGxvbmdpdHVkZSArIDE4MCwgMzYwKSAtIDE4MDtcbiAgICB9XG4gICAgaWYgKGJlYXJpbmcgPCAtMTgwIHx8IGJlYXJpbmcgPiAxODApIHtcbiAgICAgIHByb3BzLmJlYXJpbmcgPSBtb2QoYmVhcmluZyArIDE4MCwgMzYwKSAtIDE4MDtcbiAgICB9XG5cbiAgICAvLyBFbnN1cmUgem9vbSBpcyB3aXRoaW4gc3BlY2lmaWVkIHJhbmdlXG4gICAgY29uc3Qge21heFpvb20sIG1pblpvb20sIHpvb219ID0gcHJvcHM7XG4gICAgcHJvcHMuem9vbSA9IHpvb20gPiBtYXhab29tID8gbWF4Wm9vbSA6IHpvb207XG4gICAgcHJvcHMuem9vbSA9IHpvb20gPCBtaW5ab29tID8gbWluWm9vbSA6IHpvb207XG5cbiAgICAvLyBFbnN1cmUgcGl0Y2ggaXMgd2l0aGluIHNwZWNpZmllZCByYW5nZVxuICAgIGNvbnN0IHttYXhQaXRjaCwgbWluUGl0Y2gsIHBpdGNofSA9IHByb3BzO1xuXG4gICAgcHJvcHMucGl0Y2ggPSBwaXRjaCA+IG1heFBpdGNoID8gbWF4UGl0Y2ggOiBwaXRjaDtcbiAgICBwcm9wcy5waXRjaCA9IHBpdGNoIDwgbWluUGl0Y2ggPyBtaW5QaXRjaCA6IHBpdGNoO1xuXG4gICAgLy8gQ29uc3RyYWluIHpvb20gYW5kIHNoaWZ0IGNlbnRlciBhdCBsb3cgem9vbSBsZXZlbHNcbiAgICBjb25zdCB7aGVpZ2h0fSA9IHByb3BzO1xuICAgIGxldCB7bGF0aXR1ZGVSYW5nZTogW3RvcFksIGJvdHRvbVldLCB2aWV3cG9ydH0gPSB0aGlzLl9nZXRMYXRpdHVkZVJhbmdlKHByb3BzKTtcbiAgICBsZXQgc2hpZnRZID0gMDtcblxuICAgIGlmIChib3R0b21ZIC0gdG9wWSA8IGhlaWdodCkge1xuICAgICAgLy8gTWFwIGhlaWdodCBtdXN0IG5vdCBiZSBzbWFsbGVyIHRoYW4gdmlld3BvcnQgaGVpZ2h0XG4gICAgICBwcm9wcy56b29tICs9IE1hdGgubG9nMihoZWlnaHQgLyAoYm90dG9tWSAtIHRvcFkpKTtcbiAgICAgIGNvbnN0IG5ld1JhbmdlID0gdGhpcy5fZ2V0TGF0aXR1ZGVSYW5nZShwcm9wcyk7XG4gICAgICBbdG9wWSwgYm90dG9tWV0gPSBuZXdSYW5nZS5sYXRpdHVkZVJhbmdlO1xuICAgICAgdmlld3BvcnQgPSBuZXdSYW5nZS52aWV3cG9ydDtcbiAgICB9XG4gICAgaWYgKHRvcFkgPiAwKSB7XG4gICAgICAvLyBDb21wZW5zYXRlIGZvciB3aGl0ZSBnYXAgb24gdG9wXG4gICAgICBzaGlmdFkgPSB0b3BZO1xuICAgIH0gZWxzZSBpZiAoYm90dG9tWSA8IGhlaWdodCkge1xuICAgICAgLy8gQ29tcGVuc2F0ZSBmb3Igd2hpdGUgZ2FwIG9uIGJvdHRvbVxuICAgICAgc2hpZnRZID0gYm90dG9tWSAtIGhlaWdodDtcbiAgICB9XG4gICAgaWYgKHNoaWZ0WSkge1xuICAgICAgcHJvcHMubGF0aXR1ZGUgPSB2aWV3cG9ydC51bnByb2plY3QoW3Byb3BzLndpZHRoIC8gMiwgaGVpZ2h0IC8gMiArIHNoaWZ0WV0pWzFdO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9wcztcbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIGNvbXBsZXhpdHkgKi9cblxuICAvLyBSZXR1cm5zIHt2aWV3cG9ydCwgbGF0aXR1ZGVSYW5nZTogW3RvcFksIGJvdHRvbVldfSBpbiBub24tcGVyc3BlY3RpdmUgbW9kZVxuICBfZ2V0TGF0aXR1ZGVSYW5nZShwcm9wcykge1xuICAgIGNvbnN0IGZsYXRWaWV3cG9ydCA9IG5ldyBXZWJNZXJjYXRvclZpZXdwb3J0KE9iamVjdC5hc3NpZ24oe30sIHByb3BzLCB7XG4gICAgICBwaXRjaDogMCxcbiAgICAgIGJlYXJpbmc6IDBcbiAgICB9KSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZpZXdwb3J0OiBmbGF0Vmlld3BvcnQsXG4gICAgICBsYXRpdHVkZVJhbmdlOiBbXG4gICAgICAgIGZsYXRWaWV3cG9ydC5wcm9qZWN0KFtwcm9wcy5sb25naXR1ZGUsIHByb3BzLm1heExhdGl0dWRlXSlbMV0sXG4gICAgICAgIGZsYXRWaWV3cG9ydC5wcm9qZWN0KFtwcm9wcy5sb25naXR1ZGUsIHByb3BzLm1pbkxhdGl0dWRlXSlbMV1cbiAgICAgIF1cbiAgICB9O1xuICB9XG5cbiAgX3VucHJvamVjdChwb3MpIHtcbiAgICBjb25zdCB2aWV3cG9ydCA9IG5ldyBXZWJNZXJjYXRvclZpZXdwb3J0KHRoaXMuX3ZpZXdwb3J0UHJvcHMpO1xuICAgIHJldHVybiBwb3MgJiYgdmlld3BvcnQudW5wcm9qZWN0KHBvcyk7XG4gIH1cblxuICAvLyBDYWxjdWxhdGUgYSBuZXcgbG5nbGF0IGJhc2VkIG9uIHBpeGVsIGRyYWdnaW5nIHBvc2l0aW9uXG4gIF9jYWxjdWxhdGVOZXdMbmdMYXQoe3N0YXJ0UGFuTG5nTGF0LCBwb3N9KSB7XG4gICAgY29uc3Qgdmlld3BvcnQgPSBuZXcgV2ViTWVyY2F0b3JWaWV3cG9ydCh0aGlzLl92aWV3cG9ydFByb3BzKTtcbiAgICByZXR1cm4gdmlld3BvcnQuZ2V0TG9jYXRpb25BdFBvaW50KHtsbmdMYXQ6IHN0YXJ0UGFuTG5nTGF0LCBwb3N9KTtcbiAgfVxuXG4gIC8vIENhbGN1bGF0ZXMgbmV3IHpvb21cbiAgX2NhbGN1bGF0ZU5ld1pvb20oe3NjYWxlLCBzdGFydFpvb219KSB7XG4gICAgY29uc3Qge21heFpvb20sIG1pblpvb219ID0gdGhpcy5fdmlld3BvcnRQcm9wcztcbiAgICBsZXQgem9vbSA9IHN0YXJ0Wm9vbSArIE1hdGgubG9nMihzY2FsZSk7XG4gICAgem9vbSA9IHpvb20gPiBtYXhab29tID8gbWF4Wm9vbSA6IHpvb207XG4gICAgem9vbSA9IHpvb20gPCBtaW5ab29tID8gbWluWm9vbSA6IHpvb207XG4gICAgcmV0dXJuIHpvb207XG4gIH1cblxuICAvLyBDYWxjdWxhdGVzIGEgbmV3IHBpdGNoIGFuZCBiZWFyaW5nIGZyb20gYSBwb3NpdGlvbiAoY29taW5nIGZyb20gYW4gZXZlbnQpXG4gIF9jYWxjdWxhdGVOZXdQaXRjaEFuZEJlYXJpbmcoe2RlbHRhU2NhbGVYLCBkZWx0YVNjYWxlWSwgc3RhcnRCZWFyaW5nLCBzdGFydFBpdGNofSkge1xuICAgIC8vIGNsYW1wIGRlbHRhU2NhbGVZIHRvIFstMSwgMV0gc28gdGhhdCByb3RhdGlvbiBpcyBjb25zdHJhaW5lZCBiZXR3ZWVuIG1pblBpdGNoIGFuZCBtYXhQaXRjaC5cbiAgICAvLyBkZWx0YVNjYWxlWCBkb2VzIG5vdCBuZWVkIHRvIGJlIGNsYW1wZWQgYXMgYmVhcmluZyBkb2VzIG5vdCBoYXZlIGNvbnN0cmFpbnRzLlxuICAgIGRlbHRhU2NhbGVZID0gY2xhbXAoZGVsdGFTY2FsZVksIC0xLCAxKTtcblxuICAgIGNvbnN0IHttaW5QaXRjaCwgbWF4UGl0Y2h9ID0gdGhpcy5fdmlld3BvcnRQcm9wcztcblxuICAgIGNvbnN0IGJlYXJpbmcgPSBzdGFydEJlYXJpbmcgKyAxODAgKiBkZWx0YVNjYWxlWDtcbiAgICBsZXQgcGl0Y2ggPSBzdGFydFBpdGNoO1xuICAgIGlmIChkZWx0YVNjYWxlWSA+IDApIHtcbiAgICAgIC8vIEdyYWR1YWxseSBpbmNyZWFzZSBwaXRjaFxuICAgICAgcGl0Y2ggPSBzdGFydFBpdGNoICsgZGVsdGFTY2FsZVkgKiAobWF4UGl0Y2ggLSBzdGFydFBpdGNoKTtcbiAgICB9IGVsc2UgaWYgKGRlbHRhU2NhbGVZIDwgMCkge1xuICAgICAgLy8gR3JhZHVhbGx5IGRlY3JlYXNlIHBpdGNoXG4gICAgICBwaXRjaCA9IHN0YXJ0UGl0Y2ggLSBkZWx0YVNjYWxlWSAqIChtaW5QaXRjaCAtIHN0YXJ0UGl0Y2gpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBwaXRjaCxcbiAgICAgIGJlYXJpbmdcbiAgICB9O1xuICB9XG5cbn1cbiJdfQ==