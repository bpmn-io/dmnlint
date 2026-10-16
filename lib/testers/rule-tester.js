const { createRuleTester } = require('@bpmn-io/lint-core/lib/testers/rule-tester');

const {
  expectEqual,
  verify: coreVerify,
  getTitle,
  replacer
} = createRuleTester({
  Linter: require('../linter')
});

/**
 * Verify a rule. Omitted `valid` or `invalid` groups default to empty.
 */
function verify(ruleName, rule, { valid = [], invalid = [] } = {}) {
  return coreVerify(ruleName, rule, { valid, invalid });
}

module.exports = {
  expectEqual,
  verify,
  getTitle,
  replacer
};
