const charsets = require("password-sheriff").charsets;

const upperCase = charsets.upperCase;
const lowerCase = charsets.lowerCase;
const numbers = charsets.numbers;
const specialCharacters = charsets.specialCharacters;

const policies = {
  none: {
    length: { minLength: 1 },
  },
  low: {
    length: { minLength: 6 },
  },
  fair: {
    length: { minLength: 8 },
    contains: {
      expressions: [lowerCase, upperCase, numbers],
    },
  },
  good: {
    length: { minLength: 8 },
    containsAtLeast: {
      atLeast: 3,
      expressions: [lowerCase, upperCase, numbers, specialCharacters],
    },
  },
  excellent: {
    length: { minLength: 10 },
    containsAtLeast: {
      atLeast: 3,
      expressions: [lowerCase, upperCase, numbers, specialCharacters],
    },
    identicalChars: { max: 2 },
  },
};

const CHARACTER_TYPES = {
  LOWERCASE: "lowercase",
  UPPERCASE: "uppercase",
  NUMBER: "number",
  SPECIAL: "special",
};

/**
 * @typedef {Object} PasswordComplexityOptions
 * @property {number} min_length - Minimum password length (1-72)
 * @property {Array<'uppercase'|'lowercase'|'number'|'special'>} character_types - Required character types
 * @property {boolean} require_3of4_character_types - Whether to require 3 of 4 character types
 * @property {'allow'|'disallow'} identical_characters - Whether to allow >2 identical consecutive characters
 * @property {'allow'|'disallow'} sequential_characters - Whether to allow sequential alphanumeric characters
 * @property {'allow'|'disallow'} truncate - Whether to allow truncation (disallow = enforce 72 byte max)
 */

/**
 * Creates a PasswordPolicy rules configuration from an Auth0
 * `connection.options.password_options.complexity` object (PasswordComplexity type).
 *
 * @param {PasswordComplexityOptions} options - Auth0 PasswordComplexity object
 * @returns {Object} password-sheriff rules configuration object that can be passed to PasswordPolicy constructor
 */
function createRulesFromOptions(options) {
  if (!options || typeof options !== 'object') {
    throw new Error("options must be a PasswordComplexity object");
  }

  const rules = {};

  const {
    min_length: minLength,
    character_types: requiredTypes,
    require_3of4_character_types: require3of4,
    identical_characters: identicalChars,
    sequential_characters: sequentialChars,
    truncate: truncateOption
  } = options;

  // Validate min_length is within acceptable range
  if (minLength < 1 || minLength > 72) {
    throw new Error("min_length must be between 1 and 72");
  }

  // Handle min_length
  rules.length = { minLength: minLength };

  // Validate '3 of 4' prerequisite
  if (require3of4) {
    const hasAllFourTypes = Object.values(CHARACTER_TYPES).every(function (
      type
    ) {
      return requiredTypes.includes(type);
    });

    if (!hasAllFourTypes) {
      throw new Error(
        `'require_3of4_character_types' can only be true when all four character types (${Object.values(
          CHARACTER_TYPES
        ).join(", ")}) are specified`
      );
    }
  }

  if (requiredTypes.length > 0 || require3of4) {
    const expressions = [];

    if (require3of4) {
      // Use containsAtLeast with 3 out of 4
      rules.containsAtLeast = {
        atLeast: 3,
        expressions: [lowerCase, upperCase, numbers, specialCharacters],
      };
    } else {
      // Map character types to expressions
      if (requiredTypes.includes(CHARACTER_TYPES.LOWERCASE)) {
        expressions.push(lowerCase);
      }
      if (requiredTypes.includes(CHARACTER_TYPES.UPPERCASE)) {
        expressions.push(upperCase);
      }
      if (requiredTypes.includes(CHARACTER_TYPES.NUMBER)) {
        expressions.push(numbers);
      }
      if (requiredTypes.includes(CHARACTER_TYPES.SPECIAL)) {
        expressions.push(specialCharacters);
      }

      rules.contains = {
        expressions: expressions,
      };
    }
  }

  if (identicalChars === "disallow") {
    rules.identicalChars = { max: 2 };
  }

  if (sequentialChars === "disallow") {
    rules.sequentialChars = { max: 2 }
  }
  
  if (truncateOption === "disallow") {
    rules.maxLength = { maxBytes: 72 };
  }

  return rules;
}

module.exports = policies;

module.exports.createRulesFromOptions = createRulesFromOptions;
