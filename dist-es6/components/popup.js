var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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
import { createElement } from 'react';
import PropTypes from 'prop-types';
import BaseControl from './base-control';
import autobind from '../utils/autobind';

import { getDynamicPosition, ANCHOR_POSITION } from '../utils/dynamic-position';

var propTypes = Object.assign({}, BaseControl.propTypes, {
  // Custom className
  className: PropTypes.string,
  // Longitude of the anchor point
  longitude: PropTypes.number.isRequired,
  // Latitude of the anchor point
  latitude: PropTypes.number.isRequired,
  // Offset from the left
  offsetLeft: PropTypes.number,
  // Offset from the top
  offsetTop: PropTypes.number,
  // Size of the tip
  tipSize: PropTypes.number,
  // Whether to show close button
  closeButton: PropTypes.bool,
  // Whether to close on click
  closeOnClick: PropTypes.bool,
  // The popup's location relative to the coordinate
  anchor: PropTypes.oneOf(Object.keys(ANCHOR_POSITION)),
  // Whether the popup anchor should be auto-adjusted to fit within the container
  dynamicPosition: PropTypes.bool,
  // Callback when component is closed
  onClose: PropTypes.func
});

var defaultProps = Object.assign({}, BaseControl.defaultProps, {
  className: '',
  offsetLeft: 0,
  offsetTop: 0,
  tipSize: 10,
  anchor: 'bottom',
  dynamicPosition: true,
  closeButton: true,
  closeOnClick: true,
  onClose: function onClose() {}
});

/*
 * PureComponent doesn't update when context changes.
 * The only way is to implement our own shouldComponentUpdate here. Considering
 * the parent component (StaticMap or InteractiveMap) is pure, and map re-render
 * is almost always triggered by a viewport change, we almost definitely need to
 * recalculate the popup's position when the parent re-renders.
 */

var Popup = function (_BaseControl) {
  _inherits(Popup, _BaseControl);

  function Popup(props) {
    _classCallCheck(this, Popup);

    var _this = _possibleConstructorReturn(this, (Popup.__proto__ || Object.getPrototypeOf(Popup)).call(this, props));

    autobind(_this);
    return _this;
  }

  _createClass(Popup, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      // Container just got a size, re-calculate position
      this.forceUpdate();
    }
  }, {
    key: '_getPosition',
    value: function _getPosition(x, y) {
      var viewport = this.context.viewport;
      var _props = this.props,
          anchor = _props.anchor,
          dynamicPosition = _props.dynamicPosition,
          tipSize = _props.tipSize;


      if (this._content) {
        return dynamicPosition ? getDynamicPosition({
          x: x, y: y, anchor: anchor,
          padding: tipSize,
          width: viewport.width,
          height: viewport.height,
          selfWidth: this._content.clientWidth,
          selfHeight: this._content.clientHeight
        }) : anchor;
      }

      return anchor;
    }
  }, {
    key: '_onClose',
    value: function _onClose() {
      this.props.onClose();
    }
  }, {
    key: '_contentLoaded',
    value: function _contentLoaded(ref) {
      this._content = ref;
    }
  }, {
    key: '_renderTip',
    value: function _renderTip() {
      var tipSize = this.props.tipSize;


      return createElement('div', {
        key: 'tip',
        className: 'mapboxgl-popup-tip',
        style: { borderWidth: tipSize }
      });
    }
  }, {
    key: '_renderContent',
    value: function _renderContent() {
      var _props2 = this.props,
          closeButton = _props2.closeButton,
          children = _props2.children;

      return createElement('div', {
        key: 'content',
        ref: this._contentLoaded,
        className: 'mapboxgl-popup-content'
      }, [closeButton && createElement('button', {
        key: 'close-button',
        className: 'mapboxgl-popup-close-button',
        type: 'button',
        onClick: this._onClose
      }, '×'), children]);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props3 = this.props,
          className = _props3.className,
          longitude = _props3.longitude,
          latitude = _props3.latitude,
          offsetLeft = _props3.offsetLeft,
          offsetTop = _props3.offsetTop,
          closeOnClick = _props3.closeOnClick;

      var _context$viewport$pro = this.context.viewport.project([longitude, latitude]),
          _context$viewport$pro2 = _slicedToArray(_context$viewport$pro, 2),
          x = _context$viewport$pro2[0],
          y = _context$viewport$pro2[1];

      var positionType = this._getPosition(x, y);
      var anchorPosition = ANCHOR_POSITION[positionType];

      var containerStyle = {
        position: 'absolute',
        left: x + offsetLeft,
        top: y + offsetTop,
        transform: 'translate(' + -anchorPosition.x * 100 + '%, ' + -anchorPosition.y * 100 + '%)'
      };

      return createElement('div', {
        className: 'mapboxgl-popup mapboxgl-popup-anchor-' + positionType + ' ' + className,
        style: containerStyle,
        ref: this._onContainerLoad,
        onClick: closeOnClick ? this._onClose : null
      }, [this._renderTip(), this._renderContent()]);
    }
  }]);

  return Popup;
}(BaseControl);

export default Popup;


Popup.displayName = 'Popup';
Popup.propTypes = propTypes;
Popup.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL3BvcHVwLmpzIl0sIm5hbWVzIjpbImNyZWF0ZUVsZW1lbnQiLCJQcm9wVHlwZXMiLCJCYXNlQ29udHJvbCIsImF1dG9iaW5kIiwiZ2V0RHluYW1pY1Bvc2l0aW9uIiwiQU5DSE9SX1BPU0lUSU9OIiwicHJvcFR5cGVzIiwiT2JqZWN0IiwiYXNzaWduIiwiY2xhc3NOYW1lIiwic3RyaW5nIiwibG9uZ2l0dWRlIiwibnVtYmVyIiwiaXNSZXF1aXJlZCIsImxhdGl0dWRlIiwib2Zmc2V0TGVmdCIsIm9mZnNldFRvcCIsInRpcFNpemUiLCJjbG9zZUJ1dHRvbiIsImJvb2wiLCJjbG9zZU9uQ2xpY2siLCJhbmNob3IiLCJvbmVPZiIsImtleXMiLCJkeW5hbWljUG9zaXRpb24iLCJvbkNsb3NlIiwiZnVuYyIsImRlZmF1bHRQcm9wcyIsIlBvcHVwIiwicHJvcHMiLCJmb3JjZVVwZGF0ZSIsIngiLCJ5Iiwidmlld3BvcnQiLCJjb250ZXh0IiwiX2NvbnRlbnQiLCJwYWRkaW5nIiwid2lkdGgiLCJoZWlnaHQiLCJzZWxmV2lkdGgiLCJjbGllbnRXaWR0aCIsInNlbGZIZWlnaHQiLCJjbGllbnRIZWlnaHQiLCJyZWYiLCJrZXkiLCJzdHlsZSIsImJvcmRlcldpZHRoIiwiY2hpbGRyZW4iLCJfY29udGVudExvYWRlZCIsInR5cGUiLCJvbkNsaWNrIiwiX29uQ2xvc2UiLCJwcm9qZWN0IiwicG9zaXRpb25UeXBlIiwiX2dldFBvc2l0aW9uIiwiYW5jaG9yUG9zaXRpb24iLCJjb250YWluZXJTdHlsZSIsInBvc2l0aW9uIiwibGVmdCIsInRvcCIsInRyYW5zZm9ybSIsIl9vbkNvbnRhaW5lckxvYWQiLCJfcmVuZGVyVGlwIiwiX3JlbmRlckNvbnRlbnQiLCJkaXNwbGF5TmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtB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LENBQWhCLEdBQW9CLEdBQTVDLFdBQXFELENBQUN3QixlQUFldkIsQ0FBaEIsR0FBb0IsR0FBekU7QUFKcUIsT0FBdkI7O0FBT0EsYUFBT2hDLGNBQWMsS0FBZCxFQUFxQjtBQUMxQlMsNkRBQW1ENEMsWUFBbkQsU0FBbUU1QyxTQUR6QztBQUUxQm9DLGVBQU9XLGNBRm1CO0FBRzFCYixhQUFLLEtBQUtrQixnQkFIZ0I7QUFJMUJYLGlCQUFTOUIsZUFBZSxLQUFLK0IsUUFBcEIsR0FBK0I7QUFKZCxPQUFyQixFQUtKLENBQ0QsS0FBS1csVUFBTCxFQURDLEVBRUQsS0FBS0MsY0FBTCxFQUZDLENBTEksQ0FBUDtBQVNEOzs7O0VBekZnQzdELFc7O2VBQWQwQixLOzs7QUE2RnJCQSxNQUFNb0MsV0FBTixHQUFvQixPQUFwQjtBQUNBcEMsTUFBTXRCLFNBQU4sR0FBa0JBLFNBQWxCO0FBQ0FzQixNQUFNRCxZQUFOLEdBQXFCQSxZQUFyQiIsImZpbGUiOiJwb3B1cC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5pbXBvcnQge2NyZWF0ZUVsZW1lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgQmFzZUNvbnRyb2wgZnJvbSAnLi9iYXNlLWNvbnRyb2wnO1xuaW1wb3J0IGF1dG9iaW5kIGZyb20gJy4uL3V0aWxzL2F1dG9iaW5kJztcblxuaW1wb3J0IHtnZXREeW5hbWljUG9zaXRpb24sIEFOQ0hPUl9QT1NJVElPTn0gZnJvbSAnLi4vdXRpbHMvZHluYW1pYy1wb3NpdGlvbic7XG5cbmNvbnN0IHByb3BUeXBlcyA9IE9iamVjdC5hc3NpZ24oe30sIEJhc2VDb250cm9sLnByb3BUeXBlcywge1xuICAvLyBDdXN0b20gY2xhc3NOYW1lXG4gIGNsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgLy8gTG9uZ2l0dWRlIG9mIHRoZSBhbmNob3IgcG9pbnRcbiAgbG9uZ2l0dWRlOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIC8vIExhdGl0dWRlIG9mIHRoZSBhbmNob3IgcG9pbnRcbiAgbGF0aXR1ZGU6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgLy8gT2Zmc2V0IGZyb20gdGhlIGxlZnRcbiAgb2Zmc2V0TGVmdDogUHJvcFR5cGVzLm51bWJlcixcbiAgLy8gT2Zmc2V0IGZyb20gdGhlIHRvcFxuICBvZmZzZXRUb3A6IFByb3BUeXBlcy5udW1iZXIsXG4gIC8vIFNpemUgb2YgdGhlIHRpcFxuICB0aXBTaXplOiBQcm9wVHlwZXMubnVtYmVyLFxuICAvLyBXaGV0aGVyIHRvIHNob3cgY2xvc2UgYnV0dG9uXG4gIGNsb3NlQnV0dG9uOiBQcm9wVHlwZXMuYm9vbCxcbiAgLy8gV2hldGhlciB0byBjbG9zZSBvbiBjbGlja1xuICBjbG9zZU9uQ2xpY2s6IFByb3BUeXBlcy5ib29sLFxuICAvLyBUaGUgcG9wdXAncyBsb2NhdGlvbiByZWxhdGl2ZSB0byB0aGUgY29vcmRpbmF0ZVxuICBhbmNob3I6IFByb3BUeXBlcy5vbmVPZihPYmplY3Qua2V5cyhBTkNIT1JfUE9TSVRJT04pKSxcbiAgLy8gV2hldGhlciB0aGUgcG9wdXAgYW5jaG9yIHNob3VsZCBiZSBhdXRvLWFkanVzdGVkIHRvIGZpdCB3aXRoaW4gdGhlIGNvbnRhaW5lclxuICBkeW5hbWljUG9zaXRpb246IFByb3BUeXBlcy5ib29sLFxuICAvLyBDYWxsYmFjayB3aGVuIGNvbXBvbmVudCBpcyBjbG9zZWRcbiAgb25DbG9zZTogUHJvcFR5cGVzLmZ1bmNcbn0pO1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBCYXNlQ29udHJvbC5kZWZhdWx0UHJvcHMsIHtcbiAgY2xhc3NOYW1lOiAnJyxcbiAgb2Zmc2V0TGVmdDogMCxcbiAgb2Zmc2V0VG9wOiAwLFxuICB0aXBTaXplOiAxMCxcbiAgYW5jaG9yOiAnYm90dG9tJyxcbiAgZHluYW1pY1Bvc2l0aW9uOiB0cnVlLFxuICBjbG9zZUJ1dHRvbjogdHJ1ZSxcbiAgY2xvc2VPbkNsaWNrOiB0cnVlLFxuICBvbkNsb3NlOiAoKSA9PiB7fVxufSk7XG5cbi8qXG4gKiBQdXJlQ29tcG9uZW50IGRvZXNuJ3QgdXBkYXRlIHdoZW4gY29udGV4dCBjaGFuZ2VzLlxuICogVGhlIG9ubHkgd2F5IGlzIHRvIGltcGxlbWVudCBvdXIgb3duIHNob3VsZENvbXBvbmVudFVwZGF0ZSBoZXJlLiBDb25zaWRlcmluZ1xuICogdGhlIHBhcmVudCBjb21wb25lbnQgKFN0YXRpY01hcCBvciBJbnRlcmFjdGl2ZU1hcCkgaXMgcHVyZSwgYW5kIG1hcCByZS1yZW5kZXJcbiAqIGlzIGFsbW9zdCBhbHdheXMgdHJpZ2dlcmVkIGJ5IGEgdmlld3BvcnQgY2hhbmdlLCB3ZSBhbG1vc3QgZGVmaW5pdGVseSBuZWVkIHRvXG4gKiByZWNhbGN1bGF0ZSB0aGUgcG9wdXAncyBwb3NpdGlvbiB3aGVuIHRoZSBwYXJlbnQgcmUtcmVuZGVycy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUG9wdXAgZXh0ZW5kcyBCYXNlQ29udHJvbCB7XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgYXV0b2JpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAvLyBDb250YWluZXIganVzdCBnb3QgYSBzaXplLCByZS1jYWxjdWxhdGUgcG9zaXRpb25cbiAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gIH1cblxuICBfZ2V0UG9zaXRpb24oeCwgeSkge1xuICAgIGNvbnN0IHt2aWV3cG9ydH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgY29uc3Qge2FuY2hvciwgZHluYW1pY1Bvc2l0aW9uLCB0aXBTaXplfSA9IHRoaXMucHJvcHM7XG5cbiAgICBpZiAodGhpcy5fY29udGVudCkge1xuICAgICAgcmV0dXJuIGR5bmFtaWNQb3NpdGlvbiA/IGdldER5bmFtaWNQb3NpdGlvbih7XG4gICAgICAgIHgsIHksIGFuY2hvcixcbiAgICAgICAgcGFkZGluZzogdGlwU2l6ZSxcbiAgICAgICAgd2lkdGg6IHZpZXdwb3J0LndpZHRoLFxuICAgICAgICBoZWlnaHQ6IHZpZXdwb3J0LmhlaWdodCxcbiAgICAgICAgc2VsZldpZHRoOiB0aGlzLl9jb250ZW50LmNsaWVudFdpZHRoLFxuICAgICAgICBzZWxmSGVpZ2h0OiB0aGlzLl9jb250ZW50LmNsaWVudEhlaWdodFxuICAgICAgfSkgOiBhbmNob3I7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFuY2hvcjtcbiAgfVxuXG4gIF9vbkNsb3NlKCkge1xuICAgIHRoaXMucHJvcHMub25DbG9zZSgpO1xuICB9XG5cbiAgX2NvbnRlbnRMb2FkZWQocmVmKSB7XG4gICAgdGhpcy5fY29udGVudCA9IHJlZjtcbiAgfVxuXG4gIF9yZW5kZXJUaXAoKSB7XG4gICAgY29uc3Qge3RpcFNpemV9ID0gdGhpcy5wcm9wcztcblxuICAgIHJldHVybiBjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICBrZXk6ICd0aXAnLFxuICAgICAgY2xhc3NOYW1lOiAnbWFwYm94Z2wtcG9wdXAtdGlwJyxcbiAgICAgIHN0eWxlOiB7Ym9yZGVyV2lkdGg6IHRpcFNpemV9XG4gICAgfSk7XG4gIH1cblxuICBfcmVuZGVyQ29udGVudCgpIHtcbiAgICBjb25zdCB7Y2xvc2VCdXR0b24sIGNoaWxkcmVufSA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgIGtleTogJ2NvbnRlbnQnLFxuICAgICAgcmVmOiB0aGlzLl9jb250ZW50TG9hZGVkLFxuICAgICAgY2xhc3NOYW1lOiAnbWFwYm94Z2wtcG9wdXAtY29udGVudCdcbiAgICB9LCBbXG4gICAgICBjbG9zZUJ1dHRvbiAmJiBjcmVhdGVFbGVtZW50KCdidXR0b24nLCB7XG4gICAgICAgIGtleTogJ2Nsb3NlLWJ1dHRvbicsXG4gICAgICAgIGNsYXNzTmFtZTogJ21hcGJveGdsLXBvcHVwLWNsb3NlLWJ1dHRvbicsXG4gICAgICAgIHR5cGU6ICdidXR0b24nLFxuICAgICAgICBvbkNsaWNrOiB0aGlzLl9vbkNsb3NlXG4gICAgICB9LCAnw5cnKSxcbiAgICAgIGNoaWxkcmVuXG4gICAgXSk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge2NsYXNzTmFtZSwgbG9uZ2l0dWRlLCBsYXRpdHVkZSwgb2Zmc2V0TGVmdCwgb2Zmc2V0VG9wLCBjbG9zZU9uQ2xpY2t9ID0gdGhpcy5wcm9wcztcblxuICAgIGNvbnN0IFt4LCB5XSA9IHRoaXMuY29udGV4dC52aWV3cG9ydC5wcm9qZWN0KFtsb25naXR1ZGUsIGxhdGl0dWRlXSk7XG5cbiAgICBjb25zdCBwb3NpdGlvblR5cGUgPSB0aGlzLl9nZXRQb3NpdGlvbih4LCB5KTtcbiAgICBjb25zdCBhbmNob3JQb3NpdGlvbiA9IEFOQ0hPUl9QT1NJVElPTltwb3NpdGlvblR5cGVdO1xuXG4gICAgY29uc3QgY29udGFpbmVyU3R5bGUgPSB7XG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgIGxlZnQ6IHggKyBvZmZzZXRMZWZ0LFxuICAgICAgdG9wOiB5ICsgb2Zmc2V0VG9wLFxuICAgICAgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7LWFuY2hvclBvc2l0aW9uLnggKiAxMDB9JSwgJHstYW5jaG9yUG9zaXRpb24ueSAqIDEwMH0lKWBcbiAgICB9O1xuXG4gICAgcmV0dXJuIGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgIGNsYXNzTmFtZTogYG1hcGJveGdsLXBvcHVwIG1hcGJveGdsLXBvcHVwLWFuY2hvci0ke3Bvc2l0aW9uVHlwZX0gJHtjbGFzc05hbWV9YCxcbiAgICAgIHN0eWxlOiBjb250YWluZXJTdHlsZSxcbiAgICAgIHJlZjogdGhpcy5fb25Db250YWluZXJMb2FkLFxuICAgICAgb25DbGljazogY2xvc2VPbkNsaWNrID8gdGhpcy5fb25DbG9zZSA6IG51bGxcbiAgICB9LCBbXG4gICAgICB0aGlzLl9yZW5kZXJUaXAoKSxcbiAgICAgIHRoaXMuX3JlbmRlckNvbnRlbnQoKVxuICAgIF0pO1xuICB9XG5cbn1cblxuUG9wdXAuZGlzcGxheU5hbWUgPSAnUG9wdXAnO1xuUG9wdXAucHJvcFR5cGVzID0gcHJvcFR5cGVzO1xuUG9wdXAuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuIl19