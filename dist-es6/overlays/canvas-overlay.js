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
import BaseControl from '../components/base-control';
import { window } from '../utils/globals';
import autobind from '../utils/autobind';

var propTypes = Object.assign({}, BaseControl.propTypes, {
  redraw: PropTypes.func.isRequired
});

var defaultProps = {
  captureScroll: false,
  captureDrag: false,
  captureClick: false,
  captureDoubleClick: false
};

var CanvasOverlay = function (_BaseControl) {
  _inherits(CanvasOverlay, _BaseControl);

  function CanvasOverlay(props) {
    _classCallCheck(this, CanvasOverlay);

    var _this = _possibleConstructorReturn(this, (CanvasOverlay.__proto__ || Object.getPrototypeOf(CanvasOverlay)).call(this, props));

    autobind(_this);
    return _this;
  }

  _createClass(CanvasOverlay, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._redraw();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this._redraw();
    }
  }, {
    key: '_redraw',
    value: function _redraw() {
      var pixelRatio = window.devicePixelRatio || 1;
      var canvas = this._canvas;
      var ctx = canvas.getContext('2d');
      ctx.save();
      ctx.scale(pixelRatio, pixelRatio);

      var _context = this.context,
          viewport = _context.viewport,
          isDragging = _context.isDragging;

      this.props.redraw({
        width: viewport.width,
        height: viewport.height,
        ctx: ctx,
        isDragging: isDragging,
        project: viewport.project.bind(viewport),
        unproject: viewport.unproject.bind(viewport)
      });

      ctx.restore();
    }
  }, {
    key: '_canvasLoaded',
    value: function _canvasLoaded(ref) {
      this._canvas = ref;
      this._onContainerLoad(ref);
    }
  }, {
    key: 'render',
    value: function render() {
      var pixelRatio = window.devicePixelRatio || 1;
      var _context$viewport = this.context.viewport,
          width = _context$viewport.width,
          height = _context$viewport.height;


      return createElement('canvas', {
        ref: this._canvasLoaded,
        width: width * pixelRatio,
        height: height * pixelRatio,
        style: {
          width: width + 'px',
          height: height + 'px',
          position: 'absolute',
          pointerEvents: 'none',
          left: 0,
          top: 0
        }
      });
    }
  }]);

  return CanvasOverlay;
}(BaseControl);

export default CanvasOverlay;


CanvasOverlay.displayName = 'CanvasOverlay';
CanvasOverlay.propTypes = propTypes;
CanvasOverlay.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vdmVybGF5cy9jYW52YXMtb3ZlcmxheS5qcyJdLCJuYW1lcyI6WyJjcmVhdGVFbGVtZW50IiwiUHJvcFR5cGVzIiwiQmFzZUNvbnRyb2wiLCJ3aW5kb3ciLCJhdXRvYmluZCIsInByb3BUeXBlcyIsIk9iamVjdCIsImFzc2lnbiIsInJlZHJhdyIsImZ1bmMiLCJpc1JlcXVpcmVkIiwiZGVmYXVsdFByb3BzIiwiY2FwdHVyZVNjcm9sbCIsImNhcHR1cmVEcmFnIiwiY2FwdHVyZUNsaWNrIiwiY2FwdHVyZURvdWJsZUNsaWNrIiwiQ2FudmFzT3ZlcmxheSIsInByb3BzIiwiX3JlZHJhdyIsInBpeGVsUmF0aW8iLCJkZXZpY2VQaXhlbFJhdGlvIiwiY2FudmFzIiwiX2NhbnZhcyIsImN0eCIsImdldENvbnRleHQiLCJzYXZlIiwic2NhbGUiLCJjb250ZXh0Iiwidmlld3BvcnQiLCJpc0RyYWdnaW5nIiwid2lkdGgiLCJoZWlnaHQiLCJwcm9qZWN0IiwiYmluZCIsInVucHJvamVjdCIsInJlc3RvcmUiLCJyZWYiLCJfb25Db250YWluZXJMb2FkIiwiX2NhbnZhc0xvYWRlZCIsInN0eWxlIiwicG9zaXRpb24iLCJwb2ludGVyRXZlbnRzIiwibGVmdCIsInRvcCIsImRpc3BsYXlOYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVFBLGFBQVIsUUFBNEIsT0FBNUI7QUFDQSxPQUFPQyxTQUFQLE1BQXNCLFlBQXRCO0FBQ0EsT0FBT0MsV0FBUCxNQUF3Qiw0QkFBeEI7QUFDQSxTQUFRQyxNQUFSLFFBQXFCLGtCQUFyQjtBQUNBLE9BQU9DLFFBQVAsTUFBcUIsbUJBQXJCOztBQUVBLElBQU1DLFlBQVlDLE9BQU9DLE1BQVAsQ0FBYyxFQUFkLEVBQWtCTCxZQUFZRyxTQUE5QixFQUF5QztBQUN6REcsVUFBUVAsVUFBVVEsSUFBVixDQUFlQztBQURrQyxDQUF6QyxDQUFsQjs7QUFJQSxJQUFNQyxlQUFlO0FBQ25CQyxpQkFBZSxLQURJO0FBRW5CQyxlQUFhLEtBRk07QUFHbkJDLGdCQUFjLEtBSEs7QUFJbkJDLHNCQUFvQjtBQUpELENBQXJCOztJQU9xQkMsYTs7O0FBQ25CLHlCQUFZQyxLQUFaLEVBQW1CO0FBQUE7O0FBQUEsOEhBQ1hBLEtBRFc7O0FBRWpCYjtBQUZpQjtBQUdsQjs7Ozt3Q0FFbUI7QUFDbEIsV0FBS2MsT0FBTDtBQUNEOzs7eUNBRW9CO0FBQ25CLFdBQUtBLE9BQUw7QUFDRDs7OzhCQUVTO0FBQ1IsVUFBTUMsYUFBYWhCLE9BQU9pQixnQkFBUCxJQUEyQixDQUE5QztBQUNBLFVBQU1DLFNBQVMsS0FBS0MsT0FBcEI7QUFDQSxVQUFNQyxNQUFNRixPQUFPRyxVQUFQLENBQWtCLElBQWxCLENBQVo7QUFDQUQsVUFBSUUsSUFBSjtBQUNBRixVQUFJRyxLQUFKLENBQVVQLFVBQVYsRUFBc0JBLFVBQXRCOztBQUxRLHFCQU91QixLQUFLUSxPQVA1QjtBQUFBLFVBT0RDLFFBUEMsWUFPREEsUUFQQztBQUFBLFVBT1NDLFVBUFQsWUFPU0EsVUFQVDs7QUFRUixXQUFLWixLQUFMLENBQVdULE1BQVgsQ0FBa0I7QUFDaEJzQixlQUFPRixTQUFTRSxLQURBO0FBRWhCQyxnQkFBUUgsU0FBU0csTUFGRDtBQUdoQlIsZ0JBSGdCO0FBSWhCTSw4QkFKZ0I7QUFLaEJHLGlCQUFTSixTQUFTSSxPQUFULENBQWlCQyxJQUFqQixDQUFzQkwsUUFBdEIsQ0FMTztBQU1oQk0sbUJBQVdOLFNBQVNNLFNBQVQsQ0FBbUJELElBQW5CLENBQXdCTCxRQUF4QjtBQU5LLE9BQWxCOztBQVNBTCxVQUFJWSxPQUFKO0FBQ0Q7OztrQ0FFYUMsRyxFQUFLO0FBQ2pCLFdBQUtkLE9BQUwsR0FBZWMsR0FBZjtBQUNBLFdBQUtDLGdCQUFMLENBQXNCRCxHQUF0QjtBQUNEOzs7NkJBRVE7QUFDUCxVQUFNakIsYUFBYWhCLE9BQU9pQixnQkFBUCxJQUEyQixDQUE5QztBQURPLDhCQUU2QixLQUFLTyxPQUZsQyxDQUVBQyxRQUZBO0FBQUEsVUFFV0UsS0FGWCxxQkFFV0EsS0FGWDtBQUFBLFVBRWtCQyxNQUZsQixxQkFFa0JBLE1BRmxCOzs7QUFJUCxhQUNFL0IsY0FBYyxRQUFkLEVBQXdCO0FBQ3RCb0MsYUFBSyxLQUFLRSxhQURZO0FBRXRCUixlQUFPQSxRQUFRWCxVQUZPO0FBR3RCWSxnQkFBUUEsU0FBU1osVUFISztBQUl0Qm9CLGVBQU87QUFDTFQsaUJBQVVBLEtBQVYsT0FESztBQUVMQyxrQkFBV0EsTUFBWCxPQUZLO0FBR0xTLG9CQUFVLFVBSEw7QUFJTEMseUJBQWUsTUFKVjtBQUtMQyxnQkFBTSxDQUxEO0FBTUxDLGVBQUs7QUFOQTtBQUplLE9BQXhCLENBREY7QUFlRDs7OztFQTFEd0N6QyxXOztlQUF0QmMsYTs7O0FBNkRyQkEsY0FBYzRCLFdBQWQsR0FBNEIsZUFBNUI7QUFDQTVCLGNBQWNYLFNBQWQsR0FBMEJBLFNBQTFCO0FBQ0FXLGNBQWNMLFlBQWQsR0FBNkJBLFlBQTdCIiwiZmlsZSI6ImNhbnZhcy1vdmVybGF5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG5cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHtjcmVhdGVFbGVtZW50fSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IEJhc2VDb250cm9sIGZyb20gJy4uL2NvbXBvbmVudHMvYmFzZS1jb250cm9sJztcbmltcG9ydCB7d2luZG93fSBmcm9tICcuLi91dGlscy9nbG9iYWxzJztcbmltcG9ydCBhdXRvYmluZCBmcm9tICcuLi91dGlscy9hdXRvYmluZCc7XG5cbmNvbnN0IHByb3BUeXBlcyA9IE9iamVjdC5hc3NpZ24oe30sIEJhc2VDb250cm9sLnByb3BUeXBlcywge1xuICByZWRyYXc6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWRcbn0pO1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gIGNhcHR1cmVTY3JvbGw6IGZhbHNlLFxuICBjYXB0dXJlRHJhZzogZmFsc2UsXG4gIGNhcHR1cmVDbGljazogZmFsc2UsXG4gIGNhcHR1cmVEb3VibGVDbGljazogZmFsc2Vcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENhbnZhc092ZXJsYXkgZXh0ZW5kcyBCYXNlQ29udHJvbCB7XG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIGF1dG9iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5fcmVkcmF3KCk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgdGhpcy5fcmVkcmF3KCk7XG4gIH1cblxuICBfcmVkcmF3KCkge1xuICAgIGNvbnN0IHBpeGVsUmF0aW8gPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxO1xuICAgIGNvbnN0IGNhbnZhcyA9IHRoaXMuX2NhbnZhcztcbiAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBjdHguc2F2ZSgpO1xuICAgIGN0eC5zY2FsZShwaXhlbFJhdGlvLCBwaXhlbFJhdGlvKTtcblxuICAgIGNvbnN0IHt2aWV3cG9ydCwgaXNEcmFnZ2luZ30gPSB0aGlzLmNvbnRleHQ7XG4gICAgdGhpcy5wcm9wcy5yZWRyYXcoe1xuICAgICAgd2lkdGg6IHZpZXdwb3J0LndpZHRoLFxuICAgICAgaGVpZ2h0OiB2aWV3cG9ydC5oZWlnaHQsXG4gICAgICBjdHgsXG4gICAgICBpc0RyYWdnaW5nLFxuICAgICAgcHJvamVjdDogdmlld3BvcnQucHJvamVjdC5iaW5kKHZpZXdwb3J0KSxcbiAgICAgIHVucHJvamVjdDogdmlld3BvcnQudW5wcm9qZWN0LmJpbmQodmlld3BvcnQpXG4gICAgfSk7XG5cbiAgICBjdHgucmVzdG9yZSgpO1xuICB9XG5cbiAgX2NhbnZhc0xvYWRlZChyZWYpIHtcbiAgICB0aGlzLl9jYW52YXMgPSByZWY7XG4gICAgdGhpcy5fb25Db250YWluZXJMb2FkKHJlZik7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGl4ZWxSYXRpbyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDE7XG4gICAgY29uc3Qge3ZpZXdwb3J0OiB7d2lkdGgsIGhlaWdodH19ID0gdGhpcy5jb250ZXh0O1xuXG4gICAgcmV0dXJuIChcbiAgICAgIGNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycsIHtcbiAgICAgICAgcmVmOiB0aGlzLl9jYW52YXNMb2FkZWQsXG4gICAgICAgIHdpZHRoOiB3aWR0aCAqIHBpeGVsUmF0aW8sXG4gICAgICAgIGhlaWdodDogaGVpZ2h0ICogcGl4ZWxSYXRpbyxcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICB3aWR0aDogYCR7d2lkdGh9cHhgLFxuICAgICAgICAgIGhlaWdodDogYCR7aGVpZ2h0fXB4YCxcbiAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICBwb2ludGVyRXZlbnRzOiAnbm9uZScsXG4gICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICB0b3A6IDBcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICApO1xuICB9XG59XG5cbkNhbnZhc092ZXJsYXkuZGlzcGxheU5hbWUgPSAnQ2FudmFzT3ZlcmxheSc7XG5DYW52YXNPdmVybGF5LnByb3BUeXBlcyA9IHByb3BUeXBlcztcbkNhbnZhc092ZXJsYXkuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuIl19