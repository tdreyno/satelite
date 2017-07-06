// tslint:disable:no-console
declare var console: any;

import * as faker from "faker";
import { IFactTuple } from "../Fact";
import { Rete } from "../Rete";

const TEAMS = ["Spirit", "WW", "Fun", "Content", "Ops"];
const GENDERS = ["M", "F"];

function makeFakePerson(): IFactTuple[] {
  const id = faker.random.uuid();
  return [
    [id, "name", faker.name.findName()],
    [id, "gender", faker.random.arrayElement(GENDERS)],
    [id, "team", faker.random.arrayElement(TEAMS)],
  ] as any;
}

const { addFact, addProduction } = Rete.create();

console.time("Generating Data");
const fakePeople: IFactTuple[][] = [];
for (let i = 0; i < 20000; i++) {
  fakePeople.push(makeFakePerson());
}
console.timeEnd("Generating Data");

console.time("Adding Facts");
for (let i = 0; i < fakePeople.length; i++) {
  for (let j = 0; j < fakePeople[i].length; j++) {
    addFact(fakePeople[i][j]);
  }
}
console.timeEnd("Adding Facts");

console.time("Adding production");
addProduction(
  [["?e", "gender", "F"], ["?e", "team", "Fun"], ["?e", "name", "?v"]],
  () => {
    // expect(f[2]).toBe("Grace");
    // console.log(f[2]);
  },
);
console.timeEnd("Adding production");
