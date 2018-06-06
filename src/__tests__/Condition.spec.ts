import { merge } from "lodash";
import {
  findVariableInEarlierConditions,
  getJoinTestsFromCondition,
  ICondition,
  parseCondition
} from "../Condition";
import { IFact } from "../Fact";

const ph = Symbol();

class Variable<T extends string> {
  name: T;

  constructor(name: T) {
    this.name = name;
  }
}

function makeVar<T extends string>(name: T): Variable<T> {
  return new Variable(name);
}

type Results<T extends object> = { [P in keyof T]: T[P] };

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

type ICompareFn2<Schema extends IFact> = (
  a: any,
  b: Results<Schema>
) => boolean;

class Comparison2<Schema extends IFact> {
  compareFn: ICompareFn2<Schema>;

  constructor(compareFn: ICompareFn2<Schema>) {
    this.compareFn = compareFn;
  }
}

interface IConditionCCC<S extends IFact> {
  0: S[0];
  1: S[1];
  2: S[2];
}

interface IConditionCCV<S extends IFact, V3 extends string> {
  0: S[0];
  1: S[1];
  2: Variable<V3>;
}

interface IConditionCCP<S extends IFact> {
  0: S[0];
  1: S[1];
  2: typeof ph;
}

interface IConditionCCD<S extends IFact> {
  0: S[0];
  1: S[1];
  2: Comparison2<S>;
}

interface IConditionCVC<S extends IFact, V2 extends string> {
  0: S[0];
  1: Variable<V2>;
  2: S[2];
}

interface IConditionCVV<S extends IFact, V2 extends string, V3 extends string> {
  0: S[0];
  1: Variable<V2>;
  2: Variable<V3>;
}

interface IConditionCVP<S extends IFact, V2 extends string> {
  0: S[0];
  1: Variable<V2>;
  2: typeof ph;
}

interface IConditionCVD<S extends IFact, V2 extends string> {
  0: S[0];
  1: Variable<V2>;
  2: Comparison2<S>;
}

interface IConditionCPC<S extends IFact> {
  0: S[0];
  1: typeof ph;
  2: S[2];
}

interface IConditionCPV<S extends IFact, V3 extends string> {
  0: S[0];
  1: typeof ph;
  2: Variable<V3>;
}

interface IConditionCPP<S extends IFact> {
  0: S[0];
  1: typeof ph;
  2: typeof ph;
}

interface IConditionCPD<S extends IFact> {
  0: S[0];
  1: typeof ph;
  2: Comparison2<S>;
}

interface IConditionCDC<S extends IFact> {
  0: S[0];
  1: Comparison2<S>;
  2: S[2];
}

interface IConditionCDV<S extends IFact, V3 extends string> {
  0: S[0];
  1: Comparison2<S>;
  2: Variable<V3>;
}

interface IConditionCDP<S extends IFact> {
  0: S[0];
  1: Comparison2<S>;
  2: typeof ph;
}

interface IConditionCDD<S extends IFact> {
  0: S[0];
  1: Comparison2<S>;
  2: Comparison2<S>;
}

interface IConditionVCC<S extends IFact, V1 extends string> {
  0: Variable<V1>;
  1: S[1];
  2: S[2];
}

interface IConditionVCV<S extends IFact, V1 extends string, V3 extends string> {
  0: Variable<V1>;
  1: S[1];
  2: Variable<V3>;
}

interface IConditionVCP<S extends IFact, V1 extends string> {
  0: Variable<V1>;
  1: S[1];
  2: typeof ph;
}

interface IConditionVCD<S extends IFact, V1 extends string> {
  0: Variable<V1>;
  1: S[1];
  2: Comparison2<S>;
}

interface IConditionVVC<S extends IFact, V1 extends string, V2 extends string> {
  0: Variable<V1>;
  1: Variable<V2>;
  2: S[2];
}

interface IConditionVVV<
  V1 extends string,
  V2 extends string,
  V3 extends string
> {
  0: Variable<V1>;
  1: Variable<V2>;
  2: Variable<V3>;
}

interface IConditionVVP<V1 extends string, V2 extends string> {
  0: Variable<V1>;
  1: Variable<V2>;
  2: typeof ph;
}

interface IConditionVVD<S extends IFact, V1 extends string, V2 extends string> {
  0: Variable<V1>;
  1: Variable<V2>;
  2: Comparison2<S>;
}

interface IConditionVPC<S extends IFact, V1 extends string> {
  0: Variable<V1>;
  1: typeof ph;
  2: S[2];
}

interface IConditionVPV<V1 extends string, V3 extends string> {
  0: Variable<V1>;
  1: typeof ph;
  2: Variable<V3>;
}

interface IConditionVPP<V1 extends string> {
  0: Variable<V1>;
  1: typeof ph;
  2: typeof ph;
}

interface IConditionVPD<S extends IFact, V1 extends string> {
  0: Variable<V1>;
  1: typeof ph;
  2: Comparison2<S>;
}

interface IConditionVDC<S extends IFact, V1 extends string> {
  0: Variable<V1>;
  1: Comparison2<S>;
  2: S[2];
}

interface IConditionVDV<S extends IFact, V1 extends string, V3 extends string> {
  0: Variable<V1>;
  1: Comparison2<S>;
  2: Variable<V3>;
}

interface IConditionVDP<S extends IFact, V1 extends string> {
  0: Variable<V1>;
  1: Comparison2<S>;
  2: typeof ph;
}

interface IConditionVDD<S extends IFact, V1 extends string> {
  0: Variable<V1>;
  1: Comparison2<S>;
  2: Comparison2<S>;
}

interface IConditionPCC<S extends IFact> {
  0: typeof ph;
  1: S[1];
  2: S[2];
}

interface IConditionPCV<S extends IFact, V3 extends string> {
  0: typeof ph;
  1: S[1];
  2: Variable<V3>;
}

interface IConditionPCP<S extends IFact> {
  0: typeof ph;
  1: S[1];
  2: typeof ph;
}

interface IConditionPCD<S extends IFact> {
  0: typeof ph;
  1: S[1];
  2: Comparison2<S>;
}

interface IConditionPVC<S extends IFact, V2 extends string> {
  0: typeof ph;
  1: Variable<V2>;
  2: S[2];
}

interface IConditionPVV<V2 extends string, V3 extends string> {
  0: typeof ph;
  1: Variable<V2>;
  2: Variable<V3>;
}

interface IConditionPVP<V2 extends string> {
  0: typeof ph;
  1: Variable<V2>;
  2: typeof ph;
}

interface IConditionPVD<S extends IFact, V2 extends string> {
  0: typeof ph;
  1: Variable<V2>;
  2: Comparison2<S>;
}

interface IConditionPPC<S extends IFact> {
  0: typeof ph;
  1: typeof ph;
  2: S[2];
}

interface IConditionPPV<V3 extends string> {
  0: typeof ph;
  1: typeof ph;
  2: Variable<V3>;
}

interface IConditionPPP {
  0: typeof ph;
  1: typeof ph;
  2: typeof ph;
}

interface IConditionPPD<S extends IFact> {
  0: typeof ph;
  1: typeof ph;
  2: Comparison2<S>;
}

interface IConditionPDC<S extends IFact> {
  0: typeof ph;
  1: Comparison2<S>;
  2: S[2];
}

interface IConditionPDV<S extends IFact, V3 extends string> {
  0: typeof ph;
  1: Comparison2<S>;
  2: Variable<V3>;
}

interface IConditionPDP<S extends IFact> {
  0: typeof ph;
  1: Comparison2<S>;
  2: typeof ph;
}

interface IConditionPDD<S extends IFact> {
  0: typeof ph;
  1: Comparison2<S>;
  2: Comparison2<S>;
}

interface IConditionDCC<S extends IFact> {
  0: Comparison2<S>;
  1: S[1];
  2: S[2];
}

interface IConditionDCV<S extends IFact, V2 extends string> {
  0: Comparison2<S>;
  1: S[1];
  2: Variable<V2>;
}

interface IConditionDCP<S extends IFact> {
  0: Comparison2<S>;
  1: S[1];
  2: typeof ph;
}

interface IConditionDCD<S extends IFact> {
  0: Comparison2<S>;
  1: S[1];
  2: Comparison2<S>;
}

interface IConditionDVC<S extends IFact, V2 extends string> {
  0: Comparison2<S>;
  1: Variable<V2>;
  2: S[2];
}

interface IConditionDVV<S extends IFact, V2 extends string, V3 extends string> {
  0: Comparison2<S>;
  1: Variable<V2>;
  2: Variable<V3>;
}

interface IConditionDVP<S extends IFact, V2 extends string> {
  0: Comparison2<S>;
  1: Variable<V2>;
  2: typeof ph;
}

interface IConditionDVD<S extends IFact, V2 extends string> {
  0: Comparison2<S>;
  1: Variable<V2>;
  2: Comparison2<S>;
}

interface IConditionDPC<S extends IFact> {
  0: Comparison2<S>;
  1: typeof ph;
  2: S[2];
}

interface IConditionDPV<S extends IFact, V3 extends string> {
  0: Comparison2<S>;
  1: typeof ph;
  2: Variable<V3>;
}

interface IConditionDPP<S extends IFact> {
  0: Comparison2<S>;
  1: typeof ph;
  2: typeof ph;
}

interface IConditionDPD<S extends IFact> {
  0: Comparison2<S>;
  1: typeof ph;
  2: Comparison2<S>;
}

interface IConditionDDC<S extends IFact> {
  0: Comparison2<S>;
  1: Comparison2<S>;
  2: S[2];
}

interface IConditionDDV<S extends IFact, V3 extends string> {
  0: Comparison2<S>;
  1: Comparison2<S>;
  2: Variable<V3>;
}

interface IConditionDDP<S extends IFact> {
  0: Comparison2<S>;
  1: Comparison2<S>;
  2: typeof ph;
}

interface IConditionDDD<S extends IFact> {
  0: Comparison2<S>;
  1: Comparison2<S>;
  2: Comparison2<S>;
}

type PossibleCondition<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
> =
  | IConditionCVV<S, V2, V3>
  | IConditionVCV<S, V1, V3>
  | IConditionVVC<S, V1, V2>
  | IConditionVVV<V1, V2, V3>
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
  | IConditionVVP<V1, V2>
  | IConditionVPC<S, V1>
  | IConditionVPV<V1, V3>
  | IConditionVPD<S, V1>
  | IConditionVDC<S, V1>
  | IConditionVDP<S, V1>
  | IConditionVDD<S, V1>
  | IConditionPCV<S, V3>
  | IConditionPVC<S, V2>
  | IConditionPVV<V2, V3>
  | IConditionPVD<S, V2>
  | IConditionPDV<S, V3>
  | IConditionDCV<S, V3>
  | IConditionDVC<S, V2>
  | IConditionDVP<S, V2>
  | IConditionDVD<S, V2>
  | IConditionDPV<S, V3>
  | IConditionDDV<S, V3>
  | IConditionCCC<S>
  | IConditionCCP<S>
  | IConditionCCD<S>
  | IConditionCPC<S>
  | IConditionCPP<S>
  | IConditionCPD<S>
  | IConditionCDC<S>
  | IConditionCDP<S>
  | IConditionCDD<S>
  | IConditionVPP<V1>
  | IConditionPCC<S>
  | IConditionPCP<S>
  | IConditionPCD<S>
  | IConditionPVP<V2>
  | IConditionPPC<S>
  | IConditionPPV<V3>
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
  | IConditionPPP;

interface IParsedConditionVVV<
  V1 extends string,
  V2 extends string,
  V3 extends string
> {
  placeholderFields: {};
  constantFields: {};
  variableFields: { 0: Variable<V1>; 1: Variable<V2>; 2: Variable<V3> };
  variableNames: { [P in V1]: "0" } & { [P in V2]: "1" } & { [P in V3]: "2" };
  comparisonFields: {};
}

interface IParsedConditionCVV<V2 extends string, V3 extends string> {
  placeholderFields: {};
  constantFields: { 0: true };
  variableFields: { 1: Variable<V2>; 2: Variable<V3> };
  variableNames: { [P in V2]: "1" } & { [P in V3]: "2" };
  comparisonFields: {};
}

interface IParsedConditionVCV<V1 extends string, V3 extends string> {
  placeholderFields: {};
  constantFields: { 1: true };
  variableFields: { 0: Variable<V1>; 2: Variable<V3> };
  variableNames: { [P in V1]: "0" } & { [P in V3]: "2" };
  comparisonFields: {};
}

interface IParsedConditionVVC<V1 extends string, V2 extends string> {
  placeholderFields: {};
  constantFields: { 2: true };
  variableFields: { 0: Variable<V1>; 1: Variable<V2> };
  variableNames: { [P in V1]: "0" } & { [P in V2]: "1" };
  comparisonFields: {};
}

interface IParsedConditionVVP<V1 extends string, V2 extends string> {
  placeholderFields: { 2: true };
  constantFields: {};
  variableFields: { 0: Variable<V1>; 1: Variable<V2> };
  variableNames: { [P in V1]: "0" } & { [P in V2]: "1" };
  comparisonFields: {};
}

interface IParsedConditionVVD<
  S extends IFact,
  V1 extends string,
  V2 extends string
> {
  placeholderFields: {};
  constantFields: {};
  variableFields: { 0: Variable<V1>; 1: Variable<V2> };
  variableNames: { [P in V1]: "0" } & { [P in V2]: "1" };
  comparisonFields: { 2: Comparison2<S> };
}

interface IParsedConditionVPV<V1 extends string, V3 extends string> {
  placeholderFields: { 1: true };
  constantFields: {};
  variableFields: { 0: Variable<V1>; 2: Variable<V3> };
  variableNames: { [P in V1]: "0" } & { [P in V3]: "2" };
  comparisonFields: {};
}

interface IParsedConditionVDV<
  S extends IFact,
  V1 extends string,
  V3 extends string
> {
  placeholderFields: {};
  constantFields: {};
  variableFields: { 0: Variable<V1>; 2: Variable<V3> };
  variableNames: { [P in V1]: "0" } & { [P in V3]: "2" };
  comparisonFields: { 1: Comparison2<S> };
}

interface IParsedConditionPVV<V2 extends string, V3 extends string> {
  placeholderFields: { 0: true };
  constantFields: {};
  variableFields: { 1: Variable<V2>; 2: Variable<V3> };
  variableNames: { [P in V2]: "1" } & { [P in V3]: "2" };
  comparisonFields: {};
}

interface IParsedConditionDVV<
  S extends IFact,
  V2 extends string,
  V3 extends string
> {
  placeholderFields: {};
  constantFields: {};
  variableFields: { 1: Variable<V2>; 2: Variable<V3> };
  variableNames: { [P in V2]: "1" } & { [P in V3]: "2" };
  comparisonFields: { 1: Comparison2<S> };
}

interface IParsedConditionCCC {
  placeholderFields: {};
  constantFields: { 0: true; 1: true; 2: true };
  variableFields: {};
  variableNames: {};
  comparisonFields: {};
}

interface IParsedConditionCCV<V3 extends string> {
  placeholderFields: {};
  constantFields: { 0: true; 1: true };
  variableFields: { 2: Variable<V3> };
  variableNames: { [P in V3]: "2" };
  comparisonFields: {};
}

interface IParsedConditionCVC<V2 extends string> {
  placeholderFields: {};
  constantFields: { 0: true; 2: true };
  variableFields: { 1: Variable<V2> };
  variableNames: { [P in V2]: "1" };
  comparisonFields: {};
}

interface IParsedConditionVCC<V1 extends string> {
  placeholderFields: {};
  constantFields: { 1: true; 2: true };
  variableFields: { 0: Variable<V1> };
  variableNames: { [P in V1]: "0" };
  comparisonFields: {};
}

type PossibleParsedCondition<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
> =
  | IParsedConditionVVV<V1, V2, V3>
  | IParsedConditionCVV<V2, V3>
  | IParsedConditionVCV<V1, V3>
  | IParsedConditionVVC<V1, V2>
  | IParsedConditionVVP<V1, V2>
  | IParsedConditionVVD<S, V1, V2>
  | IParsedConditionVPV<V1, V3>
  | IParsedConditionVDV<S, V1, V3>
  | IParsedConditionPVV<V2, V3>
  | IParsedConditionDVV<S, V2, V3>
  | IParsedConditionCCV<V3>
  | IParsedConditionCVC<V2>
  | IParsedConditionCVP<V2>
  | IParsedConditionCVD<V2>
  | IParsedConditionCPV<V3>
  | IParsedConditionCDV<V3>
  | IParsedConditionVCC<V1>
  | IParsedConditionVCP<V1>
  | IParsedConditionVCD<V1>
  | IParsedConditionVPC<V1>
  | IParsedConditionVPP<V1>
  | IParsedConditionVPD<V1>
  | IParsedConditionVDC<V1>
  | IParsedConditionVDP<V1>
  | IParsedConditionVDD<V1>
  | IParsedConditionPCV<V3>
  | IParsedConditionPVC<V2>
  | IParsedConditionPVP<V2>
  | IParsedConditionPVD<V2>
  | IParsedConditionPPV<V3>
  | IParsedConditionPDV<V3>
  | IParsedConditionDCV<V3>
  | IParsedConditionDVC<V2>
  | IParsedConditionDVP<V2>
  | IParsedConditionDVD<V2>
  | IParsedConditionDPV<V3>
  | IParsedConditionDDV<V3>
  | IParsedConditionCCC
  | IParsedConditionCCP
  | IParsedConditionCCD
  | IParsedConditionCPC
  | IParsedConditionCPP
  | IParsedConditionCPD
  | IParsedConditionCDC
  | IParsedConditionCDP
  | IParsedConditionCDD
  | IParsedConditionPCC
  | IParsedConditionPCP
  | IParsedConditionPCD
  | IParsedConditionPPC
  | IParsedConditionPPP
  | IParsedConditionPPD
  | IParsedConditionPDC
  | IParsedConditionPDP
  | IParsedConditionPDD
  | IParsedConditionDCC
  | IParsedConditionDCP
  | IParsedConditionDCD
  | IParsedConditionDPC
  | IParsedConditionDPP
  | IParsedConditionDPD
  | IParsedConditionDDC
  | IParsedConditionDDP
  | IParsedConditionDDD;

function isVariable<T extends string>(v: Variable<T> | any): v is Variable<T> {
  return v instanceof Variable;
}

function isComparison<S extends IFact>(
  v: Comparison2<S> | any
): v is Comparison2<S> {
  return v instanceof Comparison2;
}

function isPlaceholder(v: typeof ph | any): v is typeof ph {
  return v === ph;
}

function isConstant(v: any): boolean {
  return !isVariable(v) && !isPlaceholder(v) && !isComparison(v);
}

type PossibleItem<V extends string> = Variable<V> | typeof ph;

function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionCVV<S, V2, V3>): IParsedConditionCVV<S, V2, V3>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionVCV<S, V1, V3>): IParsedConditionVCV<S, V1, V3>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionVVC<S, V1, V2>): IParsedConditionVVC<S, V1, V2>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionVVV<V1, V2, V3>): IParsedConditionVVV<V1, V2, V3>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionVVD<S, V1, V2>): IParsedConditionVVD<S, V1, V2>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionVDV<S, V1, V3>): IParsedConditionVDV<S, V1, V3>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionDVV<S, V2, V3>): IParsedConditionDVV<S, V2, V3>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionCCV<S, V3>): IParsedConditionCCV<S, V3>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionCVC<S, V2>): IParsedConditionCVC<S, V2>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionCVP<S, V2>): IParsedConditionCVP<S, V2>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionCVD<S, V2>): IParsedConditionCVD<S, V2>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionCPV<S, V3>): IParsedConditionCPV<S, V3>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionCDV<S, V3>): IParsedConditionCDV<S, V3>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionVCC<S, V1>): IParsedConditionVCC<S, V1>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionVCP<S, V1>): IParsedConditionVCP<S, V1>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionVCD<S, V1>): IParsedConditionVCD<S, V1>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionVVP<V1, V2>): IParsedConditionVVP<V1, V2>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionVPC<S, V1>): IParsedConditionVPC<S, V1>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionVPV<V1, V3>): IParsedConditionVPV<V1, V3>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionVPD<S, V1>): IParsedConditionVPD<S, V1>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionVDC<S, V1>): IParsedConditionVDC<S, V1>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionVDP<S, V1>): IParsedConditionVDP<S, V1>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionVDD<S, V1>): IParsedConditionVDD<S, V1>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionPCV<S, V3>): IParsedConditionPCV<S, V3>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionPVC<S, V2>): IParsedConditionPVC<S, V2>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionPVV<V2, V3>): IParsedConditionPVV<V2, V3>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionPVD<S, V2>): IParsedConditionPVD<S, V2>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionPDV<S, V3>): IParsedConditionPDV<S, V3>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionDCV<S, V3>): IParsedConditionDCV<S, V3>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionDVC<S, V2>): IParsedConditionDVC<S, V2>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionDVP<S, V2>): IParsedConditionDVP<S, V2>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionDVD<S, V2>): IParsedConditionDVD<S, V2>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionDPV<S, V3>): IParsedConditionDPV<S, V3>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionDDV<S, V3>): IParsedConditionDDV<S, V3>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionCCC<S>): IParsedConditionCCC<S>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionCCP<S>): IParsedConditionCCP<S>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionCCD<S>): IParsedConditionCCD<S>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionCPC<S>): IParsedConditionCPC<S>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionCPP<S>): IParsedConditionCPP<S>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionCPD<S>): IParsedConditionCPD<S>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionCDC<S>): IParsedConditionCDC<S>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionCDP<S>): IParsedConditionCDP<S>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionCDD<S>): IParsedConditionCDD<S>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionVPP<V1>): IParsedConditionVPP<V1>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionPCC<S>): IParsedConditionPCC<S>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionPCP<S>): IParsedConditionPCP<S>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionPCD<S>): IParsedConditionPCD<S>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionPVP<V2>): IParsedConditionPVP<V2>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionPPC<S>): IParsedConditionPPC<S>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionPPV<V3>): IParsedConditionPPV<V3>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionPPD<S>): IParsedConditionPPD<S>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionPDC<S>): IParsedConditionPDC<S>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionPDP<S>): IParsedConditionPDP<S>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionPDD<S>): IParsedConditionPDD<S>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionDCC<S>): IParsedConditionDCC<S>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionDCP<S>): IParsedConditionDCP<S>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionDCD<S>): IParsedConditionDCD<S>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionDPC<S>): IParsedConditionDPC<S>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionDPP<S>): IParsedConditionDPP<S>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionDPD<S>): IParsedConditionDPD<S>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionDDC<S>): IParsedConditionDDC<S>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionDDP<S>): IParsedConditionDDP<S>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionDDD<S>): IParsedConditionDDD<S>;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: IConditionPPP): IParsedConditionPPP;
function parseCondition2<
  S extends IFact,
  V1 extends string,
  V2 extends string,
  V3 extends string
>(c: PossibleCondition<S, V1, V2, V3>): PossibleParsedCondition<V1, V2, V3> {
  const identifier = c[0];
  const attribute = c[1];
  const value = c[2];

  const result: any = {
    variableNames: {},
    variableFields: {},
    constantFields: {}
  };

  /*if (isComparison(identifier)) {
    result.comparisonFields["0"] = identifier as Comparison<Schema>;
    result.placeholderFields["0"] = true;
  } else */
  if (isVariable(identifier)) {
    result.variableNames[identifier.name] = "0";
    result.variableFields["0"] = identifier;
  } else if (isPlaceholder(identifier)) {
    // result.placeholderFields["0"] = true;
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
    // result.placeholderFields["1"] = true;
  } else {
    result.constantFields["1"] = attribute;
  }

  // if (isComparison(value)) {
  //   result.comparisonFields["2"] = value as Comparison<Schema>;
  //   result.placeholderFields["2"] = true;
  // } else
  if (isVariable(value)) {
    result.variableNames[value.name] = "2";
    result.variableFields["2"] = value;
  } else if (isPlaceholder(value)) {
    // result.placeholderFields["2"] = true;
  } else {
    result.constantFields["2"] = value;
  }

  return result;
}

describe("Condition", () => {
  describe("parseCondition", () => {
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
      const $$a = makeVar("$$a");
      const $$b = makeVar("$$b");
      const $$c = makeVar("$$c");

      const { variableFields, constantFields, variableNames } = parseCondition2(
        [$$a, $$b, $$c]
      );

      expect(Object.keys(constantFields)).toHaveLength(0);
      expect(Object.keys(variableFields)).toHaveLength(3);
      expect(Object.keys(variableNames)).toHaveLength(3);
      expect(variableFields[0].name).toBe("$$a");
      expect(variableFields[1].name).toBe("$$b");
      expect(variableFields[2].name).toBe("$$c");
      expect(variableNames.$$a).toBe("0");
      expect(variableNames.$$b).toBe("1");
      expect(variableNames.$$c).toBe("2");
    });

    it("should parse mixed variable/constant condition", () => {
      const $$a = makeVar("$$a");
      const $$c = makeVar("$$c");

      const { variableFields, constantFields, variableNames } = parseCondition2(
        [$$a, "is", $$c]
      );

      expect(Object.keys(constantFields)).toHaveLength(1);
      expect(Object.keys(variableFields)).toHaveLength(2);
      expect(Object.keys(variableNames)).toHaveLength(2);
      expect(constantFields[1]).toBe("is");
      expect(variableFields[0].name).toBe("$$a");
      expect(variableFields[2].name).toBe("$$c");
      expect(variableNames.$$a).toBe("0");
      expect(variableNames.$$c).toBe("2");
    });

    it.only("should parse mixed placeholder/constant condition", () => {
      const { variableFields, constantFields, variableNames } = parseCondition2(
        [ph, "is", ph]
      );

      // expect(Object.keys(constantFields)).toHaveLength(1);
      // expect(Object.keys(variableFields)).toHaveLength(2);
      // expect(Object.keys(variableNames)).toHaveLength(2);
      // expect(constantFields[1]).toBe("is");
      // expect(variableFields[0].name).toBe("ph");
      // expect(variableFields[2].name).toBe("$$c");
      // expect(variableNames.$$a).toBe("0");
      // expect(variableNames.$$c).toBe("2");
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
