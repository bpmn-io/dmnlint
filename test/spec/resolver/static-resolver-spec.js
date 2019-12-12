import StaticResolver from '../../../lib/resolver/static-resolver';

import {
  expect
} from '../../helper';


describe('resolver/static-resolver', function() {

  const resolver = new StaticResolver({
    'rule:dmnlint/label-required': 'RULE',
    'config:dmnlint/recommended': 'CONFIG'
  });


  describe('#resolveRule', function() {

    it('should resolve rule', async function() {

      // when
      const resolvedRule = await resolver.resolveRule('dmnlint', 'label-required');

      // then
      expect(resolvedRule).to.eql('RULE');
    });


    it('should throw on unresolved rule', async function() {

      let error;

      // when
      try {
        await resolver.resolveRule('dmnlint', 'non-existing-rule');
      } catch (e) {
        error = e;
      }

      // then
      expect(error).to.exist;
      expect(error.message).to.eql('unknown rule <dmnlint/non-existing-rule>');
    });

  });


  describe('#resolveConfig', function() {

    it('should resolve config', async function() {

      // when
      const resolvedConfig = await resolver.resolveConfig('dmnlint', 'recommended');

      // then
      expect(resolvedConfig).to.eql('CONFIG');
    });


    it('should throw on unresolved config', async function() {

      let error;

      // when
      try {
        await resolver.resolveConfig('dmnlint', 'non-existing-config');
      } catch (e) {
        error = e;
      }

      // then
      expect(error).to.exist;
      expect(error.message).to.eql('unknown config <dmnlint/non-existing-config>');
    });

  });

});