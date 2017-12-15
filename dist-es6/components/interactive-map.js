var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import { PureComponent, createElement } from 'react';
import PropTypes from 'prop-types';
import autobind from '../utils/autobind';

import StaticMap from './static-map';
import { MAPBOX_LIMITS } from '../utils/map-state';
import WebMercatorViewport from 'viewport-mercator-project';

import TransitionManager from '../utils/transition-manager';

import { EventManager } from 'mjolnir.js';
import MapControls from '../utils/map-controls';
import config from '../config';
import deprecateWarn from '../utils/deprecate-warn';

var propTypes = Object.assign({}, StaticMap.propTypes, {
  // Additional props on top of StaticMap

  /** Viewport constraints */
  // Max zoom level
  maxZoom: PropTypes.number,
  // Min zoom level
  minZoom: PropTypes.number,
  // Max pitch in degrees
  maxPitch: PropTypes.number,
  // Min pitch in degrees
  minPitch: PropTypes.number,

  /**
   * `onViewportChange` callback is fired when the user interacted with the
   * map. The object passed to the callback contains viewport properties
   * such as `longitude`, `latitude`, `zoom` etc.
   */
  onViewportChange: PropTypes.func,

  /** Viewport transition **/
  // transition duration for viewport change
  transitionDuration: PropTypes.number,
  // TransitionInterpolator instance, can be used to perform custom transitions.
  transitionInterpolator: PropTypes.object,
  // type of interruption of current transition on update.
  transitionInterruption: PropTypes.number,
  // easing function
  transitionEasing: PropTypes.func,
  // transition status update functions
  onTransitionStart: PropTypes.func,
  onTransitionInterrupt: PropTypes.func,
  onTransitionEnd: PropTypes.func,

  /** Enables control event handling */
  // Scroll to zoom
  scrollZoom: PropTypes.bool,
  // Drag to pan
  dragPan: PropTypes.bool,
  // Drag to rotate
  dragRotate: PropTypes.bool,
  // Double click to zoom
  doubleClickZoom: PropTypes.bool,
  // Multitouch zoom
  touchZoom: PropTypes.bool,
  // Multitouch rotate
  touchRotate: PropTypes.bool,
  // Keyboard
  keyboard: PropTypes.bool,

  /**
     * Called when the map is hovered over.
     * @callback
     * @param {Object} event - The mouse event.
     * @param {[Number, Number]} event.lngLat - The coordinates of the pointer
     * @param {Array} event.features - The features under the pointer, using Mapbox's
     * queryRenderedFeatures API:
     * https://www.mapbox.com/mapbox-gl-js/api/#Map#queryRenderedFeatures
     * To make a layer interactive, set the `interactive` property in the
     * layer style to `true`. See Mapbox's style spec
     * https://www.mapbox.com/mapbox-gl-style-spec/#layer-interactive
     */
  onHover: PropTypes.func,
  /**
    * Called when the map is clicked.
    * @callback
    * @param {Object} event - The mouse event.
    * @param {[Number, Number]} event.lngLat - The coordinates of the pointer
    * @param {Array} event.features - The features under the pointer, using Mapbox's
    * queryRenderedFeatures API:
    * https://www.mapbox.com/mapbox-gl-js/api/#Map#queryRenderedFeatures
    * To make a layer interactive, set the `interactive` property in the
    * layer style to `true`. See Mapbox's style spec
    * https://www.mapbox.com/mapbox-gl-style-spec/#layer-interactive
    */
  onClick: PropTypes.func,

  /** Radius to detect features around a clicked point. Defaults to 0. */
  clickRadius: PropTypes.number,

  /** Accessor that returns a cursor style to show interactive state */
  getCursor: PropTypes.func,

  /** Advanced features */
  // Contraints for displaying the map. If not met, then the map is hidden.
  // Experimental! May be changed in minor version updates.
  visibilityConstraints: PropTypes.shape({
    minZoom: PropTypes.number,
    maxZoom: PropTypes.number,
    minPitch: PropTypes.number,
    maxPitch: PropTypes.number
  }),
  // A map control instance to replace the default map controls
  // The object must expose one property: `events` as an array of subscribed
  // event names; and two methods: `setState(state)` and `handle(event)`
  mapControls: PropTypes.shape({
    events: PropTypes.arrayOf(PropTypes.string),
    handleEvent: PropTypes.func
  })
});

var getDefaultCursor = function getDefaultCursor(_ref) {
  var isDragging = _ref.isDragging,
      isHovering = _ref.isHovering;
  return isDragging ? config.CURSOR.GRABBING : isHovering ? config.CURSOR.POINTER : config.CURSOR.GRAB;
};

var defaultProps = Object.assign({}, StaticMap.defaultProps, MAPBOX_LIMITS, TransitionManager.defaultProps, {
  onViewportChange: null,
  onClick: null,
  onHover: null,

  scrollZoom: true,
  dragPan: true,
  dragRotate: true,
  doubleClickZoom: true,
  touchZoomRotate: true,

  clickRadius: 0,
  getCursor: getDefaultCursor,

  visibilityConstraints: MAPBOX_LIMITS
});

var childContextTypes = {
  viewport: PropTypes.instanceOf(WebMercatorViewport),
  isDragging: PropTypes.bool,
  eventManager: PropTypes.object
};

var InteractiveMap = function (_PureComponent) {
  _inherits(InteractiveMap, _PureComponent);

  _createClass(InteractiveMap, null, [{
    key: 'supported',
    value: function supported() {
      return StaticMap.supported();
    }
  }]);

  function InteractiveMap(props) {
    _classCallCheck(this, InteractiveMap);

    var _this = _possibleConstructorReturn(this, (InteractiveMap.__proto__ || Object.getPrototypeOf(InteractiveMap)).call(this, props));

    autobind(_this);
    // Check for deprecated props
    deprecateWarn(props);

    _this.state = {
      // Whether the cursor is down
      isDragging: false,
      // Whether the cursor is over a clickable feature
      isHovering: false
    };

    // If props.mapControls is not provided, fallback to default MapControls instance
    // Cannot use defaultProps here because it needs to be per map instance
    _this._mapControls = props.mapControls || new MapControls();

    _this._eventManager = new EventManager(null, { rightButton: true });
    return _this;
  }

  _createClass(InteractiveMap, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        viewport: new WebMercatorViewport(this.props),
        isDragging: this.state.isDragging,
        eventManager: this._eventManager
      };
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var eventManager = this._eventManager;

      // Register additional event handlers for click and hover
      eventManager.on('mousemove', this._onMouseMove);
      eventManager.on('click', this._onMouseClick);

      this._mapControls.setOptions(Object.assign({}, this.props, {
        onStateChange: this._onInteractiveStateChange,
        eventManager: eventManager
      }));

      this._transitionManager = new TransitionManager(this.props);
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate(nextProps) {
      this._mapControls.setOptions(nextProps);
      this._transitionManager.processViewportChange(nextProps);
    }
  }, {
    key: 'getMap',
    value: function getMap() {
      return this._map.getMap();
    }
  }, {
    key: 'queryRenderedFeatures',
    value: function queryRenderedFeatures(geometry, options) {
      return this._map.queryRenderedFeatures(geometry, options);
    }

    // Checks a visibilityConstraints object to see if the map should be displayed

  }, {
    key: '_checkVisibilityConstraints',
    value: function _checkVisibilityConstraints(props) {
      var capitalize = function capitalize(s) {
        return s[0].toUpperCase() + s.slice(1);
      };

      var visibilityConstraints = props.visibilityConstraints;

      for (var propName in props) {
        var capitalizedPropName = capitalize(propName);
        var minPropName = 'min' + capitalizedPropName;
        var maxPropName = 'max' + capitalizedPropName;

        if (minPropName in visibilityConstraints && props[propName] < visibilityConstraints[minPropName]) {
          return false;
        }
        if (maxPropName in visibilityConstraints && props[propName] > visibilityConstraints[maxPropName]) {
          return false;
        }
      }
      return true;
    }
  }, {
    key: '_getFeatures',
    value: function _getFeatures(_ref2) {
      var pos = _ref2.pos,
          radius = _ref2.radius;

      var features = void 0;
      if (radius) {
        // Radius enables point features, like marker symbols, to be clicked.
        var size = radius;
        var bbox = [[pos[0] - size, pos[1] + size], [pos[0] + size, pos[1] - size]];
        features = this._map.queryRenderedFeatures(bbox);
      } else {
        features = this._map.queryRenderedFeatures(pos);
      }
      return features;
    }
  }, {
    key: '_onInteractiveStateChange',
    value: function _onInteractiveStateChange(_ref3) {
      var _ref3$isDragging = _ref3.isDragging,
          isDragging = _ref3$isDragging === undefined ? false : _ref3$isDragging;

      if (isDragging !== this.state.isDragging) {
        this.setState({ isDragging: isDragging });
      }
    }

    // HOVER AND CLICK

  }, {
    key: '_getPos',
    value: function _getPos(event) {
      var _event$offsetCenter = event.offsetCenter,
          x = _event$offsetCenter.x,
          y = _event$offsetCenter.y;

      return [x, y];
    }
  }, {
    key: '_onMouseMove',
    value: function _onMouseMove(event) {
      if (!this.state.isDragging) {
        var pos = this._getPos(event);
        var features = this._getFeatures({ pos: pos, radius: this.props.clickRadius });

        var isHovering = features && features.length > 0;
        if (isHovering !== this.state.isHovering) {
          this.setState({ isHovering: isHovering });
        }

        if (this.props.onHover) {
          var viewport = new WebMercatorViewport(this.props);
          event.lngLat = viewport.unproject(pos);
          event.features = features;

          this.props.onHover(event);
        }
      }
    }
  }, {
    key: '_onMouseClick',
    value: function _onMouseClick(event) {
      if (this.props.onClick) {
        var pos = this._getPos(event);
        var viewport = new WebMercatorViewport(this.props);
        event.lngLat = viewport.unproject(pos);
        event.features = this._getFeatures({ pos: pos, radius: this.props.clickRadius });

        this.props.onClick(event);
      }
    }
  }, {
    key: '_eventCanvasLoaded',
    value: function _eventCanvasLoaded(ref) {
      // This will be called with `null` after unmount, releasing event manager resource
      this._eventManager.setElement(ref);
    }
  }, {
    key: '_staticMapLoaded',
    value: function _staticMapLoaded(ref) {
      this._map = ref;
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          width = _props.width,
          height = _props.height,
          getCursor = _props.getCursor;


      var eventCanvasStyle = {
        width: width,
        height: height,
        position: 'relative',
        cursor: getCursor(this.state)
      };

      return createElement('div', {
        key: 'map-controls',
        ref: this._eventCanvasLoaded,
        style: eventCanvasStyle
      }, createElement(StaticMap, Object.assign({}, this.props, this._transitionManager && this._transitionManager.getViewportInTransition(), {
        visible: this._checkVisibilityConstraints(this.props),
        ref: this._staticMapLoaded,
        children: this.props.children
      })));
    }
  }]);

  return InteractiveMap;
}(PureComponent);

export default InteractiveMap;


InteractiveMap.displayName = 'InteractiveMap';
InteractiveMap.propTypes = propTypes;
InteractiveMap.defaultProps = defaultProps;
InteractiveMap.childContextTypes = childContextTypes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL2ludGVyYWN0aXZlLW1hcC5qcyJdLCJuYW1lcyI6WyJQdXJlQ29tcG9uZW50IiwiY3JlYXRlRWxlbWVudCIsIlByb3BUeXBlcyIsImF1dG9iaW5kIiwiU3RhdGljTWFwIiwiTUFQQk9YX0xJTUlUUyIsIldlYk1lcmNhdG9yVmlld3BvcnQiLCJUcmFuc2l0aW9uTWFuYWdlciIsIkV2ZW50TWFuYWdlciIsIk1hcENvbnRyb2xzIiwiY29uZmlnIiwiZGVwcmVjYXRlV2FybiIsInByb3BUeXBlcyIsIk9iamVjdCIsImFzc2lnbiIsIm1heFpvb20iLCJudW1iZXIiLCJtaW5ab29tIiwibWF4UGl0Y2giLCJtaW5QaXRjaCIsIm9uVmlld3BvcnRDaGFuZ2UiLCJmdW5jIiwidHJhbnNpdGlvbkR1cmF0aW9uIiwidHJhbnNpdGlvbkludGVycG9sYXRvciIsIm9iamVjdCIsInRyYW5zaXRpb25JbnRlcnJ1cHRpb24iLCJ0cmFuc2l0aW9uRWFzaW5nIiwib25UcmFuc2l0aW9uU3RhcnQiLCJvblRyYW5zaXRpb25JbnRlcnJ1cHQiLCJvblRyYW5zaXRpb25FbmQiLCJzY3JvbGxab29tIiwiYm9vbCIsImRyYWdQYW4iLCJkcmFnUm90YXRlIiwiZG91YmxlQ2xpY2tab29tIiwidG91Y2hab29tIiwidG91Y2hSb3RhdGUiLCJrZXlib2FyZCIsIm9uSG92ZXIiLCJvbkNsaWNrIiwiY2xpY2tSYWRpdXMiLCJnZXRDdXJzb3IiLCJ2aXNpYmlsaXR5Q29uc3RyYWludHMiLCJzaGFwZSIsIm1hcENvbnRyb2xzIiwiZXZlbnRzIiwiYXJyYXlPZiIsInN0cmluZyIsImhhbmRsZUV2ZW50IiwiZ2V0RGVmYXVsdEN1cnNvciIsImlzRHJhZ2dpbmciLCJpc0hvdmVyaW5nIiwiQ1VSU09SIiwiR1JBQkJJTkciLCJQT0lOVEVSIiwiR1JBQiIsImRlZmF1bHRQcm9wcyIsInRvdWNoWm9vbVJvdGF0ZSIsImNoaWxkQ29udGV4dFR5cGVzIiwidmlld3BvcnQiLCJpbnN0YW5jZU9mIiwiZXZlbnRNYW5hZ2VyIiwiSW50ZXJhY3RpdmVNYXAiLCJzdXBwb3J0ZWQiLCJwcm9wcyIsInN0YXRlIiwiX21hcENvbnRyb2xzIiwiX2V2ZW50TWFuYWdlciIsInJpZ2h0QnV0dG9uIiwib24iLCJfb25Nb3VzZU1vdmUiLCJfb25Nb3VzZUNsaWNrIiwic2V0T3B0aW9ucyIsIm9uU3RhdGVDaGFuZ2UiLCJfb25JbnRlcmFjdGl2ZVN0YXRlQ2hhbmdlIiwiX3RyYW5zaXRpb25NYW5hZ2VyIiwibmV4dFByb3BzIiwicHJvY2Vzc1ZpZXdwb3J0Q2hhbmdlIiwiX21hcCIsImdldE1hcCIsImdlb21ldHJ5Iiwib3B0aW9ucyIsInF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyIsImNhcGl0YWxpemUiLCJzIiwidG9VcHBlckNhc2UiLCJzbGljZSIsInByb3BOYW1lIiwiY2FwaXRhbGl6ZWRQcm9wTmFtZSIsIm1pblByb3BOYW1lIiwibWF4UHJvcE5hbWUiLCJwb3MiLCJyYWRpdXMiLCJmZWF0dXJlcyIsInNpemUiLCJiYm94Iiwic2V0U3RhdGUiLCJldmVudCIsIm9mZnNldENlbnRlciIsIngiLCJ5IiwiX2dldFBvcyIsIl9nZXRGZWF0dXJlcyIsImxlbmd0aCIsImxuZ0xhdCIsInVucHJvamVjdCIsInJlZiIsInNldEVsZW1lbnQiLCJ3aWR0aCIsImhlaWdodCIsImV2ZW50Q2FudmFzU3R5bGUiLCJwb3NpdGlvbiIsImN1cnNvciIsImtleSIsIl9ldmVudENhbnZhc0xvYWRlZCIsInN0eWxlIiwiZ2V0Vmlld3BvcnRJblRyYW5zaXRpb24iLCJ2aXNpYmxlIiwiX2NoZWNrVmlzaWJpbGl0eUNvbnN0cmFpbnRzIiwiX3N0YXRpY01hcExvYWRlZCIsImNoaWxkcmVuIiwiZGlzcGxheU5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUEsU0FBUUEsYUFBUixFQUF1QkMsYUFBdkIsUUFBMkMsT0FBM0M7QUFDQSxPQUFPQyxTQUFQLE1BQXNCLFlBQXRCO0FBQ0EsT0FBT0MsUUFBUCxNQUFxQixtQkFBckI7O0FBRUEsT0FBT0MsU0FBUCxNQUFzQixjQUF0QjtBQUNBLFNBQVFDLGFBQVIsUUFBNEIsb0JBQTVCO0FBQ0EsT0FBT0MsbUJBQVAsTUFBZ0MsMkJBQWhDOztBQUVBLE9BQU9DLGlCQUFQLE1BQThCLDZCQUE5Qjs7QUFFQSxTQUFRQyxZQUFSLFFBQTJCLFlBQTNCO0FBQ0EsT0FBT0MsV0FBUCxNQUF3Qix1QkFBeEI7QUFDQSxPQUFPQyxNQUFQLE1BQW1CLFdBQW5CO0FBQ0EsT0FBT0MsYUFBUCxNQUEwQix5QkFBMUI7O0FBRUEsSUFBTUMsWUFBWUMsT0FBT0MsTUFBUCxDQUFjLEVBQWQsRUFBa0JWLFVBQVVRLFNBQTVCLEVBQXVDO0FBQ3ZEOztBQUVBO0FBQ0E7QUFDQUcsV0FBU2IsVUFBVWMsTUFMb0M7QUFNdkQ7QUFDQUMsV0FBU2YsVUFBVWMsTUFQb0M7QUFRdkQ7QUFDQUUsWUFBVWhCLFVBQVVjLE1BVG1DO0FBVXZEO0FBQ0FHLFlBQVVqQixVQUFVYyxNQVhtQzs7QUFhdkQ7Ozs7O0FBS0FJLG9CQUFrQmxCLFVBQVVtQixJQWxCMkI7O0FBb0J2RDtBQUNBO0FBQ0FDLHNCQUFvQnBCLFVBQVVjLE1BdEJ5QjtBQXVCdkQ7QUFDQU8sMEJBQXdCckIsVUFBVXNCLE1BeEJxQjtBQXlCdkQ7QUFDQUMsMEJBQXdCdkIsVUFBVWMsTUExQnFCO0FBMkJ2RDtBQUNBVSxvQkFBa0J4QixVQUFVbUIsSUE1QjJCO0FBNkJ2RDtBQUNBTSxxQkFBbUJ6QixVQUFVbUIsSUE5QjBCO0FBK0J2RE8seUJBQXVCMUIsVUFBVW1CLElBL0JzQjtBQWdDdkRRLG1CQUFpQjNCLFVBQVVtQixJQWhDNEI7O0FBa0N2RDtBQUNBO0FBQ0FTLGNBQVk1QixVQUFVNkIsSUFwQ2lDO0FBcUN2RDtBQUNBQyxXQUFTOUIsVUFBVTZCLElBdENvQztBQXVDdkQ7QUFDQUUsY0FBWS9CLFVBQVU2QixJQXhDaUM7QUF5Q3ZEO0FBQ0FHLG1CQUFpQmhDLFVBQVU2QixJQTFDNEI7QUEyQ3ZEO0FBQ0FJLGFBQVdqQyxVQUFVNkIsSUE1Q2tDO0FBNkN2RDtBQUNBSyxlQUFhbEMsVUFBVTZCLElBOUNnQztBQStDdkQ7QUFDQU0sWUFBVW5DLFVBQVU2QixJQWhEbUM7O0FBa0R4RDs7Ozs7Ozs7Ozs7O0FBWUNPLFdBQVNwQyxVQUFVbUIsSUE5RG9DO0FBK0R2RDs7Ozs7Ozs7Ozs7O0FBWUFrQixXQUFTckMsVUFBVW1CLElBM0VvQzs7QUE2RXZEO0FBQ0FtQixlQUFhdEMsVUFBVWMsTUE5RWdDOztBQWdGdkQ7QUFDQXlCLGFBQVd2QyxVQUFVbUIsSUFqRmtDOztBQW1GdkQ7QUFDQTtBQUNBO0FBQ0FxQix5QkFBdUJ4QyxVQUFVeUMsS0FBVixDQUFnQjtBQUNyQzFCLGFBQVNmLFVBQVVjLE1BRGtCO0FBRXJDRCxhQUFTYixVQUFVYyxNQUZrQjtBQUdyQ0csY0FBVWpCLFVBQVVjLE1BSGlCO0FBSXJDRSxjQUFVaEIsVUFBVWM7QUFKaUIsR0FBaEIsQ0F0RmdDO0FBNEZ2RDtBQUNBO0FBQ0E7QUFDQTRCLGVBQWExQyxVQUFVeUMsS0FBVixDQUFnQjtBQUMzQkUsWUFBUTNDLFVBQVU0QyxPQUFWLENBQWtCNUMsVUFBVTZDLE1BQTVCLENBRG1CO0FBRTNCQyxpQkFBYTlDLFVBQVVtQjtBQUZJLEdBQWhCO0FBL0YwQyxDQUF2QyxDQUFsQjs7QUFxR0EsSUFBTTRCLG1CQUFtQixTQUFuQkEsZ0JBQW1CO0FBQUEsTUFBRUMsVUFBRixRQUFFQSxVQUFGO0FBQUEsTUFBY0MsVUFBZCxRQUFjQSxVQUFkO0FBQUEsU0FBOEJELGFBQ3JEeEMsT0FBTzBDLE1BQVAsQ0FBY0MsUUFEdUMsR0FFcERGLGFBQWF6QyxPQUFPMEMsTUFBUCxDQUFjRSxPQUEzQixHQUFxQzVDLE9BQU8wQyxNQUFQLENBQWNHLElBRjdCO0FBQUEsQ0FBekI7O0FBSUEsSUFBTUMsZUFBZTNDLE9BQU9DLE1BQVAsQ0FBYyxFQUFkLEVBQ25CVixVQUFVb0QsWUFEUyxFQUNLbkQsYUFETCxFQUNvQkUsa0JBQWtCaUQsWUFEdEMsRUFFbkI7QUFDRXBDLG9CQUFrQixJQURwQjtBQUVFbUIsV0FBUyxJQUZYO0FBR0VELFdBQVMsSUFIWDs7QUFLRVIsY0FBWSxJQUxkO0FBTUVFLFdBQVMsSUFOWDtBQU9FQyxjQUFZLElBUGQ7QUFRRUMsbUJBQWlCLElBUm5CO0FBU0V1QixtQkFBaUIsSUFUbkI7O0FBV0VqQixlQUFhLENBWGY7QUFZRUMsYUFBV1EsZ0JBWmI7O0FBY0VQLHlCQUF1QnJDO0FBZHpCLENBRm1CLENBQXJCOztBQW9CQSxJQUFNcUQsb0JBQW9CO0FBQ3hCQyxZQUFVekQsVUFBVTBELFVBQVYsQ0FBcUJ0RCxtQkFBckIsQ0FEYztBQUV4QjRDLGNBQVloRCxVQUFVNkIsSUFGRTtBQUd4QjhCLGdCQUFjM0QsVUFBVXNCO0FBSEEsQ0FBMUI7O0lBTXFCc0MsYzs7Ozs7Z0NBRUE7QUFDakIsYUFBTzFELFVBQVUyRCxTQUFWLEVBQVA7QUFDRDs7O0FBRUQsMEJBQVlDLEtBQVosRUFBbUI7QUFBQTs7QUFBQSxnSUFDWEEsS0FEVzs7QUFFakI3RDtBQUNBO0FBQ0FRLGtCQUFjcUQsS0FBZDs7QUFFQSxVQUFLQyxLQUFMLEdBQWE7QUFDWDtBQUNBZixrQkFBWSxLQUZEO0FBR1g7QUFDQUMsa0JBQVk7QUFKRCxLQUFiOztBQU9BO0FBQ0E7QUFDQSxVQUFLZSxZQUFMLEdBQW9CRixNQUFNcEIsV0FBTixJQUFxQixJQUFJbkMsV0FBSixFQUF6Qzs7QUFFQSxVQUFLMEQsYUFBTCxHQUFxQixJQUFJM0QsWUFBSixDQUFpQixJQUFqQixFQUF1QixFQUFDNEQsYUFBYSxJQUFkLEVBQXZCLENBQXJCO0FBakJpQjtBQWtCbEI7Ozs7c0NBRWlCO0FBQ2hCLGFBQU87QUFDTFQsa0JBQVUsSUFBSXJELG1CQUFKLENBQXdCLEtBQUswRCxLQUE3QixDQURMO0FBRUxkLG9CQUFZLEtBQUtlLEtBQUwsQ0FBV2YsVUFGbEI7QUFHTFcsc0JBQWMsS0FBS007QUFIZCxPQUFQO0FBS0Q7Ozt3Q0FFbUI7QUFDbEIsVUFBTU4sZUFBZSxLQUFLTSxhQUExQjs7QUFFQTtBQUNBTixtQkFBYVEsRUFBYixDQUFnQixXQUFoQixFQUE2QixLQUFLQyxZQUFsQztBQUNBVCxtQkFBYVEsRUFBYixDQUFnQixPQUFoQixFQUF5QixLQUFLRSxhQUE5Qjs7QUFFQSxXQUFLTCxZQUFMLENBQWtCTSxVQUFsQixDQUE2QjNELE9BQU9DLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLEtBQUtrRCxLQUF2QixFQUE4QjtBQUN6RFMsdUJBQWUsS0FBS0MseUJBRHFDO0FBRXpEYjtBQUZ5RCxPQUE5QixDQUE3Qjs7QUFLQSxXQUFLYyxrQkFBTCxHQUEwQixJQUFJcEUsaUJBQUosQ0FBc0IsS0FBS3lELEtBQTNCLENBQTFCO0FBQ0Q7Ozt3Q0FFbUJZLFMsRUFBVztBQUM3QixXQUFLVixZQUFMLENBQWtCTSxVQUFsQixDQUE2QkksU0FBN0I7QUFDQSxXQUFLRCxrQkFBTCxDQUF3QkUscUJBQXhCLENBQThDRCxTQUE5QztBQUNEOzs7NkJBRVE7QUFDUCxhQUFPLEtBQUtFLElBQUwsQ0FBVUMsTUFBVixFQUFQO0FBQ0Q7OzswQ0FFcUJDLFEsRUFBVUMsTyxFQUFTO0FBQ3ZDLGFBQU8sS0FBS0gsSUFBTCxDQUFVSSxxQkFBVixDQUFnQ0YsUUFBaEMsRUFBMENDLE9BQTFDLENBQVA7QUFDRDs7QUFFRDs7OztnREFDNEJqQixLLEVBQU87QUFDakMsVUFBTW1CLGFBQWEsU0FBYkEsVUFBYTtBQUFBLGVBQUtDLEVBQUUsQ0FBRixFQUFLQyxXQUFMLEtBQXFCRCxFQUFFRSxLQUFGLENBQVEsQ0FBUixDQUExQjtBQUFBLE9BQW5COztBQURpQyxVQUcxQjVDLHFCQUgwQixHQUdEc0IsS0FIQyxDQUcxQnRCLHFCQUgwQjs7QUFJakMsV0FBSyxJQUFNNkMsUUFBWCxJQUF1QnZCLEtBQXZCLEVBQThCO0FBQzVCLFlBQU13QixzQkFBc0JMLFdBQVdJLFFBQVgsQ0FBNUI7QUFDQSxZQUFNRSxzQkFBb0JELG1CQUExQjtBQUNBLFlBQU1FLHNCQUFvQkYsbUJBQTFCOztBQUVBLFlBQUlDLGVBQWUvQyxxQkFBZixJQUNGc0IsTUFBTXVCLFFBQU4sSUFBa0I3QyxzQkFBc0IrQyxXQUF0QixDQURwQixFQUN3RDtBQUN0RCxpQkFBTyxLQUFQO0FBQ0Q7QUFDRCxZQUFJQyxlQUFlaEQscUJBQWYsSUFDRnNCLE1BQU11QixRQUFOLElBQWtCN0Msc0JBQXNCZ0QsV0FBdEIsQ0FEcEIsRUFDd0Q7QUFDdEQsaUJBQU8sS0FBUDtBQUNEO0FBQ0Y7QUFDRCxhQUFPLElBQVA7QUFDRDs7O3dDQUUyQjtBQUFBLFVBQWRDLEdBQWMsU0FBZEEsR0FBYztBQUFBLFVBQVRDLE1BQVMsU0FBVEEsTUFBUzs7QUFDMUIsVUFBSUMsaUJBQUo7QUFDQSxVQUFJRCxNQUFKLEVBQVk7QUFDVjtBQUNBLFlBQU1FLE9BQU9GLE1BQWI7QUFDQSxZQUFNRyxPQUFPLENBQUMsQ0FBQ0osSUFBSSxDQUFKLElBQVNHLElBQVYsRUFBZ0JILElBQUksQ0FBSixJQUFTRyxJQUF6QixDQUFELEVBQWlDLENBQUNILElBQUksQ0FBSixJQUFTRyxJQUFWLEVBQWdCSCxJQUFJLENBQUosSUFBU0csSUFBekIsQ0FBakMsQ0FBYjtBQUNBRCxtQkFBVyxLQUFLZixJQUFMLENBQVVJLHFCQUFWLENBQWdDYSxJQUFoQyxDQUFYO0FBQ0QsT0FMRCxNQUtPO0FBQ0xGLG1CQUFXLEtBQUtmLElBQUwsQ0FBVUkscUJBQVYsQ0FBZ0NTLEdBQWhDLENBQVg7QUFDRDtBQUNELGFBQU9FLFFBQVA7QUFDRDs7O3FEQUUrQztBQUFBLG1DQUFyQjNDLFVBQXFCO0FBQUEsVUFBckJBLFVBQXFCLG9DQUFSLEtBQVE7O0FBQzlDLFVBQUlBLGVBQWUsS0FBS2UsS0FBTCxDQUFXZixVQUE5QixFQUEwQztBQUN4QyxhQUFLOEMsUUFBTCxDQUFjLEVBQUM5QyxzQkFBRCxFQUFkO0FBQ0Q7QUFDRjs7QUFFRDs7Ozs0QkFDUStDLEssRUFBTztBQUFBLGdDQUNrQkEsS0FEbEIsQ0FDTkMsWUFETTtBQUFBLFVBQ1NDLENBRFQsdUJBQ1NBLENBRFQ7QUFBQSxVQUNZQyxDQURaLHVCQUNZQSxDQURaOztBQUViLGFBQU8sQ0FBQ0QsQ0FBRCxFQUFJQyxDQUFKLENBQVA7QUFDRDs7O2lDQUVZSCxLLEVBQU87QUFDbEIsVUFBSSxDQUFDLEtBQUtoQyxLQUFMLENBQVdmLFVBQWhCLEVBQTRCO0FBQzFCLFlBQU15QyxNQUFNLEtBQUtVLE9BQUwsQ0FBYUosS0FBYixDQUFaO0FBQ0EsWUFBTUosV0FBVyxLQUFLUyxZQUFMLENBQWtCLEVBQUNYLFFBQUQsRUFBTUMsUUFBUSxLQUFLNUIsS0FBTCxDQUFXeEIsV0FBekIsRUFBbEIsQ0FBakI7O0FBRUEsWUFBTVcsYUFBYTBDLFlBQVlBLFNBQVNVLE1BQVQsR0FBa0IsQ0FBakQ7QUFDQSxZQUFJcEQsZUFBZSxLQUFLYyxLQUFMLENBQVdkLFVBQTlCLEVBQTBDO0FBQ3hDLGVBQUs2QyxRQUFMLENBQWMsRUFBQzdDLHNCQUFELEVBQWQ7QUFDRDs7QUFFRCxZQUFJLEtBQUthLEtBQUwsQ0FBVzFCLE9BQWYsRUFBd0I7QUFDdEIsY0FBTXFCLFdBQVcsSUFBSXJELG1CQUFKLENBQXdCLEtBQUswRCxLQUE3QixDQUFqQjtBQUNBaUMsZ0JBQU1PLE1BQU4sR0FBZTdDLFNBQVM4QyxTQUFULENBQW1CZCxHQUFuQixDQUFmO0FBQ0FNLGdCQUFNSixRQUFOLEdBQWlCQSxRQUFqQjs7QUFFQSxlQUFLN0IsS0FBTCxDQUFXMUIsT0FBWCxDQUFtQjJELEtBQW5CO0FBQ0Q7QUFDRjtBQUNGOzs7a0NBRWFBLEssRUFBTztBQUNuQixVQUFJLEtBQUtqQyxLQUFMLENBQVd6QixPQUFmLEVBQXdCO0FBQ3RCLFlBQU1vRCxNQUFNLEtBQUtVLE9BQUwsQ0FBYUosS0FBYixDQUFaO0FBQ0EsWUFBTXRDLFdBQVcsSUFBSXJELG1CQUFKLENBQXdCLEtBQUswRCxLQUE3QixDQUFqQjtBQUNBaUMsY0FBTU8sTUFBTixHQUFlN0MsU0FBUzhDLFNBQVQsQ0FBbUJkLEdBQW5CLENBQWY7QUFDQU0sY0FBTUosUUFBTixHQUFpQixLQUFLUyxZQUFMLENBQWtCLEVBQUNYLFFBQUQsRUFBTUMsUUFBUSxLQUFLNUIsS0FBTCxDQUFXeEIsV0FBekIsRUFBbEIsQ0FBakI7O0FBRUEsYUFBS3dCLEtBQUwsQ0FBV3pCLE9BQVgsQ0FBbUIwRCxLQUFuQjtBQUNEO0FBQ0Y7Ozt1Q0FFa0JTLEcsRUFBSztBQUN0QjtBQUNBLFdBQUt2QyxhQUFMLENBQW1Cd0MsVUFBbkIsQ0FBOEJELEdBQTlCO0FBQ0Q7OztxQ0FFZ0JBLEcsRUFBSztBQUNwQixXQUFLNUIsSUFBTCxHQUFZNEIsR0FBWjtBQUNEOzs7NkJBRVE7QUFBQSxtQkFDNEIsS0FBSzFDLEtBRGpDO0FBQUEsVUFDQTRDLEtBREEsVUFDQUEsS0FEQTtBQUFBLFVBQ09DLE1BRFAsVUFDT0EsTUFEUDtBQUFBLFVBQ2VwRSxTQURmLFVBQ2VBLFNBRGY7OztBQUdQLFVBQU1xRSxtQkFBbUI7QUFDdkJGLG9CQUR1QjtBQUV2QkMsc0JBRnVCO0FBR3ZCRSxrQkFBVSxVQUhhO0FBSXZCQyxnQkFBUXZFLFVBQVUsS0FBS3dCLEtBQWY7QUFKZSxPQUF6Qjs7QUFPQSxhQUNFaEUsY0FBYyxLQUFkLEVBQXFCO0FBQ25CZ0gsYUFBSyxjQURjO0FBRW5CUCxhQUFLLEtBQUtRLGtCQUZTO0FBR25CQyxlQUFPTDtBQUhZLE9BQXJCLEVBS0U3RyxjQUFjRyxTQUFkLEVBQXlCUyxPQUFPQyxNQUFQLENBQWMsRUFBZCxFQUFrQixLQUFLa0QsS0FBdkIsRUFDdkIsS0FBS1csa0JBQUwsSUFBMkIsS0FBS0Esa0JBQUwsQ0FBd0J5Qyx1QkFBeEIsRUFESixFQUV2QjtBQUNFQyxpQkFBUyxLQUFLQywyQkFBTCxDQUFpQyxLQUFLdEQsS0FBdEMsQ0FEWDtBQUVFMEMsYUFBSyxLQUFLYSxnQkFGWjtBQUdFQyxrQkFBVSxLQUFLeEQsS0FBTCxDQUFXd0Q7QUFIdkIsT0FGdUIsQ0FBekIsQ0FMRixDQURGO0FBZ0JEOzs7O0VBL0t5Q3hILGE7O2VBQXZCOEQsYzs7O0FBa0xyQkEsZUFBZTJELFdBQWYsR0FBNkIsZ0JBQTdCO0FBQ0EzRCxlQUFlbEQsU0FBZixHQUEyQkEsU0FBM0I7QUFDQWtELGVBQWVOLFlBQWYsR0FBOEJBLFlBQTlCO0FBQ0FNLGVBQWVKLGlCQUFmLEdBQW1DQSxpQkFBbkMiLCJmaWxlIjoiaW50ZXJhY3RpdmUtbWFwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtQdXJlQ29tcG9uZW50LCBjcmVhdGVFbGVtZW50fSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IGF1dG9iaW5kIGZyb20gJy4uL3V0aWxzL2F1dG9iaW5kJztcblxuaW1wb3J0IFN0YXRpY01hcCBmcm9tICcuL3N0YXRpYy1tYXAnO1xuaW1wb3J0IHtNQVBCT1hfTElNSVRTfSBmcm9tICcuLi91dGlscy9tYXAtc3RhdGUnO1xuaW1wb3J0IFdlYk1lcmNhdG9yVmlld3BvcnQgZnJvbSAndmlld3BvcnQtbWVyY2F0b3ItcHJvamVjdCc7XG5cbmltcG9ydCBUcmFuc2l0aW9uTWFuYWdlciBmcm9tICcuLi91dGlscy90cmFuc2l0aW9uLW1hbmFnZXInO1xuXG5pbXBvcnQge0V2ZW50TWFuYWdlcn0gZnJvbSAnbWpvbG5pci5qcyc7XG5pbXBvcnQgTWFwQ29udHJvbHMgZnJvbSAnLi4vdXRpbHMvbWFwLWNvbnRyb2xzJztcbmltcG9ydCBjb25maWcgZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCBkZXByZWNhdGVXYXJuIGZyb20gJy4uL3V0aWxzL2RlcHJlY2F0ZS13YXJuJztcblxuY29uc3QgcHJvcFR5cGVzID0gT2JqZWN0LmFzc2lnbih7fSwgU3RhdGljTWFwLnByb3BUeXBlcywge1xuICAvLyBBZGRpdGlvbmFsIHByb3BzIG9uIHRvcCBvZiBTdGF0aWNNYXBcblxuICAvKiogVmlld3BvcnQgY29uc3RyYWludHMgKi9cbiAgLy8gTWF4IHpvb20gbGV2ZWxcbiAgbWF4Wm9vbTogUHJvcFR5cGVzLm51bWJlcixcbiAgLy8gTWluIHpvb20gbGV2ZWxcbiAgbWluWm9vbTogUHJvcFR5cGVzLm51bWJlcixcbiAgLy8gTWF4IHBpdGNoIGluIGRlZ3JlZXNcbiAgbWF4UGl0Y2g6IFByb3BUeXBlcy5udW1iZXIsXG4gIC8vIE1pbiBwaXRjaCBpbiBkZWdyZWVzXG4gIG1pblBpdGNoOiBQcm9wVHlwZXMubnVtYmVyLFxuXG4gIC8qKlxuICAgKiBgb25WaWV3cG9ydENoYW5nZWAgY2FsbGJhY2sgaXMgZmlyZWQgd2hlbiB0aGUgdXNlciBpbnRlcmFjdGVkIHdpdGggdGhlXG4gICAqIG1hcC4gVGhlIG9iamVjdCBwYXNzZWQgdG8gdGhlIGNhbGxiYWNrIGNvbnRhaW5zIHZpZXdwb3J0IHByb3BlcnRpZXNcbiAgICogc3VjaCBhcyBgbG9uZ2l0dWRlYCwgYGxhdGl0dWRlYCwgYHpvb21gIGV0Yy5cbiAgICovXG4gIG9uVmlld3BvcnRDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuXG4gIC8qKiBWaWV3cG9ydCB0cmFuc2l0aW9uICoqL1xuICAvLyB0cmFuc2l0aW9uIGR1cmF0aW9uIGZvciB2aWV3cG9ydCBjaGFuZ2VcbiAgdHJhbnNpdGlvbkR1cmF0aW9uOiBQcm9wVHlwZXMubnVtYmVyLFxuICAvLyBUcmFuc2l0aW9uSW50ZXJwb2xhdG9yIGluc3RhbmNlLCBjYW4gYmUgdXNlZCB0byBwZXJmb3JtIGN1c3RvbSB0cmFuc2l0aW9ucy5cbiAgdHJhbnNpdGlvbkludGVycG9sYXRvcjogUHJvcFR5cGVzLm9iamVjdCxcbiAgLy8gdHlwZSBvZiBpbnRlcnJ1cHRpb24gb2YgY3VycmVudCB0cmFuc2l0aW9uIG9uIHVwZGF0ZS5cbiAgdHJhbnNpdGlvbkludGVycnVwdGlvbjogUHJvcFR5cGVzLm51bWJlcixcbiAgLy8gZWFzaW5nIGZ1bmN0aW9uXG4gIHRyYW5zaXRpb25FYXNpbmc6IFByb3BUeXBlcy5mdW5jLFxuICAvLyB0cmFuc2l0aW9uIHN0YXR1cyB1cGRhdGUgZnVuY3Rpb25zXG4gIG9uVHJhbnNpdGlvblN0YXJ0OiBQcm9wVHlwZXMuZnVuYyxcbiAgb25UcmFuc2l0aW9uSW50ZXJydXB0OiBQcm9wVHlwZXMuZnVuYyxcbiAgb25UcmFuc2l0aW9uRW5kOiBQcm9wVHlwZXMuZnVuYyxcblxuICAvKiogRW5hYmxlcyBjb250cm9sIGV2ZW50IGhhbmRsaW5nICovXG4gIC8vIFNjcm9sbCB0byB6b29tXG4gIHNjcm9sbFpvb206IFByb3BUeXBlcy5ib29sLFxuICAvLyBEcmFnIHRvIHBhblxuICBkcmFnUGFuOiBQcm9wVHlwZXMuYm9vbCxcbiAgLy8gRHJhZyB0byByb3RhdGVcbiAgZHJhZ1JvdGF0ZTogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIERvdWJsZSBjbGljayB0byB6b29tXG4gIGRvdWJsZUNsaWNrWm9vbTogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIE11bHRpdG91Y2ggem9vbVxuICB0b3VjaFpvb206IFByb3BUeXBlcy5ib29sLFxuICAvLyBNdWx0aXRvdWNoIHJvdGF0ZVxuICB0b3VjaFJvdGF0ZTogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIEtleWJvYXJkXG4gIGtleWJvYXJkOiBQcm9wVHlwZXMuYm9vbCxcblxuIC8qKlxuICAgICogQ2FsbGVkIHdoZW4gdGhlIG1hcCBpcyBob3ZlcmVkIG92ZXIuXG4gICAgKiBAY2FsbGJhY2tcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCAtIFRoZSBtb3VzZSBldmVudC5cbiAgICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gZXZlbnQubG5nTGF0IC0gVGhlIGNvb3JkaW5hdGVzIG9mIHRoZSBwb2ludGVyXG4gICAgKiBAcGFyYW0ge0FycmF5fSBldmVudC5mZWF0dXJlcyAtIFRoZSBmZWF0dXJlcyB1bmRlciB0aGUgcG9pbnRlciwgdXNpbmcgTWFwYm94J3NcbiAgICAqIHF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyBBUEk6XG4gICAgKiBodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1qcy9hcGkvI01hcCNxdWVyeVJlbmRlcmVkRmVhdHVyZXNcbiAgICAqIFRvIG1ha2UgYSBsYXllciBpbnRlcmFjdGl2ZSwgc2V0IHRoZSBgaW50ZXJhY3RpdmVgIHByb3BlcnR5IGluIHRoZVxuICAgICogbGF5ZXIgc3R5bGUgdG8gYHRydWVgLiBTZWUgTWFwYm94J3Mgc3R5bGUgc3BlY1xuICAgICogaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtc3R5bGUtc3BlYy8jbGF5ZXItaW50ZXJhY3RpdmVcbiAgICAqL1xuICBvbkhvdmVyOiBQcm9wVHlwZXMuZnVuYyxcbiAgLyoqXG4gICAgKiBDYWxsZWQgd2hlbiB0aGUgbWFwIGlzIGNsaWNrZWQuXG4gICAgKiBAY2FsbGJhY2tcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCAtIFRoZSBtb3VzZSBldmVudC5cbiAgICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gZXZlbnQubG5nTGF0IC0gVGhlIGNvb3JkaW5hdGVzIG9mIHRoZSBwb2ludGVyXG4gICAgKiBAcGFyYW0ge0FycmF5fSBldmVudC5mZWF0dXJlcyAtIFRoZSBmZWF0dXJlcyB1bmRlciB0aGUgcG9pbnRlciwgdXNpbmcgTWFwYm94J3NcbiAgICAqIHF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyBBUEk6XG4gICAgKiBodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1qcy9hcGkvI01hcCNxdWVyeVJlbmRlcmVkRmVhdHVyZXNcbiAgICAqIFRvIG1ha2UgYSBsYXllciBpbnRlcmFjdGl2ZSwgc2V0IHRoZSBgaW50ZXJhY3RpdmVgIHByb3BlcnR5IGluIHRoZVxuICAgICogbGF5ZXIgc3R5bGUgdG8gYHRydWVgLiBTZWUgTWFwYm94J3Mgc3R5bGUgc3BlY1xuICAgICogaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtc3R5bGUtc3BlYy8jbGF5ZXItaW50ZXJhY3RpdmVcbiAgICAqL1xuICBvbkNsaWNrOiBQcm9wVHlwZXMuZnVuYyxcblxuICAvKiogUmFkaXVzIHRvIGRldGVjdCBmZWF0dXJlcyBhcm91bmQgYSBjbGlja2VkIHBvaW50LiBEZWZhdWx0cyB0byAwLiAqL1xuICBjbGlja1JhZGl1czogUHJvcFR5cGVzLm51bWJlcixcblxuICAvKiogQWNjZXNzb3IgdGhhdCByZXR1cm5zIGEgY3Vyc29yIHN0eWxlIHRvIHNob3cgaW50ZXJhY3RpdmUgc3RhdGUgKi9cbiAgZ2V0Q3Vyc29yOiBQcm9wVHlwZXMuZnVuYyxcblxuICAvKiogQWR2YW5jZWQgZmVhdHVyZXMgKi9cbiAgLy8gQ29udHJhaW50cyBmb3IgZGlzcGxheWluZyB0aGUgbWFwLiBJZiBub3QgbWV0LCB0aGVuIHRoZSBtYXAgaXMgaGlkZGVuLlxuICAvLyBFeHBlcmltZW50YWwhIE1heSBiZSBjaGFuZ2VkIGluIG1pbm9yIHZlcnNpb24gdXBkYXRlcy5cbiAgdmlzaWJpbGl0eUNvbnN0cmFpbnRzOiBQcm9wVHlwZXMuc2hhcGUoe1xuICAgIG1pblpvb206IFByb3BUeXBlcy5udW1iZXIsXG4gICAgbWF4Wm9vbTogUHJvcFR5cGVzLm51bWJlcixcbiAgICBtaW5QaXRjaDogUHJvcFR5cGVzLm51bWJlcixcbiAgICBtYXhQaXRjaDogUHJvcFR5cGVzLm51bWJlclxuICB9KSxcbiAgLy8gQSBtYXAgY29udHJvbCBpbnN0YW5jZSB0byByZXBsYWNlIHRoZSBkZWZhdWx0IG1hcCBjb250cm9sc1xuICAvLyBUaGUgb2JqZWN0IG11c3QgZXhwb3NlIG9uZSBwcm9wZXJ0eTogYGV2ZW50c2AgYXMgYW4gYXJyYXkgb2Ygc3Vic2NyaWJlZFxuICAvLyBldmVudCBuYW1lczsgYW5kIHR3byBtZXRob2RzOiBgc2V0U3RhdGUoc3RhdGUpYCBhbmQgYGhhbmRsZShldmVudClgXG4gIG1hcENvbnRyb2xzOiBQcm9wVHlwZXMuc2hhcGUoe1xuICAgIGV2ZW50czogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLnN0cmluZyksXG4gICAgaGFuZGxlRXZlbnQ6IFByb3BUeXBlcy5mdW5jXG4gIH0pXG59KTtcblxuY29uc3QgZ2V0RGVmYXVsdEN1cnNvciA9ICh7aXNEcmFnZ2luZywgaXNIb3ZlcmluZ30pID0+IGlzRHJhZ2dpbmcgP1xuICBjb25maWcuQ1VSU09SLkdSQUJCSU5HIDpcbiAgKGlzSG92ZXJpbmcgPyBjb25maWcuQ1VSU09SLlBPSU5URVIgOiBjb25maWcuQ1VSU09SLkdSQUIpO1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LFxuICBTdGF0aWNNYXAuZGVmYXVsdFByb3BzLCBNQVBCT1hfTElNSVRTLCBUcmFuc2l0aW9uTWFuYWdlci5kZWZhdWx0UHJvcHMsXG4gIHtcbiAgICBvblZpZXdwb3J0Q2hhbmdlOiBudWxsLFxuICAgIG9uQ2xpY2s6IG51bGwsXG4gICAgb25Ib3ZlcjogbnVsbCxcblxuICAgIHNjcm9sbFpvb206IHRydWUsXG4gICAgZHJhZ1BhbjogdHJ1ZSxcbiAgICBkcmFnUm90YXRlOiB0cnVlLFxuICAgIGRvdWJsZUNsaWNrWm9vbTogdHJ1ZSxcbiAgICB0b3VjaFpvb21Sb3RhdGU6IHRydWUsXG5cbiAgICBjbGlja1JhZGl1czogMCxcbiAgICBnZXRDdXJzb3I6IGdldERlZmF1bHRDdXJzb3IsXG5cbiAgICB2aXNpYmlsaXR5Q29uc3RyYWludHM6IE1BUEJPWF9MSU1JVFNcbiAgfVxuKTtcblxuY29uc3QgY2hpbGRDb250ZXh0VHlwZXMgPSB7XG4gIHZpZXdwb3J0OiBQcm9wVHlwZXMuaW5zdGFuY2VPZihXZWJNZXJjYXRvclZpZXdwb3J0KSxcbiAgaXNEcmFnZ2luZzogUHJvcFR5cGVzLmJvb2wsXG4gIGV2ZW50TWFuYWdlcjogUHJvcFR5cGVzLm9iamVjdFxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW50ZXJhY3RpdmVNYXAgZXh0ZW5kcyBQdXJlQ29tcG9uZW50IHtcblxuICBzdGF0aWMgc3VwcG9ydGVkKCkge1xuICAgIHJldHVybiBTdGF0aWNNYXAuc3VwcG9ydGVkKCk7XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICBhdXRvYmluZCh0aGlzKTtcbiAgICAvLyBDaGVjayBmb3IgZGVwcmVjYXRlZCBwcm9wc1xuICAgIGRlcHJlY2F0ZVdhcm4ocHJvcHMpO1xuXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIC8vIFdoZXRoZXIgdGhlIGN1cnNvciBpcyBkb3duXG4gICAgICBpc0RyYWdnaW5nOiBmYWxzZSxcbiAgICAgIC8vIFdoZXRoZXIgdGhlIGN1cnNvciBpcyBvdmVyIGEgY2xpY2thYmxlIGZlYXR1cmVcbiAgICAgIGlzSG92ZXJpbmc6IGZhbHNlXG4gICAgfTtcblxuICAgIC8vIElmIHByb3BzLm1hcENvbnRyb2xzIGlzIG5vdCBwcm92aWRlZCwgZmFsbGJhY2sgdG8gZGVmYXVsdCBNYXBDb250cm9scyBpbnN0YW5jZVxuICAgIC8vIENhbm5vdCB1c2UgZGVmYXVsdFByb3BzIGhlcmUgYmVjYXVzZSBpdCBuZWVkcyB0byBiZSBwZXIgbWFwIGluc3RhbmNlXG4gICAgdGhpcy5fbWFwQ29udHJvbHMgPSBwcm9wcy5tYXBDb250cm9scyB8fCBuZXcgTWFwQ29udHJvbHMoKTtcblxuICAgIHRoaXMuX2V2ZW50TWFuYWdlciA9IG5ldyBFdmVudE1hbmFnZXIobnVsbCwge3JpZ2h0QnV0dG9uOiB0cnVlfSk7XG4gIH1cblxuICBnZXRDaGlsZENvbnRleHQoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZpZXdwb3J0OiBuZXcgV2ViTWVyY2F0b3JWaWV3cG9ydCh0aGlzLnByb3BzKSxcbiAgICAgIGlzRHJhZ2dpbmc6IHRoaXMuc3RhdGUuaXNEcmFnZ2luZyxcbiAgICAgIGV2ZW50TWFuYWdlcjogdGhpcy5fZXZlbnRNYW5hZ2VyXG4gICAgfTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGNvbnN0IGV2ZW50TWFuYWdlciA9IHRoaXMuX2V2ZW50TWFuYWdlcjtcblxuICAgIC8vIFJlZ2lzdGVyIGFkZGl0aW9uYWwgZXZlbnQgaGFuZGxlcnMgZm9yIGNsaWNrIGFuZCBob3ZlclxuICAgIGV2ZW50TWFuYWdlci5vbignbW91c2Vtb3ZlJywgdGhpcy5fb25Nb3VzZU1vdmUpO1xuICAgIGV2ZW50TWFuYWdlci5vbignY2xpY2snLCB0aGlzLl9vbk1vdXNlQ2xpY2spO1xuXG4gICAgdGhpcy5fbWFwQ29udHJvbHMuc2V0T3B0aW9ucyhPYmplY3QuYXNzaWduKHt9LCB0aGlzLnByb3BzLCB7XG4gICAgICBvblN0YXRlQ2hhbmdlOiB0aGlzLl9vbkludGVyYWN0aXZlU3RhdGVDaGFuZ2UsXG4gICAgICBldmVudE1hbmFnZXJcbiAgICB9KSk7XG5cbiAgICB0aGlzLl90cmFuc2l0aW9uTWFuYWdlciA9IG5ldyBUcmFuc2l0aW9uTWFuYWdlcih0aGlzLnByb3BzKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVcGRhdGUobmV4dFByb3BzKSB7XG4gICAgdGhpcy5fbWFwQ29udHJvbHMuc2V0T3B0aW9ucyhuZXh0UHJvcHMpO1xuICAgIHRoaXMuX3RyYW5zaXRpb25NYW5hZ2VyLnByb2Nlc3NWaWV3cG9ydENoYW5nZShuZXh0UHJvcHMpO1xuICB9XG5cbiAgZ2V0TWFwKCkge1xuICAgIHJldHVybiB0aGlzLl9tYXAuZ2V0TWFwKCk7XG4gIH1cblxuICBxdWVyeVJlbmRlcmVkRmVhdHVyZXMoZ2VvbWV0cnksIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFwLnF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyhnZW9tZXRyeSwgb3B0aW9ucyk7XG4gIH1cblxuICAvLyBDaGVja3MgYSB2aXNpYmlsaXR5Q29uc3RyYWludHMgb2JqZWN0IHRvIHNlZSBpZiB0aGUgbWFwIHNob3VsZCBiZSBkaXNwbGF5ZWRcbiAgX2NoZWNrVmlzaWJpbGl0eUNvbnN0cmFpbnRzKHByb3BzKSB7XG4gICAgY29uc3QgY2FwaXRhbGl6ZSA9IHMgPT4gc1swXS50b1VwcGVyQ2FzZSgpICsgcy5zbGljZSgxKTtcblxuICAgIGNvbnN0IHt2aXNpYmlsaXR5Q29uc3RyYWludHN9ID0gcHJvcHM7XG4gICAgZm9yIChjb25zdCBwcm9wTmFtZSBpbiBwcm9wcykge1xuICAgICAgY29uc3QgY2FwaXRhbGl6ZWRQcm9wTmFtZSA9IGNhcGl0YWxpemUocHJvcE5hbWUpO1xuICAgICAgY29uc3QgbWluUHJvcE5hbWUgPSBgbWluJHtjYXBpdGFsaXplZFByb3BOYW1lfWA7XG4gICAgICBjb25zdCBtYXhQcm9wTmFtZSA9IGBtYXgke2NhcGl0YWxpemVkUHJvcE5hbWV9YDtcblxuICAgICAgaWYgKG1pblByb3BOYW1lIGluIHZpc2liaWxpdHlDb25zdHJhaW50cyAmJlxuICAgICAgICBwcm9wc1twcm9wTmFtZV0gPCB2aXNpYmlsaXR5Q29uc3RyYWludHNbbWluUHJvcE5hbWVdKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChtYXhQcm9wTmFtZSBpbiB2aXNpYmlsaXR5Q29uc3RyYWludHMgJiZcbiAgICAgICAgcHJvcHNbcHJvcE5hbWVdID4gdmlzaWJpbGl0eUNvbnN0cmFpbnRzW21heFByb3BOYW1lXSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgX2dldEZlYXR1cmVzKHtwb3MsIHJhZGl1c30pIHtcbiAgICBsZXQgZmVhdHVyZXM7XG4gICAgaWYgKHJhZGl1cykge1xuICAgICAgLy8gUmFkaXVzIGVuYWJsZXMgcG9pbnQgZmVhdHVyZXMsIGxpa2UgbWFya2VyIHN5bWJvbHMsIHRvIGJlIGNsaWNrZWQuXG4gICAgICBjb25zdCBzaXplID0gcmFkaXVzO1xuICAgICAgY29uc3QgYmJveCA9IFtbcG9zWzBdIC0gc2l6ZSwgcG9zWzFdICsgc2l6ZV0sIFtwb3NbMF0gKyBzaXplLCBwb3NbMV0gLSBzaXplXV07XG4gICAgICBmZWF0dXJlcyA9IHRoaXMuX21hcC5xdWVyeVJlbmRlcmVkRmVhdHVyZXMoYmJveCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZlYXR1cmVzID0gdGhpcy5fbWFwLnF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyhwb3MpO1xuICAgIH1cbiAgICByZXR1cm4gZmVhdHVyZXM7XG4gIH1cblxuICBfb25JbnRlcmFjdGl2ZVN0YXRlQ2hhbmdlKHtpc0RyYWdnaW5nID0gZmFsc2V9KSB7XG4gICAgaWYgKGlzRHJhZ2dpbmcgIT09IHRoaXMuc3RhdGUuaXNEcmFnZ2luZykge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7aXNEcmFnZ2luZ30pO1xuICAgIH1cbiAgfVxuXG4gIC8vIEhPVkVSIEFORCBDTElDS1xuICBfZ2V0UG9zKGV2ZW50KSB7XG4gICAgY29uc3Qge29mZnNldENlbnRlcjoge3gsIHl9fSA9IGV2ZW50O1xuICAgIHJldHVybiBbeCwgeV07XG4gIH1cblxuICBfb25Nb3VzZU1vdmUoZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuc3RhdGUuaXNEcmFnZ2luZykge1xuICAgICAgY29uc3QgcG9zID0gdGhpcy5fZ2V0UG9zKGV2ZW50KTtcbiAgICAgIGNvbnN0IGZlYXR1cmVzID0gdGhpcy5fZ2V0RmVhdHVyZXMoe3BvcywgcmFkaXVzOiB0aGlzLnByb3BzLmNsaWNrUmFkaXVzfSk7XG5cbiAgICAgIGNvbnN0IGlzSG92ZXJpbmcgPSBmZWF0dXJlcyAmJiBmZWF0dXJlcy5sZW5ndGggPiAwO1xuICAgICAgaWYgKGlzSG92ZXJpbmcgIT09IHRoaXMuc3RhdGUuaXNIb3ZlcmluZykge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtpc0hvdmVyaW5nfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnByb3BzLm9uSG92ZXIpIHtcbiAgICAgICAgY29uc3Qgdmlld3BvcnQgPSBuZXcgV2ViTWVyY2F0b3JWaWV3cG9ydCh0aGlzLnByb3BzKTtcbiAgICAgICAgZXZlbnQubG5nTGF0ID0gdmlld3BvcnQudW5wcm9qZWN0KHBvcyk7XG4gICAgICAgIGV2ZW50LmZlYXR1cmVzID0gZmVhdHVyZXM7XG5cbiAgICAgICAgdGhpcy5wcm9wcy5vbkhvdmVyKGV2ZW50KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfb25Nb3VzZUNsaWNrKGV2ZW50KSB7XG4gICAgaWYgKHRoaXMucHJvcHMub25DbGljaykge1xuICAgICAgY29uc3QgcG9zID0gdGhpcy5fZ2V0UG9zKGV2ZW50KTtcbiAgICAgIGNvbnN0IHZpZXdwb3J0ID0gbmV3IFdlYk1lcmNhdG9yVmlld3BvcnQodGhpcy5wcm9wcyk7XG4gICAgICBldmVudC5sbmdMYXQgPSB2aWV3cG9ydC51bnByb2plY3QocG9zKTtcbiAgICAgIGV2ZW50LmZlYXR1cmVzID0gdGhpcy5fZ2V0RmVhdHVyZXMoe3BvcywgcmFkaXVzOiB0aGlzLnByb3BzLmNsaWNrUmFkaXVzfSk7XG5cbiAgICAgIHRoaXMucHJvcHMub25DbGljayhldmVudCk7XG4gICAgfVxuICB9XG5cbiAgX2V2ZW50Q2FudmFzTG9hZGVkKHJlZikge1xuICAgIC8vIFRoaXMgd2lsbCBiZSBjYWxsZWQgd2l0aCBgbnVsbGAgYWZ0ZXIgdW5tb3VudCwgcmVsZWFzaW5nIGV2ZW50IG1hbmFnZXIgcmVzb3VyY2VcbiAgICB0aGlzLl9ldmVudE1hbmFnZXIuc2V0RWxlbWVudChyZWYpO1xuICB9XG5cbiAgX3N0YXRpY01hcExvYWRlZChyZWYpIHtcbiAgICB0aGlzLl9tYXAgPSByZWY7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge3dpZHRoLCBoZWlnaHQsIGdldEN1cnNvcn0gPSB0aGlzLnByb3BzO1xuXG4gICAgY29uc3QgZXZlbnRDYW52YXNTdHlsZSA9IHtcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXG4gICAgICBjdXJzb3I6IGdldEN1cnNvcih0aGlzLnN0YXRlKVxuICAgIH07XG5cbiAgICByZXR1cm4gKFxuICAgICAgY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBrZXk6ICdtYXAtY29udHJvbHMnLFxuICAgICAgICByZWY6IHRoaXMuX2V2ZW50Q2FudmFzTG9hZGVkLFxuICAgICAgICBzdHlsZTogZXZlbnRDYW52YXNTdHlsZVxuICAgICAgfSxcbiAgICAgICAgY3JlYXRlRWxlbWVudChTdGF0aWNNYXAsIE9iamVjdC5hc3NpZ24oe30sIHRoaXMucHJvcHMsXG4gICAgICAgICAgdGhpcy5fdHJhbnNpdGlvbk1hbmFnZXIgJiYgdGhpcy5fdHJhbnNpdGlvbk1hbmFnZXIuZ2V0Vmlld3BvcnRJblRyYW5zaXRpb24oKSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB2aXNpYmxlOiB0aGlzLl9jaGVja1Zpc2liaWxpdHlDb25zdHJhaW50cyh0aGlzLnByb3BzKSxcbiAgICAgICAgICAgIHJlZjogdGhpcy5fc3RhdGljTWFwTG9hZGVkLFxuICAgICAgICAgICAgY2hpbGRyZW46IHRoaXMucHJvcHMuY2hpbGRyZW5cbiAgICAgICAgICB9XG4gICAgICAgICkpXG4gICAgICApXG4gICAgKTtcbiAgfVxufVxuXG5JbnRlcmFjdGl2ZU1hcC5kaXNwbGF5TmFtZSA9ICdJbnRlcmFjdGl2ZU1hcCc7XG5JbnRlcmFjdGl2ZU1hcC5wcm9wVHlwZXMgPSBwcm9wVHlwZXM7XG5JbnRlcmFjdGl2ZU1hcC5kZWZhdWx0UHJvcHMgPSBkZWZhdWx0UHJvcHM7XG5JbnRlcmFjdGl2ZU1hcC5jaGlsZENvbnRleHRUeXBlcyA9IGNoaWxkQ29udGV4dFR5cGVzO1xuIl19