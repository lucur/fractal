/* eslint no-unused-expressions: "off" */
const {expect} = require('../../../test/helpers');
const engine = require('./engine');

describe('Twig engine', function () {
  describe('factory', function () {
    it('is exported as a function', function () {
      expect(engine).to.be.a('function');
    });
    it('returns a valid engine object', function () {
      const eng = engine();
      expect(eng).to.be.an('object');
      expect(eng.name).to.equal('twig');
      expect(eng).to.have.a.property('render').that.is.a('function');
    });
  });
  describe('.render()', function () {
    it('returns a promise that resolves to a string', async function () {
      const eng = engine();
      return expect(eng.render('test')).to.eventually.equal('test');
    });
    it('renders Twig templates', async function () {
      const eng = engine();
      return expect(eng.render('{{ foo }}', {foo: 'bar'})).to.eventually.equal('bar');
    });
  });
});
