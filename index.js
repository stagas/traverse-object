
/*!
 *
 * Traverse-object
 *
 * MIT License.
 *
 */

/**
 * Module dependencies.
 */

var type = require('type'),
    indexof = require('indexof');

/**
 * Traverse.
 */

function Traverse() {}

/**
 * Proto.
 */

var proto = Traverse.prototype;

/**
 * Depth-first iterator.
 */

proto.depth = iterator('depth');

/**
 * Breadth-first iterator.
 */

proto.breadth = iterator('breadth');

/**
 * Filter bind.
 *
 * @param {Function} filter
 * @return {Object}
 * @api public
 */

proto.filter = function(filter) {
  if (this.filters) {
    this.filters.push(filter);
    return this;
  }
  else {
    var traverse = new Traverse();
    traverse.filters = [filter];
    return traverse;
  }
};

/**
 * Exports.
 */

exports = module.exports = new Traverse();
exports.Traverse = Traverse;

/**
 * Iterator strategy.
 *
 * @param {String} method
 * @api private
 */

function iterator(method) {
  // determine strategy type
  var isBreadth = 'breadth' == method;

  /**
   * Iterator runner.
   *
   * @param {Object} target
   * @param {Function} fn
   * @param {Function} [filter]
   * @api public
   */

  return function runner(target, fn, filter, visited, queue, flush) {
    if (isBreadth && !queue) {
      queue = [];
      flush = true;
    }

    var filters = this.filters;

    if (filters) {
      if (filter) filters = filters.concat([filter]);
      filter = all(filters);
    }
    else {
      filter = filter || pass;
    }

    visited = visited || [];
    visited.push(target);

    for (var key in target) {
      var item = target[key];

      if (filter(key, item)) {
        fn.call(target, key, item);

        if ('object' == type(item)
        && !~indexof(visited, item)
        ) {
          if (isBreadth) queue.push(item);
          else runner.call(this, item, fn, null, visited);
        }
      }
    }

    if (flush && queue) {
      var c = queue.slice(),
          len = c.length,
          last = len - 1;

      queue = [];

      for (var i = 0; i < len; i++) {
        runner.call(this, c[i], fn, null, visited, queue, last == i);
      }
    }
  };
}

/**
 * All filters factory.
 *
 * @param {Array} filters
 * @return {Function}
 * @api private
 */

function all(filters) {
  return function filter(key, item) {
    for (var i = 0; i < filters.length; i++) {
      var result = filters[i](key, item);
      if (!result) return false;
    }
    return true;
  };
}

/**
 * Pass filter.
 *
 * @return {Boolean}
 * @api private
 */

function pass() { return true; }
