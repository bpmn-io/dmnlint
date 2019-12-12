import NodeResolver from '../../../lib/resolver/node-resolver';

import {
  expect
} from '../../helper';


describe('resolver/node-resolver', function() {

  describe('#resolveRule', function() {

    const resolver = createResolver(function(path) {

      if (path === 'baz/rules/non-existing') {
        throw new Error('not found');
      }

      return {
        path
      };
    }, function(path) {

      if (path === '../../rules/non-existing') {
        throw new Error('not found');
      }

      return {
        path
      };
    });


    it('should resolve built-in', async function() {

      // when
      const resolvedRule = await resolver.resolveRule('dmnlint', 'label-required');

      // then
      expect(resolvedRule).to.eql({
        path: '../../rules/label-required'
      });
    });


    it('should fail to resolve built-in', async function() {

      let err;

      // when
      try {
        await resolver.resolveRule('dmnlint', 'non-existing');
      } catch (e) {
        // then
        expect(e.message).to.eql('Cannot resolve rule <non-existing> from <dmnlint>');

        err = e;
      }

      // verify
      expect(err).to.exist;
    });


    it('should resolve external', async function() {

      // when
      const resolvedRule = await resolver.resolveRule('foo', 'label-required');

      // then
      expect(resolvedRule).to.eql({
        path: 'foo/rules/label-required'
      });
    });


    it('should fail to resolve external', async function() {

      let err;

      // when
      try {
        await resolver.resolveRule('baz', 'non-existing');
      } catch (e) {
        // then
        expect(e.message).to.eql('Cannot resolve rule <non-existing> from <baz>');

        err = e;
      }

      // verify
      expect(err).to.exist;
    });

  });


  describe('#resolveConfig', function() {

    const resolver = createResolver(function(path) {

      // mimic $PKG/config/$NAME resolution
      if (path === 'dmnlint-plugin-foo/config/bar') {
        return {
          path,
          bar: true
        };
      }

      if (path.startsWith('dmnlint-plugin-foo/config')) {
        throw new Error('not found');
      }


      if (path.indexOf('config') !== -1) {
        return {
          path
        };
      }

      // mimic $PKG.configs[$NAME] resolution
      if (path === 'dmnlint-plugin-foo') {
        return {
          configs: {
            embedded: {
              path,
              embedded: true
            }
          }
        };
      }

      throw new Error('unexpected path <' + path + '>');
    }, function(path) {

      if (path === '../../config/non-existing') {
        throw new Error('not found');
      }

      return {
        path
      };
    });


    describe('should resolve built-in', function() {

      it('all', async function() {

        // when
        const resolvedConfig = await resolver.resolveConfig('dmnlint', 'all');

        // then
        expect(resolvedConfig).to.eql({
          path: '../../config/all'
        });
      });


      it('recommended', async function() {

        // when
        const resolvedConfig = await resolver.resolveConfig('dmnlint', 'recommended');

        // then
        expect(resolvedConfig).to.eql({
          path: '../../config/recommended'
        });
      });

    });


    it('should fail to resolve built-in', async function() {

      let err;

      // when
      try {
        await resolver.resolveConfig('dmnlint', 'non-existing');
      } catch (e) {
        expect(e.message).to.eql(
          'Cannot resolve config <non-existing> from <dmnlint>'
        );

        err = e;
      }

      // verify
      expect(err).to.exist;
    });


    describe('should resolve external', function() {

      it('via $PKG/config/$NAME', async function() {

        // when
        const resolvedConfig = await resolver.resolveConfig('dmnlint-plugin-foo', 'bar');

        // then
        expect(resolvedConfig).to.eql({
          path: 'dmnlint-plugin-foo/config/bar',
          bar: true
        });

      });


      it('via $PKG.configs[$NAME]', async function() {

        // when
        const resolvedConfig = await resolver.resolveConfig('dmnlint-plugin-foo', 'embedded');

        // then
        expect(resolvedConfig).to.eql({
          path: 'dmnlint-plugin-foo',
          embedded: true
        });

      });

    });


    it('should fail to resolve external', async function() {

      let err;

      // when
      try {
        await resolver.resolveConfig('dmnlint-plugin-foo', 'non-existing');
      } catch (e) {
        expect(e.message).to.eql(
          'Cannot resolve config <non-existing> from <dmnlint-plugin-foo>'
        );

        err = e;
      }

      // verify
      expect(err).to.exist;
    });

  });

});


// helpers /////////////////////////////

function createResolver(require, requireLocal) {
  return new NodeResolver({
    require,
    requireLocal
  });
}