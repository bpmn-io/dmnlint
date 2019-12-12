const { expect } = require('chai');

import compileConfig from '../../../lib/support/compile-config';


describe('support/compile-config', function() {

  it('should import rules', async function() {

    // when
    const code = await compileConfig({
      rules: {
        'label-required': 'error',
        'no-duplicate-requirements': 'off'
      }
    });

    // then
    // imports enabled rule
    expect(code).to.contain('import rule_0 from \'dmnlint/rules/label-required\'');
    expect(code).to.contain('cache[\'dmnlint/label-required\'] = rule_0');

    // does not contain disabled rule
    expect(code).not.to.contain('dmnlint/rules/no-duplicate-requirements');

    // exports config and resolver
    expect(code).to.contain('export { resolver, config };');

    expect(code).to.contain('export default bundle;');
  });


  it('should import namespaced', async function() {

    // when
    const code = await compileConfig({
      rules: {
        '@foo/bar/rule': 'warn'
      }
    });

    // then
    expect(code).to.contain('import rule_0 from \'@foo/dmnlint-plugin-bar/rules/rule\'');
    expect(code).to.contain('cache[\'@foo/dmnlint-plugin-bar/rule\'] = rule_0');
  });


  it('should resolve extends', async function() {

    // when
    const code = await compileConfig({
      extends: 'dmnlint:recommended'
    });

    // then
    // bundles enabled rules
    expect(code).to.contain('label-required');
    expect(code).to.contain('no-duplicate-requirements');
  });

});