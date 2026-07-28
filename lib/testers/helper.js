const { DmnModdle } = require('dmn-moddle');

const readFileSync = require('fs').readFileSync;


/**
 * Create moddle instance.
 *
 * @param {String} xml the XML string
 *
 * @return {Promise<Object>}
 */
async function createModdle(xml, elementType = 'dmn:Definitions') {
  const moddle = new DmnModdle();

  const {
    rootElement: root,
    references,
    warnings,
    elementsById
  } = await moddle.fromXML(xml, elementType, { lax: true });

  return {
    root,
    context: {
      references,
      warnings,
      elementsById
    },
    moddle
  };
}

module.exports.createModdle = createModdle;


/**
 * Return moddle instance, read from the given file.
 *
 * @param {String} filePath
 *
 * @return {Promise<Object>}
 */
function readModdle(filePath) {
  const contents = readFileSync(filePath, 'utf8');

  return createModdle(contents);
}

module.exports.readModdle = readModdle;