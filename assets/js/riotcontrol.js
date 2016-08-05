var _RiotControlApi = ['on','one','off','trigger']
window.RiotControl = {
    _stores: [],
    addStore: function(store) {
        this._stores.push(store);
    },
    reset: function() {
        this._stores = [];
    },
    getStores: function(name) {
      return this._stores.filter(function(obj) {
          if (obj.constructor.name === name || obj === name) {
              return obj;
          };
      });
    }
}

_RiotControlApi.forEach(function(api){
    RiotControl[api] = function() {
        var args = [].slice.call(arguments)
        this._stores.forEach(function(el){
            el[api].apply(null, args)
        })
    }
})

var RiotStore = (function () {
    this.self = this;
    var self = this;

    function RiotStore() {
        riot.observable(this);
        Object.getOwnPropertyNames(Object.getPrototypeOf(this)).forEach(function(obj) {
            if (typeof self[obj] !== 'function' || obj[0] === '_' ||
                obj === 'constructor' || obj.slice(0, 4) === 'class')  {
                return;
            }
            self.on(obj, self[obj]);
        })


    }
    return RiotStore;
}());