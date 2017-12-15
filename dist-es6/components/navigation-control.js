var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import { createElement } from 'react';
import PropTypes from 'prop-types';
import BaseControl from './base-control';
import autobind from '../utils/autobind';

import MapState from '../utils/map-state';
import TransitionManager from '../utils/transition-manager';

import deprecateWarn from '../utils/deprecate-warn';

var LINEAR_TRANSITION_PROPS = Object.assign({}, TransitionManager.defaultProps, {
  transitionDuration: 300
});

var propTypes = Object.assign({}, BaseControl.propTypes, {
  // Custom className
  className: PropTypes.string,
  /**
    * `onViewportChange` callback is fired when the user interacted with the
    * map. The object passed to the callback contains `latitude`,
    * `longitude` and `zoom` and additional state information.
    */
  onViewportChange: PropTypes.func.isRequired
});

var defaultProps = Object.assign({}, BaseControl.defaultProps, {
  className: '',
  onViewportChange: function onViewportChange() {}
});

/*
 * PureComponent doesn't update when context changes, so
 * implementing our own shouldComponentUpdate here.
 */

var NavigationControl = function (_BaseControl) {
  _inherits(NavigationControl, _BaseControl);

  function NavigationControl(props) {
    _classCallCheck(this, NavigationControl);

    var _this = _possibleConstructorReturn(this, (NavigationControl.__proto__ || Object.getPrototypeOf(NavigationControl)).call(this, props));

    autobind(_this);
    // Check for deprecated props
    deprecateWarn(props);
    return _this;
  }

  _createClass(NavigationControl, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState, nextContext) {
      return this.context.viewport.bearing !== nextContext.viewport.bearing;
    }
  }, {
    key: '_updateViewport',
    value: function _updateViewport(opts) {
      var viewport = this.context.viewport;

      var mapState = new MapState(Object.assign({}, viewport, opts));
      // TODO(deprecate): remove this check when `onChangeViewport` gets deprecated
      var onViewportChange = this.props.onChangeViewport || this.props.onViewportChange;
      var newViewport = Object.assign({}, mapState.getViewportProps(), LINEAR_TRANSITION_PROPS);

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

      return createElement('span', {
        className: 'mapboxgl-ctrl-compass-arrow',
        style: { transform: 'rotate(' + bearing + 'deg)' }
      });
    }
  }, {
    key: '_renderButton',
    value: function _renderButton(type, label, callback, children) {
      return createElement('button', {
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


      return createElement('div', {
        className: 'mapboxgl-ctrl mapboxgl-ctrl-group ' + className,
        ref: this._onContainerLoad
      }, [this._renderButton('zoom-in', 'Zoom In', this._onZoomIn), this._renderButton('zoom-out', 'Zoom Out', this._onZoomOut), this._renderButton('compass', 'Reset North', this._onResetNorth, this._renderCompass())]);
    }
  }]);

  return NavigationControl;
}(BaseControl);

export default NavigationControl;


NavigationControl.displayName = 'NavigationControl';
NavigationControl.propTypes = propTypes;
NavigationControl.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL25hdmlnYXRpb24tY29udHJvbC5qcyJdLCJuYW1lcyI6WyJjcmVhdGVFbGVtZW50IiwiUHJvcFR5cGVzIiwiQmFzZUNvbnRyb2wiLCJhdXRvYmluZCIsIk1hcFN0YXRlIiwiVHJhbnNpdGlvbk1hbmFnZXIiLCJkZXByZWNhdGVXYXJuIiwiTElORUFSX1RSQU5TSVRJT05fUFJPUFMiLCJPYmplY3QiLCJhc3NpZ24iLCJkZWZhdWx0UHJvcHMiLCJ0cmFuc2l0aW9uRHVyYXRpb24iLCJwcm9wVHlwZXMiLCJjbGFzc05hbWUiLCJzdHJpbmciLCJvblZpZXdwb3J0Q2hhbmdlIiwiZnVuYyIsImlzUmVxdWlyZWQiLCJOYXZpZ2F0aW9uQ29udHJvbCIsInByb3BzIiwibmV4dFByb3BzIiwibmV4dFN0YXRlIiwibmV4dENvbnRleHQiLCJjb250ZXh0Iiwidmlld3BvcnQiLCJiZWFyaW5nIiwib3B0cyIsIm1hcFN0YXRlIiwib25DaGFuZ2VWaWV3cG9ydCIsIm5ld1ZpZXdwb3J0IiwiZ2V0Vmlld3BvcnRQcm9wcyIsIl91cGRhdGVWaWV3cG9ydCIsInpvb20iLCJwaXRjaCIsInN0eWxlIiwidHJhbnNmb3JtIiwidHlwZSIsImxhYmVsIiwiY2FsbGJhY2siLCJjaGlsZHJlbiIsImtleSIsInRpdGxlIiwib25DbGljayIsInJlZiIsIl9vbkNvbnRhaW5lckxvYWQiLCJfcmVuZGVyQnV0dG9uIiwiX29uWm9vbUluIiwiX29uWm9vbU91dCIsIl9vblJlc2V0Tm9ydGgiLCJfcmVuZGVyQ29tcGFzcyIsImRpc3BsYXlOYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBLFNBQVFBLGFBQVIsUUFBNEIsT0FBNUI7QUFDQSxPQUFPQyxTQUFQLE1BQXNCLFlBQXRCO0FBQ0EsT0FBT0MsV0FBUCxNQUF3QixnQkFBeEI7QUFDQSxPQUFPQyxRQUFQLE1BQXFCLG1CQUFyQjs7QUFFQSxPQUFPQyxRQUFQLE1BQXFCLG9CQUFyQjtBQUNBLE9BQU9DLGlCQUFQLE1BQThCLDZCQUE5Qjs7QUFFQSxPQUFPQyxhQUFQLE1BQTBCLHlCQUExQjs7QUFFQSxJQUFNQywwQkFBMEJDLE9BQU9DLE1BQVAsQ0FBYyxFQUFkLEVBQWtCSixrQkFBa0JLLFlBQXBDLEVBQWtEO0FBQ2hGQyxzQkFBb0I7QUFENEQsQ0FBbEQsQ0FBaEM7O0FBSUEsSUFBTUMsWUFBWUosT0FBT0MsTUFBUCxDQUFjLEVBQWQsRUFBa0JQLFlBQVlVLFNBQTlCLEVBQXlDO0FBQ3pEO0FBQ0FDLGFBQVdaLFVBQVVhLE1BRm9DO0FBR3pEOzs7OztBQUtBQyxvQkFBa0JkLFVBQVVlLElBQVYsQ0FBZUM7QUFSd0IsQ0FBekMsQ0FBbEI7O0FBV0EsSUFBTVAsZUFBZUYsT0FBT0MsTUFBUCxDQUFjLEVBQWQsRUFBa0JQLFlBQVlRLFlBQTlCLEVBQTRDO0FBQy9ERyxhQUFXLEVBRG9EO0FBRS9ERSxvQkFBa0IsNEJBQU0sQ0FBRTtBQUZxQyxDQUE1QyxDQUFyQjs7QUFLQTs7Ozs7SUFJcUJHLGlCOzs7QUFFbkIsNkJBQVlDLEtBQVosRUFBbUI7QUFBQTs7QUFBQSxzSUFDWEEsS0FEVzs7QUFFakJoQjtBQUNBO0FBQ0FHLGtCQUFjYSxLQUFkO0FBSmlCO0FBS2xCOzs7OzBDQUVxQkMsUyxFQUFXQyxTLEVBQVdDLFcsRUFBYTtBQUN2RCxhQUFPLEtBQUtDLE9BQUwsQ0FBYUMsUUFBYixDQUFzQkMsT0FBdEIsS0FBa0NILFlBQVlFLFFBQVosQ0FBcUJDLE9BQTlEO0FBQ0Q7OztvQ0FFZUMsSSxFQUFNO0FBQUEsVUFDYkYsUUFEYSxHQUNELEtBQUtELE9BREosQ0FDYkMsUUFEYTs7QUFFcEIsVUFBTUcsV0FBVyxJQUFJdkIsUUFBSixDQUFhSSxPQUFPQyxNQUFQLENBQWMsRUFBZCxFQUFrQmUsUUFBbEIsRUFBNEJFLElBQTVCLENBQWIsQ0FBakI7QUFDQTtBQUNBLFVBQU1YLG1CQUFtQixLQUFLSSxLQUFMLENBQVdTLGdCQUFYLElBQStCLEtBQUtULEtBQUwsQ0FBV0osZ0JBQW5FO0FBQ0EsVUFBTWMsY0FBY3JCLE9BQU9DLE1BQVAsQ0FBYyxFQUFkLEVBQWtCa0IsU0FBU0csZ0JBQVQsRUFBbEIsRUFBK0N2Qix1QkFBL0MsQ0FBcEI7O0FBRUFRLHVCQUFpQmMsV0FBakI7QUFDRDs7O2dDQUVXO0FBQ1YsV0FBS0UsZUFBTCxDQUFxQixFQUFDQyxNQUFNLEtBQUtULE9BQUwsQ0FBYUMsUUFBYixDQUFzQlEsSUFBdEIsR0FBNkIsQ0FBcEMsRUFBckI7QUFDRDs7O2lDQUVZO0FBQ1gsV0FBS0QsZUFBTCxDQUFxQixFQUFDQyxNQUFNLEtBQUtULE9BQUwsQ0FBYUMsUUFBYixDQUFzQlEsSUFBdEIsR0FBNkIsQ0FBcEMsRUFBckI7QUFDRDs7O29DQUVlO0FBQ2QsV0FBS0QsZUFBTCxDQUFxQixFQUFDTixTQUFTLENBQVYsRUFBYVEsT0FBTyxDQUFwQixFQUFyQjtBQUNEOzs7cUNBRWdCO0FBQUEsVUFDUlIsT0FEUSxHQUNHLEtBQUtGLE9BQUwsQ0FBYUMsUUFEaEIsQ0FDUkMsT0FEUTs7QUFFZixhQUFPekIsY0FBYyxNQUFkLEVBQXNCO0FBQzNCYSxtQkFBVyw2QkFEZ0I7QUFFM0JxQixlQUFPLEVBQUNDLHVCQUFxQlYsT0FBckIsU0FBRDtBQUZvQixPQUF0QixDQUFQO0FBSUQ7OztrQ0FFYVcsSSxFQUFNQyxLLEVBQU9DLFEsRUFBVUMsUSxFQUFVO0FBQzdDLGFBQU92QyxjQUFjLFFBQWQsRUFBd0I7QUFDN0J3QyxhQUFLSixJQUR3QjtBQUU3QnZCLHlEQUErQ3VCLElBRmxCO0FBRzdCQSxjQUFNLFFBSHVCO0FBSTdCSyxlQUFPSixLQUpzQjtBQUs3QkssaUJBQVNKLFFBTG9CO0FBTTdCQztBQU42QixPQUF4QixDQUFQO0FBUUQ7Ozs2QkFFUTtBQUFBLFVBRUExQixTQUZBLEdBRWEsS0FBS00sS0FGbEIsQ0FFQU4sU0FGQTs7O0FBSVAsYUFBT2IsY0FBYyxLQUFkLEVBQXFCO0FBQzFCYSwwREFBZ0RBLFNBRHRCO0FBRTFCOEIsYUFBSyxLQUFLQztBQUZnQixPQUFyQixFQUdKLENBQ0QsS0FBS0MsYUFBTCxDQUFtQixTQUFuQixFQUE4QixTQUE5QixFQUF5QyxLQUFLQyxTQUE5QyxDQURDLEVBRUQsS0FBS0QsYUFBTCxDQUFtQixVQUFuQixFQUErQixVQUEvQixFQUEyQyxLQUFLRSxVQUFoRCxDQUZDLEVBR0QsS0FBS0YsYUFBTCxDQUFtQixTQUFuQixFQUE4QixhQUE5QixFQUE2QyxLQUFLRyxhQUFsRCxFQUFpRSxLQUFLQyxjQUFMLEVBQWpFLENBSEMsQ0FISSxDQUFQO0FBUUQ7Ozs7RUFsRTRDL0MsVzs7ZUFBMUJnQixpQjs7O0FBcUVyQkEsa0JBQWtCZ0MsV0FBbEIsR0FBZ0MsbUJBQWhDO0FBQ0FoQyxrQkFBa0JOLFNBQWxCLEdBQThCQSxTQUE5QjtBQUNBTSxrQkFBa0JSLFlBQWxCLEdBQWlDQSxZQUFqQyIsImZpbGUiOiJuYXZpZ2F0aW9uLWNvbnRyb2wuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NyZWF0ZUVsZW1lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgQmFzZUNvbnRyb2wgZnJvbSAnLi9iYXNlLWNvbnRyb2wnO1xuaW1wb3J0IGF1dG9iaW5kIGZyb20gJy4uL3V0aWxzL2F1dG9iaW5kJztcblxuaW1wb3J0IE1hcFN0YXRlIGZyb20gJy4uL3V0aWxzL21hcC1zdGF0ZSc7XG5pbXBvcnQgVHJhbnNpdGlvbk1hbmFnZXIgZnJvbSAnLi4vdXRpbHMvdHJhbnNpdGlvbi1tYW5hZ2VyJztcblxuaW1wb3J0IGRlcHJlY2F0ZVdhcm4gZnJvbSAnLi4vdXRpbHMvZGVwcmVjYXRlLXdhcm4nO1xuXG5jb25zdCBMSU5FQVJfVFJBTlNJVElPTl9QUk9QUyA9IE9iamVjdC5hc3NpZ24oe30sIFRyYW5zaXRpb25NYW5hZ2VyLmRlZmF1bHRQcm9wcywge1xuICB0cmFuc2l0aW9uRHVyYXRpb246IDMwMFxufSk7XG5cbmNvbnN0IHByb3BUeXBlcyA9IE9iamVjdC5hc3NpZ24oe30sIEJhc2VDb250cm9sLnByb3BUeXBlcywge1xuICAvLyBDdXN0b20gY2xhc3NOYW1lXG4gIGNsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgLyoqXG4gICAgKiBgb25WaWV3cG9ydENoYW5nZWAgY2FsbGJhY2sgaXMgZmlyZWQgd2hlbiB0aGUgdXNlciBpbnRlcmFjdGVkIHdpdGggdGhlXG4gICAgKiBtYXAuIFRoZSBvYmplY3QgcGFzc2VkIHRvIHRoZSBjYWxsYmFjayBjb250YWlucyBgbGF0aXR1ZGVgLFxuICAgICogYGxvbmdpdHVkZWAgYW5kIGB6b29tYCBhbmQgYWRkaXRpb25hbCBzdGF0ZSBpbmZvcm1hdGlvbi5cbiAgICAqL1xuICBvblZpZXdwb3J0Q2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkXG59KTtcblxuY29uc3QgZGVmYXVsdFByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgQmFzZUNvbnRyb2wuZGVmYXVsdFByb3BzLCB7XG4gIGNsYXNzTmFtZTogJycsXG4gIG9uVmlld3BvcnRDaGFuZ2U6ICgpID0+IHt9XG59KTtcblxuLypcbiAqIFB1cmVDb21wb25lbnQgZG9lc24ndCB1cGRhdGUgd2hlbiBjb250ZXh0IGNoYW5nZXMsIHNvXG4gKiBpbXBsZW1lbnRpbmcgb3VyIG93biBzaG91bGRDb21wb25lbnRVcGRhdGUgaGVyZS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTmF2aWdhdGlvbkNvbnRyb2wgZXh0ZW5kcyBCYXNlQ29udHJvbCB7XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgYXV0b2JpbmQodGhpcyk7XG4gICAgLy8gQ2hlY2sgZm9yIGRlcHJlY2F0ZWQgcHJvcHNcbiAgICBkZXByZWNhdGVXYXJuKHByb3BzKTtcbiAgfVxuXG4gIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHMsIG5leHRTdGF0ZSwgbmV4dENvbnRleHQpIHtcbiAgICByZXR1cm4gdGhpcy5jb250ZXh0LnZpZXdwb3J0LmJlYXJpbmcgIT09IG5leHRDb250ZXh0LnZpZXdwb3J0LmJlYXJpbmc7XG4gIH1cblxuICBfdXBkYXRlVmlld3BvcnQob3B0cykge1xuICAgIGNvbnN0IHt2aWV3cG9ydH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgY29uc3QgbWFwU3RhdGUgPSBuZXcgTWFwU3RhdGUoT2JqZWN0LmFzc2lnbih7fSwgdmlld3BvcnQsIG9wdHMpKTtcbiAgICAvLyBUT0RPKGRlcHJlY2F0ZSk6IHJlbW92ZSB0aGlzIGNoZWNrIHdoZW4gYG9uQ2hhbmdlVmlld3BvcnRgIGdldHMgZGVwcmVjYXRlZFxuICAgIGNvbnN0IG9uVmlld3BvcnRDaGFuZ2UgPSB0aGlzLnByb3BzLm9uQ2hhbmdlVmlld3BvcnQgfHwgdGhpcy5wcm9wcy5vblZpZXdwb3J0Q2hhbmdlO1xuICAgIGNvbnN0IG5ld1ZpZXdwb3J0ID0gT2JqZWN0LmFzc2lnbih7fSwgbWFwU3RhdGUuZ2V0Vmlld3BvcnRQcm9wcygpLCBMSU5FQVJfVFJBTlNJVElPTl9QUk9QUyk7XG5cbiAgICBvblZpZXdwb3J0Q2hhbmdlKG5ld1ZpZXdwb3J0KTtcbiAgfVxuXG4gIF9vblpvb21JbigpIHtcbiAgICB0aGlzLl91cGRhdGVWaWV3cG9ydCh7em9vbTogdGhpcy5jb250ZXh0LnZpZXdwb3J0Lnpvb20gKyAxfSk7XG4gIH1cblxuICBfb25ab29tT3V0KCkge1xuICAgIHRoaXMuX3VwZGF0ZVZpZXdwb3J0KHt6b29tOiB0aGlzLmNvbnRleHQudmlld3BvcnQuem9vbSAtIDF9KTtcbiAgfVxuXG4gIF9vblJlc2V0Tm9ydGgoKSB7XG4gICAgdGhpcy5fdXBkYXRlVmlld3BvcnQoe2JlYXJpbmc6IDAsIHBpdGNoOiAwfSk7XG4gIH1cblxuICBfcmVuZGVyQ29tcGFzcygpIHtcbiAgICBjb25zdCB7YmVhcmluZ30gPSB0aGlzLmNvbnRleHQudmlld3BvcnQ7XG4gICAgcmV0dXJuIGNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7XG4gICAgICBjbGFzc05hbWU6ICdtYXBib3hnbC1jdHJsLWNvbXBhc3MtYXJyb3cnLFxuICAgICAgc3R5bGU6IHt0cmFuc2Zvcm06IGByb3RhdGUoJHtiZWFyaW5nfWRlZylgfVxuICAgIH0pO1xuICB9XG5cbiAgX3JlbmRlckJ1dHRvbih0eXBlLCBsYWJlbCwgY2FsbGJhY2ssIGNoaWxkcmVuKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicsIHtcbiAgICAgIGtleTogdHlwZSxcbiAgICAgIGNsYXNzTmFtZTogYG1hcGJveGdsLWN0cmwtaWNvbiBtYXBib3hnbC1jdHJsLSR7dHlwZX1gLFxuICAgICAgdHlwZTogJ2J1dHRvbicsXG4gICAgICB0aXRsZTogbGFiZWwsXG4gICAgICBvbkNsaWNrOiBjYWxsYmFjayxcbiAgICAgIGNoaWxkcmVuXG4gICAgfSk7XG4gIH1cblxuICByZW5kZXIoKSB7XG5cbiAgICBjb25zdCB7Y2xhc3NOYW1lfSA9IHRoaXMucHJvcHM7XG5cbiAgICByZXR1cm4gY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgY2xhc3NOYW1lOiBgbWFwYm94Z2wtY3RybCBtYXBib3hnbC1jdHJsLWdyb3VwICR7Y2xhc3NOYW1lfWAsXG4gICAgICByZWY6IHRoaXMuX29uQ29udGFpbmVyTG9hZFxuICAgIH0sIFtcbiAgICAgIHRoaXMuX3JlbmRlckJ1dHRvbignem9vbS1pbicsICdab29tIEluJywgdGhpcy5fb25ab29tSW4pLFxuICAgICAgdGhpcy5fcmVuZGVyQnV0dG9uKCd6b29tLW91dCcsICdab29tIE91dCcsIHRoaXMuX29uWm9vbU91dCksXG4gICAgICB0aGlzLl9yZW5kZXJCdXR0b24oJ2NvbXBhc3MnLCAnUmVzZXQgTm9ydGgnLCB0aGlzLl9vblJlc2V0Tm9ydGgsIHRoaXMuX3JlbmRlckNvbXBhc3MoKSlcbiAgICBdKTtcbiAgfVxufVxuXG5OYXZpZ2F0aW9uQ29udHJvbC5kaXNwbGF5TmFtZSA9ICdOYXZpZ2F0aW9uQ29udHJvbCc7XG5OYXZpZ2F0aW9uQ29udHJvbC5wcm9wVHlwZXMgPSBwcm9wVHlwZXM7XG5OYXZpZ2F0aW9uQ29udHJvbC5kZWZhdWx0UHJvcHMgPSBkZWZhdWx0UHJvcHM7XG4iXX0=