import {
  expect
} from '../helper.js';

import { createRequire } from 'node:module';

import { Linter as ESLinter } from '../../lib/index.js';

const require = createRequire(import.meta.url);

const {
  Linter
} = require('../../lib/index.js');


describe('index', function() {

  it('should CJS export { Linter }', function() {
    expect(Linter).to.exist;
  });


  it('should ES export { Linter }', function() {
    expect(ESLinter).to.exist;
  });

});
