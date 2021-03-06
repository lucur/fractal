const {findIndex} = require('lodash');
const {Collection} = require('@frctl/support');
const debug = require('debug')('frctl:parser');
const check = require('check-types');

const assert = check.assert;
const Transform = require('./transform');

const _transforms = new WeakMap();

class Pipeline {
  constructor(transforms = []) {
    debug('Instantiating new Pipeline instance');
    assert.maybe.array.of.object(transforms, `The Pipeline constructor accepts an optional array of transforms only [invalid-transforms]`);
    _transforms.set(this, []);
    transforms.forEach(props => this.addTransform(props));
  }

  addTransform(props) {
    const transform = Transform.from(props);
    const position = findIndex(_transforms.get(this), {name: transform.name});
    if (position >= 0) {
      // transformer with same name already exists, replace it
      _transforms.get(this)[position] = transform;
    } else {
      _transforms.get(this).push(transform);
    }
    debug(`Pipeline.addTransform: '%s'`, transform.name);
    return transform;
  }

  getTransform(name) {
    return _transforms.get(this).find(transform => transform.name === name);
  }

  async process(data = [], context, emitter) {
    emitter.emit('process.start', data, context);
    debug(`Pipeline.process start`);
    const state = {};
    data = Collection.from(data);
    for (const transform of _transforms.get(this)) {
      debug(`Pipeline.process processing transform: '%s'`, transform.name);

      data = data.clone();
      state[transform.name] = await transform.run(data, state, context, emitter);

      // Passthru transformers pass their output to the input of the next transformer
      // down the line. Typically only the files transformer will do this.
      if (transform.passthru) {
        data = state[transform.name];
      }
    }
    emitter.emit('process.complete', state);
    debug(`Pipeline.process complete`);
    return state;
  }

  get transforms() {
    return _transforms.get(this).slice(0);
  }
}

module.exports = Pipeline;
