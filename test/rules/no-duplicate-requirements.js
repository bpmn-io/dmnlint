import RuleTester from '../../lib/testers/rule-tester';

import rule from '../../rules/no-duplicate-requirements';

import {
  readModdle
} from '../../lib/testers/helper';


const incomingMessage = 'Duplicate incoming requirements';
const outgoingMessage = 'Duplicate outgoing requirements';


RuleTester.verify('no-duplicate-requirements', rule, {
  valid: [
    {
      moddleElement: readModdle(__dirname + '/no-duplicate-requirements/valid-complex.dmn')
    }
  ],
  invalid: [
    {
      moddleElement: readModdle(__dirname + '/no-duplicate-requirements/invalid-authority-requirement.dmn'),
      report: [
        {
          category: 'error',
          id: 'Decision',
          'message': outgoingMessage
        },
        {
          category: 'error',
          id: 'KnowledgeSource',
          message: incomingMessage
        }
      ]
    },
    {
      moddleElement: readModdle(__dirname + '/no-duplicate-requirements/invalid-information-requirement.dmn'),
      report: [
        {
          category: 'error',
          id: 'Decision',
          'message': outgoingMessage
        },
        {
          category: 'error',
          id: 'InputData',
          message: incomingMessage
        }
      ]
    },
    {
      moddleElement: readModdle(__dirname + '/no-duplicate-requirements/invalid-knowledge-requirement.dmn'),
      report: [
        {
          category: 'error',
          id: 'Decision',
          'message': outgoingMessage
        },
        {
          category: 'error',
          id: 'BusinessKnowledgeModel',
          message: incomingMessage
        }
      ]
    }
  ]
});