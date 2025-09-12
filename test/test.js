const policies = require("..");
const { createRulesFromOptions } = policies;

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
          identical_characters: "allow",
        };
        const rules = createRulesFromOptions(auth0Config1);
        expect(rules).toEqual({
          length: {
            minLength: 1,
          },
        });

        const auth0Config72 = {
          min_length: 72,
          identical_characters: "allow",
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
    });

    describe("character_types", function () {
      it("should enforce required character types", function () {
        const auth0Config = {
          character_types: ["lowercase", "uppercase", "number", "special"],
          identical_characters: "allow",
          min_length: 4,
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
    });

    describe("character_type_rule", function () {
      it("should enforce all specified character types by default", function () {
        const auth0Config = {
          character_types: ["lowercase", "uppercase", "number", "special"],
          identical_characters: "allow",
          min_length: 3,
        };
        const rules = createRulesFromOptions(auth0Config);
        expect(rules).toHaveProperty("length");
        expect(rules.length).toEqual({ minLength: 3 });
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

      it("when set to '3_of_4', should enforce 3 out of 4 character types when all 4 types are specified", function () {
        const auth0Config = {
          character_types: ["lowercase", "uppercase", "number", "special"],
          character_type_rule: "3_of_4",
          identical_characters: "allow",
          min_length: 3,
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

      it("when set to '3_of_4', should throw an error when all 4 character types are NOT specified", function () {
        expect(function () {
          const auth0Config = {
            character_types: ["lowercase", "uppercase"],
            character_type_rule: "3_of_4",
          };
          createRulesFromOptions(auth0Config);
        }).toThrow(
          "'3_of_4' character_type_rule can only be used when all four character types (lowercase, uppercase, number, special) are selected"
        );
      });
    });

    describe("identical_characters", function () {
      it("should disallow more than 2 identical characters when specified", function () {
        const auth0Config = {
          identical_characters: "disallow",
        };
        const rules = createRulesFromOptions(auth0Config);
        expect(rules).toEqual({
          length: {
            minLength: 15,
          },
          identicalChars: {
            max: 2,
          },
        });
      });

      it("should allow more than 2 identical characters when specified", function () {
        const auth0Config = {
          identical_characters: "allow",
        };
        const rules = createRulesFromOptions(auth0Config);
        expect(rules).toEqual({
          length: {
            minLength: 15,
          },
        });
      });
    });

    describe("default values", function () {
      it("should apply default values when not specified", function () {
        const auth0Config = {};
        const rules = createRulesFromOptions(auth0Config);
        expect(rules).toEqual({
          length: {
            minLength: 15,
          },
        });
      });

      it("should allow overriding default values", function () {
        const auth0Config = {
          min_length: 5,
          identical_characters: "allow",
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
