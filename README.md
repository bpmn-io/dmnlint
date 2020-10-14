# dmnlint

[![Build Status](https://travis-ci.com/bpmn-io/dmnlint.svg?branch=master)](https://travis-ci.com/bpmn-io/dmnlint)

Validate your DMN diagrams based on configurable lint rules.

## Usage

Install the utility via [npm](https://www.npmjs.com/package/dmnlint):

```sh
npm install -g dmnlint
```

Validate your diagrams via the command line:

```sh
> dmnlint invoice.dmn

/Projects/process-application/resources/invoice.dmn
  InputData_13   error  Element is missing label/name       label-required
  Decision_12    error  Element is missing label/name       label-required

✖ 2 problems (2 errors, 0 warnings)
```

## Rules

Our [documentation](https://github.com/bpmn-io/dmnlint/tree/master/docs/rules#rules) lists all currenty implemented rules, the [`./rules` folder](https://github.com/bpmn-io/dmnlint/tree/master/rules) contains each rules implementation.

Do you miss a rule that should be included? [Propose a new rule](https://github.com/bpmn-io/dmnlint/issues/new?template=NEW_RULE.md).

## Configuration

Create a `.dmnlintrc` file in your working directory and inherit from a common configuration using the `extends` block:

```json
{
  "extends": "dmnlint:recommended"
}
```

Add or customize rules using the `rules` block:

```json
{
  "extends": "dmnlint:recommended",
  "rules": {
    "label-required": "off"
  }
}
```

## Visual Feedback (TODO)

Integrate the linter via [dmn-js-dmnlint](https://github.com/bpmn-io/dmn-js-dmnlint) into [dmn-js](https://github.com/bpmn-io/dmn-js) and get direct feedback during modeling.

To try out visual validation, checkout the [dmnlint playground](https://github.com/bpmn-io/dmnlint-playground).

## Writing / Consuming Custom Rules (TODO)

Use the [dmnlint playground](https://github.com/bpmn-io/dmnlint-playground) to implement new rules with quick visual feedback.

For more details on how to define and consume custom lint rules check out the [dmnlint-plugin-example](https://github.com/bpmn-io/dmnlint-plugin-example).

## Credits

The project is based on [`bpmnlint`](https://github.com/bpmn-io/bpmnlint) built by [nikku](https://github.com/nikku) and [siffogh](https://github.com/siffogh).

## License

MIT
