import map = require("lodash/map");
import { extractBindingsFromCondition, ParsedCondition } from "./Condition";
import { IFact } from "./Fact";
import { AccumulatorCondition } from "./nodes/AccumulatorNode";
import { QueryNode } from "./nodes/QueryNode";
import { IVariableBindings } from "./Token";

export type IQueryChangeFn<Schema extends IFact> = (
  facts: Schema[],
  variableBindings: Array<IVariableBindings<Schema>>
) => any;

let nextQueryId = 0;
export class Query<Schema extends IFact> {
  static create<S extends IFact>(
    conditions: Array<ParsedCondition<S> | AccumulatorCondition<S>>
  ) {
    return new Query<S>(conditions);
  }

  id = nextQueryId++;
  queryNode!: QueryNode<Schema>;
  callbacks: Set<IQueryChangeFn<Schema>> = new Set();
  conditions: Array<
    ParsedCondition<Schema> | AccumulatorCondition<Schema>
  > = [];
  lastCondition: ParsedCondition<Schema> | AccumulatorCondition<Schema>;
  facts!: Schema[];
  variableBindings!: Array<IVariableBindings<Schema>>;

  constructor(
    conditions: Array<ParsedCondition<Schema> | AccumulatorCondition<Schema>>
  ) {
    this.conditions = conditions;
    this.lastCondition = this.conditions[this.conditions.length - 1];
  }

  didChange(): void {
    this.facts = this.getFacts();
    this.variableBindings = this.getVariableBindings();

    for (const callback of this.callbacks) {
      callback(this.facts, this.variableBindings);
    }
  }

  onChange(cb: IQueryChangeFn<Schema>): void {
    this.callbacks.add(cb);
  }

  then(cb: IQueryChangeFn<Schema>): void {
    this.onChange(cb);
  }

  offChange(cb: IQueryChangeFn<Schema>): void {
    this.callbacks.delete(cb);
  }

  private getFacts(): Schema[] {
    return this.queryNode && this.queryNode.items
      ? map(this.queryNode.items, t => t.fact)
      : [];
  }

  private getVariableBindings(): Array<IVariableBindings<Schema>> {
    return this.queryNode && this.queryNode.items
      ? map(this.queryNode.items, t => {
          let bindings = t.bindings;
          if (this.lastCondition && t.fact) {
            bindings = extractBindingsFromCondition(
              this.lastCondition,
              t.fact,
              bindings
            );
          }
          return bindings;
        })
      : [];
  }
}
