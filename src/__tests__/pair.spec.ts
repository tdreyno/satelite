// import * as util from "util";

import {
  collect,
  // not,
  IFact,
  notEquals,
  placeholder as _,
  Rete
} from "../index";

const { assert, query, rule } = new Rete /*console.log.bind(console)*/();

const DATA_SET: IFact[] = [];

const people = new Set(["Thomas", "Alex", "Brian", "Paul"]);

people.forEach(person => {
  const others = new Set(people);
  others.delete(person);

  others.forEach(p => {
    DATA_SET.push([person, "canHost", p]);
  });
});

describe("someday", () => {
  it("placeholder", () => {
    expect.assertions(4);

    assert([1, "name", "Thomas"]);
    // assert([1, "previousGuests", [2, 3, 4]]);

    assert([2, "name", "Alex"]);
    // assert([2, "previousGuests", [3, 4, 1]]);

    assert([3, "name", "Brian"]);
    // assert([3, "previousGuests", [4, 1, 2]]);

    assert([4, "name", "Paul"]);
    // assert([4, "previousGuests", [1, 2, 3]]);

    rule(
      ["?id", "name", _],
      collect("?otherIds", "?otherId", [
        notEquals("?id", "?otherId"),
        "name",
        _
      ])
    ).then(({ id, otherIds }) => {
      expect(id).toBeTruthy();
      console.log(id, otherIds);
    });

    // const { facts, variableBindings } = query(
    //   ["?h", "canHost", "?g"],
    //   not(["?h", "canHost", "?h"]),
    //   collect("?possibilities", not(["?g", "canHost", "?h"]))
    // );

    // console.log(util.inspect(facts, false, null));
    // console.log(util.inspect(variableBindings, false, null));

    // expect(1).toBe(2);
  });
});