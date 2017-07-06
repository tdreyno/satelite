import { IFactTuple } from "../Fact";
import {
  addFact,
  addProduction,
  addQuery,
  makeRete,
  removeFact,
} from "../Rete";

const DATA_SET: IFactTuple[] = [
  [1, "name", "Thomas"],
  [1, "gender", "M"],
  [1, "team", "WW"],

  [2, "name", "Violet"],
  [2, "gender", "F"],
  [2, "team", "Spirit"],

  [3, "name", "Marc"],
  [3, "gender", "M"],
  [3, "team", "Content"],

  [4, "name", "Grace"],
  [4, "gender", "F"],
  [4, "team", "Fun"],
] as any;

describe("Rete", () => {
  it("should add a production", () => {
    expect.assertions(6);

    const rete = makeRete();

    for (let i = 0; i < DATA_SET.length; i++) {
      addFact(rete, DATA_SET[i]);
    }

    addProduction(
      rete,
      [["?e", "gender", "F"], ["?e", "team", "Fun"], ["?e", "name", "?v"]],
      (f, b) => {
        expect(f[2]).toBe("Grace");
        expect(b["?e"]).toBe(4);
        expect(b["?v"]).toBe("Grace");
      },
    );

    addProduction(
      rete,
      [["?e", "gender", "M"], ["?e", "team", "WW"], ["?e", "name", "?v"]],
      (f, b) => {
        expect(f[2]).toBe("Thomas");
        expect(b["?e"]).toBe(1);
        expect(b["?v"]).toBe("Thomas");
      },
    );
  });

  it("should be able to remove fact", () => {
    expect.assertions(3);

    const rete = makeRete();

    for (let i = 0; i < DATA_SET.length; i++) {
      addFact(rete, DATA_SET[i]);
    }

    addProduction(rete, [["?e", "gender", "F"], ["?e", "name", "?v"]], f => {
      if ((f[0] as any) === 2) {
        expect(f[2]).toBe("Violet");
        return [f[0], "isLady", true];
      } else {
        expect(f[2]).toBe("Grace");
      }
    });

    removeFact(rete, DATA_SET[4]);

    addProduction(rete, [["?e", "gender", "F"], ["?e", "name", "?v"]], f => {
      expect(f[2]).toBe("Grace");
    });
  });

  it("should be able to have dependent facts", () => {
    expect.assertions(4);

    const rete = makeRete();

    for (let i = 0; i < DATA_SET.length; i++) {
      addFact(rete, DATA_SET[i]);
    }

    addProduction(rete, [["?e", "isLady", true]], (f, b) => {
      expect(f).toEqual([2, "isLady", true]);
      expect(b["?e"]).toBe(2);
    });

    addProduction(
      rete,
      [["?e", "gender", "F"], ["?e", "name", "?v"]],
      (f, b) => {
        if (b["?e"] === 2) {
          expect(f[2]).toBe("Violet");
          return [f[0], "isLady", true];
        } else {
          expect(f[2]).toBe("Grace");
        }
      },
    );
  });

  it("should allow queries", () => {
    const rete = makeRete();

    for (let i = 0; i < DATA_SET.length; i++) {
      addFact(rete, DATA_SET[i]);
    }

    addProduction(rete, [["?e", "gender", "F"]], f => {
      return [f[0], "isLady", true];
    });

    const ladyQuery = addQuery(rete, [["?e", "isLady", true]]);

    let ladyFacts;
    let ladyVariableBindings;

    ladyFacts = ladyQuery.getFacts();
    expect(ladyFacts).toHaveLength(2);
    expect(ladyFacts[0][0]).toBe(4);
    expect(ladyFacts[1][0]).toBe(2);

    ladyVariableBindings = ladyQuery.getVariableBindings();
    expect(ladyVariableBindings[0]["?e"]).toBe(4);
    expect(ladyVariableBindings[1]["?e"]).toBe(2);

    removeFact(rete, DATA_SET[10] as any);

    ladyFacts = ladyQuery.getFacts();
    expect(ladyFacts).toHaveLength(1);
    expect(ladyFacts[0][0]).toBe(2);

    ladyVariableBindings = ladyQuery.getVariableBindings();
    expect(ladyVariableBindings[0]["?e"]).toBe(2);

    removeFact(rete, DATA_SET[4] as any);

    ladyFacts = ladyQuery.getFacts();
    expect(ladyFacts).toHaveLength(0);
  });
});
