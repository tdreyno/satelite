import { IFactTuple } from "../Fact";
import { addFact, addProduction, makeRete } from "../Rete";

const DATA_SET = [
  [1, "name", "Thomas"],
  [1, "gender", "M"],
  [1, "team", "WW"],

  [2, "name", "Violet"],
  [2, "gender", "F"],
  [2, "team", "Spirit"],

  [3, "name", "Brian"],
  [3, "gender", "M"],
  [3, "team", "WW"],

  [4, "name", "Grace"],
  [4, "gender", "F"],
  [4, "team", "Fun"],
];

describe("Rete", () => {
  it("should add a production", done => {
    const rete = makeRete();

    DATA_SET.forEach((f: any) => {
      addFact(rete, f as IFactTuple);
    });

    addProduction(
      rete,
      [["?e", "gender", "F"], ["?e", "team", "Fun"], ["?e", "name", "?v"]],
      // tslint:disable-next-line:variable-name
      f => {
        console.log("final", f);
        done();
      },
    );

    // DATA_SET2.forEach((f: any) => {
    //   addFact(rete, f as IFactTule);
    // });
  });
});
