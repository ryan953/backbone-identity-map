An identity map for Backbone.js models.

Usage:

    var NewModel = Backbone.IdentityMap(Backbone.Model.extend(
      ...
    ));
 
A model that is wrapped in IdentityMap will cache models by their
ID. Any time you call new NewModel(), and you pass in an id
attribute, IdentityMap will check the cache to see if that object
has already been created. If so, that existing object will be
returned. Otherwise, a new model will be instantiated.

Any models that are created without an ID will instantiate a new
object. If that model is subsequently assigned an ID, it will add
itself to the cache with this ID. If by that point another object
has already been assigned to the cache with the same ID, then
that object will be overridden.

For more information, see http://blog.shinetech.com/2012/12/24/an-identity-map-for-backbone-js/
