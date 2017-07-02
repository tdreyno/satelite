import { parseCondition } from "../Rule";

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
    expect(constantFields.identifier).toBe(1);
    expect(constantFields.attribute).toBe("is");
    expect(constantFields.value).toBe("odd");
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
    expect(variableFields.identifier).toBe("?a");
    expect(variableFields.attribute).toBe("?b");
    expect(variableFields.value).toBe("?c");
    expect(variableNames["?a"]).toBe("identifier");
    expect(variableNames["?b"]).toBe("attribute");
    expect(variableNames["?c"]).toBe("value");
  });

  it.only("should parse mixed variable/constant condition", () => {
    const { variableFields, constantFields, variableNames } = parseCondition([
      "?a",
      "is",
      "?c",
    ]);

    expect(Object.keys(constantFields)).toHaveLength(1);
    expect(Object.keys(variableFields)).toHaveLength(2);
    expect(Object.keys(variableNames)).toHaveLength(2);
    expect(constantFields.attribute).toBe("is");
    expect(variableFields.identifier).toBe("?a");
    expect(variableFields.value).toBe("?c");
    expect(variableNames["?a"]).toBe("identifier");
    expect(variableNames["?c"]).toBe("value");
  });

  it.only("should memoize the parse", () => {
    const a = parseCondition(["?a", "is", "?c"]);
    const b = parseCondition(["?a", "is", "?c"]);
    const c = parseCondition(["?a", "is", "?c"]);

    expect(a === b).toBeTruthy();
    expect(b === c).toBeTruthy();
    expect(c === a).toBeTruthy();
  });
});
