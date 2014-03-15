/**
 * Identity Map for Backbone models.
 *
 * Usage:
 *
 *    var NewModel = Backbone.IdentityMap(Backbone.Model.extend(
 *      {...},
 *      {...}
 *    ));
 *
 * A model that is wrapped in IdentityMap will cache models by their
 * ID. Any time you call new NewModel(), and you pass in an id
 * attribute, IdentityMap will check the cache to see if that object
 * has already been created. If so, that existing object will be
 * returned. Otherwise, a new model will be instantiated.
 *
 * Any models that are created without an ID will instantiate a new
 * object. If that model is subsequently assigned an ID, it will add
 * itself to the cache with this ID. If by that point another object
 * has already been assigned to the cache with the same ID, then
 * that object will be overridden.
 */
;(function() {

  // Stores cached models:
  // key: (unique identifier per class) + ':' + (model id)
  // value: model object
  var cache = {};

  // Stores usage count for stored models
  // key: (unique identifier per class) + ':' + (model id)
  // value: current usage count. Call release() to decrement
  var counts = {};

  /**
   * realConstructor: a backbone model constructor function
   * returns a constructor function that acts like realConstructor,
   * but returns cached objects if possible.
   */
  Backbone.IdentityMap = function(realConstructor) {
    var classCacheKey = _.uniqueId();
    var modelConstructor = _.extend(function(attributes, options) {
      // creates a new object (used if the object isn't found in
      // the cache)
      var create = function() {
        return new realConstructor(attributes, options);
      };
      var objectId = attributes &&
        attributes[realConstructor.prototype.idAttribute];
      // if there is an ID, check if that object exists in the
      // cache already
      if (objectId) {
        var cacheKey = classCacheKey + ':' + objectId;
        if (!cache[cacheKey]) {
          // the object has an ID, but isn't found in the cache
          cache[cacheKey] = create();
        } else {
          // the object was in the cache
          var object = cache[cacheKey];
          // set up the object just like new Backbone.Model() would
          if (options && options.parse) {
            attributes = object.parse(attributes);
          }
          object.set(attributes);
        }
        cache[cacheKey].release = function() {
          counts[cacheKey]--;
        };
        counts[cacheKey] = (counts[cacheKey] || 0) + 1;
        return cache[cacheKey];
      } else {
        var obj = create();
        obj.release = function() {};

        // when an object's id is set, add it to the cache
        obj.on('change:' + realConstructor.prototype.idAttribute,
          function(model, objectId) {
            var cacheKey = classCacheKey + ':' + objectId;
            cache[cacheKey] = obj;
            counts[cacheKey] = (counts[cacheKey] || 0) + 1;
            this.release = function() {
              counts[cacheKey]--;
            };
            obj.off(null, null, this);
          },
        this);
        return obj;
      }
    }, realConstructor);
    modelConstructor.prototype = realConstructor.prototype;
    return modelConstructor;
  };

  /**
   * Clears the cache. (useful for unit testing)
   */
  Backbone.IdentityMap.resetCache = function() {
    cache = {};
    counts = {};
  };

  /**
   * Clear unused items from the cache.
   */
  Backbone.IdentityMap.purgeCache = function() {
    _.each(counts, function(count, cacheKey) {
      if (count <= 0 && cache[cacheKey]) {
        delete cache[cacheKey];
      }
    });
  };

  /**
   * Inspect what's in the cache & store.
   */
  Backbone.IdentityMap.getCache = function() {
    return {
      cache: cache,
      counts: counts
    };
  };

})();
