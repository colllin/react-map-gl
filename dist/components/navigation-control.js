'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _react = require('react');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _baseControl = require('./base-control');

var _baseControl2 = _interopRequireDefault(_baseControl);

var _autobind = require('../utils/autobind');

var _autobind2 = _interopRequireDefault(_autobind);

var _mapState = require('../utils/map-state');

var _mapState2 = _interopRequireDefault(_mapState);

var _transitionManager = require('../utils/transition-manager');

var _transitionManager2 = _interopRequireDefault(_transitionManager);

var _deprecateWarn = require('../utils/deprecate-warn');

var _deprecateWarn2 = _interopRequireDefault(_deprecateWarn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LINEAR_TRANSITION_PROPS = (0, _assign2.default)({}, _transitionManager2.default.defaultProps, {
  transitionDuration: 300
});

var propTypes = (0, _assign2.default)({}, _baseControl2.default.propTypes, {
  // Custom className
  className: _propTypes2.default.string,
  /**
    * `onViewportChange` callback is fired when the user interacted with the
    * map. The object passed to the callback contains `latitude`,
    * `longitude` and `zoom` and additional state information.
    */
  onViewportChange: _propTypes2.default.func.isRequired
});

var defaultProps = (0, _assign2.default)({}, _baseControl2.default.defaultProps, {
  className: '',
  onViewportChange: function onViewportChange() {}
});

/*
 * PureComponent doesn't update when context changes, so
 * implementing our own shouldComponentUpdate here.
 */

var NavigationControl = function (_BaseControl) {
  (0, _inherits3.default)(NavigationControl, _BaseControl);

  function NavigationControl(props) {
    (0, _classCallCheck3.default)(this, NavigationControl);

    var _this = (0, _possibleConstructorReturn3.default)(this, (NavigationControl.__proto__ || (0, _getPrototypeOf2.default)(NavigationControl)).call(this, props));

    (0, _autobind2.default)(_this);
    // Check for deprecated props
    (0, _deprecateWarn2.default)(props);
    return _this;
  }

  (0, _createClass3.default)(NavigationControl, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState, nextContext) {
      return this.context.viewport.bearing !== nextContext.viewport.bearing;
    }
  }, {
    key: '_updateViewport',
    value: function _updateViewport(opts) {
      var viewport = this.context.viewport;

      var mapState = new _mapState2.default((0, _assign2.default)({}, viewport, opts));
      // TODO(deprecate): remove this check when `onChangeViewport` gets deprecated
      var onViewportChange = this.props.onChangeViewport || this.props.onViewportChange;
      var newViewport = (0, _assign2.default)({}, mapState.getViewportProps(), LINEAR_TRANSITION_PROPS);

      onViewportChange(newViewport);
    }
  }, {
    key: '_onZoomIn',
    value: function _onZoomIn() {
      this._updateViewport({ zoom: this.context.viewport.zoom + 1 });
    }
  }, {
    key: '_onZoomOut',
    value: function _onZoomOut() {
      this._updateViewport({ zoom: this.context.viewport.zoom - 1 });
    }
  }, {
    key: '_onResetNorth',
    value: function _onResetNorth() {
      this._updateViewport({ bearing: 0, pitch: 0 });
    }
  }, {
    key: '_renderCompass',
    value: function _renderCompass() {
      var bearing = this.context.viewport.bearing;

      return (0, _react.createElement)('span', {
        className: 'mapboxgl-ctrl-compass-arrow',
        style: { transform: 'rotate(' + bearing + 'deg)' }
      });
    }
  }, {
    key: '_renderButton',
    value: function _renderButton(type, label, callback, children) {
      return (0, _react.createElement)('button', {
        key: type,
        className: 'mapboxgl-ctrl-icon mapboxgl-ctrl-' + type,
        type: 'button',
        title: label,
        onClick: callback,
        children: children
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var className = this.props.className;


      return (0, _react.createElement)('div', {
        className: 'mapboxgl-ctrl mapboxgl-ctrl-group ' + className,
        ref: this._onContainerLoad
      }, [this._renderButton('zoom-in', 'Zoom In', this._onZoomIn), this._renderButton('zoom-out', 'Zoom Out', this._onZoomOut), this._renderButton('compass', 'Reset North', this._onResetNorth, this._renderCompass())]);
    }
  }]);
  return NavigationControl;
}(_baseControl2.default);

exports.default = NavigationControl;


NavigationControl.displayName = 'NavigationControl';
NavigationControl.propTypes = propTypes;
NavigationControl.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL25hdmlnYXRpb24tY29udHJvbC5qcyJdLCJuYW1lcyI6WyJMSU5FQVJfVFJBTlNJVElPTl9QUk9QUyIsImRlZmF1bHRQcm9wcyIsInRyYW5zaXRpb25EdXJhdGlvbiIsInByb3BUeXBlcyIsImNsYXNzTmFtZSIsInN0cmluZyIsIm9uVmlld3BvcnRDaGFuZ2UiLCJmdW5jIiwiaXNSZXF1aXJlZCIsIk5hdmlnYXRpb25Db250cm9sIiwicHJvcHMiLCJuZXh0UHJvcHMiLCJuZXh0U3RhdGUiLCJuZXh0Q29udGV4dCIsImNvbnRleHQiLCJ2aWV3cG9ydCIsImJlYXJpbmciLCJvcHRzIiwibWFwU3RhdGUiLCJvbkNoYW5nZVZpZXdwb3J0IiwibmV3Vmlld3BvcnQiLCJnZXRWaWV3cG9ydFByb3BzIiwiX3VwZGF0ZVZpZXdwb3J0Iiwiem9vbSIsInBpdGNoIiwic3R5bGUiLCJ0cmFuc2Zvcm0iLCJ0eXBlIiwibGFiZWwiLCJjYWxsYmFjayIsImNoaWxkcmVuIiwia2V5IiwidGl0bGUiLCJvbkNsaWNrIiwicmVmIiwiX29uQ29udGFpbmVyTG9hZCIsIl9yZW5kZXJCdXR0b24iLCJfb25ab29tSW4iLCJfb25ab29tT3V0IiwiX29uUmVzZXROb3J0aCIsIl9yZW5kZXJDb21wYXNzIiwiZGlzcGxheU5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFFQTs7Ozs7O0FBRUEsSUFBTUEsMEJBQTBCLHNCQUFjLEVBQWQsRUFBa0IsNEJBQWtCQyxZQUFwQyxFQUFrRDtBQUNoRkMsc0JBQW9CO0FBRDRELENBQWxELENBQWhDOztBQUlBLElBQU1DLFlBQVksc0JBQWMsRUFBZCxFQUFrQixzQkFBWUEsU0FBOUIsRUFBeUM7QUFDekQ7QUFDQUMsYUFBVyxvQkFBVUMsTUFGb0M7QUFHekQ7Ozs7O0FBS0FDLG9CQUFrQixv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Q0EsWUFBakMiLCJmaWxlIjoibmF2aWdhdGlvbi1jb250cm9sLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjcmVhdGVFbGVtZW50fSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IEJhc2VDb250cm9sIGZyb20gJy4vYmFzZS1jb250cm9sJztcbmltcG9ydCBhdXRvYmluZCBmcm9tICcuLi91dGlscy9hdXRvYmluZCc7XG5cbmltcG9ydCBNYXBTdGF0ZSBmcm9tICcuLi91dGlscy9tYXAtc3RhdGUnO1xuaW1wb3J0IFRyYW5zaXRpb25NYW5hZ2VyIGZyb20gJy4uL3V0aWxzL3RyYW5zaXRpb24tbWFuYWdlcic7XG5cbmltcG9ydCBkZXByZWNhdGVXYXJuIGZyb20gJy4uL3V0aWxzL2RlcHJlY2F0ZS13YXJuJztcblxuY29uc3QgTElORUFSX1RSQU5TSVRJT05fUFJPUFMgPSBPYmplY3QuYXNzaWduKHt9LCBUcmFuc2l0aW9uTWFuYWdlci5kZWZhdWx0UHJvcHMsIHtcbiAgdHJhbnNpdGlvbkR1cmF0aW9uOiAzMDBcbn0pO1xuXG5jb25zdCBwcm9wVHlwZXMgPSBPYmplY3QuYXNzaWduKHt9LCBCYXNlQ29udHJvbC5wcm9wVHlwZXMsIHtcbiAgLy8gQ3VzdG9tIGNsYXNzTmFtZVxuICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gIC8qKlxuICAgICogYG9uVmlld3BvcnRDaGFuZ2VgIGNhbGxiYWNrIGlzIGZpcmVkIHdoZW4gdGhlIHVzZXIgaW50ZXJhY3RlZCB3aXRoIHRoZVxuICAgICogbWFwLiBUaGUgb2JqZWN0IHBhc3NlZCB0byB0aGUgY2FsbGJhY2sgY29udGFpbnMgYGxhdGl0dWRlYCxcbiAgICAqIGBsb25naXR1ZGVgIGFuZCBgem9vbWAgYW5kIGFkZGl0aW9uYWwgc3RhdGUgaW5mb3JtYXRpb24uXG4gICAgKi9cbiAgb25WaWV3cG9ydENoYW5nZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZFxufSk7XG5cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIEJhc2VDb250cm9sLmRlZmF1bHRQcm9wcywge1xuICBjbGFzc05hbWU6ICcnLFxuICBvblZpZXdwb3J0Q2hhbmdlOiAoKSA9PiB7fVxufSk7XG5cbi8qXG4gKiBQdXJlQ29tcG9uZW50IGRvZXNuJ3QgdXBkYXRlIHdoZW4gY29udGV4dCBjaGFuZ2VzLCBzb1xuICogaW1wbGVtZW50aW5nIG91ciBvd24gc2hvdWxkQ29tcG9uZW50VXBkYXRlIGhlcmUuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5hdmlnYXRpb25Db250cm9sIGV4dGVuZHMgQmFzZUNvbnRyb2wge1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIGF1dG9iaW5kKHRoaXMpO1xuICAgIC8vIENoZWNrIGZvciBkZXByZWNhdGVkIHByb3BzXG4gICAgZGVwcmVjYXRlV2Fybihwcm9wcyk7XG4gIH1cblxuICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzLCBuZXh0U3RhdGUsIG5leHRDb250ZXh0KSB7XG4gICAgcmV0dXJuIHRoaXMuY29udGV4dC52aWV3cG9ydC5iZWFyaW5nICE9PSBuZXh0Q29udGV4dC52aWV3cG9ydC5iZWFyaW5nO1xuICB9XG5cbiAgX3VwZGF0ZVZpZXdwb3J0KG9wdHMpIHtcbiAgICBjb25zdCB7dmlld3BvcnR9ID0gdGhpcy5jb250ZXh0O1xuICAgIGNvbnN0IG1hcFN0YXRlID0gbmV3IE1hcFN0YXRlKE9iamVjdC5hc3NpZ24oe30sIHZpZXdwb3J0LCBvcHRzKSk7XG4gICAgLy8gVE9ETyhkZXByZWNhdGUpOiByZW1vdmUgdGhpcyBjaGVjayB3aGVuIGBvbkNoYW5nZVZpZXdwb3J0YCBnZXRzIGRlcHJlY2F0ZWRcbiAgICBjb25zdCBvblZpZXdwb3J0Q2hhbmdlID0gdGhpcy5wcm9wcy5vbkNoYW5nZVZpZXdwb3J0IHx8IHRoaXMucHJvcHMub25WaWV3cG9ydENoYW5nZTtcbiAgICBjb25zdCBuZXdWaWV3cG9ydCA9IE9iamVjdC5hc3NpZ24oe30sIG1hcFN0YXRlLmdldFZpZXdwb3J0UHJvcHMoKSwgTElORUFSX1RSQU5TSVRJT05fUFJPUFMpO1xuXG4gICAgb25WaWV3cG9ydENoYW5nZShuZXdWaWV3cG9ydCk7XG4gIH1cblxuICBfb25ab29tSW4oKSB7XG4gICAgdGhpcy5fdXBkYXRlVmlld3BvcnQoe3pvb206IHRoaXMuY29udGV4dC52aWV3cG9ydC56b29tICsgMX0pO1xuICB9XG5cbiAgX29uWm9vbU91dCgpIHtcbiAgICB0aGlzLl91cGRhdGVWaWV3cG9ydCh7em9vbTogdGhpcy5jb250ZXh0LnZpZXdwb3J0Lnpvb20gLSAxfSk7XG4gIH1cblxuICBfb25SZXNldE5vcnRoKCkge1xuICAgIHRoaXMuX3VwZGF0ZVZpZXdwb3J0KHtiZWFyaW5nOiAwLCBwaXRjaDogMH0pO1xuICB9XG5cbiAgX3JlbmRlckNvbXBhc3MoKSB7XG4gICAgY29uc3Qge2JlYXJpbmd9ID0gdGhpcy5jb250ZXh0LnZpZXdwb3J0O1xuICAgIHJldHVybiBjcmVhdGVFbGVtZW50KCdzcGFuJywge1xuICAgICAgY2xhc3NOYW1lOiAnbWFwYm94Z2wtY3RybC1jb21wYXNzLWFycm93JyxcbiAgICAgIHN0eWxlOiB7dHJhbnNmb3JtOiBgcm90YXRlKCR7YmVhcmluZ31kZWcpYH1cbiAgICB9KTtcbiAgfVxuXG4gIF9yZW5kZXJCdXR0b24odHlwZSwgbGFiZWwsIGNhbGxiYWNrLCBjaGlsZHJlbikge1xuICAgIHJldHVybiBjcmVhdGVFbGVtZW50KCdidXR0b24nLCB7XG4gICAgICBrZXk6IHR5cGUsXG4gICAgICBjbGFzc05hbWU6IGBtYXBib3hnbC1jdHJsLWljb24gbWFwYm94Z2wtY3RybC0ke3R5cGV9YCxcbiAgICAgIHR5cGU6ICdidXR0b24nLFxuICAgICAgdGl0bGU6IGxhYmVsLFxuICAgICAgb25DbGljazogY2FsbGJhY2ssXG4gICAgICBjaGlsZHJlblxuICAgIH0pO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuXG4gICAgY29uc3Qge2NsYXNzTmFtZX0gPSB0aGlzLnByb3BzO1xuXG4gICAgcmV0dXJuIGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgIGNsYXNzTmFtZTogYG1hcGJveGdsLWN0cmwgbWFwYm94Z2wtY3RybC1ncm91cCAke2NsYXNzTmFtZX1gLFxuICAgICAgcmVmOiB0aGlzLl9vbkNvbnRhaW5lckxvYWRcbiAgICB9LCBbXG4gICAgICB0aGlzLl9yZW5kZXJCdXR0b24oJ3pvb20taW4nLCAnWm9vbSBJbicsIHRoaXMuX29uWm9vbUluKSxcbiAgICAgIHRoaXMuX3JlbmRlckJ1dHRvbignem9vbS1vdXQnLCAnWm9vbSBPdXQnLCB0aGlzLl9vblpvb21PdXQpLFxuICAgICAgdGhpcy5fcmVuZGVyQnV0dG9uKCdjb21wYXNzJywgJ1Jlc2V0IE5vcnRoJywgdGhpcy5fb25SZXNldE5vcnRoLCB0aGlzLl9yZW5kZXJDb21wYXNzKCkpXG4gICAgXSk7XG4gIH1cbn1cblxuTmF2aWdhdGlvbkNvbnRyb2wuZGlzcGxheU5hbWUgPSAnTmF2aWdhdGlvbkNvbnRyb2wnO1xuTmF2aWdhdGlvbkNvbnRyb2wucHJvcFR5cGVzID0gcHJvcFR5cGVzO1xuTmF2aWdhdGlvbkNvbnRyb2wuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuIl19