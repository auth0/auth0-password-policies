const policies = require("..");
const { createRulesFromOptions } = policies;
const { PasswordPolicy } = require("password-sheriff");

describe("password policies", function () {
  describe("main export", function () {
    it("should export all props", function () {
      expect(Object.keys(policies)).toEqual(
        expect.arrayContaining([
          "none",
          "low",
          "fair",
          "good",
          "excellent",
          "createRulesFromOptions",
        ])
      );
    });
  });

  describe("createRulesFromOptions helper", function () {
    describe("min_length", function () {
      it("should test min_length from 1 to 72", function () {
        const auth0Config1 = {
          min_length: 1,
          character_types: [],
          identical_characters: "allow",
          sequential_characters: "allow",
          max_length_exceeded: "truncate",
        };
        const rules = createRulesFromOptions(auth0Config1);
        expect(rules).toEqual({
          length: {
            minLength: 1,
          },
        });

        const auth0Config72 = {
          min_length: 72,
          character_types: [],
          identical_characters: "allow",
          sequential_characters: "allow",
          max_length_exceeded: "truncate",
        };
        const rules72 = createRulesFromOptions(auth0Config72);
        expect(rules72).toEqual({
          length: {
            minLength: 72,
          },
        });
      });

      it("should throw an error when min_length > 72", function () {
        expect(function () {
          const auth0Config = {
            min_length: 73,
          };
          createRulesFromOptions(auth0Config);
        }).toThrow("min_length must be between 1 and 72");
      });

      it("should not set length rule when min_length is undefined", function () {
        const auth0Config = {
          character_types: [],
          identical_characters: "allow",
          sequential_characters: "allow",
          max_length_exceeded: "truncate",
        };
        const rules = createRulesFromOptions(auth0Config);
        expect(rules.length).toBeUndefined();
      });

      it("should not set length rule when min_length is null", function () {
        const auth0Config = {
          min_length: null,
          character_types: [],
          identical_characters: "allow",
          sequential_characters: "allow",
          max_length_exceeded: "truncate",
        };
        const rules = createRulesFromOptions(auth0Config);
        expect(rules.length).toBeUndefined();
      });
    });

    describe("character_types", function () {
      it("should enforce required character types", function () {
        const auth0Config = {
          min_length: 4,
          character_types: ["lowercase", "uppercase", "number", "special"],
          identical_characters: "allow",
          sequential_characters: "allow",
          max_length_exceeded: "truncate",
        };
        const rules = createRulesFromOptions(auth0Config);
        expect(rules).toHaveProperty("length");
        expect(rules.length).toEqual({ minLength: 4 });
        expect(rules).toHaveProperty("contains");
        expect(rules.contains).toHaveProperty("expressions");
        expect(rules.contains.expressions).toHaveLength(4);
        // Verify each expression has test and explain functions
        rules.contains.expressions.forEach(function (expr) {
          expect(expr).toHaveProperty("test");
          expect(expr).toHaveProperty("explain");
          expect(typeof expr.test).toBe("function");
          expect(typeof expr.explain).toBe("function");
        });
      });

      it("should handle undefined character_types", function () {
        const auth0Config = {
          min_length: 8,
          identical_characters: "allow",
          sequential_characters: "allow",
          max_length_exceeded: "truncate",
        };
        const rules = createRulesFromOptions(auth0Config);
        expect(rules).toEqual({
          length: {
            minLength: 8,
          },
        });
        expect(rules).not.toHaveProperty("contains");
        expect(rules).not.toHaveProperty("containsAtLeast");
      });
    });

    describe("character_type_rule", function () {
      it("when set to 'three_of_four', should enforce 3 out of 4 character types when all 4 types are specified", function () {
        const auth0Config = {
          min_length: 3,
          character_types: ["lowercase", "uppercase", "number", "special"],
          character_type_rule: "three_of_four",
          identical_characters: "allow",
          sequential_characters: "allow",
          max_length_exceeded: "truncate",
        };
        const rules = createRulesFromOptions(auth0Config);
        expect(rules).toHaveProperty("length");
        expect(rules.length).toEqual({ minLength: 3 });
        expect(rules).toHaveProperty("containsAtLeast");
        expect(rules.containsAtLeast).toHaveProperty("atLeast", 3);
        expect(rules.containsAtLeast).toHaveProperty("expressions");
        expect(rules.containsAtLeast.expressions).toHaveLength(4);
        // Verify each expression has test and explain functions
        rules.containsAtLeast.expressions.forEach(function (expr) {
          expect(expr).toHaveProperty("test");
          expect(expr).toHaveProperty("explain");
          expect(typeof expr.test).toBe("function");
          expect(typeof expr.explain).toBe("function");
        });
      });

      it("when set to 'three_of_four', should throw an error when all 4 character types are NOT specified", function () {
        expect(function () {
          const auth0Config = {
            min_length: 8,
            character_types: ["lowercase", "uppercase"],
            character_type_rule: "three_of_four",
            identical_characters: "allow",
            sequential_characters: "allow",
            max_length_exceeded: "error",
          };
          createRulesFromOptions(auth0Config);
        }).toThrow(
          "'three_of_four' character_type_rule can only be used when all four character types (lowercase, uppercase, number, special) are selected"
        );
      });
    });

    describe("identical_characters", function () {
      it("should disallow more than 2 identical characters when specified", function () {
        const auth0Config = {
          min_length: 8,
          character_types: [],
          identical_characters: "block",
          sequential_characters: "allow",
          max_length_exceeded: "error",
        };
        const rules = createRulesFromOptions(auth0Config);
        expect(rules).toEqual({
          length: {
            minLength: 8,
          },
          identicalChars: {
            max: 2,
          },
          maxLength: {
            maxBytes: 72,
          },
        });
      });

      it("should allow more than 2 identical characters when specified", function () {
        const auth0Config = {
          min_length: 8,
          character_types: [],
          identical_characters: "allow",
          sequential_characters: "allow",
          max_length_exceeded: "error",
        };
        const rules = createRulesFromOptions(auth0Config);
        expect(rules).toEqual({
          length: {
            minLength: 8,
          },
          maxLength: {
            maxBytes: 72,
          },
        });
      });
    });

    describe("sequential_characters", function () {
      it("should disallow more than 2 sequential characters when specified (set to block)", function () {
        const auth0Config = {
          min_length: 8,
          character_types: [],
          identical_characters: "allow",
          sequential_characters: "block",
          max_length_exceeded: "error",
        };
        const rules = createRulesFromOptions(auth0Config);
        expect(rules).toEqual({
          length: {
            minLength: 8,
          },
          sequentialChars: {
            max: 2,
          },
          maxLength: {
            maxBytes: 72,
          },
        });
      });

      it("should allow more than 2 sequential characters when specified (set to allow)", function () {
        const auth0Config = {
          min_length: 8,
          character_types: [],
          identical_characters: "allow",
          sequential_characters: "allow",
          max_length_exceeded: "error",
        };
        const rules = createRulesFromOptions(auth0Config);
        expect(rules).toEqual({
          length: {
            minLength: 8,
          },
          maxLength: {
            maxBytes: 72,
          },
        });
      });

      it("should correctly validate a password when sequential_characters is set to allow", function () {
        const auth0Config = {
          min_length: 2,
          character_types: [],
          identical_characters: "allow",
          sequential_characters: "allow",
          max_length_exceeded: "truncate",
        };
        const rules = createRulesFromOptions(auth0Config);
        const policy = new PasswordPolicy(rules);
        const result = policy.check("abcde");
        expect(result).toBe(true);
      });

      it("should correctly validate a password when sequential_characters is set to block", function () {
        const auth0Config = {
          min_length: 2,
          character_types: [],
          identical_characters: "allow",
          sequential_characters: "block",
          max_length_exceeded: "truncate",
        };
        const rules = createRulesFromOptions(auth0Config);
        const policy = new PasswordPolicy(rules);
        const result = policy.check("abcde");

        expect(result).toBe(false);
      });
    });

    describe("max_length_exceeded", function () {
      it("should disallow more than 72 bytes when creating password if max_length_exceeded is set to error", function () {
        const auth0Config = {
          min_length: 8,
          character_types: [],
          identical_characters: "allow",
          sequential_characters: "allow",
          max_length_exceeded: "error",
        };
        const rules = createRulesFromOptions(auth0Config);
        expect(rules).toEqual({
          length: {
            minLength: 8,
          },
          maxLength: {
            maxBytes: 72,
          },
        });
      });

      it("should not set a maxLength on rules when max_length_exceeded is set to truncate", function () {
        const auth0Config = {
          min_length: 8,
          character_types: [],
          identical_characters: "allow",
          sequential_characters: "allow",
          max_length_exceeded: "truncate",
        };
        const rules = createRulesFromOptions(auth0Config);
        expect(rules).toEqual({
          length: {
            minLength: 8,
          },
        });
      });

      it("should correctly validate a password when max_length_exceeded is set to error", function () {
        const auth0Config = {
          min_length: 2,
          character_types: [],
          identical_characters: "allow",
          sequential_characters: "allow",
          max_length_exceeded: "error",
        };
        const rules = createRulesFromOptions(auth0Config);
        const policy = new PasswordPolicy(rules);
        const password = "a".repeat(100);
        const result = policy.check(password);
        expect(result).toBe(false);
      });

      it("should correctly validate a password when max_length_exceeded is set to truncate", function () {
        const auth0Config = {
          min_length: 2,
          character_types: [],
          identical_characters: "allow",
          sequential_characters: "allow",
          max_length_exceeded: "truncate",
        };
        const rules = createRulesFromOptions(auth0Config);
        const policy = new PasswordPolicy(rules);
        const password = "a".repeat(100);
        const result = policy.check(password);
        expect(result).toBe(true);
      });
    });

    describe("validation", function () {
      it("should throw an error when options parameter is undefined", function () {
        expect(function () {
          const auth0Config = undefined;
          createRulesFromOptions(auth0Config);
        }).toThrow();
      });

      it("should accept valid configuration with empty options", function () {
        const auth0Config = {};
        const rules = createRulesFromOptions(auth0Config);
        expect(rules).toEqual({});
      });

      it("should accept valid configuration with all properties", function () {
        const auth0Config = {
          min_length: 5,
          character_types: [],
          identical_characters: "allow",
          sequential_characters: "allow",
          max_length_exceeded: "truncate",
        };
        const rules = createRulesFromOptions(auth0Config);
        expect(rules).toEqual({
          length: {
            minLength: 5,
          },
        });
      });
    });
  });
});
