// tslint:disable:no-console
declare var console: any;

import * as faker from "faker";
import { IFact } from "../Fact";
import { Rete } from "../Rete";

const TEAMS = ["Spirit", "WW", "Fun", "Content", "Ops"];
const GENDERS = ["M", "F"];

function makeFakePerson(): IFact[] {
  const id = faker.random.uuid();
  return [
    [id, "name", faker.name.findName()],
    [id, "gender", faker.random.arrayElement(GENDERS)],
    [id, "team", faker.random.arrayElement(TEAMS)],
  ] as any;
}

const { assert, rule } = Rete.create();

console.time("Generating Data");
const fakePeople: IFact[][] = [];
for (let i = 0; i < 20000; i++) {
  fakePeople.push(makeFakePerson());
}
console.timeEnd("Generating Data");

console.time("Adding Facts");
for (let i = 0; i < fakePeople.length; i++) {
  for (let j = 0; j < fakePeople[i].length; j++) {
    assert(fakePeople[i][j]);
  }
}
console.timeEnd("Adding Facts");

console.time("Adding production");
rule(
  ["?e", "gender", "F"],
  ["?e", "team", "Fun"],
  ["?e", "name", "?v"],
).then(() => {
  // expect(f[2]).toBe("Grace");
  // console.log(f[2]);
});
console.timeEnd("Adding production");
