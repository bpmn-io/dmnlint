import execa from 'execa';

import path from 'path';

import stripIndent from 'strip-indent';

import { expect } from 'chai';

const EMPTY = '';

test.only = testOnly;


describe('cli', function() {

  before(function() {

    this.timeout(30000);

    return exec('install-local', [], __dirname + '/cli');
  });


  describe('should execute', function() {

    test({
      cmd: [ 'dmnlint', 'diagram.dmn' ],
      expect: {
        code: 0,
        stderr: EMPTY,
        stdout: EMPTY
      }
    });


    test({
      cmd: [ 'dmnlint', 'diagram-invalid.dmn' ],
      expect: {
        code: 1,
        stderr: EMPTY,
        stdout: `

          ${diagramPath('diagram-invalid.dmn')}
            Decision_1g4u6yn  error  Element is missing label/name  label-required

          ✖ 1 problem (1 error, 0 warnings)
        `
      }
    });


    test({
      cmd: [ 'dmnlint', 'diagram-broken.dmn' ],
      expect: {
        code: 1,
        stdout: `

          ${diagramPath('diagram-broken.dmn')}
              error  Parse error: failed to parse document as <dmn:Definitions>

          ✖ 1 problem (1 error, 0 warnings)
        `
      }
    });


    it('should work with import warnings');


    it('should work with external configuration');


    test({
      cmd: [ 'dmnlint', '-c', 'non-existing.json', 'diagram.dmn' ],
      expect: {
        code: 1,
        stderr: /^Error: Could not read non-existing\.json/,
        stdout: EMPTY
      }
    });


    test({
      cmd: [ 'dmnlint', 'diagram.dmn' ],
      cwd: __dirname + '/cli/empty',
      expect: {
        code: 1,
        stderr: /^Error: Could not locate local \.dmnlintrc file/,
        stdout: EMPTY
      }
    });

  });


  describe.skip('should resolve plug-ins from working directory', function() {

    before(function() {

      this.timeout(30000);

      return exec('install-local', [], __dirname + '/cli/child');
    });


    test({
      cmd: [ 'dmnlint', 'diagram.dmn' ],
      cwd: __dirname + '/cli/child'
    });

  });


  describe.skip('should handle namespaced packages', function() {

    before(function() {

      this.timeout(30000);

      return exec('install-local', [], __dirname + '/cli/ns');
    });


    describe('providing rules', function() {

      test({
        cmd: [ 'dmnlint', '-c', 'uses-rules.json', 'diagram.dmn' ],
        cwd: __dirname + '/cli/ns',
      });


      test({
        cmd: [ 'dmnlint', '-c', 'uses-rules.json', 'diagram-invalid.dmn' ],
        cwd: __dirname + '/cli/ns',
        expect: {
          code: 1,
          stderr: EMPTY,
          stdout: `

            ${diagramPath('ns/diagram-invalid.bpmn')}
              StartEvent  error  Element has non-sense label <xxx>  test2/no-label-xxx
              StartEvent  error  Element has non-sense label <xxx>  @ns/test/no-label-xxx

            ✖ 2 problems (2 errors, 0 warnings)
          `
        }
      });

    });


    describe('providing configuration', function() {

      test({
        cmd: [ 'dmnlint', '-c', 'extends.json', 'diagram.dmn' ],
        cwd: __dirname + '/cli/ns',
      });


      test({
        cmd: [ 'dmnlint', '-c', 'extends.json', 'diagram-invalid.dmn' ],
        cwd: __dirname + '/cli/ns',
        expect: {
          code: 1,
          stderr: EMPTY,
          stdout: `

            ${diagramPath('ns/diagram-invalid.dmn')}
              StartEvent  error  Element has non-sense label <xxx>  @ns/test/no-label-xxx
              StartEvent  error  Element has non-sense label <xxx>  test2/no-label-xxx

            ✖ 2 problems (2 errors, 0 warnings)
          `
        }
      });

    });
  });

});


// helper /////////////////////////////

function exec(prog, args, cwd, options = {}) {

  return execa(prog, args, {
    cwd,
    ...options
  });
}

function test(options) {

  const {
    cmd,
    cwd,
    expect: _expect,
    only
  } = options;

  const expected = _expect || { code: 0 };

  (only ? it.only : it)(cmd.join(' ') + (cwd ? ` (cwd: ${cwd})` : ''), async function() {

    this.timeout(3000);

    // when
    const {
      stdout
    } = await exec('npm', [ 'test', '--', ...cmd ], __dirname + '/cli', {
      env: {
        dmnlint_TEST_CWD: cwd || ''
      }
    });

    // then
    if ('stderr' in expected) {
      expectOutput(parseOutput(stdout, '---- STDERR'), expected.stderr);
    }

    if ('stdout' in expected) {
      expectOutput(parseOutput(stdout, '---- STDOUT'), expected.stdout);
    }


    const code = expected.code || 0;

    expect(
      parseInt(
        parseOutput(stdout, '---- CODE'), 10
      )
    ).to.eql(code);
  });

}

function testOnly(options) {
  return test({
    only: true,
    ...options
  });
}

function diagramPath(diagramName) {
  return path.resolve(`${__dirname}/cli/${diagramName}`);
}

function parseOutput(output, separator) {

  const regexp = new RegExp(separator + '\n');

  return trimRight(output.split(regexp)[1]);
}

function expectOutput(actual, expected) {

  let matcher;

  if (expected instanceof RegExp) {
    matcher = 'match';
  } else {
    expected = trimRight(
      stripIndent(expected)
    );

    matcher = 'eql';
  }

  expect(actual).to[matcher](expected);
}

function trimRight(output) {
  return output
    .split(/\n/)
    .map(s => s.replace(/\s+$/, EMPTY))
    .join('\n');
}