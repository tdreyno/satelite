import { memoize } from "interstelar";
import { chunk } from "lodash";
import {
  collect,
  count,
  IFact,
  notEquals,
  placeholder as _,
  Rete
} from "../index";

function makeRecordPure(...parts: any[]) {
  return chunk(parts, 2).reduce((sum, [key, value]) => {
    sum[key] = value;
    return sum;
  }, {});
}

const makeRecord = memoize(makeRecordPure);

function makePair(host: any, guest: any) {
  return makeRecord("host", host, "guest", guest);
}

const { assert, query, rule } = new Rete /*console.log.bind(console)*/();

assert([1, "name", "Thomas"]);
assert([1, "previousGuests", [2, 3, 4]]);

assert([2, "name", "Alex"]);
assert([2, "previousGuests", [3, 4, 1]]);

assert([3, "name", "Brian"]);
assert([3, "previousGuests", [4, 1, 2]]);

assert([4, "name", "Paul"]);
assert([4, "previousGuests", [1, 2, 3]]);

// Generate points
rule(["?id", "previousGuests", "?guests"]).then(({ id, guests }) => {
  return (guests as number[]).reduce(
    (sum, g, i) => {
      return sum.concat([[makePair(id, g), "points", i + 1]]);
    },
    [] as IFact[]
  );
});

describe("Pairing tests", () => {
  it("find pair", () => {
    expect.assertions(1);

    rule([makePair(4, 3), "points", "?points"]).then(({ points }) => {
      expect(points).toBe(3);
    });
  });

  it.skip("verify probabilities", () => {
    rule(["?pair", "points", "?points"]).then(({ pair, points }) => {
      console.log(pair, points);
    });
  });

  it("verify guest list", () => {
    expect.assertions(4);

    rule(count("?totalPeople", ["?id", "name", _]), [
      "?id",
      "previousGuests",
      "?guests"
    ]).then(({ totalPeople, guests }) => {
      expect(guests).toHaveLength(totalPeople - 1);
    });
  });

  it("regular query", () => {
    expect.assertions(12 * 2);

    rule(["?id", "name", _], [notEquals("?id", "?otherId"), "name", _]).then(
      ({ id, otherId }) => {
        expect(id).toBeTruthy();
        expect(id).not.toEqual(otherId);

        return [id, "possiblePairing", otherId];
      }
    );

    // TODO: Helper to change to bindings
    //       into a pair to query points.
    rule(
      ["?host", "possiblePairing", "?guest"],
      [
        notEquals("?host", "?secondHost"),
        "possiblePairing",
        notEquals("?guest", "?secondGuest")
      ]
    ).then(({ host, guest, secondHost, secondGuest }) => {
      if (host === secondGuest && guest === secondHost) {
        return;
      }

      return [
        -1, // Code Smell
        "twoPair",
        [makePair(host, guest), makePair(secondHost, secondGuest)]
      ] as IFact;
    });

    rule([_, "twoPair", "?twoPair"]).then(({ twoPair }) => {
      console.log(twoPair);
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

  it("collected query", () => {
    expect.assertions(4 * 3);

    rule(
      ["?id", "name", _],
      collect("?otherIds", "?otherId", [
        notEquals("?id", "?otherId"),
        "name",
        _
      ])
    ).then(({ id, otherIds }) => {
      expect(id).toBeTruthy();
      expect(otherIds).toHaveLength(3);
      expect(otherIds.includes(id)).toBeFalsy();
    });
  });
});
