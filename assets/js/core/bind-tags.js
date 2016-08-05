(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.bindTag = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var isProxyPolyfill = false
if (typeof Proxy === 'undefined') {
  isProxyPolyfill = true
  require('proxy-polyfill/proxy.min.js')
}
var proxy_cache = [
  /*
  {
    target: Variable,
    value: Proxy,
    tags: [ Tag, ... ]
  }
  */
]
var canProxy = function (input) {
  if (input instanceof Date) return false
  return (Array.isArray(input) || (typeof input === 'object' && input))
}
var getCached = function (target) {
  for (var i = 0; i < proxy_cache.length; i++) {
    if (proxy_cache[i].target === target || proxy_cache[i].value === target) {
      return proxy_cache[i]
    }
  }
  return false
}
var setCached = function (proxy) {
  proxy_cache.push(proxy)
  return proxy
}

var createProxy = module.exports = function (target, deep, parentProxy) {
  var cached = getCached(target)
  if (cached) {
    return cached
  }

  var proxy = setCached({
    target: target,
    value: null,
    tags: [],
    updateRelatedProxyTags: function () {
      for (var i = 0; i < proxy.tags.length; i++) {
        if (proxy.tags[i]._bindingsEnabled === false) continue
        proxy.tags[i].update()
      }
      if (parentProxy) {
        parentProxy.updateRelatedProxyTags()
      }
    }
  })

  if (Array.isArray(target)) {
    var array = target
    if (deep) {
      for (var i = 0; i < array.length; i++) {
        if (canProxy(array[i])) {
          array[i] = createProxy(array[i], deep, proxy).value
        }
      }
    }
    if (isProxyPolyfill) {
      var oPush = array.push
      var oSplice = array.splice
      array.push = function () {
        oPush.apply(this, arguments)
        proxy.updateRelatedProxyTags()
      }
      array.splice = function () {
        oSplice.apply(this, arguments)
        proxy.updateRelatedProxyTags()
      }
      proxy.value = array
    } else {
      proxy.value = new Proxy(array, {
        set: function (obj, prop, newval) {
          if (canProxy(newval) && deep) {
            newval = createProxy(newval, deep, proxy).value
          }
          obj[prop] = newval
          proxy.updateRelatedProxyTags()
          return true
        }
      })
    }
  } else {
    var object = target
    if (deep) {
      for (var key in object) {
        if (canProxy(object[key])) {
          object[key] = createProxy(object[key], deep, proxy).value
        }
      }
    }
    proxy.value = new Proxy(object, {
      set: function (obj, prop, newval) {
        if (canProxy(newval) && deep) {
          newval = createProxy(newval, deep, proxy).value
        }
        obj[prop] = newval
        proxy.updateRelatedProxyTags()
        return true
      }
    })
  }

  return proxy
}

},{"proxy-polyfill/proxy.min.js":3}],2:[function(require,module,exports){
var createProxy = require('./create-proxy')

module.exports = function (tag) {
  var modelBindCache = []
  var tagProxies = []
  var bindModelsHandler

  var addProxyToTag = function (proxy) {
    if (tagProxies.indexOf(proxy) === -1) {
      tagProxies.push(proxy)
    }
  }

  tag.disableBindings = function () {
    tag._bindingsEnabled = false
  }
  tag.enableBindings = function () {
    tag._bindingsEnabled = true
    tag.update()
  }

  tag.bind = function (propertyName, object, deep, update) {
    if (typeof object !== 'object') throw new Error(object + ' ' + typeof object + ' is not object')
    if (typeof deep === 'undefined') deep = true
    if (typeof update === 'undefined') update = true
    var proxy = createProxy(object, deep)
    if (update) {
      if (proxy.tags.indexOf(tag) === -1) {
        proxy.tags.push(tag)
      }
    }
    tag[propertyName] = proxy.value
    addProxyToTag(proxy)
    if (update) {
      tag.update()
    }
  }

  tag.bindOpt = function (propertyName, optName, onbind, deep) {
    if (typeof optName === 'undefined') {
      optName = propertyName
    }
    if (typeof optName === 'function') {
      onbind = optName
      optName = propertyName
    }
    if (typeof deep === 'undefined') {
      deep = true
    }
    var rebind = function () {
      var proxy = createProxy(tag.opts[optName], deep)
      if (proxy.tags.indexOf(tag) === -1) {
        proxy.tags.push(tag)
      }
      tag[propertyName] = proxy.value
      addProxyToTag(proxy)
      onbind && onbind()
    }
    tag.on('update', rebind)
    rebind()
  }

  var getElementsWithModels = function (tag) {
    var elements = tag.root.querySelectorAll('[tag-value]')
    var result = []
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].attributes['tag-value'].value.split('#')[0] === tag._riot_id.toString()) {
        result.push(elements[i])
      }
    }
    return result
  }

  var bindElementChangeToModel = function (el) {
    var modelPath = el.attributes['tag-value'].value.split('#')[1]
    var handler = function (e) {
      _.set(tag, modelPath, e.target.value)
    }
    el.addEventListener('change', handler)
    if (el.attributes['multiple']) {
      var value = _.get(tag, modelPath) || []
      for (var i = 0 ; i < el.children.length ; i++) {
        var option = el.children[i]
        if (value.indexOf(option.value) !== -1) {
          option.selected = true
        }
      }
    } else {
      el.value = _.get(tag, modelPath)
    }
    modelBindCache.push({
      el: el,
      fn: handler
    })
  }

  var bindModels = function () {
    if (!bindModelsHandler) {
      bindModelsHandler = function () {
        var i = 0
        for (i = 0; i < modelBindCache.length; i++) {
          var pair = modelBindCache[i]
          pair.el.removeEventListener('change', pair.fn)
        }
        modelBindCache = []
        var elementsWithModels = getElementsWithModels(tag)
        for (i = 0; i < elementsWithModels.length; i++) {
          bindElementChangeToModel(elementsWithModels[i])
        }
      }
      tag.on('mount', bindModelsHandler)
      tag.on('updated', bindModelsHandler)
    }
  }

  tag.bindProp = function (modelPath) {
    bindModels()
    return tag._riot_id + '#' + modelPath
  }

  tag.on('unmount', function () {
    for (var i = 0; i < tagProxies.length; i++) {
      var proxy = tagProxies[i]
      var tagIndex = proxy.tags.indexOf(tag)
      if (tagIndex !== -1) {
        proxy.tags.splice(tagIndex, 1)
      }
    }
    if (bindModelsHandler) {
      tag.off('mount', bindModelsHandler)
      tag.off('updated', bindModelsHandler)
      bindModelsHandler = null
    }
  })
}

},{"./create-proxy":1}],3:[function(require,module,exports){
(function (global){
(function(d){function k(a){return a?"object"==typeof a||"function"==typeof a:!1}if(!d.Proxy){var l=null;d.a=function(a,c){function d(){}if(!k(a)||!k(c))throw new TypeError("Cannot create proxy with a non-object as target or handler");l=function(){d=function(b){throw new TypeError("Cannot perform '"+b+"' on a proxy that has been revoked");}};var f=c;c={get:null,set:null,apply:null,construct:null};for(var g in f){if(!(g in c))throw new TypeError("Proxy polyfill does not support trap '"+g+"'");c[g]=
f[g]}"function"==typeof f&&(c.apply=f.apply.bind(f));var e=this,m=!1,n="function"==typeof a;if(c.apply||c.construct||n)e=function(){var b=this&&this.constructor===e;d(b?"construct":"apply");if(b&&c.construct)return c.construct.call(this,a,arguments);if(!b&&c.apply)return c.apply(a,this,arguments);if(n)return b?(b=Array.prototype.slice.call(arguments),b.unshift(a),new (a.bind.apply(a,b))):a.apply(this,arguments);throw new TypeError(b?"not a constructor":"not a function");},m=!0;var p=c.get?function(b){d("get");
return c.get(this,b,e)}:function(b){d("get");return this[b]},r=c.set?function(b,a){d("set");c.set(this,b,a,e)}:function(a,c){d("set");this[a]=c},q={};Object.getOwnPropertyNames(a).forEach(function(b){m&&b in e||(Object.defineProperty(e,b,{enumerable:!!Object.getOwnPropertyDescriptor(a,b).enumerable,get:p.bind(a,b),set:r.bind(a,b)}),q[b]=!0)});f=!0;Object.setPrototypeOf?Object.setPrototypeOf(e,Object.getPrototypeOf(a)):e.__proto__?e.__proto__=a.__proto__:f=!1;if(c.get||!f)for(var h in a)q[h]||Object.defineProperty(e,
h,{get:p.bind(a,h)});Object.seal(a);Object.seal(e);return e};d.a.b=function(a,c){return{proxy:new d.a(a,c),revoke:l}};d.a.revocable=d.a.b;d.Proxy=d.a}})("undefined"!==typeof module&&module.exports?global:window);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[2])(2)
});