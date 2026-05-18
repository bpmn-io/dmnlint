import path from 'node:path';
import { fileURLToPath } from 'node:url';

import traverse from '../../lib/traverse.js';

import {
  expect,
  createModdle,
  readModdle
} from '../helper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


describe('traverse', function() {

  describe('should visit each node', function() {

    it('diagram with multiple nodes', async function() {

      // given
      const {
        root
      } = await readModdle(__dirname + '/diagram.dmn');

      let nodesCount = 0;

      const traverseCb = () => nodesCount++;

      // when
      traverse(root, traverseCb);

      // then
      expect(nodesCount).to.eql(10);
    });


    it('diagram with one node', async function() {

      // given
      const xmlStr = `
        <?xml version="1.0" encoding="UTF-8"?>
        <definitions
            xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"
            id="Definitions_0nc6puk"
            targetNamespace="http://bpmn.io/bpmn">
        </definitions>
      `;

      const {
        root
      } = await createModdle(xmlStr);

      let nodesCount = 0;
      const traverseCb = () => nodesCount++;

      // when
      traverse(root, traverseCb);

      // then
      expect(nodesCount).to.eql(1);
    });


    it('diagram with generic element', async function() {

      // given
      const xmlStr = `
        <?xml version="1.0" encoding="UTF-8"?>
        <definitions
            xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"
            xmlns:asd="http://asd"
            id="Definitions_0nc6puk"
            targetNamespace="http://bpmn.io/bpmn">
          <extensionElements>
            <asd:foo bar="BAR" />
          </extensionElements>
        </definitions>
      `;

      const {
        root
      } = await createModdle(xmlStr);

      let nodesCount = 0;
      const traverseCb = () => nodesCount++;

      // when
      traverse(root, traverseCb);

      // then
      expect(nodesCount).to.eql(3);
    });

  });

});
