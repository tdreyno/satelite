import { merge } from "lodash";
import {
  findVariableInEarlierConditions,
  getJoinTestsFromCondition,
  parseCondition
} from "../Condition";
import { IIdentifier, IPrimitive } from "../Identifier";

type IFact<V> = [IIdentifier | IPrimitive, string, V];

function f<V>(i: IIdentifier | IPrimitive, a: string, v: V): IFact<V> {
  return [i, a, v];
}

interface ICondition<
  S extends IFact<S[2]>,
  V1 extends string,
  V2 extends string,
  V3 extends string
> {
  0: Placeholder | Comparison2<S> | Variable<V1>; // | S[0];
  1: Placeholder | Comparison2<S> | Variable<V2>; // | S[1];
  2: Placeholder | Comparison2<S> | Variable<V3>; // | S[2];
  length: 3;
}

class Placeholder {}
const ph = new Placeholder();

class Variable<T extends string> {
  name: T;

  constructor(name: T) {
    this.name = name;
  }
}

function makeVar<T extends string>(name: T): Variable<T> {
  return new Variable(name);
}

// type Results<T extends object> = { [P in keyof T]: T[P] };

// function cond<A, T extends string>(
//   placeholder: Variable<T>,
//   value: A
// ): Results<{ [P in T]: A }> {
//   return {
//     [placeholder.name]: value
//   } as any;
// }

// const f = cond(makeVar("a"), "Test");
// const s = f.a;

// const b = makeVar("b");
// const f2 = cond(b, 2);
// const s2 = f2.b;

// function makeCond<V>(name: V, value: V): {};
// function makeCond<T extends string, V>(
//   name: Variable<T>,
//   value: V
// ): Results<{ [P in T]: V }>;
// function makeCond(name: any, value: any): any {
//   return cond(makeVar(name), value);
// }

// const $c = makeVar("$c");
// const f3 = makeCond($c, 2);
// const s3 = f3.$c;

// const f4 = makeCond(2, 2);

// function extendResults<T1 extends object, T2 extends object>(
//   a: Results<{ [P in keyof T1]: T1[P] }>,
//   b: Results<{ [P in keyof T2]: T2[P] }>
// ): Results<T1 & T2>;
// function extendResults<T1 extends object, T2 extends object, T3 extends object>(
//   a: Results<{ [P in keyof T1]: T1[P] }>,
//   b: Results<{ [P in keyof T2]: T2[P] }>,
//   c: Results<{ [P in keyof T3]: T3[P] }>
// ): Results<T1 & T2 & T3>;
// function extendResults(...results: any[]): any {
//   return merge({}, ...results) as any;
// }

// const $d = makeVar("$d");
// const $e = makeVar("$e");
// const $f = makeVar("$f");

// const f5 = makeCond($d, "test");
// const f6 = makeCond($e, 5);
// const f7 = makeCond($f, 5);
// const f56 = extendResults(f5, f6);
// const f567 = extendResults(f7, f56);

// function extend<T1 extends object>(val1: Results<T1>) {
//   return {
//     extend: <T2 extends object>(val2: Results<T2>) => {
//       return extend(extendResults<T1, T2>(val1, val2));
//     },
//     get: () => val1
//   };
// }

// const f567B = extend({})
//   .extend(f5)
//   .extend(f6)
//   .extend(f7)
//   .get();

// const f567C = extendResults(f5, f6, f7);

type IConstantTest2 = string;

// type ICompareFn2<Schema> = (a: any, b: Results<Schema>) => boolean;

class Comparison2<_> {
  // compareFn: ICompareFn2<Schema>;
  // constructor(compareFn: ICompareFn2<Schema>) {
  //   this.compareFn = compareFn;
  // }
}

interface IConditionCCC<S extends IFact<S[2]>>
  extends ICondition<S, never, never, never> {
  0: S[0];
  1: S[1];
  2: S[2];
}

interface IConditionCCV<S extends IFact<S[2]>, V3 extends string>
  extends ICondition<S, never, never, V3> {
  0: S[0];
  1: S[1];
  2: Variable<V3>;
}

interface IConditionCCP<S extends IFact<S[2]>>
  extends ICondition<S, never, never, never> {
  0: S[0];
  1: S[1];
  2: Placeholder;
}

interface IConditionCCD<S extends IFact<S[2]>>
  extends ICondition<S, never, never, never> {
  0: S[0];
  1: S[1];
  2: Comparison2<S>;
}

interface IConditionCVC<S extends IFact<S[2]>, V2 extends string>
  extends ICondition<S, never, V2, never> {
  0: S[0];
  1: Variable<V2>;
  2: S[2];
}

interface IConditionCVV<
  S extends IFact<S[2]>,
  V2 extends string,
  V3 extends string
> extends ICondition<S, never, V2, V3> {
  0: S[0];
  1: Variable<V2>;
  2: Variable<V3>;
}

interface IConditionCVP<S extends IFact<S[2]>, V2 extends string>
  extends ICondition<S, never, V2, never> {
  0: S[0];
  1: Variable<V2>;
  2: Placeholder;
}

interface IConditionCVD<S extends IFact<S[2]>, V2 extends string>
  extends ICondition<S, never, V2, never> {
  0: S[0];
  1: Variable<V2>;
  2: Comparison2<S>;
}

interface IConditionCPC<S extends IFact<S[2]>>
  extends ICondition<S, never, never, never> {
  0: S[0];
  1: Placeholder;
  2: S[2];
}

interface IConditionCPV<S extends IFact<S[2]>, V3 extends string>
  extends ICondition<S, never, never, V3> {
  0: S[0];
  1: Placeholder;
  2: Variable<V3>;
}

interface IConditionCPP<S extends IFact<S[2]>>
  extends ICondition<S, never, never, never> {
  0: S[0];
  1: Placeholder;
  2: Placeholder;
}

interface IConditionCPD<S extends IFact<S[2]>>
  extends ICondition<S, never, never, never> {
  0: S[0];
  1: Placeholder;
  2: Comparison2<S>;
}

interface IConditionCDC<S extends IFact<S[2]>>
  extends ICondition<S, never, never, never> {
  0: S[0];
  1: Comparison2<S>;
  2: S[2];
}

interface IConditionCDV<S extends IFact<S[2]>, V3 extends string>
  extends ICondition<S, never, never, never> {
  0: S[0];
  1: Comparison2<S>;
  2: Variable<V3>;
}

interface IConditionCDP<S extends IFact<S[2]>>
  extends ICondition<S, never, never, never> {
  0: S[0];
  1: Comparison2<S>;
  2: Placeholder;
}

interface IConditionCDD<S extends IFact<S[2]>>
  extends ICondition<S, never, never, never> {
  0: S[0];
  1: Comparison2<S>;
  2: Comparison2<S>;
}

interface IConditionVCC<S extends IFact<S[2]>, V1 extends string>
  extends ICondition<S, never, never, never> {
  0: Variable<V1>;
  1: S[1];
  2: S[2];
}

interface IConditionVCV<
  S extends IFact<S[2]>,
  V1 extends string,
  V3 extends string
> extends ICondition<S, never, never, never> {
  0: Variable<V1>;
  1: S[1];
  2: Variable<V3>;
}

interface IConditionVCP<S extends IFact<S[2]>, V1 extends string>
  extends ICondition<S, never, never, never> {
  0: Variable<V1>;
  1: S[1];
  2: Placeholder;
}

interface IConditionVCD<S extends IFact<S[2]>, V1 extends string>
  extends ICondition<S, never, never, never> {
  0: Variable<V1>;
  1: S[1];
  2: Comparison2<S>;
}

interface IConditionVVC<
  S extends IFact<S[2]>,
  V1 extends string,
  V2 extends string
> extends ICondition<S, never, never, never> {
  0: Variable<V1>;
  1: Variable<V2>;
  2: S[2];
}

interface IConditionVVV<
  S extends IFact<S[2]>,
  V1 extends string,
  V2 extends string,
  V3 extends string
> extends ICondition<S, V1, V2, V3> {
  0: Variable<V1>;
  1: Variable<V2>;
  2: Variable<V3>;
}

interface IConditionVVP<
  S extends IFact<S[2]>,
  V1 extends string,
  V2 extends string
> extends ICondition<S, never, never, never> {
  0: Variable<V1>;
  1: Variable<V2>;
  2: Placeholder;
}

interface IConditionVVD<
  S extends IFact<S[2]>,
  V1 extends string,
  V2 extends string
> extends ICondition<S, V1, V2, never> {
  0: Variable<V1>;
  1: Variable<V2>;
  2: Comparison2<S>;
}

interface IConditionVPC<S extends IFact<S[2]>, V1 extends string>
  extends ICondition<S, never, never, never> {
  0: Variable<V1>;
  1: Placeholder;
  2: S[2];
}

interface IConditionVPV<
  S extends IFact<S[2]>,
  V1 extends string,
  V3 extends string
> extends ICondition<S, never, never, never> {
  0: Variable<V1>;
  1: Placeholder;
  2: Variable<V3>;
}

interface IConditionVPP<S extends IFact<S[2]>, V1 extends string>
  extends ICondition<S, never, never, never> {
  0: Variable<V1>;
  1: Placeholder;
  2: Placeholder;
}

interface IConditionVPD<S extends IFact<S[2]>, V1 extends string>
  extends ICondition<S, never, never, never> {
  0: Variable<V1>;
  1: Placeholder;
  2: Comparison2<S>;
}

interface IConditionVDC<S extends IFact<S[2]>, V1 extends string>
  extends ICondition<S, never, never, never> {
  0: Variable<V1>;
  1: Comparison2<S>;
  2: S[2];
}

interface IConditionVDV<
  S extends IFact<S[2]>,
  V1 extends string,
  V3 extends string
> extends ICondition<S, V1, never, V3> {
  0: Variable<V1>;
  1: Comparison2<S>;
  2: Variable<V3>;
}

interface IConditionVDP<S extends IFact<S[2]>, V1 extends string>
  extends ICondition<S, never, never, never> {
  0: Variable<V1>;
  1: Comparison2<S>;
  2: Placeholder;
}

interface IConditionVDD<S extends IFact<S[2]>, V1 extends string>
  extends ICondition<S, never, never, never> {
  0: Variable<V1>;
  1: Comparison2<S>;
  2: Comparison2<S>;
}

interface IConditionPCC<S extends IFact<S[2]>>
  extends ICondition<S, never, never, never> {
  0: Placeholder;
  1: S[1];
  2: S[2];
}

interface IConditionPCV<S extends IFact<S[2]>, V3 extends string>
  extends ICondition<S, never, never, never> {
  0: Placeholder;
  1: S[1];
  2: Variable<V3>;
}

interface IConditionPCP<S extends IFact<S[2]>>
  extends ICondition<S, never, never, never> {
  0: Placeholder;
  1: S[1];
  2: Placeholder;
}

interface IConditionPCD<S extends IFact<S[2]>>
  extends ICondition<S, never, never, never> {
  0: Placeholder;
  1: S[1];
  2: Comparison2<S>;
}

interface IConditionPVC<S extends IFact<S[2]>, V2 extends string>
  extends ICondition<S, never, never, never> {
  0: Placeholder;
  1: Variable<V2>;
  2: S[2];
}

interface IConditionPVV<
  S extends IFact<S[2]>,
  V2 extends string,
  V3 extends string
> extends ICondition<S, never, never, never> {
  0: Placeholder;
  1: Variable<V2>;
  2: Variable<V3>;
}

interface IConditionPVP<S extends IFact<S[2]>, V2 extends string>
  extends ICondition<S, never, never, never> {
  0: Placeholder;
  1: Variable<V2>;
  2: Placeholder;
}

interface IConditionPVD<S extends IFact<S[2]>, V2 extends string>
  extends ICondition<S, never, never, never> {
  0: Placeholder;
  1: Variable<V2>;
  2: Comparison2<S>;
}

interface IConditionPPC<S extends IFact<S[2]>>
  extends ICondition<S, never, never, never> {
  0: Placeholder;
  1: Placeholder;
  2: S[2];
}

interface IConditionPPV<S extends IFact<S[2]>, V3 extends string>
  extends ICondition<S, never, never, never> {
  0: Placeholder;
  1: Placeholder;
  2: Variable<V3>;
}

interface IConditionPPP<S extends IFact<S[2]>>
  extends ICondition<S, never, never, never> {
  0: Placeholder;
  1: Placeholder;
  2: Placeholder;
}

interface IConditionPPD<S extends IFact<S[2]>>
  extends ICondition<S, never, never, never> {
  0: Placeholder;
  1: Placeholder;
  2: Comparison2<S>;
}

interface IConditionPDC<S extends IFact<S[2]>>
  extends ICondition<S, never, never, never> {
  0: Placeholder;
  1: Comparison2<S>;
  2: S[2];
}

interface IConditionPDV<S extends IFact<S[2]>, V3 extends string>
  extends ICondition<S, never, never, never> {
  0: Placeholder;
  1: Comparison2<S>;
  2: Variable<V3>;
}

interface IConditionPDP<S extends IFact<S[2]>>
  extends ICondition<S, never, never, never> {
  0: Placeholder;
  1: Comparison2<S>;
  2: Placeholder;
}

interface IConditionPDD<S extends IFact<S[2]>>
  extends ICondition<S, never, never, never> {
  0: Placeholder;
  1: Comparison2<S>;
  2: Comparison2<S>;
}

interface IConditionDCC<S extends IFact<S[2]>>
  extends ICondition<S, never, never, never> {
  0: Comparison2<S>;
  1: S[1];
  2: S[2];
}

interface IConditionDCV<S extends IFact<S[2]>, V2 extends string>
  extends ICondition<S, never, never, never> {
  0: Comparison2<S>;
  1: S[1];
  2: Variable<V2>;
}

interface IConditionDCP<S extends IFact<S[2]>>
  extends ICondition<S, never, never, never> {
  0: Comparison2<S>;
  1: S[1];
  2: Placeholder;
}

interface IConditionDCD<S extends IFact<S[2]>>
  extends ICondition<S, never, never, never> {
  0: Comparison2<S>;
  1: S[1];
  2: Comparison2<S>;
}

interface IConditionDVC<S extends IFact<S[2]>, V2 extends string>
  extends ICondition<S, never, never, never> {
  0: Comparison2<S>;
  1: Variable<V2>;
  2: S[2];
}

interface IConditionDVV<
  S extends IFact<S[2]>,
  V2 extends string,
  V3 extends string
> extends ICondition<S, never, V2, V3> {
  0: Comparison2<S>;
  1: Variable<V2>;
  2: Variable<V3>;
}

interface IConditionDVP<S extends IFact<S[2]>, V2 extends string>
  extends ICondition<S, never, never, never> {
  0: Comparison2<S>;
  1: Variable<V2>;
  2: Placeholder;
}

interface IConditionDVD<S extends IFact<S[2]>, V2 extends string>
  extends ICondition<S, never, never, never> {
  0: Comparison2<S>;
  1: Variable<V2>;
  2: Comparison2<S>;
}

interface IConditionDPC<S extends IFact<S[2]>>
  extends ICondition<S, never, never, never> {
  0: Comparison2<S>;
  1: Placeholder;
  2: S[2];
}

interface IConditionDPV<S extends IFact<S[2]>, V3 extends string>
  extends ICondition<S, never, never, never> {
  0: Comparison2<S>;
  1: Placeholder;
  2: Variable<V3>;
}

interface IConditionDPP<S extends IFact<S[2]>>
  extends ICondition<S, never, never, never> {
  0: Comparison2<S>;
  1: Placeholder;
  2: Placeholder;
}

interface IConditionDPD<S extends IFact<S[2]>>
  extends ICondition<S, never, never, never> {
  0: Comparison2<S>;
  1: Placeholder;
  2: Comparison2<S>;
}

interface IConditionDDC<S extends IFact<S[2]>>
  extends ICondition<S, never, never, never> {
  0: Comparison2<S>;
  1: Comparison2<S>;
  2: S[2];
}

interface IConditionDDV<S extends IFact<S[2]>, V3 extends string>
  extends ICondition<S, never, never, never> {
  0: Comparison2<S>;
  1: Comparison2<S>;
  2: Variable<V3>;
}

interface IConditionDDP<S extends IFact<S[2]>>
  extends ICondition<S, never, never, never> {
  0: Comparison2<S>;
  1: Comparison2<S>;
  2: Placeholder;
}

interface IConditionDDD<S extends IFact<S[2]>>
  extends ICondition<S, never, never, never> {
  0: Comparison2<S>;
  1: Comparison2<S>;
  2: Comparison2<S>;
}

type PossibleCondition<
  S extends IFact<S[2]>,
  V1 extends string,
  V2 extends string,
  V3 extends string
> =
  | IConditionCVV<S, V2, V3>
  | IConditionVCV<S, V1, V3>
  | IConditionVVC<S, V1, V2>
  | IConditionVVV<S, V1, V2, V3>
  | IConditionVVD<S, V1, V2>
  | IConditionVDV<S, V1, V3>
  | IConditionDVV<S, V2, V3>
  | IConditionCCV<S, V3>
  | IConditionCVC<S, V2>
  | IConditionCVP<S, V2>
  | IConditionCVD<S, V2>
  | IConditionCPV<S, V3>
  | IConditionCDV<S, V3>
  | IConditionVCC<S, V1>
  | IConditionVCP<S, V1>
  | IConditionVCD<S, V1>
  | IConditionVVP<S, V1, V2>
  | IConditionVPC<S, V1>
  | IConditionVPV<S, V1, V3>
  | IConditionVPD<S, V1>
  | IConditionVDC<S, V1>
  | IConditionVDP<S, V1>
  | IConditionVDD<S, V1>
  | IConditionPCV<S, V3>
  | IConditionPVC<S, V2>
  | IConditionPVV<S, V2, V3>
  | IConditionPVD<S, V2>
  | IConditionPDV<S, V3>
  | IConditionDCV<S, V3>
  | IConditionDVC<S, V2>
  | IConditionDVP<S, V2>
  | IConditionDVD<S, V2>
  | IConditionDPV<S, V3>
  | IConditionDDV<S, V3>
  | IConditionVPP<S, V1>
  | IConditionPVP<S, V2>
  | IConditionPPV<S, V3>
  | IConditionCCC<S>
  | IConditionCCP<S>
  | IConditionCCD<S>
  | IConditionCPC<S>
  | IConditionCPP<S>
  | IConditionCPD<S>
  | IConditionCDC<S>
  | IConditionCDP<S>
  | IConditionCDD<S>
  | IConditionPCC<S>
  | IConditionPCP<S>
  | IConditionPCD<S>
  | IConditionPPC<S>
  | IConditionPPD<S>
  | IConditionPDC<S>
  | IConditionPDP<S>
  | IConditionPDD<S>
  | IConditionDCC<S>
  | IConditionDCP<S>
  | IConditionDCD<S>
  | IConditionDPC<S>
  | IConditionDPP<S>
  | IConditionDPD<S>
  | IConditionDDC<S>
  | IConditionDDP<S>
  | IConditionDDD<S>
  | IConditionPPP<S>;

interface IParsedCondition<S extends IFact<S[2]>> {
  placeholderFields: { [K in "0" | "1" | "2"]?: true };
  constantFields: { 0?: S[0]; 1?: S[1]; 2?: S[2] };
  variableFields: { [K in "0" | "1" | "2"]?: Variable<any> };
  variableNames: { [key: string]: "0" | "1" | "2" };
  comparisonFields: { [K in "0" | "1" | "2"]?: Comparison2<S> };
}

interface IParsedConditionVVV<
  S extends IFact<S[2]>,
  V1 extends string,
  V2 extends string,
  V3 extends string
> extends IParsedCondition<S> {
  placeholderFields: {};
  constantFields: {};
  variableFields: { 0: Variable<V1>; 1: Variable<V2>; 2: Variable<V3> };
  variableNames: { [P in V1]: "0" } & { [P in V2]: "1" } & { [P in V3]: "2" };
  comparisonFields: {};
}

interface IParsedConditionCVV<
  S extends IFact<S[2]>,
  V2 extends string,
  V3 extends string
> extends IParsedCondition<S> {
  placeholderFields: {};
  constantFields: { 0: S[0] };
  variableFields: { 1: Variable<V2>; 2: Variable<V3> };
  variableNames: { [P in V2]: "1" } & { [P in V3]: "2" };
  comparisonFields: {};
}

interface IParsedConditionVCV<
  S extends IFact<S[2]>,
  V1 extends string,
  V3 extends string
> extends IParsedCondition<S> {
  placeholderFields: {};
  constantFields: { 1: S[1] };
  variableFields: { 0: Variable<V1>; 2: Variable<V3> };
  variableNames: { [P in V1]: "0" } & { [P in V3]: "2" };
  comparisonFields: {};
}

interface IParsedConditionVVC<
  S extends IFact<S[2]>,
  V1 extends string,
  V2 extends string
> extends IParsedCondition<S> {
  placeholderFields: {};
  constantFields: { 2: true };
  variableFields: { 0: Variable<V1>; 1: Variable<V2> };
  variableNames: { [P in V1]: "0" } & { [P in V2]: "1" };
  comparisonFields: {};
}

interface IParsedConditionVVP<
  S extends IFact<S[2]>,
  V1 extends string,
  V2 extends string
> extends IParsedCondition<S> {
  placeholderFields: { 2: true };
  constantFields: {};
  variableFields: { 0: Variable<V1>; 1: Variable<V2> };
  variableNames: { [P in V1]: "0" } & { [P in V2]: "1" };
  comparisonFields: {};
}

interface IParsedConditionVVD<
  S extends IFact<S[2]>,
  V1 extends string,
  V2 extends string
> extends IParsedCondition<S> {
  placeholderFields: {};
  constantFields: {};
  variableFields: { 0: Variable<V1>; 1: Variable<V2> };
  variableNames: { [P in V1]: "0" } & { [P in V2]: "1" };
  comparisonFields: { 2: Comparison2<S> };
}

interface IParsedConditionVPV<
  S extends IFact<S[2]>,
  V1 extends string,
  V3 extends string
> extends IParsedCondition<S> {
  placeholderFields: { 1: true };
  constantFields: {};
  variableFields: { 0: Variable<V1>; 2: Variable<V3> };
  variableNames: { [P in V1]: "0" } & { [P in V3]: "2" };
  comparisonFields: {};
}

interface IParsedConditionVDV<
  S extends IFact<S[2]>,
  V1 extends string,
  V3 extends string
> extends IParsedCondition<S> {
  placeholderFields: {};
  constantFields: {};
  variableFields: { 0: Variable<V1>; 2: Variable<V3> };
  variableNames: { [P in V1]: "0" } & { [P in V3]: "2" };
  comparisonFields: { 1: Comparison2<S> };
}

interface IParsedConditionPVV<
  S extends IFact<S[2]>,
  V2 extends string,
  V3 extends string
> extends IParsedCondition<S> {
  placeholderFields: { 0: true };
  constantFields: {};
  variableFields: { 1: Variable<V2>; 2: Variable<V3> };
  variableNames: { [P in V2]: "1" } & { [P in V3]: "2" };
  comparisonFields: {};
}

interface IParsedConditionCDV<S extends IFact<S[2]>, V3 extends string>
  extends IParsedCondition<S> {
  placeholderFields: {};
  constantFields: { 0: S[0] };
  variableFields: { 2: Variable<V3> };
  variableNames: { [P in V3]: "2" };
  comparisonFields: { 1: Comparison2<S> };
}

interface IParsedConditionVCD<S extends IFact<S[2]>, V1 extends string>
  extends IParsedCondition<S> {
  placeholderFields: {};
  constantFields: { 1: S[1] };
  variableFields: { 0: Variable<V1> };
  variableNames: { [P in V1]: "0" };
  comparisonFields: { 2: Comparison2<S> };
}

interface IParsedConditionVPD<S extends IFact<S[2]>, V1 extends string>
  extends IParsedCondition<S> {
  placeholderFields: { 1: true };
  constantFields: {};
  variableFields: { 0: Variable<V1> };
  variableNames: { [P in V1]: "0" };
  comparisonFields: { 2: Comparison2<S> };
}

interface IParsedConditionVDC<S extends IFact<S[2]>, V1 extends string>
  extends IParsedCondition<S> {
  placeholderFields: {};
  constantFields: { 2: true };
  variableFields: { 0: Variable<V1> };
  variableNames: { [P in V1]: "0" };
  comparisonFields: { 1: Comparison2<S> };
}

interface IParsedConditionVDP<S extends IFact<S[2]>, V1 extends string>
  extends IParsedCondition<S> {
  placeholderFields: { 2: true };
  constantFields: {};
  variableFields: { 0: Variable<V1> };
  variableNames: { [P in V1]: "0" };
  comparisonFields: { 1: Comparison2<S> };
}

interface IParsedConditionVDD<S extends IFact<S[2]>, V1 extends string>
  extends IParsedCondition<S> {
  placeholderFields: {};
  constantFields: {};
  variableFields: { 0: Variable<V1> };
  variableNames: { [P in V1]: "0" };
  comparisonFields: { 1: Comparison2<S>; 2: Comparison2<S> };
}

interface IParsedConditionPVD<S extends IFact<S[2]>, V2 extends string>
  extends IParsedCondition<S> {
  placeholderFields: { 0: true };
  constantFields: {};
  variableFields: { 1: Variable<V2> };
  variableNames: { [P in V2]: "1" };
  comparisonFields: { 2: Comparison2<S> };
}

interface IParsedConditionPDV<S extends IFact<S[2]>, V3 extends string>
  extends IParsedCondition<S> {
  placeholderFields: { 0: true };
  constantFields: {};
  variableFields: { 2: Variable<V3> };
  variableNames: { [P in V3]: "2" };
  comparisonFields: { 1: Comparison2<S> };
}

interface IParsedConditionDCV<S extends IFact<S[2]>, V3 extends string>
  extends IParsedCondition<S> {
  placeholderFields: {};
  constantFields: { 0: S[0] };
  variableFields: { 2: Variable<V3> };
  variableNames: { [P in V3]: "2" };
  comparisonFields: { 0: Comparison2<S> };
}

interface IParsedConditionDVC<S extends IFact<S[2]>, V2 extends string>
  extends IParsedCondition<S> {
  placeholderFields: {};
  constantFields: { 2: true };
  variableFields: { 1: Variable<V2> };
  variableNames: { [P in V2]: "1" };
  comparisonFields: { 0: Comparison2<S> };
}

interface IParsedConditionDVP<S extends IFact<S[2]>, V2 extends string>
  extends IParsedCondition<S> {
  placeholderFields: { 2: true };
  constantFields: {};
  variableFields: { 1: Variable<V2> };
  variableNames: { [P in V2]: "1" };
  comparisonFields: { 0: Comparison2<S> };
}

interface IParsedConditionDVD<S extends IFact<S[2]>, V2 extends string>
  extends IParsedCondition<S> {
  placeholderFields: {};
  constantFields: {};
  variableFields: { 1: Variable<V2> };
  variableNames: { [P in V2]: "1" };
  comparisonFields: { 0: Comparison2<S>; 2: Comparison2<S> };
}

interface IParsedConditionDPV<S extends IFact<S[2]>, V3 extends string>
  extends IParsedCondition<S> {
  placeholderFields: { 1: true };
  constantFields: {};
  variableFields: { 2: Variable<V3> };
  variableNames: { [P in V3]: "2" };
  comparisonFields: { 0: Comparison2<S> };
}

interface IParsedConditionDDV<S extends IFact<S[2]>, V3 extends string>
  extends IParsedCondition<S> {
  placeholderFields: {};
  constantFields: {};
  variableFields: { 2: Variable<V3> };
  variableNames: { [P in V3]: "2" };
  comparisonFields: { 0: Comparison2<S>; 1: Comparison2<S> };
}

interface IParsedConditionDVV<
  S extends IFact<S[2]>,
  V2 extends string,
  V3 extends string
> extends IParsedCondition<S> {
  placeholderFields: {};
  constantFields: {};
  variableFields: { 1: Variable<V2>; 2: Variable<V3> };
  variableNames: { [P in V2]: "1" } & { [P in V3]: "2" };
  comparisonFields: { 1: Comparison2<S> };
}

interface IParsedConditionCCV<S extends IFact<S[2]>, V3 extends string>
  extends IParsedCondition<S> {
  placeholderFields: {};
  constantFields: { 0: S[0]; 1: S[1] };
  variableFields: { 2: Variable<V3> };
  variableNames: { [P in V3]: "2" };
  comparisonFields: {};
}

interface IParsedConditionCVC<S extends IFact<S[2]>, V2 extends string>
  extends IParsedCondition<S> {
  placeholderFields: {};
  constantFields: { 0: S[0]; 2: true };
  variableFields: { 1: Variable<V2> };
  variableNames: { [P in V2]: "1" };
  comparisonFields: {};
}

interface IParsedConditionCVP<S extends IFact<S[2]>, V2 extends string>
  extends IParsedCondition<S> {
  placeholderFields: { 2: true };
  constantFields: { 0: S[0] };
  variableFields: { 1: Variable<V2> };
  variableNames: { [P in V2]: "1" };
  comparisonFields: {};
}

interface IParsedConditionCPV<S extends IFact<S[2]>, V3 extends string>
  extends IParsedCondition<S> {
  placeholderFields: { 1: true };
  constantFields: { 0: S[0] };
  variableFields: { 2: Variable<V3> };
  variableNames: { [P in V3]: "2" };
  comparisonFields: {};
}

interface IParsedConditionCVD<S extends IFact<S[2]>, V2 extends string>
  extends IParsedCondition<S> {
  placeholderFields: {};
  constantFields: { 0: S[0] };
  variableFields: { 1: Variable<V2> };
  variableNames: { [P in V2]: "1" };
  comparisonFields: { 2: Comparison2<S> };
}

interface IParsedConditionVCC<S extends IFact<S[2]>, V1 extends string>
  extends IParsedCondition<S> {
  placeholderFields: {};
  constantFields: { 1: S[1]; 2: true };
  variableFields: { 0: Variable<V1> };
  variableNames: { [P in V1]: "0" };
  comparisonFields: {};
}

interface IParsedConditionVCP<S extends IFact<S[2]>, V1 extends string>
  extends IParsedCondition<S> {
  placeholderFields: { 2: true };
  constantFields: { 1: S[1] };
  variableFields: { 0: Variable<V1> };
  variableNames: { [P in V1]: "0" };
  comparisonFields: {};
}

interface IParsedConditionVPC<S extends IFact<S[2]>, V1 extends string>
  extends IParsedCondition<S> {
  placeholderFields: { 1: true };
  constantFields: { 2: true };
  variableFields: { 0: Variable<V1> };
  variableNames: { [P in V1]: "0" };
  comparisonFields: {};
}

interface IParsedConditionVPP<S extends IFact<S[2]>, V1 extends string>
  extends IParsedCondition<S> {
  placeholderFields: { 1: true; 2: true };
  constantFields: {};
  variableFields: { 0: Variable<V1> };
  variableNames: { [P in V1]: "0" };
  comparisonFields: {};
}

interface IParsedConditionPCV<S extends IFact<S[2]>, V3 extends string>
  extends IParsedCondition<S> {
  placeholderFields: { 0: true };
  constantFields: { 1: S[1] };
  variableFields: { 2: Variable<V3> };
  variableNames: { [P in V3]: "2" };
  comparisonFields: {};
}

interface IParsedConditionPVC<S extends IFact<S[2]>, V2 extends string>
  extends IParsedCondition<S> {
  placeholderFields: { 0: true };
  constantFields: { 2: true };
  variableFields: { 1: Variable<V2> };
  variableNames: { [P in V2]: "1" };
  comparisonFields: {};
}

interface IParsedConditionPVP<S extends IFact<S[2]>, V2 extends string>
  extends IParsedCondition<S> {
  placeholderFields: { 0: true; 2: true };
  constantFields: {};
  variableFields: { 1: Variable<V2> };
  variableNames: { [P in V2]: "1" };
  comparisonFields: {};
}

interface IParsedConditionPPV<S extends IFact<S[2]>, V3 extends string>
  extends IParsedCondition<S> {
  placeholderFields: { 0: true; 1: true };
  constantFields: {};
  variableFields: { 2: Variable<V3> };
  variableNames: { [P in V3]: "2" };
  comparisonFields: {};
}

interface IParsedConditionCCD<S extends IFact<S[2]>>
  extends IParsedCondition<S> {
  placeholderFields: {};
  constantFields: { 0: S[0]; 1: S[1] };
  variableFields: {};
  variableNames: {};
  comparisonFields: { 2: Comparison2<S> };
}

interface IParsedConditionCPD<S extends IFact<S[2]>>
  extends IParsedCondition<S> {
  placeholderFields: { 1: true };
  constantFields: { 0: S[0] };
  variableFields: {};
  variableNames: {};
  comparisonFields: { 2: Comparison2<S> };
}

interface IParsedConditionCDC<S extends IFact<S[2]>>
  extends IParsedCondition<S> {
  placeholderFields: {};
  constantFields: { 0: S[0]; 2: true };
  variableFields: {};
  variableNames: {};
  comparisonFields: { 1: Comparison2<S> };
}

interface IParsedConditionCDP<S extends IFact<S[2]>>
  extends IParsedCondition<S> {
  placeholderFields: { 2: true };
  constantFields: { 0: S[0] };
  variableFields: {};
  variableNames: {};
  comparisonFields: { 1: Comparison2<S> };
}

interface IParsedConditionCDD<S extends IFact<S[2]>>
  extends IParsedCondition<S> {
  placeholderFields: {};
  constantFields: { 0: S[0] };
  variableFields: {};
  variableNames: {};
  comparisonFields: { 1: Comparison2<S>; 2: Comparison2<S> };
}

interface IParsedConditionPCD<S extends IFact<S[2]>>
  extends IParsedCondition<S> {
  placeholderFields: { 0: true };
  constantFields: { 1: S[1] };
  variableFields: {};
  variableNames: {};
  comparisonFields: { 2: Comparison2<S> };
}

interface IParsedConditionPPD<S extends IFact<S[2]>>
  extends IParsedCondition<S> {
  placeholderFields: { 0: true; 1: true };
  constantFields: {};
  variableFields: {};
  variableNames: {};
  comparisonFields: { 2: Comparison2<S> };
}

interface IParsedConditionPDC<S extends IFact<S[2]>>
  extends IParsedCondition<S> {
  placeholderFields: { 0: true };
  constantFields: { 2: true };
  variableFields: {};
  variableNames: {};
  comparisonFields: { 1: Comparison2<S> };
}

interface IParsedConditionPDP<S extends IFact<S[2]>>
  extends IParsedCondition<S> {
  placeholderFields: { 0: true; 2: true };
  constantFields: {};
  variableFields: {};
  variableNames: {};
  comparisonFields: { 1: Comparison2<S> };
}

interface IParsedConditionPDD<S extends IFact<S[2]>>
  extends IParsedCondition<S> {
  placeholderFields: { 0: true };
  constantFields: {};
  variableFields: {};
  variableNames: {};
  comparisonFields: { 1: Comparison2<S>; 2: Comparison2<S> };
}

interface IParsedConditionDCC<S extends IFact<S[2]>>
  extends IParsedCondition<S> {
  placeholderFields: {};
  constantFields: { 1: S[1]; 2: true };
  variableFields: {};
  variableNames: {};
  comparisonFields: { 0: Comparison2<S> };
}

interface IParsedConditionDCP<S extends IFact<S[2]>>
  extends IParsedCondition<S> {
  placeholderFields: { 2: true };
  constantFields: { 1: S[1] };
  variableFields: {};
  variableNames: {};
  comparisonFields: { 0: Comparison2<S> };
}

interface IParsedConditionDCD<S extends IFact<S[2]>>
  extends IParsedCondition<S> {
  placeholderFields: {};
  constantFields: { 1: S[1] };
  variableFields: {};
  variableNames: {};
  comparisonFields: { 0: Comparison2<S>; 2: Comparison2<S> };
}

interface IParsedConditionDPC<S extends IFact<S[2]>>
  extends IParsedCondition<S> {
  placeholderFields: { 1: true };
  constantFields: { 2: true };
  variableFields: {};
  variableNames: {};
  comparisonFields: { 0: Comparison2<S> };
}

interface IParsedConditionDPP<S extends IFact<S[2]>>
  extends IParsedCondition<S> {
  placeholderFields: { 1: true; 2: true };
  constantFields: {};
  variableFields: {};
  variableNames: {};
  comparisonFields: { 0: Comparison2<S> };
}

interface IParsedConditionDPD<S extends IFact<S[2]>>
  extends IParsedCondition<S> {
  placeholderFields: { 1: true };
  constantFields: {};
  variableFields: {};
  variableNames: {};
  comparisonFields: { 0: Comparison2<S>; 2: Comparison2<S> };
}

interface IParsedConditionDDC<S extends IFact<S[2]>>
  extends IParsedCondition<S> {
  placeholderFields: {};
  constantFields: { 2: true };
  variableFields: {};
  variableNames: {};
  comparisonFields: { 0: Comparison2<S>; 1: Comparison2<S> };
}

interface IParsedConditionDDP<S extends IFact<S[2]>>
  extends IParsedCondition<S> {
  placeholderFields: { 2: true };
  constantFields: {};
  variableFields: {};
  variableNames: {};
  comparisonFields: { 0: Comparison2<S>; 1: Comparison2<S> };
}

interface IParsedConditionDDD<S extends IFact<S[2]>>
  extends IParsedCondition<S> {
  placeholderFields: {};
  constantFields: {};
  variableFields: {};
  variableNames: {};
  comparisonFields: { 0: Comparison2<S>; 1: Comparison2<S>; 2: Comparison2<S> };
}

interface IParsedConditionCCC<S extends IFact<S[2]>>
  extends IParsedCondition<S> {
  placeholderFields: {};
  constantFields: { 0: S[0]; 1: S[1]; 2: S[2] };
  variableFields: {};
  variableNames: {};
  comparisonFields: {};
}

interface IParsedConditionCCP<S extends IFact<S[2]>>
  extends IParsedCondition<S> {
  placeholderFields: { 2: true };
  constantFields: { 0: S[0]; 1: S[1] };
  variableFields: {};
  variableNames: {};
  comparisonFields: {};
}

interface IParsedConditionCPC<S extends IFact<S[2]>>
  extends IParsedCondition<S> {
  placeholderFields: { 1: true };
  constantFields: { 0: S[0]; 2: true };
  variableFields: {};
  variableNames: {};
  comparisonFields: {};
}

interface IParsedConditionCPP<S extends IFact<S[2]>>
  extends IParsedCondition<S> {
  placeholderFields: { 1: true; 2: true };
  constantFields: { 0: S[0] };
  variableFields: {};
  variableNames: {};
  comparisonFields: {};
}

interface IParsedConditionPCC<S extends IFact<S[2]>>
  extends IParsedCondition<S> {
  placeholderFields: { 0: true };
  constantFields: { 1: S[1]; 2: true };
  variableFields: {};
  variableNames: {};
  comparisonFields: {};
}

interface IParsedConditionPCP<S extends IFact<S[2]>>
  extends IParsedCondition<S> {
  placeholderFields: { 0: true; 2: true };
  constantFields: { 1: S[1] };
  variableFields: {};
  variableNames: {};
  comparisonFields: {};
}

interface IParsedConditionPPC<S extends IFact<S[2]>>
  extends IParsedCondition<S> {
  placeholderFields: { 0: true; 1: true };
  constantFields: { 2: true };
  variableFields: {};
  variableNames: {};
  comparisonFields: {};
}

interface IParsedConditionPPP<S extends IFact<S[2]>>
  extends IParsedCondition<S> {
  placeholderFields: { 0: true; 1: true; 2: true };
  constantFields: {};
  variableFields: {};
  variableNames: {};
  comparisonFields: {};
}

type PossibleParsedCondition<
  S extends IFact<S[2]>,
  V1 extends string,
  V2 extends string,
  V3 extends string
> =
  | IParsedConditionVVV<S, V1, V2, V3>
  | IParsedConditionVVD<S, V1, V2>
  | IParsedConditionVDV<S, V1, V3>
  | IParsedConditionDVV<S, V2, V3>
  | IParsedConditionCVV<S, V2, V3>
  | IParsedConditionVCV<S, V1, V3>
  | IParsedConditionVVC<S, V1, V2>
  | IParsedConditionVVP<S, V1, V2>
  | IParsedConditionCVD<S, V2>
  | IParsedConditionVPV<S, V1, V3>
  | IParsedConditionPVV<S, V2, V3>
  | IParsedConditionCDV<S, V3>
  | IParsedConditionVCD<S, V1>
  | IParsedConditionVPD<S, V1>
  | IParsedConditionVDC<S, V1>
  | IParsedConditionVDP<S, V1>
  | IParsedConditionVDD<S, V1>
  | IParsedConditionPVD<S, V2>
  | IParsedConditionPDV<S, V3>
  | IParsedConditionDCV<S, V3>
  | IParsedConditionDVC<S, V2>
  | IParsedConditionDVP<S, V2>
  | IParsedConditionDVD<S, V2>
  | IParsedConditionDPV<S, V3>
  | IParsedConditionDDV<S, V3>
  | IParsedConditionCCV<S, V3>
  | IParsedConditionCVC<S, V2>
  | IParsedConditionCVP<S, V2>
  | IParsedConditionCPV<S, V3>
  | IParsedConditionVCC<S, V1>
  | IParsedConditionVCP<S, V1>
  | IParsedConditionVPC<S, V1>
  | IParsedConditionVPP<S, V1>
  | IParsedConditionPCV<S, V3>
  | IParsedConditionPVC<S, V2>
  | IParsedConditionPVP<S, V2>
  | IParsedConditionPPV<S, V3>
  | IParsedConditionCCD<S>
  | IParsedConditionCPD<S>
  | IParsedConditionCDC<S>
  | IParsedConditionCDP<S>
  | IParsedConditionCDD<S>
  | IParsedConditionPCD<S>
  | IParsedConditionPPD<S>
  | IParsedConditionPDC<S>
  | IParsedConditionPDP<S>
  | IParsedConditionPDD<S>
  | IParsedConditionDCC<S>
  | IParsedConditionDCP<S>
  | IParsedConditionDCD<S>
  | IParsedConditionDPC<S>
  | IParsedConditionDPP<S>
  | IParsedConditionDPD<S>
  | IParsedConditionDDC<S>
  | IParsedConditionDDP<S>
  | IParsedConditionDDD<S>
  | IParsedConditionCCC<S>
  | IParsedConditionCCP<S>
  | IParsedConditionCPC<S>
  | IParsedConditionCPP<S>
  | IParsedConditionPCC<S>
  | IParsedConditionPCP<S>
  | IParsedConditionPPC<S>
  | IParsedConditionPPP<S>;

function isVariable<T extends string>(v: Variable<T> | any): v is Variable<T> {
  return v instanceof Variable;
}

function isComparison<S extends IFact<S[2]>>(
  v: Comparison2<S> | any
): v is Comparison2<S> {
  return v instanceof Comparison2;
}

function isPlaceholder(v: Placeholder | any): v is Placeholder {
  return v instanceof Placeholder;
}

function isConstant(v: any): boolean {
  return !isVariable(v) && !isPlaceholder(v) && !isComparison(v);
}

type PossibleItem<V extends string> = Variable<V> | Placeholder;

function parseCondition2<
  S extends IFact<S[2]>,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionVVV<S, V1, V2, V3>): IParsedConditionVVV<S, V1, V2, V3>;
function parseCondition2<
  S extends IFact<S[2]>,
  V2 extends string,
  V3 extends string
>(c: IConditionCVV<S, V2, V3>): IParsedConditionCVV<S, V2, V3>;
function parseCondition2<
  S extends IFact<S[2]>,
  V1 extends string,
  V3 extends string
>(c: IConditionVCV<S, V1, V3>): IParsedConditionVCV<S, V1, V3>;
function parseCondition2<
  S extends IFact<S[2]>,
  V1 extends string,
  V2 extends string
>(c: IConditionVVC<S, V1, V2>): IParsedConditionVVC<S, V1, V2>;
function parseCondition2<
  S extends IFact<S[2]>,
  V1 extends string,
  V2 extends string
>(c: IConditionVVD<S, V1, V2>): IParsedConditionVVD<S, V1, V2>;
function parseCondition2<
  S extends IFact<S[2]>,
  V1 extends string,
  V3 extends string
>(c: IConditionVDV<S, V1, V3>): IParsedConditionVDV<S, V1, V3>;
function parseCondition2<
  S extends IFact<S[2]>,
  V2 extends string,
  V3 extends string
>(c: IConditionDVV<S, V2, V3>): IParsedConditionDVV<S, V2, V3>;
function parseCondition2<S extends IFact<S[2]>, V3 extends string>(
  c: IConditionCCV<S, V3>
): IParsedConditionCCV<S, V3>;
function parseCondition2<S extends IFact<S[2]>, V2 extends string>(
  c: IConditionCVC<S, V2>
): IParsedConditionCVC<S, V2>;
function parseCondition2<S extends IFact<S[2]>, V2 extends string>(
  c: IConditionCVP<S, V2>
): IParsedConditionCVP<S, V2>;
function parseCondition2<S extends IFact<S[2]>, V2 extends string>(
  c: IConditionCVD<S, V2>
): IParsedConditionCVD<S, V2>;
function parseCondition2<S extends IFact<S[2]>, V3 extends string>(
  c: IConditionCPV<S, V3>
): IParsedConditionCPV<S, V3>;
function parseCondition2<S extends IFact<S[2]>, V3 extends string>(
  c: IConditionCDV<S, V3>
): IParsedConditionCDV<S, V3>;
function parseCondition2<S extends IFact<S[2]>, V1 extends string>(
  c: IConditionVCC<S, V1>
): IParsedConditionVCC<S, V1>;
function parseCondition2<S extends IFact<S[2]>, V1 extends string>(
  c: IConditionVCP<S, V1>
): IParsedConditionVCP<S, V1>;
function parseCondition2<S extends IFact<S[2]>, V1 extends string>(
  c: IConditionVCD<S, V1>
): IParsedConditionVCD<S, V1>;
function parseCondition2<
  S extends IFact<S[2]>,
  V1 extends string,
  V2 extends string
>(c: IConditionVVP<S, V1, V2>): IParsedConditionVVP<S, V1, V2>;
function parseCondition2<S extends IFact<S[2]>, V1 extends string>(
  c: IConditionVPC<S, V1>
): IParsedConditionVPC<S, V1>;
function parseCondition2<
  S extends IFact<S[2]>,
  V1 extends string,
  V3 extends string
>(c: IConditionVPV<S, V1, V3>): IParsedConditionVPV<S, V1, V3>;
function parseCondition2<S extends IFact<S[2]>, V1 extends string>(
  c: IConditionVPD<S, V1>
): IParsedConditionVPD<S, V1>;
function parseCondition2<S extends IFact<S[2]>, V1 extends string>(
  c: IConditionVDC<S, V1>
): IParsedConditionVDC<S, V1>;
function parseCondition2<S extends IFact<S[2]>, V1 extends string>(
  c: IConditionVDP<S, V1>
): IParsedConditionVDP<S, V1>;
function parseCondition2<S extends IFact<S[2]>, V1 extends string>(
  c: IConditionVDD<S, V1>
): IParsedConditionVDD<S, V1>;
function parseCondition2<S extends IFact<S[2]>, V3 extends string>(
  c: IConditionPCV<S, V3>
): IParsedConditionPCV<S, V3>;
function parseCondition2<S extends IFact<S[2]>, V2 extends string>(
  c: IConditionPVC<S, V2>
): IParsedConditionPVC<S, V2>;
function parseCondition2<
  S extends IFact<S[2]>,
  V2 extends string,
  V3 extends string
>(c: IConditionPVV<S, V2, V3>): IParsedConditionPVV<S, V2, V3>;
function parseCondition2<S extends IFact<S[2]>, V2 extends string>(
  c: IConditionPVD<S, V2>
): IParsedConditionPVD<S, V2>;
function parseCondition2<S extends IFact<S[2]>, V3 extends string>(
  c: IConditionPDV<S, V3>
): IParsedConditionPDV<S, V3>;
function parseCondition2<S extends IFact<S[2]>, V3 extends string>(
  c: IConditionDCV<S, V3>
): IParsedConditionDCV<S, V3>;
function parseCondition2<S extends IFact<S[2]>, V2 extends string>(
  c: IConditionDVC<S, V2>
): IParsedConditionDVC<S, V2>;
function parseCondition2<S extends IFact<S[2]>, V2 extends string>(
  c: IConditionDVP<S, V2>
): IParsedConditionDVP<S, V2>;
function parseCondition2<S extends IFact<S[2]>, V2 extends string>(
  c: IConditionDVD<S, V2>
): IParsedConditionDVD<S, V2>;
function parseCondition2<S extends IFact<S[2]>, V3 extends string>(
  c: IConditionDPV<S, V3>
): IParsedConditionDPV<S, V3>;
function parseCondition2<S extends IFact<S[2]>, V3 extends string>(
  c: IConditionDDV<S, V3>
): IParsedConditionDDV<S, V3>;
function parseCondition2<S extends IFact<S[2]>>(
  c: IConditionCCC<S>
): IParsedConditionCCC<S>;
function parseCondition2<S extends IFact<S[2]>>(
  c: IConditionCCP<S>
): IParsedConditionCCP<S>;
function parseCondition2<S extends IFact<S[2]>>(
  c: IConditionCCD<S>
): IParsedConditionCCD<S>;
function parseCondition2<S extends IFact<S[2]>>(
  c: IConditionCPC<S>
): IParsedConditionCPC<S>;
function parseCondition2<S extends IFact<S[2]>>(
  c: IConditionCPP<S>
): IParsedConditionCPP<S>;
function parseCondition2<S extends IFact<S[2]>>(
  c: IConditionCPD<S>
): IParsedConditionCPD<S>;
function parseCondition2<S extends IFact<S[2]>>(
  c: IConditionCDC<S>
): IParsedConditionCDC<S>;
function parseCondition2<S extends IFact<S[2]>>(
  c: IConditionCDP<S>
): IParsedConditionCDP<S>;
function parseCondition2<S extends IFact<S[2]>>(
  c: IConditionCDD<S>
): IParsedConditionCDD<S>;
function parseCondition2<S extends IFact<S[2]>, V1 extends string>(
  c: IConditionVPP<S, V1>
): IParsedConditionVPP<S, V1>;
function parseCondition2<S extends IFact<S[2]>>(
  c: IConditionPCP<S>
): IParsedConditionPCP<S>;
function parseCondition2<S extends IFact<S[2]>>(
  c: IConditionPCC<S>
): IParsedConditionPCC<S>;
function parseCondition2<S extends IFact<S[2]>>(
  c: IConditionPCD<S>
): IParsedConditionPCD<S>;
function parseCondition2<S extends IFact<S[2]>, V2 extends string>(
  c: IConditionPVP<S, V2>
): IParsedConditionPVP<S, V2>;
function parseCondition2<S extends IFact<S[2]>>(
  c: IConditionPPC<S>
): IParsedConditionPPC<S>;
function parseCondition2<S extends IFact<S[2]>, V3 extends string>(
  c: IConditionPPV<S, V3>
): IParsedConditionPPV<S, V3>;
function parseCondition2<S extends IFact<S[2]>>(
  c: IConditionPPD<S>
): IParsedConditionPPD<S>;
function parseCondition2<S extends IFact<S[2]>>(
  c: IConditionPDC<S>
): IParsedConditionPDC<S>;
function parseCondition2<S extends IFact<S[2]>>(
  c: IConditionPDP<S>
): IParsedConditionPDP<S>;
function parseCondition2<S extends IFact<S[2]>>(
  c: IConditionPDD<S>
): IParsedConditionPDD<S>;
function parseCondition2<S extends IFact<S[2]>>(
  c: IConditionDCC<S>
): IParsedConditionDCC<S>;
function parseCondition2<S extends IFact<S[2]>>(
  c: IConditionDCP<S>
): IParsedConditionDCP<S>;
function parseCondition2<S extends IFact<S[2]>>(
  c: IConditionDCD<S>
): IParsedConditionDCD<S>;
function parseCondition2<S extends IFact<S[2]>>(
  c: IConditionDPC<S>
): IParsedConditionDPC<S>;
function parseCondition2<S extends IFact<S[2]>>(
  c: IConditionDPP<S>
): IParsedConditionDPP<S>;
function parseCondition2<S extends IFact<S[2]>>(
  c: IConditionDPD<S>
): IParsedConditionDPD<S>;
function parseCondition2<S extends IFact<S[2]>>(
  c: IConditionDDC<S>
): IParsedConditionDDC<S>;
function parseCondition2<S extends IFact<S[2]>>(
  c: IConditionDDP<S>
): IParsedConditionDDP<S>;
function parseCondition2<S extends IFact<S[2]>>(
  c: IConditionDDD<S>
): IParsedConditionDDD<S>;
function parseCondition2<S extends IFact<S[2]>>(
  c: IConditionPPP<S>
): IParsedConditionPPP<S>;
function parseCondition2<
  S extends IFact<S[2]>,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: PossibleCondition<S, V1, V2, V3>): PossibleParsedCondition<S, V1, V2, V3> {
  const identifier = c[0];
  const attribute = c[1];
  const value = c[2];

  const result: IParsedCondition<S> = {
    variableNames: {},
    variableFields: {},
    constantFields: {},
    placeholderFields: {},
    comparisonFields: {}
  };

  /*if (isComparison(identifier)) {
    result.comparisonFields["0"] = identifier as Comparison<Schema>;
    result.placeholderFields["0"] = true;
  } else */
  if (isVariable(identifier)) {
    result.variableNames[identifier.name] = "0";
    result.variableFields["0"] = identifier;
  } else if (isPlaceholder(identifier)) {
    result.placeholderFields["0"] = true;
  } else {
    result.constantFields["0"] = identifier;
  }

  // if (isComparison(attribute)) {
  //   result.comparisonFields["1"] = attribute as Comparison<Schema>;
  //   result.placeholderFields["1"] = true;
  // } else
  if (isVariable(attribute)) {
    result.variableNames[attribute.name] = "1";
    result.variableFields["1"] = attribute;
  } else if (isPlaceholder(attribute)) {
    result.placeholderFields["1"] = true;
  } else {
    result.constantFields["1"] = attribute;
  }

  // if (isComparison(value)) {
  //   result.comparisonFields["2"] = value as Comparison<Schema>;
  //   result.placeholderFields["2"] = true;
  // } else
  if (isVariable(value)) {
    result.variableNames[(value as any).name] = "2";
    result.variableFields["2"] = value;
  } else if (isPlaceholder(value)) {
    result.placeholderFields["2"] = true;
  } else {
    result.constantFields["2"] = value;
  }

  return result as any;
}

describe("Condition", () => {
  describe.only("parseCondition", () => {
    type SimpleSchema = [number, "is", "odd" | "even"];

    it("should parse a purely constants condition", () => {
      const { variableFields, constantFields, variableNames } = parseCondition2(
        [1, "is", "odd"]
      );

      expect(Object.keys(variableFields)).toHaveLength(0);
      expect(Object.keys(variableNames)).toHaveLength(0);
      expect(Object.keys(constantFields)).toHaveLength(3);
      expect(constantFields[0]).toBe(1);
      expect(constantFields[1]).toBe("is");
      expect(constantFields[2]).toBe("odd");
    });

    it("should parse a purely variable condition", () => {
      const $a = makeVar("a");
      const $b = makeVar("b");
      const $c = makeVar("c");

      const { variableFields, constantFields, variableNames } = parseCondition2(
        [$a, $b, $c]
      );

      expect(Object.keys(constantFields)).toHaveLength(0);
      expect(Object.keys(variableFields)).toHaveLength(3);
      expect(Object.keys(variableNames)).toHaveLength(3);
      expect(variableFields[0].name).toBe("a");
      expect(variableFields[1].name).toBe("b");
      expect(variableFields[2].name).toBe("c");
      expect(variableNames.a).toBe("0");
      expect(variableNames.b).toBe("1");
      expect(variableNames.c).toBe("2");
    });

    it("should parse mixed variable/constant condition", () => {
      const $a = makeVar("$a");
      const $c = makeVar("$c");

      const { variableFields, constantFields, variableNames } = parseCondition2(
        [$a, "is", $c]
      );

      expect(Object.keys(constantFields)).toHaveLength(1);
      expect(Object.keys(variableFields)).toHaveLength(2);
      expect(Object.keys(variableNames)).toHaveLength(2);
      expect(constantFields[1]).toBe("is");
      expect(variableFields[0].name).toBe("$a");
      expect(variableFields[2].name).toBe("$c");
      expect(variableNames.$a).toBe("0");
      expect(variableNames.$c).toBe("2");
    });

    it("should parse mixed placeholder/constant condition", () => {
      const { placeholderFields, constantFields } = parseCondition2([
        ph,
        "is",
        ph
      ]);

      expect(Object.keys(constantFields)).toHaveLength(1);
      expect(Object.keys(placeholderFields)).toHaveLength(2);
      expect(constantFields[1]).toBe("is");
      expect(placeholderFields[0]).toBe(true);
      expect(placeholderFields[2]).toBe(true);
    });

    it("should memoize the parse", () => {
      const a = parseCondition(["?a", "is", "?c"]);
      const b = parseCondition(["?a", "is", "?c"]);
      const c = parseCondition(["?a", "is", "?c"]);

      expect(a === b).toBeTruthy();
      expect(b === c).toBeTruthy();
      expect(c === a).toBeTruthy();
    });
  });

  describe("findVariableInEarlierConditions", () => {
    it("should find previous condition", () => {
      const conditions = [parseCondition(["?e", "age", 34])];
      expect(findVariableInEarlierConditions("?e", conditions)).toBe(
        conditions[0]
      );
    });

    it("should find multiple previous conditions", () => {
      const conditions = [
        parseCondition(["?e", "age", 34]),
        parseCondition(["?e", "name", "?v"])
      ];

      expect(findVariableInEarlierConditions("?e", conditions)).toBe(
        conditions[0]
      );
      expect(findVariableInEarlierConditions("?v", conditions)).toBe(
        conditions[1]
      );
    });

    it("should not find previous condition", () => {
      const conditions = [parseCondition([1, "age", 34])];

      expect(findVariableInEarlierConditions("?e", conditions)).toBeUndefined();
    });
  });

  describe("getJoinTestsFromCondition", () => {
    it("should create a join test for the known variable ?e, but not ?v", () => {
      const conditions = [
        parseCondition([1, "name", "Thomas"]),
        parseCondition(["?e", "age", 34])
      ];

      const baseCondition = parseCondition(["?v", "relation", "?e"]);
      const tests = getJoinTestsFromCondition(baseCondition, conditions);

      expect(tests).toHaveLength(2);
      if (tests) {
        expect(tests[0].fieldArg1).toBe(2);
        expect(tests[0].condition).toBe(conditions[1]);
        expect(tests[0].fieldArg2).toBe("0");
        expect(tests[1].fieldArg1).toBe(null);
        expect(tests[1].condition).toBe(baseCondition);
        expect(tests[1].fieldArg2).toBe(null);
      }
    });

    it("should create a join test for the known variables ?e and ?v", () => {
      const conditions = [
        parseCondition(["?e", "age", 34]),
        parseCondition(["?e", "status", "?v"])
      ];

      const tests = getJoinTestsFromCondition(
        parseCondition(["?e", "name", "?v"]),
        conditions
      );

      expect(tests).toHaveLength(2);

      if (tests) {
        expect(tests[0].fieldArg1).toBe(2);
        expect(tests[0].condition).toBe(conditions[1]);
        expect(tests[0].fieldArg2).toBe("2");
        expect(tests[1].fieldArg1).toBe(0);
        expect(tests[1].condition).toBe(conditions[0]);
        expect(tests[1].fieldArg2).toBe("0");
      }
    });
  });
});
