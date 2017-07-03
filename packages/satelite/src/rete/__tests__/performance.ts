// tslint:disable:no-console
declare var console: any;

import * as faker from "faker";
import { IFactTuple } from "../Fact";
import { addFact, addProduction, makeRete } from "../Rete";

const TEAMS = ["Spirit", "WW", "Fun", "Content", "Ops"];
const GENDERS = ["M", "F"];

function makeFakePerson() {
  const id = faker.random.uuid();
  return [
    [id, "name", faker.name.findName()],
    [id, "gender", faker.random.arrayElement(GENDERS)],
    [id, "team", faker.random.arrayElement(TEAMS)],
  ];
}

const rete = makeRete();

console.time("Generating Data");
const fakePeople = [];
for (let i = 0; i < 20000; i++) {
  fakePeople.push(makeFakePerson());
}
console.timeEnd("Generating Data");

console.time("Adding Facts");
for (let i = 0; i < fakePeople.length; i++) {
  fakePeople[i].forEach((f: IFactTuple) => {
    addFact(rete, f);
  });
}
console.timeEnd("Adding Facts");

console.time("Adding production");
addProduction(
  rete,
  [["?e", "gender", "F"], ["?e", "team", "Fun"], ["?e", "name", "?v"]],
  () => {
    // expect(f[2]).toBe("Grace");
    // console.log(f[2]);
  },
);
console.timeEnd("Adding production");
