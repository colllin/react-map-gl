var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

import MapState from './map-state';
import TransitionManager from './transition-manager';

var NO_TRANSITION_PROPS = {
  transitionDuration: 0
};
var LINEAR_TRANSITION_PROPS = Object.assign({}, TransitionManager.defaultProps, {
  transitionDuration: 300
});

// EVENT HANDLING PARAMETERS
var PITCH_MOUSE_THRESHOLD = 5;
var PITCH_ACCEL = 1.2;
var ZOOM_ACCEL = 0.01;

var EVENT_TYPES = {
  WHEEL: ['wheel'],
  PAN: ['panstart', 'panmove', 'panend'],
  PINCH: ['pinchstart', 'pinchmove', 'pinchend'],
  DOUBLE_TAP: ['doubletap'],
  KEYBOARD: ['keydown']
};

var MapControls = function () {
  /**
   * @classdesc
   * A class that handles events and updates mercator style viewport parameters
   */
  function MapControls() {
    _classCallCheck(this, MapControls);

    this._state = {
      isDragging: false
    };
    this.events = [];
    this.handleEvent = this.handleEvent.bind(this);
  }

  /**
   * Callback for events
   * @param {hammer.Event} event
   */


  _createClass(MapControls, [{
    key: 'handleEvent',
    value: function handleEvent(event) {
      this.mapState = this.getMapState();

      switch (event.type) {
        case 'panstart':
          return this._onPanStart(event);
        case 'panmove':
          return this._onPan(event);
        case 'panend':
          return this._onPanEnd(event);
        case 'pinchstart':
          return this._onPinchStart(event);
        case 'pinchmove':
          return this._onPinch(event);
        case 'pinchend':
          return this._onPinchEnd(event);
        case 'doubletap':
          return this._onDoubleTap(event);
        case 'wheel':
          return this._onWheel(event);
        case 'keydown':
          return this._onKeyDown(event);
        default:
          return false;
      }
    }

    /* Event utils */
    // Event object: http://hammerjs.github.io/api/#event-object

  }, {
    key: 'getCenter',
    value: function getCenter(event) {
      var _event$offsetCenter = event.offsetCenter,
          x = _event$offsetCenter.x,
          y = _event$offsetCenter.y;

      return [x, y];
    }
  }, {
    key: 'isFunctionKeyPressed',
    value: function isFunctionKeyPressed(event) {
      var srcEvent = event.srcEvent;

      return Boolean(srcEvent.metaKey || srcEvent.altKey || srcEvent.ctrlKey || srcEvent.shiftKey);
    }
  }, {
    key: 'setState',
    value: function setState(newState) {
      Object.assign(this._state, newState);
      if (this.onStateChange) {
        this.onStateChange(this._state);
      }
    }

    /* Callback util */
    // formats map state and invokes callback function

  }, {
    key: 'updateViewport',
    value: function updateViewport(newMapState) {
      var extraProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var extraState = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var oldViewport = this.mapState.getViewportProps();
      var newViewport = Object.assign({}, newMapState.getViewportProps(), extraProps);

      if (this.onViewportChange && Object.keys(newViewport).some(function (key) {
        return oldViewport[key] !== newViewport[key];
      })) {
        // Viewport has changed
        this.onViewportChange(newViewport);
      }

      this.setState(Object.assign({}, newMapState.getInteractiveState(), extraState));
    }
  }, {
    key: 'getMapState',
    value: function getMapState(overrides) {
      return new MapState(Object.assign({}, this.mapStateProps, this._state, overrides));
    }

    /**
     * Extract interactivity options
     */

  }, {
    key: 'setOptions',
    value: function setOptions(options) {
      var onChangeViewport = options.onChangeViewport,
          _options$touchZoomRot = options.touchZoomRotate,
          touchZoomRotate = _options$touchZoomRot === undefined ? true : _options$touchZoomRot,
          onViewportChange = options.onViewportChange,
          _options$onStateChang = options.onStateChange,
          onStateChange = _options$onStateChang === undefined ? this.onStateChange : _options$onStateChang,
          _options$eventManager = options.eventManager,
          eventManager = _options$eventManager === undefined ? this.eventManager : _options$eventManager,
          _options$scrollZoom = options.scrollZoom,
          scrollZoom = _options$scrollZoom === undefined ? true : _options$scrollZoom,
          _options$dragPan = options.dragPan,
          dragPan = _options$dragPan === undefined ? true : _options$dragPan,
          _options$dragRotate = options.dragRotate,
          dragRotate = _options$dragRotate === undefined ? true : _options$dragRotate,
          _options$doubleClickZ = options.doubleClickZoom,
          doubleClickZoom = _options$doubleClickZ === undefined ? true : _options$doubleClickZ,
          _options$touchZoom = options.touchZoom,
          touchZoom = _options$touchZoom === undefined ? true : _options$touchZoom,
          _options$touchRotate = options.touchRotate,
          touchRotate = _options$touchRotate === undefined ? false : _options$touchRotate,
          _options$keyboard = options.keyboard,
          keyboard = _options$keyboard === undefined ? true : _options$keyboard;

      // TODO(deprecate): remove this check when `onChangeViewport` gets deprecated

      this.onViewportChange = onViewportChange || onChangeViewport;
      this.onStateChange = onStateChange;
      this.mapStateProps = options;
      if (this.eventManager !== eventManager) {
        // EventManager has changed
        this.eventManager = eventManager;
        this._events = {};
        this.toggleEvents(this.events, true);
      }
      var isInteractive = Boolean(this.onViewportChange);

      // Register/unregister events
      this.toggleEvents(EVENT_TYPES.WHEEL, isInteractive && scrollZoom);
      this.toggleEvents(EVENT_TYPES.PAN, isInteractive && (dragPan || dragRotate));
      this.toggleEvents(EVENT_TYPES.PINCH, isInteractive && touchZoomRotate);
      this.toggleEvents(EVENT_TYPES.DOUBLE_TAP, isInteractive && doubleClickZoom);
      this.toggleEvents(EVENT_TYPES.KEYBOARD, isInteractive && keyboard);

      // Interaction toggles
      this.scrollZoom = scrollZoom;
      this.dragPan = dragPan;
      this.dragRotate = dragRotate;
      this.doubleClickZoom = doubleClickZoom;
      this.touchZoom = touchZoomRotate && touchZoom;
      this.touchRotate = touchZoomRotate && touchRotate;
      this.keyboard = keyboard;
    }
  }, {
    key: 'toggleEvents',
    value: function toggleEvents(eventNames, enabled) {
      var _this = this;

      if (this.eventManager) {
        eventNames.forEach(function (eventName) {
          if (_this._events[eventName] !== enabled) {
            _this._events[eventName] = enabled;
            if (enabled) {
              _this.eventManager.on(eventName, _this.handleEvent);
            } else {
              _this.eventManager.off(eventName, _this.handleEvent);
            }
          }
        });
      }
    }

    /* Event handlers */
    // Default handler for the `panstart` event.

  }, {
    key: '_onPanStart',
    value: function _onPanStart(event) {
      var pos = this.getCenter(event);
      var newMapState = this.mapState.panStart({ pos: pos }).rotateStart({ pos: pos });
      return this.updateViewport(newMapState, NO_TRANSITION_PROPS, { isDragging: true });
    }

    // Default handler for the `panmove` event.

  }, {
    key: '_onPan',
    value: function _onPan(event) {
      return this.isFunctionKeyPressed(event) || event.rightButton ? this._onPanRotate(event) : this._onPanMove(event);
    }

    // Default handler for the `panend` event.

  }, {
    key: '_onPanEnd',
    value: function _onPanEnd(event) {
      var newMapState = this.mapState.panEnd().rotateEnd();
      return this.updateViewport(newMapState, null, { isDragging: false });
    }

    // Default handler for panning to move.
    // Called by `_onPan` when panning without function key pressed.

  }, {
    key: '_onPanMove',
    value: function _onPanMove(event) {
      if (!this.dragPan) {
        return false;
      }
      var pos = this.getCenter(event);
      var newMapState = this.mapState.pan({ pos: pos });
      return this.updateViewport(newMapState, NO_TRANSITION_PROPS, { isDragging: true });
    }

    // Default handler for panning to rotate.
    // Called by `_onPan` when panning with function key pressed.

  }, {
    key: '_onPanRotate',
    value: function _onPanRotate(event) {
      if (!this.dragRotate) {
        return false;
      }

      var deltaX = event.deltaX,
          deltaY = event.deltaY;

      var _getCenter = this.getCenter(event),
          _getCenter2 = _slicedToArray(_getCenter, 2),
          centerY = _getCenter2[1];

      var startY = centerY - deltaY;

      var _mapState$getViewport = this.mapState.getViewportProps(),
          width = _mapState$getViewport.width,
          height = _mapState$getViewport.height;

      var deltaScaleX = deltaX / width;
      var deltaScaleY = 0;

      if (deltaY > 0) {
        if (Math.abs(height - startY) > PITCH_MOUSE_THRESHOLD) {
          // Move from 0 to -1 as we drag upwards
          deltaScaleY = deltaY / (startY - height) * PITCH_ACCEL;
        }
      } else if (deltaY < 0) {
        if (startY > PITCH_MOUSE_THRESHOLD) {
          // Move from 0 to 1 as we drag upwards
          deltaScaleY = 1 - centerY / startY;
        }
      }
      deltaScaleY = Math.min(1, Math.max(-1, deltaScaleY));

      var newMapState = this.mapState.rotate({ deltaScaleX: deltaScaleX, deltaScaleY: deltaScaleY });
      return this.updateViewport(newMapState, NO_TRANSITION_PROPS, { isDragging: true });
    }

    // Default handler for the `wheel` event.

  }, {
    key: '_onWheel',
    value: function _onWheel(event) {
      if (!this.scrollZoom) {
        return false;
      }

      var pos = this.getCenter(event);
      var delta = event.delta;

      // Map wheel delta to relative scale

      var scale = 2 / (1 + Math.exp(-Math.abs(delta * ZOOM_ACCEL)));
      if (delta < 0 && scale !== 0) {
        scale = 1 / scale;
      }

      var newMapState = this.mapState.zoom({ pos: pos, scale: scale });
      return this.updateViewport(newMapState, NO_TRANSITION_PROPS);
    }

    // Default handler for the `pinchstart` event.

  }, {
    key: '_onPinchStart',
    value: function _onPinchStart(event) {
      var pos = this.getCenter(event);
      var newMapState = this.mapState.zoomStart({ pos: pos }).rotateStart({ pos: pos });
      // hack - hammer's `rotation` field doesn't seem to produce the correct angle
      this._state.startPinchRotation = event.rotation;
      return this.updateViewport(newMapState, NO_TRANSITION_PROPS, { isDragging: true });
    }

    // Default handler for the `pinch` event.

  }, {
    key: '_onPinch',
    value: function _onPinch(event) {
      if (!this.touchZoom && !this.touchRotate) {
        return false;
      }

      var newMapState = this.mapState;
      if (this.touchZoom) {
        var scale = event.scale;

        var pos = this.getCenter(event);
        newMapState = newMapState.zoom({ pos: pos, scale: scale });
      }
      if (this.touchRotate) {
        var rotation = event.rotation;
        var startPinchRotation = this._state.startPinchRotation;

        newMapState = newMapState.rotate({ deltaScaleX: -(rotation - startPinchRotation) / 180 });
      }

      return this.updateViewport(newMapState, NO_TRANSITION_PROPS, { isDragging: true });
    }

    // Default handler for the `pinchend` event.

  }, {
    key: '_onPinchEnd',
    value: function _onPinchEnd(event) {
      var newMapState = this.mapState.zoomEnd().rotateEnd();
      this._state.startPinchRotation = 0;
      return this.updateViewport(newMapState, null, { isDragging: false });
    }

    // Default handler for the `doubletap` event.

  }, {
    key: '_onDoubleTap',
    value: function _onDoubleTap(event) {
      if (!this.doubleClickZoom) {
        return false;
      }
      var pos = this.getCenter(event);
      var isZoomOut = this.isFunctionKeyPressed(event);

      var newMapState = this.mapState.zoom({ pos: pos, scale: isZoomOut ? 0.5 : 2 });
      return this.updateViewport(newMapState, LINEAR_TRANSITION_PROPS);
    }

    /* eslint-disable complexity */
    // Default handler for the `keydown` event

  }, {
    key: '_onKeyDown',
    value: function _onKeyDown(event) {
      if (!this.keyboard) {
        return false;
      }
      var funcKey = this.isFunctionKeyPressed(event);
      var mapStateProps = this.mapStateProps;

      var newMapState = void 0;

      switch (event.srcEvent.keyCode) {
        case 189:
          // -
          if (funcKey) {
            newMapState = this.getMapState({ zoom: mapStateProps.zoom - 2 });
          } else {
            newMapState = this.getMapState({ zoom: mapStateProps.zoom - 1 });
          }
          break;
        case 187:
          // +
          if (funcKey) {
            newMapState = this.getMapState({ zoom: mapStateProps.zoom + 2 });
          } else {
            newMapState = this.getMapState({ zoom: mapStateProps.zoom + 1 });
          }
          break;
        case 37:
          // left
          if (funcKey) {
            newMapState = this.getMapState({ bearing: mapStateProps.bearing - 15 });
          } else {
            newMapState = this.mapState.pan({ pos: [100, 0], startPos: [0, 0] });
          }
          break;
        case 39:
          // right
          if (funcKey) {
            newMapState = this.getMapState({ bearing: mapStateProps.bearing + 15 });
          } else {
            newMapState = this.mapState.pan({ pos: [-100, 0], startPos: [0, 0] });
          }
          break;
        case 38:
          // up
          if (funcKey) {
            newMapState = this.getMapState({ pitch: mapStateProps.pitch + 10 });
          } else {
            newMapState = this.mapState.pan({ pos: [0, 100], startPos: [0, 0] });
          }
          break;
        case 40:
          // down
          if (funcKey) {
            newMapState = this.getMapState({ pitch: mapStateProps.pitch - 10 });
          } else {
            newMapState = this.mapState.pan({ pos: [0, -100], startPos: [0, 0] });
          }
          break;
        default:
          return false;
      }
      return this.updateViewport(newMapState, LINEAR_TRANSITION_PROPS);
    }
    /* eslint-enable complexity */

  }]);

  return MapControls;
}();

export default MapControls;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9tYXAtY29udHJvbHMuanMiXSwibmFtZXMiOlsiTWFwU3RhdGUiLCJUcmFuc2l0aW9uTWFuYWdlciIsIk5PX1RSQU5TSVRJT05fUFJPUFMiLCJ0cmFuc2l0aW9uRHVyYXRpb24iLCJMSU5FQVJfVFJBTlNJVElPTl9QUk9QUyIsIk9iamVjdCIsImFzc2lnbiIsImRlZmF1bHRQcm9wcyIsIlBJVENIX01PVVNFX1RIUkVTSE9MRCIsIlBJVENIX0FDQ0VMIiwiWk9PTV9BQ0NFTCIsIkVWRU5UX1RZUEVTIiwiV0hFRUwiLCJQQU4iLCJQSU5DSCIsIkRPVUJMRV9UQVAiLCJLRVlCT0FSRCIsIk1hcENvbnRyb2xzIiwiX3N0YXRlIiwiaXNEcmFnZ2luZyIsImV2ZW50cyIsImhhbmRsZUV2ZW50IiwiYmluZCIsImV2ZW50IiwibWFwU3RhdGUiLCJnZXRNYXBTdGF0ZSIsInR5cGUiLCJfb25QYW5TdGFydCIsIl9vblBhbiIsIl9vblBhbkVuZCIsIl9vblBpbmNoU3RhcnQiLCJfb25QaW5jaCIsIl9vblBpbmNoRW5kIiwiX29uRG91YmxlVGFwIiwiX29uV2hlZWwiLCJfb25LZXlEb3duIiwib2Zmc2V0Q2VudGVyIiwieCIsInkiLCJzcmNFdmVudCIsIkJvb2xlYW4iLCJtZXRhS2V5IiwiYWx0S2V5IiwiY3RybEtleSIsInNoaWZ0S2V5IiwibmV3U3RhdGUiLCJvblN0YXRlQ2hhbmdlIiwibmV3TWFwU3RhdGUiLCJleHRyYVByb3BzIiwiZXh0cmFTdGF0ZSIsIm9sZFZpZXdwb3J0IiwiZ2V0Vmlld3BvcnRQcm9wcyIsIm5ld1ZpZXdwb3J0Iiwib25WaWV3cG9ydENoYW5nZSIsImtleXMiLCJzb21lIiwia2V5Iiwic2V0U3RhdGUiLCJnZXRJbnRlcmFjdGl2ZVN0YXRlIiwib3ZlcnJpZGVzIiwibWFwU3RhdGVQcm9wcyIsIm9wdGlvbnMiLCJvbkNoYW5nZVZpZXdwb3J0IiwidG91Y2hab29tUm90YXRlIiwiZXZlbnRNYW5hZ2VyIiwic2Nyb2xsWm9vbSIsImRyYWdQYW4iLCJkcmFnUm90YXRlIiwiZG91YmxlQ2xpY2tab29tIiwidG91Y2hab29tIiwidG91Y2hSb3RhdGUiLCJrZXlib2FyZCIsIl9ldmVudHMiLCJ0b2dnbGVFdmVudHMiLCJpc0ludGVyYWN0aXZlIiwiZXZlbnROYW1lcyIsImVuYWJsZWQiLCJmb3JFYWNoIiwiZXZlbnROYW1lIiwib24iLCJvZmYiLCJwb3MiLCJnZXRDZW50ZXIiLCJwYW5TdGFydCIsInJvdGF0ZVN0YXJ0IiwidXBkYXRlVmlld3BvcnQiLCJpc0Z1bmN0aW9uS2V5UHJlc3NlZCIsInJpZ2h0QnV0dG9uIiwiX29uUGFuUm90YXRlIiwiX29uUGFuTW92ZSIsInBhbkVuZCIsInJvdGF0ZUVuZCIsInBhbiIsImRlbHRhWCIsImRlbHRhWSIsImNlbnRlclkiLCJzdGFydFkiLCJ3aWR0aCIsImhlaWdodCIsImRlbHRhU2NhbGVYIiwiZGVsdGFTY2FsZVkiLCJNYXRoIiwiYWJzIiwibWluIiwibWF4Iiwicm90YXRlIiwiZGVsdGEiLCJzY2FsZSIsImV4cCIsInpvb20iLCJ6b29tU3RhcnQiLCJzdGFydFBpbmNoUm90YXRpb24iLCJyb3RhdGlvbiIsInpvb21FbmQiLCJpc1pvb21PdXQiLCJmdW5jS2V5Iiwia2V5Q29kZSIsImJlYXJpbmciLCJzdGFydFBvcyIsInBpdGNoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFQLE1BQXFCLGFBQXJCO0FBQ0EsT0FBT0MsaUJBQVAsTUFBOEIsc0JBQTlCOztBQUVBLElBQU1DLHNCQUFzQjtBQUMxQkMsc0JBQW9CO0FBRE0sQ0FBNUI7QUFHQSxJQUFNQywwQkFBMEJDLE9BQU9DLE1BQVAsQ0FBYyxFQUFkLEVBQWtCTCxrQkFBa0JNLFlBQXBDLEVBQWtEO0FBQ2hGSixzQkFBb0I7QUFENEQsQ0FBbEQsQ0FBaEM7O0FB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QWMsS0FBS3ZCLFFBQUwsQ0FBY29FLEdBQWQsQ0FBa0IsRUFBQ1gsS0FBSyxDQUFDLENBQUMsR0FBRixFQUFPLENBQVAsQ0FBTixFQUFpQnFDLFVBQVUsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUEzQixFQUFsQixDQUFkO0FBQ0Q7QUFDRDtBQUNGLGFBQUssRUFBTDtBQUFTO0FBQ1AsY0FBSUgsT0FBSixFQUFhO0FBQ1hwRSwwQkFBYyxLQUFLdEIsV0FBTCxDQUFpQixFQUFDOEYsT0FBTzNELGNBQWMyRCxLQUFkLEdBQXNCLEVBQTlCLEVBQWpCLENBQWQ7QUFDRCxXQUZELE1BRU87QUFDTHhFLDBCQUFjLEtBQUt2QixRQUFMLENBQWNvRSxHQUFkLENBQWtCLEVBQUNYLEtBQUssQ0FBQyxDQUFELEVBQUksR0FBSixDQUFOLEVBQWdCcUMsVUFBVSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQTFCLEVBQWxCLENBQWQ7QUFDRDtBQUNEO0FBQ0YsYUFBSyxFQUFMO0FBQVM7QUFDUCxjQUFJSCxPQUFKLEVBQWE7QUFDWHBFLDBCQUFjLEtBQUt0QixXQUFMLENBQWlCLEVBQUM4RixPQUFPM0QsY0FBYzJELEtBQWQsR0FBc0IsRUFBOUIsRUFBakIsQ0FBZDtBQUNELFdBRkQsTUFFTztBQUNMeEUsMEJBQWMsS0FBS3ZCLFFBQUwsQ0FBY29FLEdBQWQsQ0FBa0IsRUFBQ1gsS0FBSyxDQUFDLENBQUQsRUFBSSxDQUFDLEdBQUwsQ0FBTixFQUFpQnFDLFVBQVUsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUEzQixFQUFsQixDQUFkO0FBQ0Q7QUFDRDtBQUNGO0FBQ0UsaUJBQU8sS0FBUDtBQTVDRjtBQThDQSxhQUFPLEtBQUtqQyxjQUFMLENBQW9CdEMsV0FBcEIsRUFBaUMzQyx1QkFBakMsQ0FBUDtBQUNEO0FBQ0Q7Ozs7Ozs7ZUFsVm1CYSxXIiwiZmlsZSI6Im1hcC1jb250cm9scy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBNYXBTdGF0ZSBmcm9tICcuL21hcC1zdGF0ZSc7XG5pbXBvcnQgVHJhbnNpdGlvbk1hbmFnZXIgZnJvbSAnLi90cmFuc2l0aW9uLW1hbmFnZXInO1xuXG5jb25zdCBOT19UUkFOU0lUSU9OX1BST1BTID0ge1xuICB0cmFuc2l0aW9uRHVyYXRpb246IDBcbn07XG5jb25zdCBMSU5FQVJfVFJBTlNJVElPTl9QUk9QUyA9IE9iamVjdC5hc3NpZ24oe30sIFRyYW5zaXRpb25NYW5hZ2VyLmRlZmF1bHRQcm9wcywge1xuICB0cmFuc2l0aW9uRHVyYXRpb246IDMwMFxufSk7XG5cbi8vIEVWRU5UIEhBTkRMSU5HIFBBUkFNRVRFUlNcbmNvbnN0IFBJVENIX01PVVNFX1RIUkVTSE9MRCA9IDU7XG5jb25zdCBQSVRDSF9BQ0NFTCA9IDEuMjtcbmNvbnN0IFpPT01fQUNDRUwgPSAwLjAxO1xuXG5jb25zdCBFVkVOVF9UWVBFUyA9IHtcbiAgV0hFRUw6IFsnd2hlZWwnXSxcbiAgUEFOOiBbJ3BhbnN0YXJ0JywgJ3Bhbm1vdmUnLCAncGFuZW5kJ10sXG4gIFBJTkNIOiBbJ3BpbmNoc3RhcnQnLCAncGluY2htb3ZlJywgJ3BpbmNoZW5kJ10sXG4gIERPVUJMRV9UQVA6IFsnZG91YmxldGFwJ10sXG4gIEtFWUJPQVJEOiBbJ2tleWRvd24nXVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFwQ29udHJvbHMge1xuICAvKipcbiAgICogQGNsYXNzZGVzY1xuICAgKiBBIGNsYXNzIHRoYXQgaGFuZGxlcyBldmVudHMgYW5kIHVwZGF0ZXMgbWVyY2F0b3Igc3R5bGUgdmlld3BvcnQgcGFyYW1ldGVyc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fc3RhdGUgPSB7XG4gICAgICBpc0RyYWdnaW5nOiBmYWxzZVxuICAgIH07XG4gICAgdGhpcy5ldmVudHMgPSBbXTtcbiAgICB0aGlzLmhhbmRsZUV2ZW50ID0gdGhpcy5oYW5kbGVFdmVudC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIGZvciBldmVudHNcbiAgICogQHBhcmFtIHtoYW1tZXIuRXZlbnR9IGV2ZW50XG4gICAqL1xuICBoYW5kbGVFdmVudChldmVudCkge1xuICAgIHRoaXMubWFwU3RhdGUgPSB0aGlzLmdldE1hcFN0YXRlKCk7XG5cbiAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcbiAgICBjYXNlICdwYW5zdGFydCc6XG4gICAgICByZXR1cm4gdGhpcy5fb25QYW5TdGFydChldmVudCk7XG4gICAgY2FzZSAncGFubW92ZSc6XG4gICAgICByZXR1cm4gdGhpcy5fb25QYW4oZXZlbnQpO1xuICAgIGNhc2UgJ3BhbmVuZCc6XG4gICAgICByZXR1cm4gdGhpcy5fb25QYW5FbmQoZXZlbnQpO1xuICAgIGNhc2UgJ3BpbmNoc3RhcnQnOlxuICAgICAgcmV0dXJuIHRoaXMuX29uUGluY2hTdGFydChldmVudCk7XG4gICAgY2FzZSAncGluY2htb3ZlJzpcbiAgICAgIHJldHVybiB0aGlzLl9vblBpbmNoKGV2ZW50KTtcbiAgICBjYXNlICdwaW5jaGVuZCc6XG4gICAgICByZXR1cm4gdGhpcy5fb25QaW5jaEVuZChldmVudCk7XG4gICAgY2FzZSAnZG91YmxldGFwJzpcbiAgICAgIHJldHVybiB0aGlzLl9vbkRvdWJsZVRhcChldmVudCk7XG4gICAgY2FzZSAnd2hlZWwnOlxuICAgICAgcmV0dXJuIHRoaXMuX29uV2hlZWwoZXZlbnQpO1xuICAgIGNhc2UgJ2tleWRvd24nOlxuICAgICAgcmV0dXJuIHRoaXMuX29uS2V5RG93bihldmVudCk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKiBFdmVudCB1dGlscyAqL1xuICAvLyBFdmVudCBvYmplY3Q6IGh0dHA6Ly9oYW1tZXJqcy5naXRodWIuaW8vYXBpLyNldmVudC1vYmplY3RcbiAgZ2V0Q2VudGVyKGV2ZW50KSB7XG4gICAgY29uc3Qge29mZnNldENlbnRlcjoge3gsIHl9fSA9IGV2ZW50O1xuICAgIHJldHVybiBbeCwgeV07XG4gIH1cblxuICBpc0Z1bmN0aW9uS2V5UHJlc3NlZChldmVudCkge1xuICAgIGNvbnN0IHtzcmNFdmVudH0gPSBldmVudDtcbiAgICByZXR1cm4gQm9vbGVhbihzcmNFdmVudC5tZXRhS2V5IHx8IHNyY0V2ZW50LmFsdEtleSB8fFxuICAgICAgc3JjRXZlbnQuY3RybEtleSB8fCBzcmNFdmVudC5zaGlmdEtleSk7XG4gIH1cblxuICBzZXRTdGF0ZShuZXdTdGF0ZSkge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5fc3RhdGUsIG5ld1N0YXRlKTtcbiAgICBpZiAodGhpcy5vblN0YXRlQ2hhbmdlKSB7XG4gICAgICB0aGlzLm9uU3RhdGVDaGFuZ2UodGhpcy5fc3RhdGUpO1xuICAgIH1cbiAgfVxuXG4gIC8qIENhbGxiYWNrIHV0aWwgKi9cbiAgLy8gZm9ybWF0cyBtYXAgc3RhdGUgYW5kIGludm9rZXMgY2FsbGJhY2sgZnVuY3Rpb25cbiAgdXBkYXRlVmlld3BvcnQobmV3TWFwU3RhdGUsIGV4dHJhUHJvcHMgPSB7fSwgZXh0cmFTdGF0ZSA9IHt9KSB7XG4gICAgY29uc3Qgb2xkVmlld3BvcnQgPSB0aGlzLm1hcFN0YXRlLmdldFZpZXdwb3J0UHJvcHMoKTtcbiAgICBjb25zdCBuZXdWaWV3cG9ydCA9IE9iamVjdC5hc3NpZ24oe30sIG5ld01hcFN0YXRlLmdldFZpZXdwb3J0UHJvcHMoKSwgZXh0cmFQcm9wcyk7XG5cbiAgICBpZiAodGhpcy5vblZpZXdwb3J0Q2hhbmdlICYmXG4gICAgICBPYmplY3Qua2V5cyhuZXdWaWV3cG9ydCkuc29tZShrZXkgPT4gb2xkVmlld3BvcnRba2V5XSAhPT0gbmV3Vmlld3BvcnRba2V5XSkpIHtcbiAgICAgIC8vIFZpZXdwb3J0IGhhcyBjaGFuZ2VkXG4gICAgICB0aGlzLm9uVmlld3BvcnRDaGFuZ2UobmV3Vmlld3BvcnQpO1xuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoT2JqZWN0LmFzc2lnbih7fSwgbmV3TWFwU3RhdGUuZ2V0SW50ZXJhY3RpdmVTdGF0ZSgpLCBleHRyYVN0YXRlKSk7XG4gIH1cblxuICBnZXRNYXBTdGF0ZShvdmVycmlkZXMpIHtcbiAgICByZXR1cm4gbmV3IE1hcFN0YXRlKE9iamVjdC5hc3NpZ24oe30sIHRoaXMubWFwU3RhdGVQcm9wcywgdGhpcy5fc3RhdGUsIG92ZXJyaWRlcykpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4dHJhY3QgaW50ZXJhY3Rpdml0eSBvcHRpb25zXG4gICAqL1xuICBzZXRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICBjb25zdCB7XG4gICAgICAvLyBUT0RPKGRlcHJlY2F0ZSk6IHJlbW92ZSB0aGlzIHdoZW4gYG9uQ2hhbmdlVmlld3BvcnRgIGdldHMgZGVwcmVjYXRlZFxuICAgICAgb25DaGFuZ2VWaWV3cG9ydCxcbiAgICAgIC8vIFRPRE8oZGVwcmVjYXRlKTogcmVtb3ZlIHRoaXMgd2hlbiBgdG91Y2hab29tUm90YXRlYCBnZXRzIGRlcHJlY2F0ZWRcbiAgICAgIHRvdWNoWm9vbVJvdGF0ZSA9IHRydWUsXG5cbiAgICAgIG9uVmlld3BvcnRDaGFuZ2UsXG4gICAgICBvblN0YXRlQ2hhbmdlID0gdGhpcy5vblN0YXRlQ2hhbmdlLFxuICAgICAgZXZlbnRNYW5hZ2VyID0gdGhpcy5ldmVudE1hbmFnZXIsXG4gICAgICBzY3JvbGxab29tID0gdHJ1ZSxcbiAgICAgIGRyYWdQYW4gPSB0cnVlLFxuICAgICAgZHJhZ1JvdGF0ZSA9IHRydWUsXG4gICAgICBkb3VibGVDbGlja1pvb20gPSB0cnVlLFxuICAgICAgdG91Y2hab29tID0gdHJ1ZSxcbiAgICAgIHRvdWNoUm90YXRlID0gZmFsc2UsXG4gICAgICBrZXlib2FyZCA9IHRydWVcbiAgICB9ID0gb3B0aW9ucztcblxuICAgIC8vIFRPRE8oZGVwcmVjYXRlKTogcmVtb3ZlIHRoaXMgY2hlY2sgd2hlbiBgb25DaGFuZ2VWaWV3cG9ydGAgZ2V0cyBkZXByZWNhdGVkXG4gICAgdGhpcy5vblZpZXdwb3J0Q2hhbmdlID0gb25WaWV3cG9ydENoYW5nZSB8fCBvbkNoYW5nZVZpZXdwb3J0O1xuICAgIHRoaXMub25TdGF0ZUNoYW5nZSA9IG9uU3RhdGVDaGFuZ2U7XG4gICAgdGhpcy5tYXBTdGF0ZVByb3BzID0gb3B0aW9ucztcbiAgICBpZiAodGhpcy5ldmVudE1hbmFnZXIgIT09IGV2ZW50TWFuYWdlcikge1xuICAgICAgLy8gRXZlbnRNYW5hZ2VyIGhhcyBjaGFuZ2VkXG4gICAgICB0aGlzLmV2ZW50TWFuYWdlciA9IGV2ZW50TWFuYWdlcjtcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgICAgdGhpcy50b2dnbGVFdmVudHModGhpcy5ldmVudHMsIHRydWUpO1xuICAgIH1cbiAgICBjb25zdCBpc0ludGVyYWN0aXZlID0gQm9vbGVhbih0aGlzLm9uVmlld3BvcnRDaGFuZ2UpO1xuXG4gICAgLy8gUmVnaXN0ZXIvdW5yZWdpc3RlciBldmVudHNcbiAgICB0aGlzLnRvZ2dsZUV2ZW50cyhFVkVOVF9UWVBFUy5XSEVFTCwgaXNJbnRlcmFjdGl2ZSAmJiBzY3JvbGxab29tKTtcbiAgICB0aGlzLnRvZ2dsZUV2ZW50cyhFVkVOVF9UWVBFUy5QQU4sIGlzSW50ZXJhY3RpdmUgJiYgKGRyYWdQYW4gfHwgZHJhZ1JvdGF0ZSkpO1xuICAgIHRoaXMudG9nZ2xlRXZlbnRzKEVWRU5UX1RZUEVTLlBJTkNILCBpc0ludGVyYWN0aXZlICYmIHRvdWNoWm9vbVJvdGF0ZSk7XG4gICAgdGhpcy50b2dnbGVFdmVudHMoRVZFTlRfVFlQRVMuRE9VQkxFX1RBUCwgaXNJbnRlcmFjdGl2ZSAmJiBkb3VibGVDbGlja1pvb20pO1xuICAgIHRoaXMudG9nZ2xlRXZlbnRzKEVWRU5UX1RZUEVTLktFWUJPQVJELCBpc0ludGVyYWN0aXZlICYmIGtleWJvYXJkKTtcblxuICAgIC8vIEludGVyYWN0aW9uIHRvZ2dsZXNcbiAgICB0aGlzLnNjcm9sbFpvb20gPSBzY3JvbGxab29tO1xuICAgIHRoaXMuZHJhZ1BhbiA9IGRyYWdQYW47XG4gICAgdGhpcy5kcmFnUm90YXRlID0gZHJhZ1JvdGF0ZTtcbiAgICB0aGlzLmRvdWJsZUNsaWNrWm9vbSA9IGRvdWJsZUNsaWNrWm9vbTtcbiAgICB0aGlzLnRvdWNoWm9vbSA9IHRvdWNoWm9vbVJvdGF0ZSAmJiB0b3VjaFpvb207XG4gICAgdGhpcy50b3VjaFJvdGF0ZSA9IHRvdWNoWm9vbVJvdGF0ZSAmJiB0b3VjaFJvdGF0ZTtcbiAgICB0aGlzLmtleWJvYXJkID0ga2V5Ym9hcmQ7XG4gIH1cblxuICB0b2dnbGVFdmVudHMoZXZlbnROYW1lcywgZW5hYmxlZCkge1xuICAgIGlmICh0aGlzLmV2ZW50TWFuYWdlcikge1xuICAgICAgZXZlbnROYW1lcy5mb3JFYWNoKGV2ZW50TmFtZSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9ldmVudHNbZXZlbnROYW1lXSAhPT0gZW5hYmxlZCkge1xuICAgICAgICAgIHRoaXMuX2V2ZW50c1tldmVudE5hbWVdID0gZW5hYmxlZDtcbiAgICAgICAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICAgICAgdGhpcy5ldmVudE1hbmFnZXIub24oZXZlbnROYW1lLCB0aGlzLmhhbmRsZUV2ZW50KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5ldmVudE1hbmFnZXIub2ZmKGV2ZW50TmFtZSwgdGhpcy5oYW5kbGVFdmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKiBFdmVudCBoYW5kbGVycyAqL1xuICAvLyBEZWZhdWx0IGhhbmRsZXIgZm9yIHRoZSBgcGFuc3RhcnRgIGV2ZW50LlxuICBfb25QYW5TdGFydChldmVudCkge1xuICAgIGNvbnN0IHBvcyA9IHRoaXMuZ2V0Q2VudGVyKGV2ZW50KTtcbiAgICBjb25zdCBuZXdNYXBTdGF0ZSA9IHRoaXMubWFwU3RhdGUucGFuU3RhcnQoe3Bvc30pLnJvdGF0ZVN0YXJ0KHtwb3N9KTtcbiAgICByZXR1cm4gdGhpcy51cGRhdGVWaWV3cG9ydChuZXdNYXBTdGF0ZSwgTk9fVFJBTlNJVElPTl9QUk9QUywge2lzRHJhZ2dpbmc6IHRydWV9KTtcbiAgfVxuXG4gIC8vIERlZmF1bHQgaGFuZGxlciBmb3IgdGhlIGBwYW5tb3ZlYCBldmVudC5cbiAgX29uUGFuKGV2ZW50KSB7XG4gICAgcmV0dXJuIHRoaXMuaXNGdW5jdGlvbktleVByZXNzZWQoZXZlbnQpIHx8IGV2ZW50LnJpZ2h0QnV0dG9uID9cbiAgICAgIHRoaXMuX29uUGFuUm90YXRlKGV2ZW50KSA6IHRoaXMuX29uUGFuTW92ZShldmVudCk7XG4gIH1cblxuICAvLyBEZWZhdWx0IGhhbmRsZXIgZm9yIHRoZSBgcGFuZW5kYCBldmVudC5cbiAgX29uUGFuRW5kKGV2ZW50KSB7XG4gICAgY29uc3QgbmV3TWFwU3RhdGUgPSB0aGlzLm1hcFN0YXRlLnBhbkVuZCgpLnJvdGF0ZUVuZCgpO1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZVZpZXdwb3J0KG5ld01hcFN0YXRlLCBudWxsLCB7aXNEcmFnZ2luZzogZmFsc2V9KTtcbiAgfVxuXG4gIC8vIERlZmF1bHQgaGFuZGxlciBmb3IgcGFubmluZyB0byBtb3ZlLlxuICAvLyBDYWxsZWQgYnkgYF9vblBhbmAgd2hlbiBwYW5uaW5nIHdpdGhvdXQgZnVuY3Rpb24ga2V5IHByZXNzZWQuXG4gIF9vblBhbk1vdmUoZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuZHJhZ1Bhbikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBwb3MgPSB0aGlzLmdldENlbnRlcihldmVudCk7XG4gICAgY29uc3QgbmV3TWFwU3RhdGUgPSB0aGlzLm1hcFN0YXRlLnBhbih7cG9zfSk7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlVmlld3BvcnQobmV3TWFwU3RhdGUsIE5PX1RSQU5TSVRJT05fUFJPUFMsIHtpc0RyYWdnaW5nOiB0cnVlfSk7XG4gIH1cblxuICAvLyBEZWZhdWx0IGhhbmRsZXIgZm9yIHBhbm5pbmcgdG8gcm90YXRlLlxuICAvLyBDYWxsZWQgYnkgYF9vblBhbmAgd2hlbiBwYW5uaW5nIHdpdGggZnVuY3Rpb24ga2V5IHByZXNzZWQuXG4gIF9vblBhblJvdGF0ZShldmVudCkge1xuICAgIGlmICghdGhpcy5kcmFnUm90YXRlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3Qge2RlbHRhWCwgZGVsdGFZfSA9IGV2ZW50O1xuICAgIGNvbnN0IFssIGNlbnRlclldID0gdGhpcy5nZXRDZW50ZXIoZXZlbnQpO1xuICAgIGNvbnN0IHN0YXJ0WSA9IGNlbnRlclkgLSBkZWx0YVk7XG4gICAgY29uc3Qge3dpZHRoLCBoZWlnaHR9ID0gdGhpcy5tYXBTdGF0ZS5nZXRWaWV3cG9ydFByb3BzKCk7XG5cbiAgICBjb25zdCBkZWx0YVNjYWxlWCA9IGRlbHRhWCAvIHdpZHRoO1xuICAgIGxldCBkZWx0YVNjYWxlWSA9IDA7XG5cbiAgICBpZiAoZGVsdGFZID4gMCkge1xuICAgICAgaWYgKE1hdGguYWJzKGhlaWdodCAtIHN0YXJ0WSkgPiBQSVRDSF9NT1VTRV9USFJFU0hPTEQpIHtcbiAgICAgICAgLy8gTW92ZSBmcm9tIDAgdG8gLTEgYXMgd2UgZHJhZyB1cHdhcmRzXG4gICAgICAgIGRlbHRhU2NhbGVZID0gZGVsdGFZIC8gKHN0YXJ0WSAtIGhlaWdodCkgKiBQSVRDSF9BQ0NFTDtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGRlbHRhWSA8IDApIHtcbiAgICAgIGlmIChzdGFydFkgPiBQSVRDSF9NT1VTRV9USFJFU0hPTEQpIHtcbiAgICAgICAgLy8gTW92ZSBmcm9tIDAgdG8gMSBhcyB3ZSBkcmFnIHVwd2FyZHNcbiAgICAgICAgZGVsdGFTY2FsZVkgPSAxIC0gY2VudGVyWSAvIHN0YXJ0WTtcbiAgICAgIH1cbiAgICB9XG4gICAgZGVsdGFTY2FsZVkgPSBNYXRoLm1pbigxLCBNYXRoLm1heCgtMSwgZGVsdGFTY2FsZVkpKTtcblxuICAgIGNvbnN0IG5ld01hcFN0YXRlID0gdGhpcy5tYXBTdGF0ZS5yb3RhdGUoe2RlbHRhU2NhbGVYLCBkZWx0YVNjYWxlWX0pO1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZVZpZXdwb3J0KG5ld01hcFN0YXRlLCBOT19UUkFOU0lUSU9OX1BST1BTLCB7aXNEcmFnZ2luZzogdHJ1ZX0pO1xuICB9XG5cbiAgLy8gRGVmYXVsdCBoYW5kbGVyIGZvciB0aGUgYHdoZWVsYCBldmVudC5cbiAgX29uV2hlZWwoZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuc2Nyb2xsWm9vbSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IHBvcyA9IHRoaXMuZ2V0Q2VudGVyKGV2ZW50KTtcbiAgICBjb25zdCB7ZGVsdGF9ID0gZXZlbnQ7XG5cbiAgICAvLyBNYXAgd2hlZWwgZGVsdGEgdG8gcmVsYXRpdmUgc2NhbGVcbiAgICBsZXQgc2NhbGUgPSAyIC8gKDEgKyBNYXRoLmV4cCgtTWF0aC5hYnMoZGVsdGEgKiBaT09NX0FDQ0VMKSkpO1xuICAgIGlmIChkZWx0YSA8IDAgJiYgc2NhbGUgIT09IDApIHtcbiAgICAgIHNjYWxlID0gMSAvIHNjYWxlO1xuICAgIH1cblxuICAgIGNvbnN0IG5ld01hcFN0YXRlID0gdGhpcy5tYXBTdGF0ZS56b29tKHtwb3MsIHNjYWxlfSk7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlVmlld3BvcnQobmV3TWFwU3RhdGUsIE5PX1RSQU5TSVRJT05fUFJPUFMpO1xuICB9XG5cbiAgLy8gRGVmYXVsdCBoYW5kbGVyIGZvciB0aGUgYHBpbmNoc3RhcnRgIGV2ZW50LlxuICBfb25QaW5jaFN0YXJ0KGV2ZW50KSB7XG4gICAgY29uc3QgcG9zID0gdGhpcy5nZXRDZW50ZXIoZXZlbnQpO1xuICAgIGNvbnN0IG5ld01hcFN0YXRlID0gdGhpcy5tYXBTdGF0ZS56b29tU3RhcnQoe3Bvc30pLnJvdGF0ZVN0YXJ0KHtwb3N9KTtcbiAgICAvLyBoYWNrIC0gaGFtbWVyJ3MgYHJvdGF0aW9uYCBmaWVsZCBkb2Vzbid0IHNlZW0gdG8gcHJvZHVjZSB0aGUgY29ycmVjdCBhbmdsZVxuICAgIHRoaXMuX3N0YXRlLnN0YXJ0UGluY2hSb3RhdGlvbiA9IGV2ZW50LnJvdGF0aW9uO1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZVZpZXdwb3J0KG5ld01hcFN0YXRlLCBOT19UUkFOU0lUSU9OX1BST1BTLCB7aXNEcmFnZ2luZzogdHJ1ZX0pO1xuICB9XG5cbiAgLy8gRGVmYXVsdCBoYW5kbGVyIGZvciB0aGUgYHBpbmNoYCBldmVudC5cbiAgX29uUGluY2goZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMudG91Y2hab29tICYmICF0aGlzLnRvdWNoUm90YXRlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbGV0IG5ld01hcFN0YXRlID0gdGhpcy5tYXBTdGF0ZTtcbiAgICBpZiAodGhpcy50b3VjaFpvb20pIHtcbiAgICAgIGNvbnN0IHtzY2FsZX0gPSBldmVudDtcbiAgICAgIGNvbnN0IHBvcyA9IHRoaXMuZ2V0Q2VudGVyKGV2ZW50KTtcbiAgICAgIG5ld01hcFN0YXRlID0gbmV3TWFwU3RhdGUuem9vbSh7cG9zLCBzY2FsZX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50b3VjaFJvdGF0ZSkge1xuICAgICAgY29uc3Qge3JvdGF0aW9ufSA9IGV2ZW50O1xuICAgICAgY29uc3Qge3N0YXJ0UGluY2hSb3RhdGlvbn0gPSB0aGlzLl9zdGF0ZTtcbiAgICAgIG5ld01hcFN0YXRlID0gbmV3TWFwU3RhdGUucm90YXRlKHtkZWx0YVNjYWxlWDogLShyb3RhdGlvbiAtIHN0YXJ0UGluY2hSb3RhdGlvbikgLyAxODB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy51cGRhdGVWaWV3cG9ydChuZXdNYXBTdGF0ZSwgTk9fVFJBTlNJVElPTl9QUk9QUywge2lzRHJhZ2dpbmc6IHRydWV9KTtcbiAgfVxuXG4gIC8vIERlZmF1bHQgaGFuZGxlciBmb3IgdGhlIGBwaW5jaGVuZGAgZXZlbnQuXG4gIF9vblBpbmNoRW5kKGV2ZW50KSB7XG4gICAgY29uc3QgbmV3TWFwU3RhdGUgPSB0aGlzLm1hcFN0YXRlLnpvb21FbmQoKS5yb3RhdGVFbmQoKTtcbiAgICB0aGlzLl9zdGF0ZS5zdGFydFBpbmNoUm90YXRpb24gPSAwO1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZVZpZXdwb3J0KG5ld01hcFN0YXRlLCBudWxsLCB7aXNEcmFnZ2luZzogZmFsc2V9KTtcbiAgfVxuXG4gIC8vIERlZmF1bHQgaGFuZGxlciBmb3IgdGhlIGBkb3VibGV0YXBgIGV2ZW50LlxuICBfb25Eb3VibGVUYXAoZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuZG91YmxlQ2xpY2tab29tKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IHBvcyA9IHRoaXMuZ2V0Q2VudGVyKGV2ZW50KTtcbiAgICBjb25zdCBpc1pvb21PdXQgPSB0aGlzLmlzRnVuY3Rpb25LZXlQcmVzc2VkKGV2ZW50KTtcblxuICAgIGNvbnN0IG5ld01hcFN0YXRlID0gdGhpcy5tYXBTdGF0ZS56b29tKHtwb3MsIHNjYWxlOiBpc1pvb21PdXQgPyAwLjUgOiAyfSk7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlVmlld3BvcnQobmV3TWFwU3RhdGUsIExJTkVBUl9UUkFOU0lUSU9OX1BST1BTKTtcbiAgfVxuXG4gIC8qIGVzbGludC1kaXNhYmxlIGNvbXBsZXhpdHkgKi9cbiAgLy8gRGVmYXVsdCBoYW5kbGVyIGZvciB0aGUgYGtleWRvd25gIGV2ZW50XG4gIF9vbktleURvd24oZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMua2V5Ym9hcmQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgZnVuY0tleSA9IHRoaXMuaXNGdW5jdGlvbktleVByZXNzZWQoZXZlbnQpO1xuICAgIGNvbnN0IHttYXBTdGF0ZVByb3BzfSA9IHRoaXM7XG4gICAgbGV0IG5ld01hcFN0YXRlO1xuXG4gICAgc3dpdGNoIChldmVudC5zcmNFdmVudC5rZXlDb2RlKSB7XG4gICAgY2FzZSAxODk6IC8vIC1cbiAgICAgIGlmIChmdW5jS2V5KSB7XG4gICAgICAgIG5ld01hcFN0YXRlID0gdGhpcy5nZXRNYXBTdGF0ZSh7em9vbTogbWFwU3RhdGVQcm9wcy56b29tIC0gMn0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3TWFwU3RhdGUgPSB0aGlzLmdldE1hcFN0YXRlKHt6b29tOiBtYXBTdGF0ZVByb3BzLnpvb20gLSAxfSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIDE4NzogLy8gK1xuICAgICAgaWYgKGZ1bmNLZXkpIHtcbiAgICAgICAgbmV3TWFwU3RhdGUgPSB0aGlzLmdldE1hcFN0YXRlKHt6b29tOiBtYXBTdGF0ZVByb3BzLnpvb20gKyAyfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdNYXBTdGF0ZSA9IHRoaXMuZ2V0TWFwU3RhdGUoe3pvb206IG1hcFN0YXRlUHJvcHMuem9vbSArIDF9KTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMzc6IC8vIGxlZnRcbiAgICAgIGlmIChmdW5jS2V5KSB7XG4gICAgICAgIG5ld01hcFN0YXRlID0gdGhpcy5nZXRNYXBTdGF0ZSh7YmVhcmluZzogbWFwU3RhdGVQcm9wcy5iZWFyaW5nIC0gMTV9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld01hcFN0YXRlID0gdGhpcy5tYXBTdGF0ZS5wYW4oe3BvczogWzEwMCwgMF0sIHN0YXJ0UG9zOiBbMCwgMF19KTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMzk6IC8vIHJpZ2h0XG4gICAgICBpZiAoZnVuY0tleSkge1xuICAgICAgICBuZXdNYXBTdGF0ZSA9IHRoaXMuZ2V0TWFwU3RhdGUoe2JlYXJpbmc6IG1hcFN0YXRlUHJvcHMuYmVhcmluZyArIDE1fSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdNYXBTdGF0ZSA9IHRoaXMubWFwU3RhdGUucGFuKHtwb3M6IFstMTAwLCAwXSwgc3RhcnRQb3M6IFswLCAwXX0pO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAzODogLy8gdXBcbiAgICAgIGlmIChmdW5jS2V5KSB7XG4gICAgICAgIG5ld01hcFN0YXRlID0gdGhpcy5nZXRNYXBTdGF0ZSh7cGl0Y2g6IG1hcFN0YXRlUHJvcHMucGl0Y2ggKyAxMH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3TWFwU3RhdGUgPSB0aGlzLm1hcFN0YXRlLnBhbih7cG9zOiBbMCwgMTAwXSwgc3RhcnRQb3M6IFswLCAwXX0pO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSA0MDogLy8gZG93blxuICAgICAgaWYgKGZ1bmNLZXkpIHtcbiAgICAgICAgbmV3TWFwU3RhdGUgPSB0aGlzLmdldE1hcFN0YXRlKHtwaXRjaDogbWFwU3RhdGVQcm9wcy5waXRjaCAtIDEwfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdNYXBTdGF0ZSA9IHRoaXMubWFwU3RhdGUucGFuKHtwb3M6IFswLCAtMTAwXSwgc3RhcnRQb3M6IFswLCAwXX0pO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlVmlld3BvcnQobmV3TWFwU3RhdGUsIExJTkVBUl9UUkFOU0lUSU9OX1BST1BTKTtcbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIGNvbXBsZXhpdHkgKi9cbn1cbiJdfQ==