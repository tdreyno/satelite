import { count, entity, max } from "../accumulators";
import { IFact } from "../Fact";
import { makeIdentifier } from "../Identifier";
import { not, placeholder as _, Rete } from "../Rete";

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

    const { assert, rule } = makeRete();

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

    const { assert, rule } = makeRete();

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

    const { self, assert, retract, rule } = makeRete();

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

  it("should be able to have dependent facts", () => {
    expect.assertions(4);

    const { assert, rule } = makeRete();

    rule(["?e", "isLady", true]).then(({ e }, { fact }) => {
      expect(fact).toEqual([violet, "isLady", true]);
      expect(e).toBe(violet);
    });

    rule(
      ["?e", "gender", "F"],
      ["?e", "name", "?v"],
    ).then(({ e, v }, { addProducedFact }) => {
      if (e === violet) {
        expect(v).toBe("Violet");
        addProducedFact([e, "isLady", true]);
      } else {
        expect(v).toBe("Grace");
      }
    });
  });

  it("should allow queries", () => {
    const { assert, retract, rule, query } = makeRete();

    rule(["?e", "gender", "F"]).then(({ e }, { addProducedFact }) => {
      addProducedFact([e, "isLady", true]);

      assert([thomas, "superCool", true]);
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
    expect(ladyFacts[0][0]).toBe(grace);
    expect(ladyFacts[1][0]).toBe(violet);

    ladyVariableBindings = ladyQuery.getVariableBindings();
    expect(ladyVariableBindings[0].e).toBe(grace);
    expect(ladyVariableBindings[1].e).toBe(violet);

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

  it("should make sure 2 queries for the same conditions return the same object", () => {
    const { self, assert, query } = makeRete();

    const query1 = query(["?e", "isLady", true]);
    const query2 = query(["?e", "isLady", true]);

    expect(self.root.children).toHaveLength(1);
    expect(query1 === query2).toBeFalsy();
    expect(query1.queryNode === query2.queryNode).toBeFalsy();
    expect(query1.queryNode.parent === query2.queryNode.parent).toBeTruthy();
  });

  it("should be able to accumulate facts", () => {
    expect.assertions(2);

    const { assert, rule } = makeRete();

    rule(["?e", "gender", "F"], count("?count")).then(({ count }) => {
      expect(count).toBe(2);
    });

    rule(["?e", "team", "Fun"], count("?count")).then(({ count }) => {
      expect(count).toBe(1);
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
    const { assert, retract, findEntity } = makeRete();

    const thomasDefinition1 = findEntity(thomas);

    expect(thomasDefinition1!.name).toEqual("Thomas");
    expect(thomasDefinition1!.gender).toEqual("M");
    expect(thomasDefinition1!.team).toEqual("WW");

    retract([thomas, "gender", "M"]);

    const thomasDefinition2 = findEntity(thomas);

    expect(thomasDefinition2!.name).toEqual("Thomas");
    expect(thomasDefinition2!.gender).toBeUndefined();
    expect(thomasDefinition2!.team).toEqual("WW");

    retract([thomas, "team", "WW"]);

    const thomasDefinition3 = findEntity(thomas);

    expect(thomasDefinition3!.name).toEqual("Thomas");
    expect(thomasDefinition3!.gender).toBeUndefined();
    expect(thomasDefinition3!.team).toBeUndefined();

    retract([thomas, "name", "Thomas"]);

    const thomasDefinition4 = findEntity(thomas);

    expect(thomasDefinition4).toBeUndefined();
  });

  it("should have entity level subscriptions", () => {
    expect.assertions(4);

    const { assert, retract, query } = Rete.create();

    for (let i = 0; i < DATA_SET.length; i++) {
      assert(DATA_SET[i]);
    }

    const entityQuery = query(["?e", "gender", "M"], entity("?entity", "?e"));

    entityQuery.getFacts().forEach((f: any) => {
      if (f.id === marc) {
        expect(f.attributes.name).toBe("Marc");
      } else if (f.id === thomas) {
        expect(f.attributes.name).toBe("Thomas");
      }
    });

    retract([marc, "gender", "M"]);

    const fewerFacts: any[] = entityQuery.getFacts();
    expect(fewerFacts).toHaveLength(1);

    // TODO: Time to start batching changes.
    expect(fewerFacts[0].id).toBe(thomas);
  });
});
