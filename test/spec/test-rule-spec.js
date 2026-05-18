import path from 'node:path';

import testRule from '../../lib/test-rule.js';

import { expect, createRule, readModdle } from '../helper.js';

import { is } from 'dmnlint-utils';

const __dirname = path.dirname(new URL(import.meta.url).pathname);


describe('test-rule', function() {

  let moddleRoot;

  beforeEach(async function() {
    const result = await readModdle(__dirname + '/diagram.dmn');

    moddleRoot = result.root;
  });

  it('should return reported messages', function() {

    // given
    const expectedMessages = [
      {
        id: 'Definitions_0nc6puk',
        message: 'Definitions detected'
      }
    ];
    const messages = testRule({
      moddleRoot,
      rule: createRule(fakeRuleWithReports)
    });

    // then
    expect(messages).to.eql(expectedMessages);
  });


  it('should empty messages', function() {

    // given
    const expectedMessages = [];

    // when
    const messages = testRule({
      moddleRoot,
      rule: createRule(fakeRuleWithoutReports)
    });

    // then
    expect(messages).to.eql(expectedMessages);
  });

});

function fakeRuleWithReports() {
  function check(node, reporter) {
    if (is(node, 'Definitions')) {
      reporter.report(node.id, 'Definitions detected');
    }
  }

  return { check };
}

function fakeRuleWithoutReports() {
  return { check: () => {} };
}
