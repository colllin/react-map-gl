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

var _react = require('react');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _viewportMercatorProject = require('viewport-mercator-project');

var _viewportMercatorProject2 = _interopRequireDefault(_viewportMercatorProject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var propTypes = {
  /** Event handling */
  captureScroll: _propTypes2.default.bool,
  // Stop map pan & rotate
  captureDrag: _propTypes2.default.bool,
  // Stop map click
  captureClick: _propTypes2.default.bool,
  // Stop map double click
  captureDoubleClick: _propTypes2.default.bool
}; // Copyright (c) 2015 Uber Technologies, Inc.

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


var defaultProps = {
  captureScroll: false,
  captureDrag: true,
  captureClick: true,
  captureDoubleClick: true
};

var contextTypes = {
  viewport: _propTypes2.default.instanceOf(_viewportMercatorProject2.default),
  isDragging: _propTypes2.default.bool,
  eventManager: _propTypes2.default.object
};

var EVENT_MAP = {
  captureScroll: 'wheel',
  captureDrag: 'panstart',
  captureClick: 'click',
  captureDoubleClick: 'dblclick'
};

/*
 * PureComponent doesn't update when context changes.
 * The only way is to implement our own shouldComponentUpdate here. Considering
 * the parent component (StaticMap or InteractiveMap) is pure, and map re-render
 * is almost always triggered by a viewport change, we almost definitely need to
 * recalculate the marker's position when the parent re-renders.
 */

var BaseControl = function (_Component) {
  (0, _inherits3.default)(BaseControl, _Component);

  function BaseControl(props) {
    (0, _classCallCheck3.default)(this, BaseControl);

    var _this = (0, _possibleConstructorReturn3.default)(this, (BaseControl.__proto__ || (0, _getPrototypeOf2.default)(BaseControl)).call(this, props));

    _this._events = null;

    _this._onContainerLoad = _this._onContainerLoad.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(BaseControl, [{
    key: '_onContainerLoad',
    value: function _onContainerLoad(ref) {
      var eventManager = this.context.eventManager;

      var events = this._events;

      // Remove all previously registered events
      if (events) {
        eventManager.off(events);
        events = null;
      }

      if (ref) {
        // container is mounted: register events for this element
        events = {};

        for (var propName in EVENT_MAP) {
          var shouldCapture = this.props[propName];
          var eventName = EVENT_MAP[propName];

          if (shouldCapture) {
            events[eventName] = this._captureEvent;
          }
        }

        eventManager.on(events, ref);
      }

      this._events = events;
    }
  }, {
    key: '_captureEvent',
    value: function _captureEvent(evt) {
      evt.stopPropagation();
    }
  }, {
    key: 'render',
    value: function render() {
      return null;
    }
  }]);
  return BaseControl;
}(_react.Component);

exports.default = BaseControl;


BaseControl.propTypes = propTypes;
BaseControl.defaultProps = defaultProps;
BaseControl.contextTypes = contextTypes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL2Jhc2UtY29udHJvbC5qcyJdLCJuYW1lcyI6WyJwcm9wVHlwZXMiLCJjYXB0dXJlU2Nyb2xsIiwiYm9vbCIsImNhcHR1cmVEcmFnIiwiY2FwdHVyZUNsaWNrIiwiY2FwdHVyZURvdWJsZUNsaWNrIiwiZGVmYXVsdFByb3BzIiwiY29udGV4dFR5cGVzIiwidmlld3BvcnQiLCJpbnN0YW5jZU9mIiwiaXNEcmFnZ2luZyIsImV2ZW50TWFuYWdlciIsIm9iamVjdCIsIkVWRU5UX01BUCIsIkJhc2VDb250cm9sIiwicHJvcHMiLCJfZXZlbnRzIiwiX29uQ29udGFpbmVyTG9hZCIsImJpbmQiLCJyZWYiLCJjb250ZXh0IiwiZXZlbnRzIiwib2ZmIiwicHJvcE5hbWUiLCJzaG91bGRDYXB0dXJlIiwiZXZlbnROYW1lIiwiX2NhcHR1cmVFdmVudCIsIm9uIiwiZXZ0Iiwic3RvcFByb3BhZ2F0aW9uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1CQTs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFNQSxZQUFZO0FBQ2hCO0FBQ0FDLGlCQUFlLG9CQUFVQyxJQUZUO0FBR2hCO0FBQ0FDLGVBQWEsb0JBQVVELElBSlA7QUFLaEI7QUFDQUUsZ0JBQWMsb0JBQVVGLElBTlI7QUFPaEI7QUFDQUcsc0JBQW9CLG9CQUFVSDtBQVJkLENBQWxCLEMsQ0F2QkE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQWdCQSxJQUFNSSxlQUFlO0FBQ25CTCxpQkFBZSxLQURJO0FBRW5CRSxlQUFhLElBRk07QUFHbkJDLGdCQUFjLElBSEs7QUFJbkJDLHNCQUFvQjtBQUpELENBQXJCOztBQU9BLElBQU1FLGVBQWU7QUFDbkJDLFlBQVUsb0JBQVVDLFVBQVYsbUNBRFM7QUFFbkJDLGNBQVksb0JBQVVSLElBRkg7QUFHbkJTLGdCQUFjLG9CQUFVQztBQUhMLENBQXJCOztBQU1BLElBQU1DLFlBQVk7QUFDaEJaLGlCQUFlLE9BREM7QUFFaEJFLGVBQWEsVUFGRztBQUdoQkMsZ0JBQWMsT0FIRTtBQUloQkMsc0JBQW9CO0FBSkosQ0FBbEI7O0FBT0E7Ozs7Ozs7O0lBT3FCUyxXOzs7QUFFbkIsdUJBQVlDLEtBQVosRUFBbUI7QUFBQTs7QUFBQSxnSkFDWEEsS0FEVzs7QUFHakIsVUFBS0MsT0FBTCxHQUFlLElBQWY7O0FBRUEsVUFBS0MsZ0JBQUwsR0FBd0IsTUFBS0EsZ0JBQUwsQ0FBc0JDLElBQXRCLE9BQXhCO0FBTGlCO0FBTWxCOzs7O3FDQUVnQkMsRyxFQUFLO0FBQUEsVUFDYlIsWUFEYSxHQUNHLEtBQUtTLE9BRFIsQ0FDYlQsWUFEYTs7QUFFcEIsVUFBSVUsU0FBUyxLQUFLTCxPQUFsQjs7QUFFQTtBQUNBLFVBQUlLLE1BQUosRUFBWTtBQUNWVixxQkFBYVcsR0FBYixDQUFpQkQsTUFBakI7QUFDQUEsaUJBQVMsSUFBVDtBQUNEOztBQUVELFVBQUlGLEdBQUosRUFBUztBQUNQO0FBQ0FFLGlCQUFTLEVBQVQ7O0FBRUEsYUFBSyxJQUFNRSxRQUFYLElBQXVCVixTQUF2QixFQUFrQztBQUNoQyxjQUFNVyxnQkFBZ0IsS0FBS1QsS0FBTCxDQUFXUSxRQUFYLENBQXRCO0FBQ0EsY0FBTUUsWUFBWVosVUFBVVUsUUFBVixDQUFsQjs7QUFFQSxjQUFJQyxhQUFKLEVBQW1CO0FBQ2pCSCxtQkFBT0ksU0FBUCxJQUFvQixLQUFLQyxhQUF6QjtBQUNEO0FBQ0Y7O0FBRURmLHFCQUFhZ0IsRUFBYixDQUFnQk4sTUFBaEIsRUFBd0JGLEdBQXhCO0FBQ0Q7O0FBRUQsV0FBS0gsT0FBTCxHQUFlSyxNQUFmO0FBQ0Q7OztrQ0FFYU8sRyxFQUFLO0FBQ2pCQSxVQUFJQyxlQUFKO0FBQ0Q7Ozs2QkFFUTtBQUNQLGFBQU8sSUFBUDtBQUNEOzs7OztrQkE3Q2tCZixXOzs7QUFpRHJCQSxZQUFZZCxTQUFaLEdBQXdCQSxTQUF4QjtBQUNBYyxZQUFZUixZQUFaLEdBQTJCQSxZQUEzQjtBQUNBUSxZQUFZUCxZQUFaLEdBQTJCQSxZQUEzQiIsImZpbGUiOiJiYXNlLWNvbnRyb2wuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cblxuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgV2ViTWVyY2F0b3JWaWV3cG9ydCBmcm9tICd2aWV3cG9ydC1tZXJjYXRvci1wcm9qZWN0JztcblxuY29uc3QgcHJvcFR5cGVzID0ge1xuICAvKiogRXZlbnQgaGFuZGxpbmcgKi9cbiAgY2FwdHVyZVNjcm9sbDogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIFN0b3AgbWFwIHBhbiAmIHJvdGF0ZVxuICBjYXB0dXJlRHJhZzogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIFN0b3AgbWFwIGNsaWNrXG4gIGNhcHR1cmVDbGljazogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIFN0b3AgbWFwIGRvdWJsZSBjbGlja1xuICBjYXB0dXJlRG91YmxlQ2xpY2s6IFByb3BUeXBlcy5ib29sXG59O1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gIGNhcHR1cmVTY3JvbGw6IGZhbHNlLFxuICBjYXB0dXJlRHJhZzogdHJ1ZSxcbiAgY2FwdHVyZUNsaWNrOiB0cnVlLFxuICBjYXB0dXJlRG91YmxlQ2xpY2s6IHRydWVcbn07XG5cbmNvbnN0IGNvbnRleHRUeXBlcyA9IHtcbiAgdmlld3BvcnQ6IFByb3BUeXBlcy5pbnN0YW5jZU9mKFdlYk1lcmNhdG9yVmlld3BvcnQpLFxuICBpc0RyYWdnaW5nOiBQcm9wVHlwZXMuYm9vbCxcbiAgZXZlbnRNYW5hZ2VyOiBQcm9wVHlwZXMub2JqZWN0XG59O1xuXG5jb25zdCBFVkVOVF9NQVAgPSB7XG4gIGNhcHR1cmVTY3JvbGw6ICd3aGVlbCcsXG4gIGNhcHR1cmVEcmFnOiAncGFuc3RhcnQnLFxuICBjYXB0dXJlQ2xpY2s6ICdjbGljaycsXG4gIGNhcHR1cmVEb3VibGVDbGljazogJ2RibGNsaWNrJ1xufTtcblxuLypcbiAqIFB1cmVDb21wb25lbnQgZG9lc24ndCB1cGRhdGUgd2hlbiBjb250ZXh0IGNoYW5nZXMuXG4gKiBUaGUgb25seSB3YXkgaXMgdG8gaW1wbGVtZW50IG91ciBvd24gc2hvdWxkQ29tcG9uZW50VXBkYXRlIGhlcmUuIENvbnNpZGVyaW5nXG4gKiB0aGUgcGFyZW50IGNvbXBvbmVudCAoU3RhdGljTWFwIG9yIEludGVyYWN0aXZlTWFwKSBpcyBwdXJlLCBhbmQgbWFwIHJlLXJlbmRlclxuICogaXMgYWxtb3N0IGFsd2F5cyB0cmlnZ2VyZWQgYnkgYSB2aWV3cG9ydCBjaGFuZ2UsIHdlIGFsbW9zdCBkZWZpbml0ZWx5IG5lZWQgdG9cbiAqIHJlY2FsY3VsYXRlIHRoZSBtYXJrZXIncyBwb3NpdGlvbiB3aGVuIHRoZSBwYXJlbnQgcmUtcmVuZGVycy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFzZUNvbnRyb2wgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuXG4gICAgdGhpcy5fZXZlbnRzID0gbnVsbDtcblxuICAgIHRoaXMuX29uQ29udGFpbmVyTG9hZCA9IHRoaXMuX29uQ29udGFpbmVyTG9hZC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgX29uQ29udGFpbmVyTG9hZChyZWYpIHtcbiAgICBjb25zdCB7ZXZlbnRNYW5hZ2VyfSA9IHRoaXMuY29udGV4dDtcbiAgICBsZXQgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuXG4gICAgLy8gUmVtb3ZlIGFsbCBwcmV2aW91c2x5IHJlZ2lzdGVyZWQgZXZlbnRzXG4gICAgaWYgKGV2ZW50cykge1xuICAgICAgZXZlbnRNYW5hZ2VyLm9mZihldmVudHMpO1xuICAgICAgZXZlbnRzID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAocmVmKSB7XG4gICAgICAvLyBjb250YWluZXIgaXMgbW91bnRlZDogcmVnaXN0ZXIgZXZlbnRzIGZvciB0aGlzIGVsZW1lbnRcbiAgICAgIGV2ZW50cyA9IHt9O1xuXG4gICAgICBmb3IgKGNvbnN0IHByb3BOYW1lIGluIEVWRU5UX01BUCkge1xuICAgICAgICBjb25zdCBzaG91bGRDYXB0dXJlID0gdGhpcy5wcm9wc1twcm9wTmFtZV07XG4gICAgICAgIGNvbnN0IGV2ZW50TmFtZSA9IEVWRU5UX01BUFtwcm9wTmFtZV07XG5cbiAgICAgICAgaWYgKHNob3VsZENhcHR1cmUpIHtcbiAgICAgICAgICBldmVudHNbZXZlbnROYW1lXSA9IHRoaXMuX2NhcHR1cmVFdmVudDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBldmVudE1hbmFnZXIub24oZXZlbnRzLCByZWYpO1xuICAgIH1cblxuICAgIHRoaXMuX2V2ZW50cyA9IGV2ZW50cztcbiAgfVxuXG4gIF9jYXB0dXJlRXZlbnQoZXZ0KSB7XG4gICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbn1cblxuQmFzZUNvbnRyb2wucHJvcFR5cGVzID0gcHJvcFR5cGVzO1xuQmFzZUNvbnRyb2wuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuQmFzZUNvbnRyb2wuY29udGV4dFR5cGVzID0gY29udGV4dFR5cGVzO1xuIl19