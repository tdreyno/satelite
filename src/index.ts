export { Rete, placeholder, not } from "./Rete";
export * from "./accumulators";
export { makeIdentifier, IIdentifier } from "./Identifier";
export { IFact, makeFact } from "./Fact";
export {
  ICondition,
  compare,
  greaterThan,
  greaterThanOrEqualTo,
  lessThan,
  lessThanOrEqualTo,
  equals,
  notEquals,
  isIdentifierType,
} from "./Condition";
