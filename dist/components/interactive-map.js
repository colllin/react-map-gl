'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _react = require('react');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _autobind = require('../utils/autobind');

var _autobind2 = _interopRequireDefault(_autobind);

var _staticMap = require('./static-map');

var _staticMap2 = _interopRequireDefault(_staticMap);

var _mapState = require('../utils/map-state');

var _viewportMercatorProject = require('viewport-mercator-project');

var _viewportMercatorProject2 = _interopRequireDefault(_viewportMercatorProject);

var _transitionManager = require('../utils/transition-manager');

var _transitionManager2 = _interopRequireDefault(_transitionManager);

var _mjolnir = require('mjolnir.js');

var _mapControls = require('../utils/map-controls');

var _mapControls2 = _interopRequireDefault(_mapControls);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _deprecateWarn = require('../utils/deprecate-warn');

var _deprecateWarn2 = _interopRequireDefault(_deprecateWarn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var propTypes = (0, _assign2.default)({}, _staticMap2.default.propTypes, {
  // Additional props on top of StaticMap

  /** Viewport constraints */
  // Max zoom level
  maxZoom: _propTypes2.default.number,
  // Min zoom level
  minZoom: _propTypes2.default.number,
  // Max pitch in degrees
  maxPitch: _propTypes2.default.number,
  // Min pitch in degrees
  minPitch: _propTypes2.default.number,

  /**
   * `onViewportChange` callback is fired when the user interacted with the
   * map. The object passed to the callback contains viewport properties
   * such as `longitude`, `latitude`, `zoom` etc.
   */
  onViewportChange: _propTypes2.default.func,

  /** Viewport transition **/
  // transition duration for viewport change
  transitionDuration: _propTypes2.default.number,
  // TransitionInterpolator instance, can be used to perform custom transitions.
  transitionInterpolator: _propTypes2.default.object,
  // type of interruption of current transition on update.
  transitionInterruption: _propTypes2.default.number,
  // easing function
  transitionEasing: _propTypes2.default.func,
  // transition status update functions
  onTransitionStart: _propTypes2.default.func,
  onTransitionInterrupt: _propTypes2.default.func,
  onTransitionEnd: _propTypes2.default.func,

  /** Enables control event handling */
  // Scroll to zoom
  scrollZoom: _propTypes2.default.bool,
  // Drag to pan
  dragPan: _propTypes2.default.bool,
  // Drag to rotate
  dragRotate: _propTypes2.default.bool,
  // Double click to zoom
  doubleClickZoom: _propTypes2.default.bool,
  // Multitouch zoom
  touchZoom: _propTypes2.default.bool,
  // Multitouch rotate
  touchRotate: _propTypes2.default.bool,
  // Keyboard
  keyboard: _propTypes2.default.bool,

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
  onHover: _propTypes2.default.func,
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
  onClick: _propTypes2.default.func,

  /** Radius to detect features around a clicked point. Defaults to 0. */
  clickRadius: _propTypes2.default.number,

  /** Accessor that returns a cursor style to show interactive state */
  getCursor: _propTypes2.default.func,

  /** Advanced features */
  // Contraints for displaying the map. If not met, then the map is hidden.
  // Experimental! May be changed in minor version updates.
  visibilityConstraints: _propTypes2.default.shape({
    minZoom: _propTypes2.default.number,
    maxZoom: _propTypes2.default.number,
    minPitch: _propTypes2.default.number,
    maxPitch: _propTypes2.default.number
  }),
  // A map control instance to replace the default map controls
  // The object must expose one property: `events` as an array of subscribed
  // event names; and two methods: `setState(state)` and `handle(event)`
  mapControls: _propTypes2.default.shape({
    events: _propTypes2.default.arrayOf(_propTypes2.default.string),
    handleEvent: _propTypes2.default.func
  })
});

var getDefaultCursor = function getDefaultCursor(_ref) {
  var isDragging = _ref.isDragging,
      isHovering = _ref.isHovering;
  return isDragging ? _config2.default.CURSOR.GRABBING : isHovering ? _config2.default.CURSOR.POINTER : _config2.default.CURSOR.GRAB;
};

var defaultProps = (0, _assign2.default)({}, _staticMap2.default.defaultProps, _mapState.MAPBOX_LIMITS, _transitionManager2.default.defaultProps, {
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

  visibilityConstraints: _mapState.MAPBOX_LIMITS
});

var childContextTypes = {
  viewport: _propTypes2.default.instanceOf(_viewportMercatorProject2.default),
  isDragging: _propTypes2.default.bool,
  eventManager: _propTypes2.default.object
};

var InteractiveMap = function (_PureComponent) {
  (0, _inherits3.default)(InteractiveMap, _PureComponent);
  (0, _createClass3.default)(InteractiveMap, null, [{
    key: 'supported',
    value: function supported() {
      return _staticMap2.default.supported();
    }
  }]);

  function InteractiveMap(props) {
    (0, _classCallCheck3.default)(this, InteractiveMap);

    var _this = (0, _possibleConstructorReturn3.default)(this, (InteractiveMap.__proto__ || (0, _getPrototypeOf2.default)(InteractiveMap)).call(this, props));

    (0, _autobind2.default)(_this);
    // Check for deprecated props
    (0, _deprecateWarn2.default)(props);

    _this.state = {
      // Whether the cursor is down
      isDragging: false,
      // Whether the cursor is over a clickable feature
      isHovering: false
    };

    // If props.mapControls is not provided, fallback to default MapControls instance
    // Cannot use defaultProps here because it needs to be per map instance
    _this._mapControls = props.mapControls || new _mapControls2.default();

    _this._eventManager = new _mjolnir.EventManager(null, { rightButton: true });
    return _this;
  }

  (0, _createClass3.default)(InteractiveMap, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        viewport: new _viewportMercatorProject2.default(this.props),
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

      this._mapControls.setOptions((0, _assign2.default)({}, this.props, {
        onStateChange: this._onInteractiveStateChange,
        eventManager: eventManager
      }));

      this._transitionManager = new _transitionManager2.default(this.props);
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
          var viewport = new _viewportMercatorProject2.default(this.props);
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
        var viewport = new _viewportMercatorProject2.default(this.props);
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

      return (0, _react.createElement)('div', {
        key: 'map-controls',
        ref: this._eventCanvasLoaded,
        style: eventCanvasStyle
      }, (0, _react.createElement)(_staticMap2.default, (0, _assign2.default)({}, this.props, this._transitionManager && this._transitionManager.getViewportInTransition(), {
        visible: this._checkVisibilityConstraints(this.props),
        ref: this._staticMapLoaded,
        children: this.props.children
      })));
    }
  }]);
  return InteractiveMap;
}(_react.PureComponent);

exports.default = InteractiveMap;


InteractiveMap.displayName = 'InteractiveMap';
InteractiveMap.propTypes = propTypes;
InteractiveMap.defaultProps = defaultProps;
InteractiveMap.childContextTypes = childContextTypes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL2ludGVyYWN0aXZlLW1hcC5qcyJdLCJuYW1lcyI6WyJwcm9wVHlwZXMiLCJtYXhab29tIiwibnVtYmVyIiwibWluWm9vbSIsIm1heFBpdGNoIiwibWluUGl0Y2giLCJvblZpZXdwb3J0Q2hhbmdlIiwiZnVuYyIsInRyYW5zaXRpb25EdXJhdGlvbiIsInRyYW5zaXRpb25JbnRlcnBvbGF0b3IiLCJvYmplY3QiLCJ0cmFuc2l0aW9uSW50ZXJydXB0aW9uIiwidHJhbnNpdGlvbkVhc2luZyIsIm9uVHJhbnNpdGlvblN0YXJ0Iiwib25UcmFuc2l0aW9uSW50ZXJydXB0Iiwib25UcmFuc2l0aW9uRW5kIiwic2Nyb2xsWm9vbSIsImJvb2wiLCJkcmFnUGFuIiwiZHJhZ1JvdGF0ZSIsImRvdWJsZUNsaWNrWm9vbSIsInRvdWNoWm9vbSIsInRvdWNoUm90YXRlIiwia2V5Ym9hcmQiLCJvbkhvdmVyIiwib25DbGljayIsImNsaWNrUmFkaXVzIiwiZ2V0Q3Vyc29yIiwidmlzaWJpbGl0eUNvbnN0cmFpbnRzIiwic2hhcGUiLCJtYXBDb250cm9scyIsImV2ZW50cyIsImFycmF5T2YiLCJzdHJpbmciLCJoYW5kbGVFdmVudCIsImdldERlZmF1bHRDdXJzb3IiLCJpc0RyYWdnaW5nIiwiaXNIb3ZlcmluZyIsIkNVUlNPUiIsIkdSQUJCSU5HIiwiUE9JTlRFUiIsIkdSQUIiLCJkZWZhdWx0UHJvcHMiLCJ0b3VjaFpvb21Sb3RhdGUiLCJjaGlsZENvbnRleHRUeXBlcyIsInZpZXdwb3J0IiwiaW5zdGFuY2VPZiIsImV2ZW50TWFuYWdlciIsIkludGVyYWN0aXZlTWFwIiwic3VwcG9ydGVkIiwicHJvcHMiLCJzdGF0ZSIsIl9tYXBDb250cm9scyIsIl9ldmVudE1hbmFnZXIiLCJyaWdodEJ1dHRvbiIsIm9uIiwiX29uTW91c2VNb3ZlIiwiX29uTW91c2VDbGljayIsInNldE9wdGlvbnMiLCJvblN0YXRlQ2hhbmdlIiwiX29uSW50ZXJhY3RpdmVTdGF0ZUNoYW5nZSIsIl90cmFuc2l0aW9uTWFuYWdlciIsIm5leHRQcm9wcyIsInByb2Nlc3NWaWV3cG9ydENoYW5nZSIsIl9tYXAiLCJnZXRNYXAiLCJnZW9tZXRyeSIsIm9wdGlvbnMiLCJxdWVyeVJlbmRlcmVkRmVhdHVyZXMiLCJjYXBpdGFsaXplIiwicyIsInRvVXBwZXJDYXNlIiwic2xpY2UiLCJwcm9wTmFtZSIsImNhcGl0YWxpemVkUHJvcE5hbWUiLCJtaW5Qcm9wTmFtZSIsIm1heFByb3BOYW1lIiwicG9zIiwicmFkaXVzIiwiZmVhdHVyZXMiLCJzaXplIiwiYmJveCIsInNldFN0YXRlIiwiZXZlbnQiLCJvZmZzZXRDZW50ZXIiLCJ4IiwieSIsIl9nZXRQb3MiLCJfZ2V0RmVhdHVyZXMiLCJsZW5ndGgiLCJsbmdMYXQiLCJ1bnByb2plY3QiLCJyZWYiLCJzZXRFbGVtZW50Iiwid2lkdGgiLCJoZWlnaHQiLCJldmVudENhbnZhc1N0eWxlIiwicG9zaXRpb24iLCJjdXJzb3IiLCJrZXkiLCJfZXZlbnRDYW52YXNMb2FkZWQiLCJzdHlsZSIsImdldFZpZXdwb3J0SW5UcmFuc2l0aW9uIiwidmlzaWJsZSIsIl9jaGVja1Zpc2liaWxpdHlDb25zdHJhaW50cyIsIl9zdGF0aWNNYXBMb2FkZWQiLCJjaGlsZHJlbiIsImRpc3BsYXlOYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7OztBQUNBOzs7O0FBRUE7Ozs7QUFDQTs7QUFDQTs7OztBQUVBOzs7O0FBRUE7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFNQSxZQUFZLHNCQUFjLEVBQWQsRUFBa0Isb0JBQVVBLFNBQTVCLEVBQXVDO0FBQ3ZEOztBQUVBO0FBQ0E7QUFDQUMsV0FBUyxvQkFBVUMsTUFMb0M7QUFNdkQ7QUFDQUMsV0FBUyxvQkFBVUQsTUFQb0M7QUFRdkQ7QUFDQUUsWUFBVSxvQkFBVUYsTUFUbUM7QUFVdkQ7QUFDQUcsWUFBVSxvQkFBVUgsTUFYbUM7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RFg7QUFFRTBDLGFBQUssS0FBS2EsZ0JBRlo7QUFHRUMsa0JBQVUsS0FBS3hELEtBQUwsQ0FBV3dEO0FBSHZCLE9BRnVCLENBQXpCLENBTEYsQ0FERjtBQWdCRDs7Ozs7a0JBL0trQjFELGM7OztBQWtMckJBLGVBQWUyRCxXQUFmLEdBQTZCLGdCQUE3QjtBQUNBM0QsZUFBZWhELFNBQWYsR0FBMkJBLFNBQTNCO0FBQ0FnRCxlQUFlTixZQUFmLEdBQThCQSxZQUE5QjtBQUNBTSxlQUFlSixpQkFBZixHQUFtQ0EsaUJBQW5DIiwiZmlsZSI6ImludGVyYWN0aXZlLW1hcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UHVyZUNvbXBvbmVudCwgY3JlYXRlRWxlbWVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBhdXRvYmluZCBmcm9tICcuLi91dGlscy9hdXRvYmluZCc7XG5cbmltcG9ydCBTdGF0aWNNYXAgZnJvbSAnLi9zdGF0aWMtbWFwJztcbmltcG9ydCB7TUFQQk9YX0xJTUlUU30gZnJvbSAnLi4vdXRpbHMvbWFwLXN0YXRlJztcbmltcG9ydCBXZWJNZXJjYXRvclZpZXdwb3J0IGZyb20gJ3ZpZXdwb3J0LW1lcmNhdG9yLXByb2plY3QnO1xuXG5pbXBvcnQgVHJhbnNpdGlvbk1hbmFnZXIgZnJvbSAnLi4vdXRpbHMvdHJhbnNpdGlvbi1tYW5hZ2VyJztcblxuaW1wb3J0IHtFdmVudE1hbmFnZXJ9IGZyb20gJ21qb2xuaXIuanMnO1xuaW1wb3J0IE1hcENvbnRyb2xzIGZyb20gJy4uL3V0aWxzL21hcC1jb250cm9scyc7XG5pbXBvcnQgY29uZmlnIGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQgZGVwcmVjYXRlV2FybiBmcm9tICcuLi91dGlscy9kZXByZWNhdGUtd2Fybic7XG5cbmNvbnN0IHByb3BUeXBlcyA9IE9iamVjdC5hc3NpZ24oe30sIFN0YXRpY01hcC5wcm9wVHlwZXMsIHtcbiAgLy8gQWRkaXRpb25hbCBwcm9wcyBvbiB0b3Agb2YgU3RhdGljTWFwXG5cbiAgLyoqIFZpZXdwb3J0IGNvbnN0cmFpbnRzICovXG4gIC8vIE1heCB6b29tIGxldmVsXG4gIG1heFpvb206IFByb3BUeXBlcy5udW1iZXIsXG4gIC8vIE1pbiB6b29tIGxldmVsXG4gIG1pblpvb206IFByb3BUeXBlcy5udW1iZXIsXG4gIC8vIE1heCBwaXRjaCBpbiBkZWdyZWVzXG4gIG1heFBpdGNoOiBQcm9wVHlwZXMubnVtYmVyLFxuICAvLyBNaW4gcGl0Y2ggaW4gZGVncmVlc1xuICBtaW5QaXRjaDogUHJvcFR5cGVzLm51bWJlcixcblxuICAvKipcbiAgICogYG9uVmlld3BvcnRDaGFuZ2VgIGNhbGxiYWNrIGlzIGZpcmVkIHdoZW4gdGhlIHVzZXIgaW50ZXJhY3RlZCB3aXRoIHRoZVxuICAgKiBtYXAuIFRoZSBvYmplY3QgcGFzc2VkIHRvIHRoZSBjYWxsYmFjayBjb250YWlucyB2aWV3cG9ydCBwcm9wZXJ0aWVzXG4gICAqIHN1Y2ggYXMgYGxvbmdpdHVkZWAsIGBsYXRpdHVkZWAsIGB6b29tYCBldGMuXG4gICAqL1xuICBvblZpZXdwb3J0Q2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcblxuICAvKiogVmlld3BvcnQgdHJhbnNpdGlvbiAqKi9cbiAgLy8gdHJhbnNpdGlvbiBkdXJhdGlvbiBmb3Igdmlld3BvcnQgY2hhbmdlXG4gIHRyYW5zaXRpb25EdXJhdGlvbjogUHJvcFR5cGVzLm51bWJlcixcbiAgLy8gVHJhbnNpdGlvbkludGVycG9sYXRvciBpbnN0YW5jZSwgY2FuIGJlIHVzZWQgdG8gcGVyZm9ybSBjdXN0b20gdHJhbnNpdGlvbnMuXG4gIHRyYW5zaXRpb25JbnRlcnBvbGF0b3I6IFByb3BUeXBlcy5vYmplY3QsXG4gIC8vIHR5cGUgb2YgaW50ZXJydXB0aW9uIG9mIGN1cnJlbnQgdHJhbnNpdGlvbiBvbiB1cGRhdGUuXG4gIHRyYW5zaXRpb25JbnRlcnJ1cHRpb246IFByb3BUeXBlcy5udW1iZXIsXG4gIC8vIGVhc2luZyBmdW5jdGlvblxuICB0cmFuc2l0aW9uRWFzaW5nOiBQcm9wVHlwZXMuZnVuYyxcbiAgLy8gdHJhbnNpdGlvbiBzdGF0dXMgdXBkYXRlIGZ1bmN0aW9uc1xuICBvblRyYW5zaXRpb25TdGFydDogUHJvcFR5cGVzLmZ1bmMsXG4gIG9uVHJhbnNpdGlvbkludGVycnVwdDogUHJvcFR5cGVzLmZ1bmMsXG4gIG9uVHJhbnNpdGlvbkVuZDogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgLyoqIEVuYWJsZXMgY29udHJvbCBldmVudCBoYW5kbGluZyAqL1xuICAvLyBTY3JvbGwgdG8gem9vbVxuICBzY3JvbGxab29tOiBQcm9wVHlwZXMuYm9vbCxcbiAgLy8gRHJhZyB0byBwYW5cbiAgZHJhZ1BhbjogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIERyYWcgdG8gcm90YXRlXG4gIGRyYWdSb3RhdGU6IFByb3BUeXBlcy5ib29sLFxuICAvLyBEb3VibGUgY2xpY2sgdG8gem9vbVxuICBkb3VibGVDbGlja1pvb206IFByb3BUeXBlcy5ib29sLFxuICAvLyBNdWx0aXRvdWNoIHpvb21cbiAgdG91Y2hab29tOiBQcm9wVHlwZXMuYm9vbCxcbiAgLy8gTXVsdGl0b3VjaCByb3RhdGVcbiAgdG91Y2hSb3RhdGU6IFByb3BUeXBlcy5ib29sLFxuICAvLyBLZXlib2FyZFxuICBrZXlib2FyZDogUHJvcFR5cGVzLmJvb2wsXG5cbiAvKipcbiAgICAqIENhbGxlZCB3aGVuIHRoZSBtYXAgaXMgaG92ZXJlZCBvdmVyLlxuICAgICogQGNhbGxiYWNrXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgLSBUaGUgbW91c2UgZXZlbnQuXG4gICAgKiBAcGFyYW0ge1tOdW1iZXIsIE51bWJlcl19IGV2ZW50LmxuZ0xhdCAtIFRoZSBjb29yZGluYXRlcyBvZiB0aGUgcG9pbnRlclxuICAgICogQHBhcmFtIHtBcnJheX0gZXZlbnQuZmVhdHVyZXMgLSBUaGUgZmVhdHVyZXMgdW5kZXIgdGhlIHBvaW50ZXIsIHVzaW5nIE1hcGJveCdzXG4gICAgKiBxdWVyeVJlbmRlcmVkRmVhdHVyZXMgQVBJOlxuICAgICogaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtanMvYXBpLyNNYXAjcXVlcnlSZW5kZXJlZEZlYXR1cmVzXG4gICAgKiBUbyBtYWtlIGEgbGF5ZXIgaW50ZXJhY3RpdmUsIHNldCB0aGUgYGludGVyYWN0aXZlYCBwcm9wZXJ0eSBpbiB0aGVcbiAgICAqIGxheWVyIHN0eWxlIHRvIGB0cnVlYC4gU2VlIE1hcGJveCdzIHN0eWxlIHNwZWNcbiAgICAqIGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLXN0eWxlLXNwZWMvI2xheWVyLWludGVyYWN0aXZlXG4gICAgKi9cbiAgb25Ib3ZlcjogUHJvcFR5cGVzLmZ1bmMsXG4gIC8qKlxuICAgICogQ2FsbGVkIHdoZW4gdGhlIG1hcCBpcyBjbGlja2VkLlxuICAgICogQGNhbGxiYWNrXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgLSBUaGUgbW91c2UgZXZlbnQuXG4gICAgKiBAcGFyYW0ge1tOdW1iZXIsIE51bWJlcl19IGV2ZW50LmxuZ0xhdCAtIFRoZSBjb29yZGluYXRlcyBvZiB0aGUgcG9pbnRlclxuICAgICogQHBhcmFtIHtBcnJheX0gZXZlbnQuZmVhdHVyZXMgLSBUaGUgZmVhdHVyZXMgdW5kZXIgdGhlIHBvaW50ZXIsIHVzaW5nIE1hcGJveCdzXG4gICAgKiBxdWVyeVJlbmRlcmVkRmVhdHVyZXMgQVBJOlxuICAgICogaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtanMvYXBpLyNNYXAjcXVlcnlSZW5kZXJlZEZlYXR1cmVzXG4gICAgKiBUbyBtYWtlIGEgbGF5ZXIgaW50ZXJhY3RpdmUsIHNldCB0aGUgYGludGVyYWN0aXZlYCBwcm9wZXJ0eSBpbiB0aGVcbiAgICAqIGxheWVyIHN0eWxlIHRvIGB0cnVlYC4gU2VlIE1hcGJveCdzIHN0eWxlIHNwZWNcbiAgICAqIGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLXN0eWxlLXNwZWMvI2xheWVyLWludGVyYWN0aXZlXG4gICAgKi9cbiAgb25DbGljazogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgLyoqIFJhZGl1cyB0byBkZXRlY3QgZmVhdHVyZXMgYXJvdW5kIGEgY2xpY2tlZCBwb2ludC4gRGVmYXVsdHMgdG8gMC4gKi9cbiAgY2xpY2tSYWRpdXM6IFByb3BUeXBlcy5udW1iZXIsXG5cbiAgLyoqIEFjY2Vzc29yIHRoYXQgcmV0dXJucyBhIGN1cnNvciBzdHlsZSB0byBzaG93IGludGVyYWN0aXZlIHN0YXRlICovXG4gIGdldEN1cnNvcjogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgLyoqIEFkdmFuY2VkIGZlYXR1cmVzICovXG4gIC8vIENvbnRyYWludHMgZm9yIGRpc3BsYXlpbmcgdGhlIG1hcC4gSWYgbm90IG1ldCwgdGhlbiB0aGUgbWFwIGlzIGhpZGRlbi5cbiAgLy8gRXhwZXJpbWVudGFsISBNYXkgYmUgY2hhbmdlZCBpbiBtaW5vciB2ZXJzaW9uIHVwZGF0ZXMuXG4gIHZpc2liaWxpdHlDb25zdHJhaW50czogUHJvcFR5cGVzLnNoYXBlKHtcbiAgICBtaW5ab29tOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIG1heFpvb206IFByb3BUeXBlcy5udW1iZXIsXG4gICAgbWluUGl0Y2g6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgbWF4UGl0Y2g6IFByb3BUeXBlcy5udW1iZXJcbiAgfSksXG4gIC8vIEEgbWFwIGNvbnRyb2wgaW5zdGFuY2UgdG8gcmVwbGFjZSB0aGUgZGVmYXVsdCBtYXAgY29udHJvbHNcbiAgLy8gVGhlIG9iamVjdCBtdXN0IGV4cG9zZSBvbmUgcHJvcGVydHk6IGBldmVudHNgIGFzIGFuIGFycmF5IG9mIHN1YnNjcmliZWRcbiAgLy8gZXZlbnQgbmFtZXM7IGFuZCB0d28gbWV0aG9kczogYHNldFN0YXRlKHN0YXRlKWAgYW5kIGBoYW5kbGUoZXZlbnQpYFxuICBtYXBDb250cm9sczogUHJvcFR5cGVzLnNoYXBlKHtcbiAgICBldmVudHM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5zdHJpbmcpLFxuICAgIGhhbmRsZUV2ZW50OiBQcm9wVHlwZXMuZnVuY1xuICB9KVxufSk7XG5cbmNvbnN0IGdldERlZmF1bHRDdXJzb3IgPSAoe2lzRHJhZ2dpbmcsIGlzSG92ZXJpbmd9KSA9PiBpc0RyYWdnaW5nID9cbiAgY29uZmlnLkNVUlNPUi5HUkFCQklORyA6XG4gIChpc0hvdmVyaW5nID8gY29uZmlnLkNVUlNPUi5QT0lOVEVSIDogY29uZmlnLkNVUlNPUi5HUkFCKTtcblxuY29uc3QgZGVmYXVsdFByb3BzID0gT2JqZWN0LmFzc2lnbih7fSxcbiAgU3RhdGljTWFwLmRlZmF1bHRQcm9wcywgTUFQQk9YX0xJTUlUUywgVHJhbnNpdGlvbk1hbmFnZXIuZGVmYXVsdFByb3BzLFxuICB7XG4gICAgb25WaWV3cG9ydENoYW5nZTogbnVsbCxcbiAgICBvbkNsaWNrOiBudWxsLFxuICAgIG9uSG92ZXI6IG51bGwsXG5cbiAgICBzY3JvbGxab29tOiB0cnVlLFxuICAgIGRyYWdQYW46IHRydWUsXG4gICAgZHJhZ1JvdGF0ZTogdHJ1ZSxcbiAgICBkb3VibGVDbGlja1pvb206IHRydWUsXG4gICAgdG91Y2hab29tUm90YXRlOiB0cnVlLFxuXG4gICAgY2xpY2tSYWRpdXM6IDAsXG4gICAgZ2V0Q3Vyc29yOiBnZXREZWZhdWx0Q3Vyc29yLFxuXG4gICAgdmlzaWJpbGl0eUNvbnN0cmFpbnRzOiBNQVBCT1hfTElNSVRTXG4gIH1cbik7XG5cbmNvbnN0IGNoaWxkQ29udGV4dFR5cGVzID0ge1xuICB2aWV3cG9ydDogUHJvcFR5cGVzLmluc3RhbmNlT2YoV2ViTWVyY2F0b3JWaWV3cG9ydCksXG4gIGlzRHJhZ2dpbmc6IFByb3BUeXBlcy5ib29sLFxuICBldmVudE1hbmFnZXI6IFByb3BUeXBlcy5vYmplY3Rcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEludGVyYWN0aXZlTWFwIGV4dGVuZHMgUHVyZUNvbXBvbmVudCB7XG5cbiAgc3RhdGljIHN1cHBvcnRlZCgpIHtcbiAgICByZXR1cm4gU3RhdGljTWFwLnN1cHBvcnRlZCgpO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgYXV0b2JpbmQodGhpcyk7XG4gICAgLy8gQ2hlY2sgZm9yIGRlcHJlY2F0ZWQgcHJvcHNcbiAgICBkZXByZWNhdGVXYXJuKHByb3BzKTtcblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAvLyBXaGV0aGVyIHRoZSBjdXJzb3IgaXMgZG93blxuICAgICAgaXNEcmFnZ2luZzogZmFsc2UsXG4gICAgICAvLyBXaGV0aGVyIHRoZSBjdXJzb3IgaXMgb3ZlciBhIGNsaWNrYWJsZSBmZWF0dXJlXG4gICAgICBpc0hvdmVyaW5nOiBmYWxzZVxuICAgIH07XG5cbiAgICAvLyBJZiBwcm9wcy5tYXBDb250cm9scyBpcyBub3QgcHJvdmlkZWQsIGZhbGxiYWNrIHRvIGRlZmF1bHQgTWFwQ29udHJvbHMgaW5zdGFuY2VcbiAgICAvLyBDYW5ub3QgdXNlIGRlZmF1bHRQcm9wcyBoZXJlIGJlY2F1c2UgaXQgbmVlZHMgdG8gYmUgcGVyIG1hcCBpbnN0YW5jZVxuICAgIHRoaXMuX21hcENvbnRyb2xzID0gcHJvcHMubWFwQ29udHJvbHMgfHwgbmV3IE1hcENvbnRyb2xzKCk7XG5cbiAgICB0aGlzLl9ldmVudE1hbmFnZXIgPSBuZXcgRXZlbnRNYW5hZ2VyKG51bGwsIHtyaWdodEJ1dHRvbjogdHJ1ZX0pO1xuICB9XG5cbiAgZ2V0Q2hpbGRDb250ZXh0KCkge1xuICAgIHJldHVybiB7XG4gICAgICB2aWV3cG9ydDogbmV3IFdlYk1lcmNhdG9yVmlld3BvcnQodGhpcy5wcm9wcyksXG4gICAgICBpc0RyYWdnaW5nOiB0aGlzLnN0YXRlLmlzRHJhZ2dpbmcsXG4gICAgICBldmVudE1hbmFnZXI6IHRoaXMuX2V2ZW50TWFuYWdlclxuICAgIH07XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICBjb25zdCBldmVudE1hbmFnZXIgPSB0aGlzLl9ldmVudE1hbmFnZXI7XG5cbiAgICAvLyBSZWdpc3RlciBhZGRpdGlvbmFsIGV2ZW50IGhhbmRsZXJzIGZvciBjbGljayBhbmQgaG92ZXJcbiAgICBldmVudE1hbmFnZXIub24oJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VNb3ZlKTtcbiAgICBldmVudE1hbmFnZXIub24oJ2NsaWNrJywgdGhpcy5fb25Nb3VzZUNsaWNrKTtcblxuICAgIHRoaXMuX21hcENvbnRyb2xzLnNldE9wdGlvbnMoT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5wcm9wcywge1xuICAgICAgb25TdGF0ZUNoYW5nZTogdGhpcy5fb25JbnRlcmFjdGl2ZVN0YXRlQ2hhbmdlLFxuICAgICAgZXZlbnRNYW5hZ2VyXG4gICAgfSkpO1xuXG4gICAgdGhpcy5fdHJhbnNpdGlvbk1hbmFnZXIgPSBuZXcgVHJhbnNpdGlvbk1hbmFnZXIodGhpcy5wcm9wcyk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVXBkYXRlKG5leHRQcm9wcykge1xuICAgIHRoaXMuX21hcENvbnRyb2xzLnNldE9wdGlvbnMobmV4dFByb3BzKTtcbiAgICB0aGlzLl90cmFuc2l0aW9uTWFuYWdlci5wcm9jZXNzVmlld3BvcnRDaGFuZ2UobmV4dFByb3BzKTtcbiAgfVxuXG4gIGdldE1hcCgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFwLmdldE1hcCgpO1xuICB9XG5cbiAgcXVlcnlSZW5kZXJlZEZlYXR1cmVzKGdlb21ldHJ5LCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcC5xdWVyeVJlbmRlcmVkRmVhdHVyZXMoZ2VvbWV0cnksIG9wdGlvbnMpO1xuICB9XG5cbiAgLy8gQ2hlY2tzIGEgdmlzaWJpbGl0eUNvbnN0cmFpbnRzIG9iamVjdCB0byBzZWUgaWYgdGhlIG1hcCBzaG91bGQgYmUgZGlzcGxheWVkXG4gIF9jaGVja1Zpc2liaWxpdHlDb25zdHJhaW50cyhwcm9wcykge1xuICAgIGNvbnN0IGNhcGl0YWxpemUgPSBzID0+IHNbMF0udG9VcHBlckNhc2UoKSArIHMuc2xpY2UoMSk7XG5cbiAgICBjb25zdCB7dmlzaWJpbGl0eUNvbnN0cmFpbnRzfSA9IHByb3BzO1xuICAgIGZvciAoY29uc3QgcHJvcE5hbWUgaW4gcHJvcHMpIHtcbiAgICAgIGNvbnN0IGNhcGl0YWxpemVkUHJvcE5hbWUgPSBjYXBpdGFsaXplKHByb3BOYW1lKTtcbiAgICAgIGNvbnN0IG1pblByb3BOYW1lID0gYG1pbiR7Y2FwaXRhbGl6ZWRQcm9wTmFtZX1gO1xuICAgICAgY29uc3QgbWF4UHJvcE5hbWUgPSBgbWF4JHtjYXBpdGFsaXplZFByb3BOYW1lfWA7XG5cbiAgICAgIGlmIChtaW5Qcm9wTmFtZSBpbiB2aXNpYmlsaXR5Q29uc3RyYWludHMgJiZcbiAgICAgICAgcHJvcHNbcHJvcE5hbWVdIDwgdmlzaWJpbGl0eUNvbnN0cmFpbnRzW21pblByb3BOYW1lXSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAobWF4UHJvcE5hbWUgaW4gdmlzaWJpbGl0eUNvbnN0cmFpbnRzICYmXG4gICAgICAgIHByb3BzW3Byb3BOYW1lXSA+IHZpc2liaWxpdHlDb25zdHJhaW50c1ttYXhQcm9wTmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIF9nZXRGZWF0dXJlcyh7cG9zLCByYWRpdXN9KSB7XG4gICAgbGV0IGZlYXR1cmVzO1xuICAgIGlmIChyYWRpdXMpIHtcbiAgICAgIC8vIFJhZGl1cyBlbmFibGVzIHBvaW50IGZlYXR1cmVzLCBsaWtlIG1hcmtlciBzeW1ib2xzLCB0byBiZSBjbGlja2VkLlxuICAgICAgY29uc3Qgc2l6ZSA9IHJhZGl1cztcbiAgICAgIGNvbnN0IGJib3ggPSBbW3Bvc1swXSAtIHNpemUsIHBvc1sxXSArIHNpemVdLCBbcG9zWzBdICsgc2l6ZSwgcG9zWzFdIC0gc2l6ZV1dO1xuICAgICAgZmVhdHVyZXMgPSB0aGlzLl9tYXAucXVlcnlSZW5kZXJlZEZlYXR1cmVzKGJib3gpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmZWF0dXJlcyA9IHRoaXMuX21hcC5xdWVyeVJlbmRlcmVkRmVhdHVyZXMocG9zKTtcbiAgICB9XG4gICAgcmV0dXJuIGZlYXR1cmVzO1xuICB9XG5cbiAgX29uSW50ZXJhY3RpdmVTdGF0ZUNoYW5nZSh7aXNEcmFnZ2luZyA9IGZhbHNlfSkge1xuICAgIGlmIChpc0RyYWdnaW5nICE9PSB0aGlzLnN0YXRlLmlzRHJhZ2dpbmcpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe2lzRHJhZ2dpbmd9KTtcbiAgICB9XG4gIH1cblxuICAvLyBIT1ZFUiBBTkQgQ0xJQ0tcbiAgX2dldFBvcyhldmVudCkge1xuICAgIGNvbnN0IHtvZmZzZXRDZW50ZXI6IHt4LCB5fX0gPSBldmVudDtcbiAgICByZXR1cm4gW3gsIHldO1xuICB9XG5cbiAgX29uTW91c2VNb3ZlKGV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLmlzRHJhZ2dpbmcpIHtcbiAgICAgIGNvbnN0IHBvcyA9IHRoaXMuX2dldFBvcyhldmVudCk7XG4gICAgICBjb25zdCBmZWF0dXJlcyA9IHRoaXMuX2dldEZlYXR1cmVzKHtwb3MsIHJhZGl1czogdGhpcy5wcm9wcy5jbGlja1JhZGl1c30pO1xuXG4gICAgICBjb25zdCBpc0hvdmVyaW5nID0gZmVhdHVyZXMgJiYgZmVhdHVyZXMubGVuZ3RoID4gMDtcbiAgICAgIGlmIChpc0hvdmVyaW5nICE9PSB0aGlzLnN0YXRlLmlzSG92ZXJpbmcpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aXNIb3ZlcmluZ30pO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5wcm9wcy5vbkhvdmVyKSB7XG4gICAgICAgIGNvbnN0IHZpZXdwb3J0ID0gbmV3IFdlYk1lcmNhdG9yVmlld3BvcnQodGhpcy5wcm9wcyk7XG4gICAgICAgIGV2ZW50LmxuZ0xhdCA9IHZpZXdwb3J0LnVucHJvamVjdChwb3MpO1xuICAgICAgICBldmVudC5mZWF0dXJlcyA9IGZlYXR1cmVzO1xuXG4gICAgICAgIHRoaXMucHJvcHMub25Ib3ZlcihldmVudCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX29uTW91c2VDbGljayhldmVudCkge1xuICAgIGlmICh0aGlzLnByb3BzLm9uQ2xpY2spIHtcbiAgICAgIGNvbnN0IHBvcyA9IHRoaXMuX2dldFBvcyhldmVudCk7XG4gICAgICBjb25zdCB2aWV3cG9ydCA9IG5ldyBXZWJNZXJjYXRvclZpZXdwb3J0KHRoaXMucHJvcHMpO1xuICAgICAgZXZlbnQubG5nTGF0ID0gdmlld3BvcnQudW5wcm9qZWN0KHBvcyk7XG4gICAgICBldmVudC5mZWF0dXJlcyA9IHRoaXMuX2dldEZlYXR1cmVzKHtwb3MsIHJhZGl1czogdGhpcy5wcm9wcy5jbGlja1JhZGl1c30pO1xuXG4gICAgICB0aGlzLnByb3BzLm9uQ2xpY2soZXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIF9ldmVudENhbnZhc0xvYWRlZChyZWYpIHtcbiAgICAvLyBUaGlzIHdpbGwgYmUgY2FsbGVkIHdpdGggYG51bGxgIGFmdGVyIHVubW91bnQsIHJlbGVhc2luZyBldmVudCBtYW5hZ2VyIHJlc291cmNlXG4gICAgdGhpcy5fZXZlbnRNYW5hZ2VyLnNldEVsZW1lbnQocmVmKTtcbiAgfVxuXG4gIF9zdGF0aWNNYXBMb2FkZWQocmVmKSB7XG4gICAgdGhpcy5fbWFwID0gcmVmO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHt3aWR0aCwgaGVpZ2h0LCBnZXRDdXJzb3J9ID0gdGhpcy5wcm9wcztcblxuICAgIGNvbnN0IGV2ZW50Q2FudmFzU3R5bGUgPSB7XG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuICAgICAgY3Vyc29yOiBnZXRDdXJzb3IodGhpcy5zdGF0ZSlcbiAgICB9O1xuXG4gICAgcmV0dXJuIChcbiAgICAgIGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAga2V5OiAnbWFwLWNvbnRyb2xzJyxcbiAgICAgICAgcmVmOiB0aGlzLl9ldmVudENhbnZhc0xvYWRlZCxcbiAgICAgICAgc3R5bGU6IGV2ZW50Q2FudmFzU3R5bGVcbiAgICAgIH0sXG4gICAgICAgIGNyZWF0ZUVsZW1lbnQoU3RhdGljTWFwLCBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnByb3BzLFxuICAgICAgICAgIHRoaXMuX3RyYW5zaXRpb25NYW5hZ2VyICYmIHRoaXMuX3RyYW5zaXRpb25NYW5hZ2VyLmdldFZpZXdwb3J0SW5UcmFuc2l0aW9uKCksXG4gICAgICAgICAge1xuICAgICAgICAgICAgdmlzaWJsZTogdGhpcy5fY2hlY2tWaXNpYmlsaXR5Q29uc3RyYWludHModGhpcy5wcm9wcyksXG4gICAgICAgICAgICByZWY6IHRoaXMuX3N0YXRpY01hcExvYWRlZCxcbiAgICAgICAgICAgIGNoaWxkcmVuOiB0aGlzLnByb3BzLmNoaWxkcmVuXG4gICAgICAgICAgfVxuICAgICAgICApKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn1cblxuSW50ZXJhY3RpdmVNYXAuZGlzcGxheU5hbWUgPSAnSW50ZXJhY3RpdmVNYXAnO1xuSW50ZXJhY3RpdmVNYXAucHJvcFR5cGVzID0gcHJvcFR5cGVzO1xuSW50ZXJhY3RpdmVNYXAuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuSW50ZXJhY3RpdmVNYXAuY2hpbGRDb250ZXh0VHlwZXMgPSBjaGlsZENvbnRleHRUeXBlcztcbiJdfQ==