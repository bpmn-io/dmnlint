import * as utils from 'dmnlint-utils';

export * from '../lib/testers/helper.js';

export { expect } from 'chai';

export function createRule(ruleFactory) {
  return ruleFactory(utils);
}
