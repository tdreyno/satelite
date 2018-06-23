import * as util from "util";

import { collect, IFact, not, placeholder as _, Rete } from "../index";

const rete = new Rete();

const DATA_SET: IFact[] = [];

const people = new Set([1, 2, 3, 4]);

people.forEach((person, i) => {
  if (i === people.size) {
    return;
  }

  const others = new Set(people);
  others.delete(person);

  others.forEach(p => {
    DATA_SET.push([person, "hosts", p]);
  });
});

describe("someday", () => {
  it("placeholder", () => {
    rete
      .query(["?h", "hosts", "?g"], not(["?g", "hosts", "?h"]))
      .then((facts, bindings) => {
        console.log(util.inspect(facts, false, null));
        console.log(util.inspect(bindings, false, null));
      });

    for (let i = 0; i < DATA_SET.length; i++) {
      rete.assert(DATA_SET[i] as IFact);
    }
  });
});
