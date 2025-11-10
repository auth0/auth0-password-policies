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

This package is automatically published to npm when:

1. **Tests pass**: All tests must pass across Node.js versions 16, 18, and 20
2. **Version tag is pushed**: Create and push a git tag following semantic versioning

### Publishing Steps

1. Update the version in `package.json`:
   ```bash
   npm version patch    # For bug fixes (1.0.0 -> 1.0.1)
   npm version minor    # For new features (1.0.0 -> 1.1.0)  
   npm version major    # For breaking changes (1.0.0 -> 2.0.0)
   npm version prerelease --preid=beta  # For beta releases (1.0.0 -> 1.0.1-beta.0)
   ```

2. Push the tag to trigger publishing:
   ```bash
   git push origin master --tags
   ```

The workflow will:
- Run tests across multiple Node.js versions
- Only publish if all tests pass (using `needs: test`)
- Publish with the appropriate npm tag (`latest` for stable, `beta` for pre-releases)
- Use provenance for enhanced security

### Tag Format
Tags must follow the format: `v1.2.3` or `v1.2.3-beta` or `v1.2.3-beta.1`
