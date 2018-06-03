import { Rete } from "../../../src";

const rete = Rete.create({
  Asserting: console.log.bind(console),
  Retracting: console.log.bind(console),
  Updating: console.log.bind(console)
});

const { assert, retract, update, findEntity, retractEntity } = rete;

// Add to window for debugging
(window as any).rete = rete;

export { rete, assert, retract, update, findEntity, retractEntity };
export * from "../../../src";
export { subscribe } from "../../../src/react";
