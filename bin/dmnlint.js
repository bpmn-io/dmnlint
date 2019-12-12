#!/usr/bin/env node
const meow = require('meow');
const fs = require('fs');
const path = require('path');
const {
  red,
  yellow,
  underline,
  bold,
  magenta
} = require('chalk');

const { promisify } = require('util');

const readFile = promisify(fs.readFile);

const DmnModdle = require('dmn-moddle');

const Linter = require('../lib/linter');
const NodeResolver = require('../lib/resolver/node-resolver');

const Table = require('cli-table');

const pluralize = require('pluralize');

const moddle = new DmnModdle();

function boldRed(str) {
  return bold(red(str));
}

function boldYellow(str) {
  return bold(yellow(str));
}

/**
 * Reads XML form path and return moddle object
 * @param {*} sourcePath
 */
function parseDiagram(diagramXML) {
  return new Promise((resolve, reject) => {
    moddle.fromXML(diagramXML, (error, moddleElement, context) => {

      if (error) {
        return resolve({
          error
        });
      }

      const warnings = context.warnings || [];

      return resolve({
        moddleElement,
        warnings
      });
    });
  });
}

const categoryMap = {
  warn: 'warning'
};

/**
 * Logs a formatted  message
 */
function tableEntry(report) {
  const category = report.category;

  const color = category === 'error' ? red : yellow;

  return [ report.id || '', color(categoryMap[category] || category), report.message, report.name || '' ];
}

function createTable() {
  return new Table({
    chars: {
      'top': '',
      'top-mid': '',
      'top-left': '',
      'top-right': '',
      'bottom': '',
      'bottom-mid': '',
      'bottom-left': '',
      'bottom-right': '',
      'left': '  ',
      'left-mid': '',
      'mid': '',
      'mid-mid': '',
      'right': '',
      'right-mid': '',
      'middle': '  '
    },
    style: {
      'padding-left': 0,
      'padding-right': 0
    }
  });
}


/**
 * Prints lint results to the console
 *
 * @param {String} filePath
 * @param {Object} results
 */
function printReports(filePath, results) {

  let errorCount = 0;
  let warningCount = 0;

  const table = createTable();

  Object.entries(results).forEach(function([ name, reports ]) {

    reports.forEach(function(report) {

      const {
        category,
        id,
        message,
        name: reportName
      } = report;

      table.push(tableEntry({
        category,
        id,
        message,
        name: reportName || name
      }));

      if (category === 'error') {
        errorCount++;
      } else {
        warningCount++;
      }
    });
  });

  const problemCount = warningCount + errorCount;

  if (problemCount) {
    console.log();
    console.log(underline(path.resolve(filePath)));
    console.log(table.toString());
  }

  return {
    errorCount,
    warningCount
  };
}

const cli = meow(
  `
  Usage
    $ dmnlint diagram.dmn

  Options
    --config, -c  Path to configuration file. It overrides .dmnlintrc if present.
    --init        Generate a .dmnlintrc file in the current working directory

  Examples
    $ dmnlint ./invoice.dmn
    $ dmnlint --init

`,
  {
    flags: {
      init: {
        type: 'boolean'
      },
      config: {
        type: 'string',
        alias: 'c'
      }
    }
  }
);

if (cli.flags.init) {
  if (fs.existsSync('.dmnlintrc')) {
    console.warn('Not overriding existing .dmnlintrc');
    process.exit(1);
  }

  fs.writeFileSync('.dmnlintrc', `{
  "extends": "dmnlint:recommended"
}`, 'utf8');

  console.error(`Created ${magenta('.dmnlintrc')} file`);
  process.exit(0);
}

if (cli.input.length === 0) {
  console.log('Error: dmn file path missing');
  process.exit(1);
}

function logAndExit(...args) {
  console.error(...args);

  process.exit(1);
}

async function lintDiagram(diagramPath, config) {

  let diagramXML;

  try {
    diagramXML = await readFile(path.resolve(diagramPath), 'utf-8');
  } catch (error) {
    return logAndExit(`Error: Failed to read ${diagramPath}\n\n%s`, error.message);
  }


  const {
    error: importError,
    warnings: importWarnings,
    moddleElement
  } = await parseDiagram(diagramXML);

  if (importError) {
    return printReports(diagramPath, {
      '': [
        {
          message: 'Parse error: ' + importError.message,
          category: 'error'
        }
      ]
    });
  }

  const importReports = importWarnings.length ? {
    '': importWarnings.map(function(warning) {

      const {
        element,
        message
      } = warning;

      const id = element && element.id;

      return {
        id,
        message: 'Import warning: ' + message.split(/\n/)[0],
        category: 'error'
      };
    })
  } : {};

  try {
    const linter = new Linter({
      config,
      resolver: new NodeResolver()
    });

    const lintReports = await linter.lint(moddleElement);

    const allResults = {
      ...importReports,
      ...lintReports
    };

    return printReports(diagramPath, allResults);
  } catch (e) {
    return logAndExit(e);
  }
}

async function lint(config) {

  let errorCount = 0;
  let warningCount = 0;

  console.log();

  for (let i = 0; i < cli.input.length; i++) {
    let results = await lintDiagram(cli.input[i], config);

    errorCount += results.errorCount;
    warningCount += results.warningCount;
  }

  const problemCount = errorCount + warningCount;

  let color;

  if (warningCount) {
    color = boldYellow;
  }

  if (errorCount) {
    color = boldRed;
  }

  if (problemCount) {
    console.log();
    console.log(color(
      `✖ ${problemCount} ${pluralize('problem', problemCount)} (${errorCount} ${pluralize('error', errorCount)}, ${warningCount} ${pluralize('warning', warningCount)})`
    ));
  }

  if (errorCount) {
    process.exit(1);
  }

}

async function run() {

  const configOverridePath = cli.flags.config;

  const configPath = configOverridePath || '.dmnlintrc';

  let configString, config;

  try {
    configString = await readFile(configPath, 'utf-8');
  } catch (error) {

    const message = (
      configOverridePath
        ? `Error: Could not read ${ configOverridePath }`
        : `Error: Could not locate local ${ magenta('.dmnlintrc') } file. Create one via

  ${magenta('dmnlint --init')}

Learn more about configuring dmnlint: https://github.com/bpmn-io/dmnlint#configuration`
    );

    return logAndExit(message);
  }

  try {
    config = JSON.parse(configString);
  } catch (err) {
    return logAndExit('Error: Could not parse %s\n\n%s', configPath, err.message);
  }

  return lint(config);
}

run().catch(logAndExit);