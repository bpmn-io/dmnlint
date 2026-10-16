import path from 'node:path';
import { fileURLToPath } from 'node:url';

import RuleTester from '../../lib/testers/rule-tester.js';

import rule from '../../rules/label-required.js';

import { readModdle } from '../../lib/testers/helper.js';


const __dirname = path.dirname(fileURLToPath(import.meta.url));


describe('RuleTester', function() {

  // suites with a single group must register without throwing

  RuleTester.verify('label-required', rule, {
    valid: [
      {
        moddleElement: readModdle(__dirname + '/../rules/label-required/valid-complex.dmn')
      }
    ]
  });

  RuleTester.verify('label-required', rule, {
    invalid: []
  });

});
