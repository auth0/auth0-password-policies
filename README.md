# auth0-password-policies

Password policies presets used by Auth0. Extracted from [password-sheriff](https://github.com/auth0/password-sheriff).


## Policies

### none
* minimum characters: 1

### low
* minimum characters: 6

### fair
* minimum characters: 8
* contains at least one character in each group: lowerCase, upperCase and numbers

### good
* minimum characters: 8
* contains at least one character in three different groups out of: lowerCase, upperCase, numbers, specialCharacters

### excellent
* minimum characters: 10 
* contains at least one character in three different groups out of: lowerCase, upperCase, numbers, specialCharacters
* may not contain any character repeated more than twice

## Helpers

### createRulesFromOptions
Converts an Auth0 `connection.options.password_options.complexity` object into a `password-sheriff` compatible rules object, and applies default values.

Usage:
```js
const { PasswordPolicy } = require('password-sheriff');
const { createRulesFromOptions } = require('auth0-password-policies');

const passwordOptions = {
  character_types: ["uppercase","lowercase","number","special"],
  character_type_rule: "three_of_four",
  identical_characters: "block",
  sequential_characters: "block",
  max_length_exceeded: "error"
};

const rules = createRulesFromOptions(passwordOptions);
const customPolicy = new PasswordPolicy(rules);
console.log(customPolicy.toString());
/**
* Output is:
* * At least 15 characters in length
* * At least 3 of the following 4 types of characters:
*   * lower case letters (a-z)
*   * upper case letters (A-Z)
*   * numbers (i.e. 0-9)
*   * special characters (e.g. !@#$%^&*)
* * No more than 2 identical characters in a row (e.g., "aaa" not allowed)
* * No more than 2 sequential alphanumeric characters (e.g., "abc" not allowed)
* * Maximum password length exceeded
*/
```

## Publishing

Releases are fully automated via [semantic-release](https://semantic-release.gitbook.io/). Merging to `master` triggers a release if any qualifying commits are present — no manual tagging or version bumps required.

### Commit message format

Commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

| Commit prefix | Release type |
|---|---|
| `fix:` | Patch (`1.0.0` → `1.0.1`) |
| `feat:` | Minor (`1.0.0` → `1.1.0`) |
| `BREAKING CHANGE:` footer | Major (`1.0.0` → `2.0.0`) |
| `chore:`, `docs:`, `test:`, etc. | No release |

### What happens on merge to master

1. Tests run across Node.js 16, 18, and 20
2. semantic-release analyzes commits since the last release
3. If a release is warranted: creates a GitHub Release, pushes a `v*` tag, and publishes to npm with provenance
