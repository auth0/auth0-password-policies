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
 * @typedef {Object} PasswordOptions
 * @property {number} [min_length=15] - Minimum password length (1-72)
 * @property {Array<'uppercase'|'lowercase'|'number'|'special'>} [character_types=[]] - Required character types
 * @property {'all'|'3_of_4'} [character_type_rule='all'] - How many character types are required
 * @property {'allow'|'disallow'} [identical_characters='allow'] - Whether to allow >2 identical consecutive characters
 */

/**
 * Default values for password options
 * @constant
 * @type {PasswordOptions}
 */
const DEFAULT_PASSWORD_OPTIONS = {
  min_length: 15,
  character_types: [],
  character_type_rule: "all",
  identical_characters: "allow",
};

/**
 * Creates a PasswordPolicy rules configuration from an Auth0
 * `connection.options.password_options.complexity` object.
 *
 * @param {PasswordOptions} options - Auth0 password_options.complexity object
 * @returns {Object} password-sheriff rules configuration object that can be passed to PasswordPolicy constructor
 */
function createRulesFromOptions(options = {}) {
  const rules = {};

  // Apply defaults
  const {
    min_length: minLength,
    character_types: requiredTypes,
    character_type_rule: characterTypeRule,
    identical_characters: identicalChars,
  } = { ...DEFAULT_PASSWORD_OPTIONS, ...options };

  // Validate min_length is within acceptable range
  if (minLength < 1 || minLength > 72) {
    throw new Error("min_length must be between 1 and 72");
  }

  // Handle min_length
  rules.length = { minLength: minLength };

  // Validate '3 of 4' prerequisite
  const require3of4 = characterTypeRule === "three_of_four";
  if (require3of4) {
    const hasAllFourTypes = Object.values(CHARACTER_TYPES).every(function (
      type
    ) {
      return requiredTypes.includes(type);
    });

    if (!hasAllFourTypes) {
      throw new Error(
        `'three_of_four' character_type_rule can only be used when all four character types (${Object.values(
          CHARACTER_TYPES
        ).join(", ")}) are selected`
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

  return rules;
}

module.exports = policies;

module.exports.createRulesFromOptions = createRulesFromOptions;
