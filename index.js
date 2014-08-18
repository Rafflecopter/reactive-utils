var partials = require('reactive-partials')
  , foreach = require('lodash.foreach')

module.exports = function wrap(reactive) {
  return function (template_or_el, model, options) {
    options = options || {}
    options.bindings = options.bindings || {}
    options.bindings['keep-if'] = keepIf
    options.bindings['remove-if'] = removeIf

    // We have a slightly different export syntax than reactive-partials
    var ptls = options.partials
      , nptls = options.partials = {}
    foreach(ptls, function (P, key) {
      nptls[key] = function (a,b) { return new P(a,b).view.el }
    })

    return partials(reactive)(template_or_el, model, options)
  }
}



// ---- Bindings ----

/* Our way of doing nested templates.
 *
 *  Example:
 *      after doing
 *          `reactive(tpl, model, {partials: {myPartial: ...}})`
 *      you can then do
 *          `<div partial-myPartial>`
 *
 *      You can also pass params to the partial like this:
 *          `<div partial-myPartial="x y z">`
 *
 */
function partial (Partial) {
  return function (el, property) {
    var partial = new Partial(this.reactive, property)
    partial._binding = this
    el.parentNode.replaceChild(partial.view.el, el)
  }
}


/* Removes the element from a page if a property is true.
 * Opposite of keepIf.
 *
 *  Example:
 *      `<span class="profile-data" keep-if="hasProfile">`
 *
 */
function removeIf(el, property) {
  var binding = this
    , parent = el.parentNode

  binding.change(function() {
    var value = binding.value(property)
    console.log('keep-if', property, value, el, el.parentNode, parent)
    if (value && el.parentNode) {
      el.parentNode.removeChild(el)
    } else if (value && !el.parentNode) {
      parent.appendChild(el)
    }
  });
};


/* Keeps the element on a page if a property is true.
 * Opposite of removeIf.
 *
 *  Example:
 *      `<span class="profile-data" keep-if="hasProfile">`
 *
 */
function keepIf(el, property) {
  var binding = this
    , parent = el.parentNode

  binding.change(function() {
    var value = binding.value(property)
    console.log('keep-if', property, value, el, el.parentNode, parent)
    if (!value && el.parentNode) {
      el.parentNode.removeChild(el)
    } else if (value && !el.parentNode) {
      parent.appendChild(el)
    }
  });
};


/* Keeps the element on a page if model[property] == value
 * Uses double-equal comparison.
 *
 *  Example:
 *      `<span class="propertyEditor" keep-if-equal="dataType=boolean">`
 *
 */
function keepIfEqual(el, attrVal) {
  var spl = attrVal.split(/ ?= ?/)
    , property = spl[0]
    , test = spl[1]

  var binding = this
    , parent = el.parentNode

  binding.change(function() {
    var value = binding.value(prop)
    if ((value == test) && el.parentNode) {
      el.parentNode.removeChild(el)
    } else if (value && !el.parentNode) {
      parent.appendChild(el)
    }
  })
}

