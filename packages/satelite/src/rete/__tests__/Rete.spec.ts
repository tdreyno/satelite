import { IFactTuple } from "../Fact";
import { addFact, addProduction, makeRete, removeFact } from "../Rete";

const DATA_SET = [
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
];

describe("Rete", () => {
  it("should add a production", () => {
    expect.assertions(2);

    const rete = makeRete();

    for (let i = 0; i < DATA_SET.length; i++) {
      addFact(rete, DATA_SET[i] as IFactTuple);
    }

    addProduction(
      rete,
      [["?e", "gender", "F"], ["?e", "team", "Fun"], ["?e", "name", "?v"]],
      f => {
        expect(f[2]).toBe("Grace");
      },
    );

    addProduction(
      rete,
      [["?e", "gender", "M"], ["?e", "team", "WW"], ["?e", "name", "?v"]],
      f => {
        expect(f[2]).toBe("Thomas");
      },
    );
  });

  it("should be able to remove fact", () => {
    expect.assertions(1);

    const rete = makeRete();

    for (let i = 0; i < DATA_SET.length; i++) {
      addFact(rete, DATA_SET[i] as IFactTuple);
    }

    removeFact(rete, DATA_SET[4] as any);

    addProduction(rete, [["?e", "gender", "F"], ["?e", "name", "?v"]], f => {
      expect(f[2]).toBe("Grace");
    });
  });

  // it.only("should allow queries", () => {
  //   expect.assertions(1);

  //   const rete = makeRete();

  //   for (let i = 0; i < DATA_SET.length; i++) {
  //     addFact(rete, DATA_SET[i] as IFactTuple);
  //   }

  //   removeFact(rete, DATA_SET[4] as any);

  //   addProduction(rete, [["?e", "gender", "F"], ["?e", "name", "?v"]], f => {
  //     expect(f[2]).toBe("Grace");
  //   });
  // });
});
