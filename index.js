const charsets = require('password-sheriff').charsets;

const upperCase = charsets.upperCase;
const lowerCase = charsets.lowerCase;
const numbers = charsets.numbers;
const specialCharacters = charsets.specialCharacters;

const policies = {
  none: {
    length: { minLength: 1 }
  },
  low: {
    length: { minLength: 6 }
  },
  fair: {
    length: { minLength: 8 },
    contains: {
      expressions: [lowerCase, upperCase, numbers]
    }
  },
  good: {
    length: { minLength: 8 },
    containsAtLeast: {
      atLeast: 3,
      expressions: [lowerCase, upperCase, numbers, specialCharacters]
    }
  },
  excellent: {
    length: { minLength: 10 },
    containsAtLeast: {
      atLeast: 3,
      expressions: [lowerCase, upperCase, numbers, specialCharacters]
    },
    identicalChars: { max: 2 }
  }
};

module.exports = policies;
