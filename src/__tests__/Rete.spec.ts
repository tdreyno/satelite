import { collect, count, entity, max, min } from "../accumulators";
import {
  equals,
  greaterThan,
  isBetween,
  isIdentifierType,
  lessThanOrEqualTo,
} from "../Condition";
import { IFact } from "../Fact";
import { makeIdentifier } from "../Identifier";
import { IAnyCondition, not, placeholder as _, Rete } from "../Rete";

const thomas = makeIdentifier("person", 1);
const violet = makeIdentifier("person", 2);
const marc = makeIdentifier("person", 3);
const grace = makeIdentifier("person", 4);

const DATA_SET: IFact[] = [
  [thomas, "name", "Thomas"],
  [thomas, "gender", "M"],
  [thomas, "team", "WW"],

  [violet, "name", "Violet"],
  [violet, "gender", "F"],
  [violet, "team", "Spirit"],

  [marc, "name", "Marc"],
  [marc, "gender", "M"],
  [marc, "team", "Content"],

  [grace, "name", "Grace"],
  [grace, "gender", "F"],
  [grace, "team", "Fun"],
] as any;

function makeRete() {
  const rete = Rete.create();

  for (let i = 0; i < DATA_SET.length; i++) {
    rete.assert(DATA_SET[i]);
  }

  return rete;
}

describe("Rete", () => {
  it("should add a production", () => {
    expect.assertions(4);

    const { rule } = makeRete();

    rule(
      ["?e", "gender", "F"],
      ["?e", "team", "Fun"],
      ["?e", "name", "?v"],
    ).then(({ e, v }) => {
      expect(e).toBe(grace);
      expect(v).toBe("Grace");
    });

    rule(
      ["?e", "gender", "M"],
      ["?e", "team", "WW"],
      ["?e", "name", "?v"],
    ).then(({ e, v }) => {
      expect(e).toBe(thomas);
      expect(v).toBe("Thomas");
    });
  });

  it("should allow negative conditions", () => {
    expect.assertions(2);

    const { rule } = makeRete();

    rule(["?e", "gender", "F"], not(["?e", "team", "Fun"]), [
      "?e",
      "name",
      "?v",
    ]).then(({ e, v }) => {
      expect(e).toBe(violet);
      expect(v).toBe("Violet");
    });
  });

  it("should be able to remove fact", () => {
    expect.assertions(3);

    const { retract, rule } = makeRete();

    rule(["?e", "gender", "F"], ["?e", "name", "?v"]).then(({ e, v }) => {
      if (e === violet) {
        expect(v).toBe("Violet");
      } else {
        expect(v).toBe("Grace");
      }
    });

    retract([violet, "gender", "F"]);

    rule(["?e", "gender", "F"], ["?e", "name", "?v"]).then(({ v }) => {
      expect(v).toBe("Grace");
    });
  });

  it("should be able to update fact", () => {
    expect.assertions(10);
    const { update, query, rule, assert } = new Rete();

    assert([1, "gender", "M"]);
    assert([1, "job", "Dev"]);
    assert([1, "name", "Tom"]);
    assert([1, "age", 10]);

    const conditions: IAnyCondition[] = [
      ["?e", "gender", "M"],
      max("?max", ["?e", "age", _]),
      ["?e2", "age", "?max"],
      ["?e2", "name", "?v"],
    ];

    const q = query(...conditions);

    let isFirst = true;
    rule(...conditions).then(({ v }) => {
      if (isFirst) {
        expect(v).toBe("Tom");
        isFirst = false;
        return [
          [1, "hasBro", true],
          ["global", "hasTName", true],
          ["global", "isFirst", true],
        ] as IFact[];
      } else {
        expect(v).toBe("Thomas");
        return [
          ["global", "hasTName", true],
          [1, "isNotBro", true],
          ["global", "isFirst", false],
        ] as IFact[];
      }
    });

    const broQuery = query([_, "hasBro", true]);
    const tNameQuery = query([_, "hasTName", true]);

    const b1 = q.getVariableBindings()[0];
    expect(b1.e).toBe(1);
    expect(b1.v).toBe("Tom");

    const bro1 = broQuery.getFacts();
    expect(bro1).toHaveLength(1);

    const tName1 = tNameQuery.getFacts();
    expect(tName1).toHaveLength(1);

    update([1, "name", "Thomas"]);

    const b2 = q.getVariableBindings()[0];
    expect(b2.e).toBe(1);
    expect(b2.v).toBe("Thomas");

    const bro2 = broQuery.getFacts();
    expect(bro2).toHaveLength(0);

    const tName2 = tNameQuery.getFacts();
    expect(tName2).toHaveLength(1);

    rule(["?e", "gender", "M"], ["?e", "hasBro", false]);
  });

  it("should be able to have dependent facts", () => {
    expect.assertions(4);

    const { rule } = makeRete();

    rule(["?e", "isLady", true]).then(({ e }, { fact }) => {
      expect(fact).toEqual([violet, "isLady", true]);
      expect(e).toBe(violet);
    });

    rule(["?e", "gender", "F"], ["?e", "name", "?v"]).then(({ e, v }) => {
      if (e === violet) {
        expect(v).toBe("Violet");
        return [e, "isLady", true];
      } else {
        expect(v).toBe("Grace");
      }
    });
  });

  it("should allow queries", () => {
    const { assert, retract, rule, query } = makeRete();

    rule(["?e", "gender", "F"]).then(({ e }) => {
      assert([thomas, "superCool", true]);

      return [[e, "isLady", true]] as IFact[];
    });

    const coolQuery = query(["?e", "superCool", true]);
    const ladyQuery = query(["?e", "isLady", true]);

    let coolFacts;
    let ladyFacts;
    let ladyVariableBindings;

    coolFacts = coolQuery.getFacts();
    expect(coolFacts).toHaveLength(1);
    expect(coolFacts[0][0]).toBe(thomas);

    ladyFacts = ladyQuery.getFacts();
    expect(ladyFacts).toHaveLength(2);
    expect(ladyFacts[0][0]).toBe(violet);
    expect(ladyFacts[1][0]).toBe(grace);

    ladyVariableBindings = ladyQuery.getVariableBindings();
    expect(ladyVariableBindings[0].e).toBe(violet);
    expect(ladyVariableBindings[1].e).toBe(grace);

    retract(DATA_SET[10] as any);

    ladyFacts = ladyQuery.getFacts();
    expect(ladyFacts).toHaveLength(1);
    expect(ladyFacts[0][0]).toBe(violet);

    ladyVariableBindings = ladyQuery.getVariableBindings();
    expect(ladyVariableBindings[0].e).toBe(violet);

    retract(DATA_SET[4] as any);

    ladyFacts = ladyQuery.getFacts();
    expect(ladyFacts).toHaveLength(0);

    coolFacts = coolQuery.getFacts();
    expect(coolFacts).toHaveLength(1);
    expect(coolFacts[0][0]).toBe(thomas);
  });

  it.skip(
    "should make sure 2 queries for the same conditions return the same object",
    () => {
      const { self, query } = makeRete();

      const query1 = query(["?e", "isLady", true]);
      const query2 = query(["?e", "isLady", true]);

      expect(self.root.children).toHaveLength(1);
      expect(query1 === query2).toBeFalsy();
      expect(query1.queryNode === query2.queryNode).toBeFalsy();
      expect(query1.queryNode.parent === query2.queryNode.parent).toBeTruthy();
    },
  );

  it("should be able to accumulate facts", () => {
    expect.assertions(6);

    const { rule, assert } = makeRete();

    assert(
      [thomas, "age", 40],
      [violet, "age", 30],
      [marc, "age", 20],
      [grace, "age", 10],
    );

    rule(count("?c", ["?e", "gender", "F"])).then(({ c }) => {
      expect(c).toBe(2);
    });

    rule(count("?c", ["?e", "team", "Fun"])).then(({ c }) => {
      expect(c).toBe(1);
    });

    // Mapping an alias
    rule(
      max("?age", [_, "age", _]),
      collect("?olds", "?e", ["?e", "age", "?age"]),
    ).then(({ olds }) => {
      expect(olds).toHaveLength(1);
      expect(olds[0]).toBe(thomas);
    });

    // Mapping a function
    rule(
      min("?age", [_, "age", _]),
      collect("?youngs", f => f[0], [_, "age", "?age"]),
    ).then(({ youngs }) => {
      expect(youngs).toHaveLength(1);
      expect(youngs[0]).toBe(grace);
    });
  });

  it("should be able to run arbitrary comparisons", () => {
    expect.assertions(5);

    const { rule, assert } = makeRete();

    assert(
      [thomas, "age", 40],
      [violet, "age", 30],
      [marc, "age", 20],
      [grace, "age", 10],
    );

    rule(["?e", "age", lessThanOrEqualTo(20)]).then(({ e }, { fact }) => {
      if (e === marc) {
        expect(fact[2]).toBe(20);
      } else if (e === grace) {
        expect(fact[2]).toBe(10);
      }
    });

    rule(min("?age", [_, "age", greaterThan(10)])).then(({ age }) => {
      expect(age).toBe(20);
    });

    rule(["?e", "age", isBetween(19, 21)]).then(({ e }) => {
      expect(e).toBe(marc);
    });

    rule(min("?age", [_, "age", _]), [
      "?e",
      "age",
      equals("?age"),
    ]).then(({ e }) => {
      expect(e).toBe(grace);
    });
  });

  it("should be able to query by identifier type", () => {
    expect.assertions(4);

    const { rule, assert } = new Rete();

    const personA = makeIdentifier("person", 1);
    const personB = makeIdentifier("person", 2);

    const tagA = makeIdentifier("tag", 1);
    const tagB = makeIdentifier("tag", 2);

    const isPerson = isIdentifierType("person");
    const isTag = isIdentifierType("tag");

    assert(
      [personA, "name", "Thomas"],
      [personB, "name", "Violet"],
      [personA, "tag", tagA],
      [personB, "tag", tagB],
      [tagA, "name", "New"],
      [tagB, "name", "Old"],
    );

    rule([isPerson, "name", "?v"]).then(({ v }, { fact }) => {
      if (fact[0] === personA) {
        expect(v).toBe("Thomas");
      } else if (fact[0] === personB) {
        expect(v).toBe("Violet");
      }
    });

    rule([isTag, "name", "?v"]).then(({ v }, { fact }) => {
      if (fact[0] === tagA) {
        expect(v).toBe("New");
      } else if (fact[0] === tagB) {
        expect(v).toBe("Old");
      }
    });
  });

  it("should be able to query a max accumulator", () => {
    const { assert, query } = Rete.create();

    assert([3, "name", "Older"]);
    assert([2, "name", "Medium"]);
    assert([1, "name", "Young"]);

    assert([3, "age", 15]);
    assert([2, "age", 10]);
    assert([1, "age", 5]);

    assert([3, "gender", "F"]);
    assert([2, "gender", "M"]);
    assert([1, "gender", "M"]);

    const maxQuery = query(
      max("?max", [_, "age", _]),
      ["?e", "age", "?max"],
      ["?e", "name", "?v"],
    );

    const maxFacts = maxQuery.getFacts();
    expect(maxFacts).toHaveLength(1);
    expect(maxFacts[0][2]).toBe("Older");

    const maxMaleQuery = query(
      ["?e", "gender", "M"],
      max("?max", ["?e", "age", _]),
      ["?e2", "age", "?max"],
      ["?e2", "name", "?v"],
    );

    const maxMaleFacts = maxMaleQuery.getFacts();
    expect(maxMaleFacts).toHaveLength(1);
    expect(maxMaleFacts[0][2]).toBe("Medium");

    const maxMaleQuery2 = query(
      max("?max", ["?e", "gender", "M"], ["?e", "age", _]),
      ["?e2", "age", "?max"],
      ["?e2", "name", "?v"],
    );

    const maxMaleFacts2 = maxMaleQuery2.getFacts();
    expect(maxMaleFacts2).toHaveLength(1);
    expect(maxMaleFacts2[0][2]).toBe("Medium");
  });

  it("should have an entity cache", () => {
    const { retract, findEntity } = makeRete();

    const thomasDefinition1 = findEntity(thomas);

    expect(thomasDefinition1!.attributes.name).toEqual("Thomas");
    expect(thomasDefinition1!.attributes.gender).toEqual("M");
    expect(thomasDefinition1!.attributes.team).toEqual("WW");

    retract([thomas, "gender", "M"]);

    const thomasDefinition2 = findEntity(thomas);

    expect(thomasDefinition2!.attributes.name).toEqual("Thomas");
    expect(thomasDefinition2!.attributes.gender).toBeUndefined();
    expect(thomasDefinition2!.attributes.team).toEqual("WW");

    retract([thomas, "team", "WW"]);

    const thomasDefinition3 = findEntity(thomas);

    expect(thomasDefinition3!.attributes.name).toEqual("Thomas");
    expect(thomasDefinition3!.attributes.gender).toBeUndefined();
    expect(thomasDefinition3!.attributes.team).toBeUndefined();

    retract([thomas, "name", "Thomas"]);

    const thomasDefinition4 = findEntity(thomas);

    expect(thomasDefinition4).toBeUndefined();
  });

  it("should have entity level subscriptions", () => {
    expect.assertions(4);

    const { retract, query } = makeRete();

    const entityQuery = query(["?e", "gender", "M"], entity("?entity", "?e"));

    entityQuery.getFacts().forEach((f: any) => {
      if (f.id === marc) {
        expect(f.name).toBe("Marc");
      } else if (f.id === thomas) {
        expect(f.name).toBe("Thomas");
      }
    });

    retract([marc, "gender", "M"]);

    const fewerFacts: any[] = entityQuery.getFacts();
    expect(fewerFacts).toHaveLength(1);

    // TODO: Time to start batching changes.
    expect(fewerFacts[0].id).toBe(thomas);
  });

  it("should allow unrelated query items", () => {
    const { query } = makeRete();

    const multiQuery = query(
      [grace, "team", "?fun"], // A team named fun.
      collect("?men", [_, "gender", "M"]), // All The Men
      ["?marc", "team", "Content"], // A person who is marc.
      collect("?women", [_, "gender", "F"]), // All The Women
      ["?e", "team", "WW"],
      ["?e", "?attr", "Thomas"], // A field called "name"
      collect("?grace", [_, "team", "?fun"]), // Fun folk
    );

    const bindings = multiQuery.getVariableBindings();

    expect(bindings[0].fun).toBe("Fun");

    expect(bindings[0].men).toHaveLength(2);
    expect(bindings[0].men[0][0]).toBe(thomas);
    expect(bindings[0].men[1][0]).toBe(marc);

    expect(bindings[0].marc).toBe(marc);

    expect(bindings[0].women).toHaveLength(2);
    expect(bindings[0].women[0][0]).toBe(violet);
    expect(bindings[0].women[1][0]).toBe(grace);

    expect(bindings[0].e).toBe(thomas);
    expect(bindings[0].attr).toBe("name");
  });
});
