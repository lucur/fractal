const debug = require('debug')('frctl:parser');
const {Validator} = require('@frctl/support');
const {toArray} = require('@frctl/utils');
const schema = require('@frctl/support/schema');
const Plugin = require('./plugin');

const _items = new WeakMap();

class PluginStore {
  constructor(items) {
    debug('Instantiating new PluginStore');

    _items.set(this, []);

    if (items) {
      this.add(items);
    }
  }

  /**
   * Adds a new item to the store
   *
   * @param  {Plugin|array<Plugin>} item Item or array of items to add
   * @return {PluginStore} Returns a reference to itself
   */
  add(item) {
    let items = toArray(item);
    Validator.assertValid(items, schema.pluginStore, 'PluginStore.add: The items provided do not match the schema of a plugins [plugins-invalid]');
    items = items.map(item => {
      debug('PluginStore.add: %s', item.name);
      return new Plugin(item);
    });
    _items.get(this).push(...items);
    return this;
  }

  get items() {
    return _items.get(this).slice(0);
  }

  get [Symbol.toStringTag]() {
    return 'PluginStore';
  }

  [Symbol.iterator]() {
    return this.items[Symbol.iterator]();
  }
}

module.exports = PluginStore;
