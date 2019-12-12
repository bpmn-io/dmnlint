const {
  is,
  isAny
} = require('dmnlint-utils');

const requirements = [
  'dmn:AuthorityRequirement',
  'dmn:InformationRequirement',
  'dmn:KnowledgeRequirement'
];


/**
 * A rule that verifies that there are no duplicated
 * requirements, i.e. two or more requirements
 * between two elements
 */
module.exports = function() {

  const keyed = {};

  const outgoingReported = {};
  const incomingReported = {};

  function check(node, reporter) {

    if (!isAny(node, requirements)) {
      return;
    }

    const key = requirementKey(node);

    if (key in keyed) {
      const sourceId = getRequirementSourceId(node);
      const targetId = getRequirementTargetId(node);

      if (!outgoingReported[sourceId]) {
        reporter.report(sourceId, 'Duplicate outgoing requirements');

        outgoingReported[sourceId] = true;
      }

      if (!incomingReported[targetId]) {
        reporter.report(targetId, 'Duplicate incoming requirements');

        incomingReported[targetId] = true;
      }
    } else {
      keyed[key] = node;
    }
  }

  return {
    check
  };

};


// helpers /////////////////

function requirementKey(requirement) {
  const sourceId = requirement.$parent.id;

  const targetId = getRequirementTargetId(requirement);

  return sourceId + '#' + targetId;
}

function getRequirementSourceId(requirement) {
  return requirement.$parent.id;
}

function getRequirementTargetId(requirement) {

  if (is(requirement, 'dmn:AuthorityRequirement')) {
    return requirement.requiredAuthority.href.replace('#', '');
  } else if (is(requirement, 'dmn:InformationRequirement')) {
    return requirement.requiredInput.href.replace('#', '');
  } else if (is(requirement, 'dmn:KnowledgeRequirement')) {
    return requirement.requiredKnowledge.href.replace('#', '');
  }
}
