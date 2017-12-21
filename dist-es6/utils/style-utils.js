import { Map } from 'immutable';
import diffStyles from './diff-styles';

export function getInteractiveLayerIds(mapStyle) {
  var interactiveLayerIds = null;

  if (Map.isMap(mapStyle) && mapStyle.has('layers')) {
    interactiveLayerIds = mapStyle.get('layers').filter(function (l) {
      return l.get('interactive');
    }).map(function (l) {
      return l.get('id');
    }).toJS();
  } else if (Array.isArray(mapStyle.layers)) {
    interactiveLayerIds = mapStyle.layers.filter(function (l) {
      return l.interactive;
    }).map(function (l) {
      return l.id;
    });
  }

  return interactiveLayerIds;
}

// Individually update the maps source and layers that have changed if all
// other style props haven't changed. This prevents flicking of the map when
// styles only change sources or layers.
/* eslint-disable max-statements, complexity */
export function setDiffStyle(prevStyle, nextStyle, map) {
  var prevKeysMap = prevStyle && styleKeysMap(prevStyle) || {};
  var nextKeysMap = styleKeysMap(nextStyle);
  function styleKeysMap(style) {
    return style.map(function () {
      return true;
    }).delete('layers').delete('sources').toJS();
  }
  function propsOtherThanLayersOrSourcesDiffer() {
    var prevKeysList = Object.keys(prevKeysMap);
    var nextKeysList = Object.keys(nextKeysMap);
    if (prevKeysList.length !== nextKeysList.length) {
      return true;
    }
    // `nextStyle` and `prevStyle` should not have the same set of props.
    if (nextKeysList.some(function (key) {
      return prevStyle.get(key) !== nextStyle.get(key);
    }
    // But the value of one of those props is different.
    )) {
      return true;
    }
    return false;
  }

  if (!prevStyle || propsOtherThanLayersOrSourcesDiffer()) {
    map.setStyle(nextStyle.toJS());
    return;
  }

  var _diffStyles = diffStyles(prevStyle, nextStyle),
      sourcesDiff = _diffStyles.sourcesDiff,
      layersDiff = _diffStyles.layersDiff;

  // TODO: It's rather difficult to determine style diffing in the presence
  // of refs. For now, if any style update has a ref, fallback to no diffing.
  // We can come back to this case if there's a solid usecase.


  if (layersDiff.updates.some(function (node) {
    return node.layer.get('ref');
  })) {
    map.setStyle(nextStyle.toJS());
    return;
  }

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = sourcesDiff.enter[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var enter = _step.value;

      map.addSource(enter.id, enter.source.toJS());
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = sourcesDiff.update[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var update = _step2.value;

      updateStyleSource(map, update);
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = sourcesDiff.exit[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var exit = _step3.value;

      map.removeSource(exit.id);
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = layersDiff.exiting[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var _exit = _step4.value;

      if (map.style.getLayer(_exit.id)) {
        map.removeLayer(_exit.id);
      }
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = layersDiff.updates[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var _update = _step5.value;

      if (!_update.enter) {
        // This is an old layer that needs to be updated. Remove the old layer
        // with the same id and add it back again.
        map.removeLayer(_update.id);
      }
      map.addLayer(_update.layer.toJS(), _update.before);
    }
  } catch (err) {
    _didIteratorError5 = true;
    _iteratorError5 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion5 && _iterator5.return) {
        _iterator5.return();
      }
    } finally {
      if (_didIteratorError5) {
        throw _iteratorError5;
      }
    }
  }
}
/* eslint-enable max-statements, complexity */

// Update a source in the map style
function updateStyleSource(map, update) {
  var newSource = update.source.toJS();
  if (newSource.type === 'geojson') {
    var oldSource = map.getSource(update.id);
    if (oldSource.type === 'geojson') {
      // update data if no other GeoJSONSource options were changed
      var oldOpts = oldSource.workerOptions;
      if ((newSource.maxzoom === undefined || newSource.maxzoom === oldOpts.geojsonVtOptions.maxZoom) && (newSource.buffer === undefined || newSource.buffer === oldOpts.geojsonVtOptions.buffer) && (newSource.tolerance === undefined || newSource.tolerance === oldOpts.geojsonVtOptions.tolerance) && (newSource.cluster === undefined || newSource.cluster === oldOpts.cluster) && (newSource.clusterRadius === undefined || newSource.clusterRadius === oldOpts.superclusterOptions.radius) && (newSource.clusterMaxZoom === undefined || newSource.clusterMaxZoom === oldOpts.superclusterOptions.maxZoom)) {
        oldSource.setData(newSource.data);
        return;
      }
    }
  }

  map.removeSource(update.id);
  map.addSource(update.id, newSource);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9zdHlsZS11dGlscy5qcyJdLCJuYW1lcyI6WyJNYXAiLCJkaWZmU3R5bGVzIiwiZ2V0SW50ZXJhY3RpdmVMYXllcklkcyIsIm1hcFN0eWxlIiwiaW50ZXJhY3RpdmVMYXllcklkcyIsImlzTWFwIiwiaGFzIiwiZ2V0IiwiZmlsdGVyIiwibCIsIm1hcCIsInRvSlMiLCJBcnJheSIsImlzQXJyYXkiLCJsYXllcnMiLCJpbnRlcmFjdGl2ZSIsImlkIiwic2V0RGlmZlN0eWxlIiwicHJldlN0eWxlIiwibmV4dFN0eWxlIiwicHJldktleXNNYXAiLCJzdHlsZUtleXNNYXAiLCJuZXh0S2V5c01hcCIsInN0eWxlIiwiZGVsZXRlIiwicHJvcHNPdGhlclRoYW5MYXllcnNPclNvdXJjZXNEaWZmZXIiLCJwcmV2S2V5c0xpc3QiLCJPYmplY3QiLCJrZXlzIiwibmV4dEtleXNMaXN0IiwibGVuZ3RoIiwic29tZSIsImtleSIsInNldFN0eWxlIiwic291cmNlc0RpZmYiLCJsYXllcnNEaWZmIiwidXBkYXRlcyIsIm5vZGUiLCJsYXllciIsImVudGVyIiwiYWRkU291cmNlIiwic291cmNlIiwidXBkYXRlIiwidXBkYXRlU3R5bGVTb3VyY2UiLCJleGl0IiwicmVtb3ZlU291cmNlIiwiZXhpdGluZyIsImdldExheWVyIiwicmVtb3ZlTGF5ZXIiLCJhZGRMYXllciIsImJlZm9yZSIsIm5ld1NvdXJjZSIsInR5cGUiLCJvbGRTb3VyY2UiLCJnZXRTb3VyY2UiLCJvbGRPcHRzIiwid29ya2VyT3B0aW9ucyIsIm1heHpvb20iLCJ1bmRlZmluZWQiLCJnZW9qc29uVnRPcHRpb25zIiwibWF4Wm9vbSIsImJ1ZmZlciIsInRvbGVyYW5jZSIsImNsdXN0ZXIiLCJjbHVzdGVyUmFkaXVzIiwic3VwZXJjbHVzdGVyT3B0aW9ucyIsInJhZGl1cyIsImNsdXN0ZXJNYXhab29tIiwic2V0RGF0YSIsImRhdGEiXSwibWFwcGluZ3MiOiJBQUFBLFNBQVFBLEdBQVIs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QkFBUixDQUE0QkwsT0FYM0QsQ0FERixFQWFFO0FBQ0FQLGtCQUFVZSxPQUFWLENBQWtCakIsVUFBVWtCLElBQTVCO0FBQ0E7QUFDRDtBQUNGO0FBQ0Y7O0FBRUQzRCxNQUFJbUMsWUFBSixDQUFpQkgsT0FBTzFCLEVBQXhCO0FBQ0FOLE1BQUk4QixTQUFKLENBQWNFLE9BQU8xQixFQUFyQixFQUF5Qm1DLFNBQXpCO0FBQ0QiLCJmaWxlIjoic3R5bGUtdXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge01hcH0gZnJvbSAnaW1tdXRhYmxlJztcbmltcG9ydCBkaWZmU3R5bGVzIGZyb20gJy4vZGlmZi1zdHlsZXMnO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW50ZXJhY3RpdmVMYXllcklkcyhtYXBTdHlsZSkge1xuICBsZXQgaW50ZXJhY3RpdmVMYXllcklkcyA9IG51bGw7XG5cbiAgaWYgKE1hcC5pc01hcChtYXBTdHlsZSkgJiYgbWFwU3R5bGUuaGFzKCdsYXllcnMnKSkge1xuICAgIGludGVyYWN0aXZlTGF5ZXJJZHMgPSBtYXBTdHlsZS5nZXQoJ2xheWVycycpXG4gICAgICAuZmlsdGVyKGwgPT4gbC5nZXQoJ2ludGVyYWN0aXZlJykpXG4gICAgICAubWFwKGwgPT4gbC5nZXQoJ2lkJykpXG4gICAgICAudG9KUygpO1xuICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkobWFwU3R5bGUubGF5ZXJzKSkge1xuICAgIGludGVyYWN0aXZlTGF5ZXJJZHMgPSBtYXBTdHlsZS5sYXllcnMuZmlsdGVyKGwgPT4gbC5pbnRlcmFjdGl2ZSlcbiAgICAgIC5tYXAobCA9PiBsLmlkKTtcbiAgfVxuXG4gIHJldHVybiBpbnRlcmFjdGl2ZUxheWVySWRzO1xufVxuXG4vLyBJbmRpdmlkdWFsbHkgdXBkYXRlIHRoZSBtYXBzIHNvdXJjZSBhbmQgbGF5ZXJzIHRoYXQgaGF2ZSBjaGFuZ2VkIGlmIGFsbFxuLy8gb3RoZXIgc3R5bGUgcHJvcHMgaGF2ZW4ndCBjaGFuZ2VkLiBUaGlzIHByZXZlbnRzIGZsaWNraW5nIG9mIHRoZSBtYXAgd2hlblxuLy8gc3R5bGVzIG9ubHkgY2hhbmdlIHNvdXJjZXMgb3IgbGF5ZXJzLlxuLyogZXNsaW50LWRpc2FibGUgbWF4LXN0YXRlbWVudHMsIGNvbXBsZXhpdHkgKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXREaWZmU3R5bGUocHJldlN0eWxlLCBuZXh0U3R5bGUsIG1hcCkge1xuICBjb25zdCBwcmV2S2V5c01hcCA9IHByZXZTdHlsZSAmJiBzdHlsZUtleXNNYXAocHJldlN0eWxlKSB8fCB7fTtcbiAgY29uc3QgbmV4dEtleXNNYXAgPSBzdHlsZUtleXNNYXAobmV4dFN0eWxlKTtcbiAgZnVuY3Rpb24gc3R5bGVLZXlzTWFwKHN0eWxlKSB7XG4gICAgcmV0dXJuIHN0eWxlLm1hcCgoKSA9PiB0cnVlKS5kZWxldGUoJ2xheWVycycpLmRlbGV0ZSgnc291cmNlcycpLnRvSlMoKTtcbiAgfVxuICBmdW5jdGlvbiBwcm9wc090aGVyVGhhbkxheWVyc09yU291cmNlc0RpZmZlcigpIHtcbiAgICBjb25zdCBwcmV2S2V5c0xpc3QgPSBPYmplY3Qua2V5cyhwcmV2S2V5c01hcCk7XG4gICAgY29uc3QgbmV4dEtleXNMaXN0ID0gT2JqZWN0LmtleXMobmV4dEtleXNNYXApO1xuICAgIGlmIChwcmV2S2V5c0xpc3QubGVuZ3RoICE9PSBuZXh0S2V5c0xpc3QubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgLy8gYG5leHRTdHlsZWAgYW5kIGBwcmV2U3R5bGVgIHNob3VsZCBub3QgaGF2ZSB0aGUgc2FtZSBzZXQgb2YgcHJvcHMuXG4gICAgaWYgKG5leHRLZXlzTGlzdC5zb21lKFxuICAgICAga2V5ID0+IHByZXZTdHlsZS5nZXQoa2V5KSAhPT0gbmV4dFN0eWxlLmdldChrZXkpXG4gICAgICAvLyBCdXQgdGhlIHZhbHVlIG9mIG9uZSBvZiB0aG9zZSBwcm9wcyBpcyBkaWZmZXJlbnQuXG4gICAgKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghcHJldlN0eWxlIHx8IHByb3BzT3RoZXJUaGFuTGF5ZXJzT3JTb3VyY2VzRGlmZmVyKCkpIHtcbiAgICBtYXAuc2V0U3R5bGUobmV4dFN0eWxlLnRvSlMoKSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3Qge3NvdXJjZXNEaWZmLCBsYXllcnNEaWZmfSA9IGRpZmZTdHlsZXMocHJldlN0eWxlLCBuZXh0U3R5bGUpO1xuXG4gIC8vIFRPRE86IEl0J3MgcmF0aGVyIGRpZmZpY3VsdCB0byBkZXRlcm1pbmUgc3R5bGUgZGlmZmluZyBpbiB0aGUgcHJlc2VuY2VcbiAgLy8gb2YgcmVmcy4gRm9yIG5vdywgaWYgYW55IHN0eWxlIHVwZGF0ZSBoYXMgYSByZWYsIGZhbGxiYWNrIHRvIG5vIGRpZmZpbmcuXG4gIC8vIFdlIGNhbiBjb21lIGJhY2sgdG8gdGhpcyBjYXNlIGlmIHRoZXJlJ3MgYSBzb2xpZCB1c2VjYXNlLlxuICBpZiAobGF5ZXJzRGlmZi51cGRhdGVzLnNvbWUobm9kZSA9PiBub2RlLmxheWVyLmdldCgncmVmJykpKSB7XG4gICAgbWFwLnNldFN0eWxlKG5leHRTdHlsZS50b0pTKCkpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGZvciAoY29uc3QgZW50ZXIgb2Ygc291cmNlc0RpZmYuZW50ZXIpIHtcbiAgICBtYXAuYWRkU291cmNlKGVudGVyLmlkLCBlbnRlci5zb3VyY2UudG9KUygpKTtcbiAgfVxuICBmb3IgKGNvbnN0IHVwZGF0ZSBvZiBzb3VyY2VzRGlmZi51cGRhdGUpIHtcbiAgICB1cGRhdGVTdHlsZVNvdXJjZShtYXAsIHVwZGF0ZSk7XG4gIH1cbiAgZm9yIChjb25zdCBleGl0IG9mIHNvdXJjZXNEaWZmLmV4aXQpIHtcbiAgICBtYXAucmVtb3ZlU291cmNlKGV4aXQuaWQpO1xuICB9XG4gIGZvciAoY29uc3QgZXhpdCBvZiBsYXllcnNEaWZmLmV4aXRpbmcpIHtcbiAgICBpZiAobWFwLnN0eWxlLmdldExheWVyKGV4aXQuaWQpKSB7XG4gICAgICBtYXAucmVtb3ZlTGF5ZXIoZXhpdC5pZCk7XG4gICAgfVxuICB9XG4gIGZvciAoY29uc3QgdXBkYXRlIG9mIGxheWVyc0RpZmYudXBkYXRlcykge1xuICAgIGlmICghdXBkYXRlLmVudGVyKSB7XG4gICAgICAvLyBUaGlzIGlzIGFuIG9sZCBsYXllciB0aGF0IG5lZWRzIHRvIGJlIHVwZGF0ZWQuIFJlbW92ZSB0aGUgb2xkIGxheWVyXG4gICAgICAvLyB3aXRoIHRoZSBzYW1lIGlkIGFuZCBhZGQgaXQgYmFjayBhZ2Fpbi5cbiAgICAgIG1hcC5yZW1vdmVMYXllcih1cGRhdGUuaWQpO1xuICAgIH1cbiAgICBtYXAuYWRkTGF5ZXIodXBkYXRlLmxheWVyLnRvSlMoKSwgdXBkYXRlLmJlZm9yZSk7XG4gIH1cbn1cbi8qIGVzbGludC1lbmFibGUgbWF4LXN0YXRlbWVudHMsIGNvbXBsZXhpdHkgKi9cblxuLy8gVXBkYXRlIGEgc291cmNlIGluIHRoZSBtYXAgc3R5bGVcbmZ1bmN0aW9uIHVwZGF0ZVN0eWxlU291cmNlKG1hcCwgdXBkYXRlKSB7XG4gIGNvbnN0IG5ld1NvdXJjZSA9IHVwZGF0ZS5zb3VyY2UudG9KUygpO1xuICBpZiAobmV3U291cmNlLnR5cGUgPT09ICdnZW9qc29uJykge1xuICAgIGNvbnN0IG9sZFNvdXJjZSA9IG1hcC5nZXRTb3VyY2UodXBkYXRlLmlkKTtcbiAgICBpZiAob2xkU291cmNlLnR5cGUgPT09ICdnZW9qc29uJykge1xuICAgICAgLy8gdXBkYXRlIGRhdGEgaWYgbm8gb3RoZXIgR2VvSlNPTlNvdXJjZSBvcHRpb25zIHdlcmUgY2hhbmdlZFxuICAgICAgY29uc3Qgb2xkT3B0cyA9IG9sZFNvdXJjZS53b3JrZXJPcHRpb25zO1xuICAgICAgaWYgKFxuICAgICAgICAobmV3U291cmNlLm1heHpvb20gPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgIG5ld1NvdXJjZS5tYXh6b29tID09PSBvbGRPcHRzLmdlb2pzb25WdE9wdGlvbnMubWF4Wm9vbSkgJiZcbiAgICAgICAgKG5ld1NvdXJjZS5idWZmZXIgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgIG5ld1NvdXJjZS5idWZmZXIgPT09IG9sZE9wdHMuZ2VvanNvblZ0T3B0aW9ucy5idWZmZXIpICYmXG4gICAgICAgIChuZXdTb3VyY2UudG9sZXJhbmNlID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICBuZXdTb3VyY2UudG9sZXJhbmNlID09PSBvbGRPcHRzLmdlb2pzb25WdE9wdGlvbnMudG9sZXJhbmNlKSAmJlxuICAgICAgICAobmV3U291cmNlLmNsdXN0ZXIgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgIG5ld1NvdXJjZS5jbHVzdGVyID09PSBvbGRPcHRzLmNsdXN0ZXIpICYmXG4gICAgICAgIChuZXdTb3VyY2UuY2x1c3RlclJhZGl1cyA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgbmV3U291cmNlLmNsdXN0ZXJSYWRpdXMgPT09IG9sZE9wdHMuc3VwZXJjbHVzdGVyT3B0aW9ucy5yYWRpdXMpICYmXG4gICAgICAgIChuZXdTb3VyY2UuY2x1c3Rlck1heFpvb20gPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgIG5ld1NvdXJjZS5jbHVzdGVyTWF4Wm9vbSA9PT0gb2xkT3B0cy5zdXBlcmNsdXN0ZXJPcHRpb25zLm1heFpvb20pXG4gICAgICApIHtcbiAgICAgICAgb2xkU291cmNlLnNldERhdGEobmV3U291cmNlLmRhdGEpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbWFwLnJlbW92ZVNvdXJjZSh1cGRhdGUuaWQpO1xuICBtYXAuYWRkU291cmNlKHVwZGF0ZS5pZCwgbmV3U291cmNlKTtcbn1cbiJdfQ==