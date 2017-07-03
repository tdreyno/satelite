import { IFact } from "../Fact";
import { addFact, addProduction, makeRete } from "../Rete";

const DATA_SET = [
  [1, "name", "Thomas"],
  // [1, "gender", "M"],
  // [1, "team", "WW"],

  // [2, "name", "Violet"],
  // [2, "gender", "F"],
  // [2, "team", "Spirit"],

  // [3, "name", "Brian"],
  // [3, "gender", "M"],
  // [3, "team", "WW"],

  // [4, "name", "Grace"],
  // [4, "gender", "F"],
  // [4, "team", "Fun"],
];

describe("Rete", () => {
  it("should add a production", () => {
    const rete = makeRete();

    DATA_SET.forEach((f: any) => {
      addFact(rete, f as IFact);
    });

    addProduction(rete, [["?e", "gender", "F"], ["?e", "team", "Fun"]], () => {
      console.log(arguments);
      expect(true).toBe(false);
      // done();
    });
  });
});
