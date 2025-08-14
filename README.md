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
  "require_3of4_character_types": true,
  identical_characters: "disallow"
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
*/
```
