import {
  findVariableInEarlierConditions,
  getJoinTestsFromCondition,
  parseCondition,
} from "../Condition";

describe("Condition", () => {
  describe("parseCondition", () => {
    it("should parse a purely constants condition", () => {
      const { variableFields, constantFields, variableNames } = parseCondition([
        1,
        "is",
        "odd",
      ]);

      expect(Object.keys(variableFields)).toHaveLength(0);
      expect(Object.keys(variableNames)).toHaveLength(0);
      expect(Object.keys(constantFields)).toHaveLength(3);
      expect(constantFields[0]).toBe(1);
      expect(constantFields[1]).toBe("is");
      expect(constantFields[2]).toBe("odd");
    });

    it("should parse a purely variable condition", () => {
      const { variableFields, constantFields, variableNames } = parseCondition([
        "?a",
        "?b",
        "?c",
      ]);

      expect(Object.keys(constantFields)).toHaveLength(0);
      expect(Object.keys(variableFields)).toHaveLength(3);
      expect(Object.keys(variableNames)).toHaveLength(3);
      expect(variableFields[0]).toBe("?a");
      expect(variableFields[1]).toBe("?b");
      expect(variableFields[2]).toBe("?c");
      expect(variableNames["?a"]).toBe("0");
      expect(variableNames["?b"]).toBe("1");
      expect(variableNames["?c"]).toBe("2");
    });

    it("should parse mixed variable/constant condition", () => {
      const { variableFields, constantFields, variableNames } = parseCondition([
        "?a",
        "is",
        "?c",
      ]);

      expect(Object.keys(constantFields)).toHaveLength(1);
      expect(Object.keys(variableFields)).toHaveLength(2);
      expect(Object.keys(variableNames)).toHaveLength(2);
      expect(constantFields[1]).toBe("is");
      expect(variableFields[0]).toBe("?a");
      expect(variableFields[2]).toBe("?c");
      expect(variableNames["?a"]).toBe("0");
      expect(variableNames["?c"]).toBe("2");
    });

    it("should memoize the parse", () => {
      const a = parseCondition(["?a", "is", "?c"]);
      const b = parseCondition(["?a", "is", "?c"]);
      const c = parseCondition(["?a", "is", "?c"]);

      expect(a === b).toBeTruthy();
      expect(b === c).toBeTruthy();
      expect(c === a).toBeTruthy();
    });
  });

  describe("findVariableInEarlierConditions", () => {
    it("should find previous condition", () => {
      const conditions = [["?e", "age", 34]].map(parseCondition);
      expect(findVariableInEarlierConditions("?e", conditions)).toBe(
        conditions[0],
      );
    });

    it("should find multiple previous conditions", () => {
      const conditions = [["?e", "age", 34], ["?e", "name", "?v"]].map(
        parseCondition,
      );
      expect(findVariableInEarlierConditions("?e", conditions)).toBe(
        conditions[0],
      );
      expect(findVariableInEarlierConditions("?v", conditions)).toBe(
        conditions[1],
      );
    });

    it("should not find previous condition", () => {
      const conditions = [[1, "age", 34]].map(parseCondition);
      expect(findVariableInEarlierConditions("?e", conditions)).toBeUndefined();
    });
  });

  describe("getJoinTestsFromCondition", () => {
    it("should create a join test for the known variable ?e, but not ?v", () => {
      const conditions = [[1, "name", "Thomas"], ["?e", "age", 34]].map(
        parseCondition,
      );

      const tests = getJoinTestsFromCondition(
        parseCondition(["?v", "relation", "?e"]),
        conditions,
      );

      expect(tests).toHaveLength(1);
      if (tests) {
        expect(tests[0].fieldArg1).toBe(2);
        expect(tests[0].condition).toBe(conditions[1]);
        expect(tests[0].fieldArg2).toBe("0");
      }
    });

    it("should create a join test for the known variables ?e and ?v", () => {
      const conditions = [["?e", "age", 34], ["?e", "status", "?v"]].map(
        parseCondition,
      );

      const tests = getJoinTestsFromCondition(
        parseCondition(["?e", "name", "?v"]),
        conditions,
      );

      expect(tests).toHaveLength(2);

      if (tests) {
        expect(tests[0].fieldArg1).toBe(2);
        expect(tests[0].condition).toBe(conditions[1]);
        expect(tests[0].fieldArg2).toBe("2");
        expect(tests[1].fieldArg1).toBe(0);
        expect(tests[1].condition).toBe(conditions[0]);
        expect(tests[1].fieldArg2).toBe("0");
      }
    });
  });
});
