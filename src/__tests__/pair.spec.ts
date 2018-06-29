import { memoize } from "interstelar";
import { chunk, uniq } from "lodash";
import {
  collect,
  count,
  IFact,
  notEquals,
  notIncludes,
  placeholder as _,
  Rete
} from "../index";

let lastGuid = 0;

function makeGuid() {
  return ++lastGuid;
}

let lastPair = 0;

// tslint:disable-next-line:variable-name
const makePair = memoize((_a: any, _b: any) => {
  return --lastPair;
});

const { assert, query, rule } = new Rete({
  // Asserting: console.log.bind(console)
});

assert([1, "name", "Thomas"]);
assert([1, "previousGuests", [2, 3, 4]]);

assert([2, "name", "Alex"]);
assert([2, "previousGuests", [3, 4, 1]]);

assert([3, "name", "Brian"]);
assert([3, "previousGuests", [4, 1, 2]]);

assert([4, "name", "Paul"]);
assert([4, "previousGuests", [1, 2, 3]]);

rule(["?id", "name", _], [notEquals("?id").as("?otherId"), "name", _]).then(
  ({ id, otherId }) => {
    const guid = makePair(id, otherId);

    return [
      [guid, "possiblePairingHost", id],
      [guid, "possiblePairingGuest", otherId]
    ] as IFact[];
  }
);

// Generate points
rule(["?id", "previousGuests", "?guests"]).then(({ id, guests }) => {
  return (guests as number[]).reduce(
    (sum, g, i) => {
      const guid = makePair(id, g);
      return sum.concat([[guid, "points", i + 1]]);
    },
    [] as IFact[]
  );
});

describe("Pairing tests", () => {
  // it.skip("find pair", () => {
  //   expect.assertions(1);

  //   rule([makePair(4, 3), "points", "?points"]).then(({ points }) => {
  //     expect(points).toBe(3);
  //   });
  // });

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
    // expect.assertions(12 * 2);

    rule(
      ["?pairId", "possiblePairingHost", "?host1"],
      ["?pairId", "possiblePairingGuest", "?guest1"],

      [
        notEquals("?pairId").as("?secondPairId"),
        "possiblePairingHost",
        "?host2"
      ],
      [
        notEquals("?pairId").as("?secondPairId"),
        "possiblePairingGuest",
        "?guest2"
      ]
    ).then(({ pairId, secondPairId, host1, guest1, host2, guest2 }) => {
      const allPairs = [[host1, guest1], [host2, guest2]];

      console.log(allPairs);
      const hasReflections = allPairs
        .map(pair => [...pair].reverse())
        .some(([h1, g1]) => {
          return allPairs.some(([h2, g2]) => {
            return h1 === h2 && g1 === g2;
          });
        });

      if (hasReflections) {
        return;
      }

      const guid = makeGuid();

      return [
        [guid, "twoPair1", pairId],
        [guid, "twoPair2", secondPairId]
      ] as IFact[];
    });

    rule(
      ["?twoPairId", "twoPair1", "?pairId1"],
      ["?pairId1", "possiblePairingHost", "?host1"],
      ["?pairId1", "possiblePairingGuest", "?guest1"],

      ["?twoPairId", "twoPair2", "?pairId2"],
      ["?pairId2", "possiblePairingHost", "?host2"],
      ["?pairId2", "possiblePairingGuest", "?guest2"],

      [
        notIncludes("?pairId1", "?pairId2").as("?thirdPairId"),
        "possiblePairingHost",
        "?host3"
      ],
      [
        notIncludes("?pairId1", "?pairId2").as("?thirdPairId"),
        "possiblePairingGuest",
        "?guest3"
      ]
    ).then(
      ({
        thirdPairId,
        pairId1,
        pairId2,
        host1,
        guest1,
        host2,
        guest2,
        host3,
        guest3
      }) => {
        const allPairs = [[host1, guest1], [host2, guest2], [host3, guest3]];

        const hasReflections = allPairs
          .map(pair => [...pair].reverse())
          .some(([h1, g1]) => {
            return allPairs.some(([h2, g2]) => {
              return h1 === h2 && g1 === g2;
            });
          });

        if (hasReflections) {
          return;
        }

        const guid = makeGuid();

        return [
          [guid, "threePair1", pairId1],
          [guid, "threePair2", pairId2],
          [guid, "threePair3", thirdPairId]
        ] as IFact[];
      }
    );

    rule(
      ["?threePairId", "threePair1", "?pairId1"],
      ["?pairId1", "possiblePairingHost", "?host1"],
      ["?pairId1", "possiblePairingGuest", "?guest1"],

      ["?threePairId", "threePair2", "?pairId2"],
      ["?pairId2", "possiblePairingHost", "?host2"],
      ["?pairId2", "possiblePairingGuest", "?guest2"],

      ["?threePairId", "threePair3", "?pairId3"],
      ["?pairId3", "possiblePairingHost", "?host3"],
      ["?pairId3", "possiblePairingGuest", "?guest3"],

      [
        notIncludes("?pairId1", "?pairId2", "?pairId3").as("?fourthPairId"),
        "possiblePairingHost",
        "?host4"
      ],
      [
        notIncludes("?pairId1", "?pairId2", "?pairId3").as("?fourthPairId"),
        "possiblePairingGuest",
        "?guest4"
      ]
    ).then(
      ({
        fourthPairId,
        pairId1,
        pairId2,
        pairId3,
        host1,
        guest1,
        host2,
        guest2,
        host3,
        guest3,
        host4,
        guest4
      }) => {
        const allPairs = [
          [host1, guest1],
          [host2, guest2],
          [host3, guest3],
          [host4, guest4]
        ];

        const hasReflections = allPairs
          .map(pair => [...pair].reverse())
          .some(([h1, g1]) => {
            return allPairs.some(([h2, g2]) => {
              return h1 === h2 && g1 === g2;
            });
          });

        if (hasReflections) {
          return;
        }

        const guid = makeGuid();

        return [
          [guid, "fourPair1", pairId1],
          [guid, "fourPair2", pairId2],
          [guid, "fourPair3", pairId3],
          [guid, "fourPair4", fourthPairId]
        ] as IFact[];
      }
    );

    rule(
      ["?fourPairId", "fourPair1", "?pairId1"],
      ["?pairId1", "points", "?pair1Point"],

      ["?fourPairId", "fourPair2", "?pairId2"],
      ["?pairId2", "points", "?pair2Point"],

      ["?fourPairId", "fourPair3", "?pairId3"],
      ["?pairId3", "points", "?pair3Point"],

      ["?fourPairId", "fourPair4", "?pairId4"],
      ["?pairId4", "points", "?pair4Point"]
    ).then(({ fourPairId, pair1Point, pair2Point, pair3Point, pair4Point }) => {
      const allPoints = [pair1Point, pair2Point, pair3Point, pair4Point];
      const totalScore = allPoints.reduce((sum, p) => sum + p, 0);

      console.log("okay", totalScore);
      return [[fourPairId, "fourPairScore", totalScore]] as IFact[];
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
        notEquals("?id").as("?otherId"),
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
