export type IIdentifierTuple = [string, any];
export type IIdentifier = IIdentifierTuple | symbol | string | number;
export type IIdentifierWithPlaceholder = IIdentifier | IPlaceholder;

export const placeholder = "__secret__placeholder__";
export type IPlaceholder = typeof placeholder;

export type IDescriptor<V = any> = [IIdentifier, string, V] | string[];

export type IDescriptorWithPlaceholders<V = any> =
  | [IIdentifierWithPlaceholder, string, V | IPlaceholder]
  | string[];

export const t = {
  Number<T>(s: T): boolean {
    return typeof s === "number";
  },

  String<T>(s: T): boolean {
    return typeof s === "string";
  },

  Boolean<T>(s: T): boolean {
    return typeof s === "boolean";
  },
};

export interface ISchema {
  type: typeof t.String | typeof t.Boolean;
  isMultiple?: boolean;
}

export interface ISchemaSet {
  [namespace: string]: ISchema;
}

export type IDatum = Map<any, any>;

export interface IDataSet {
  [key: string]: IDatum;
}

export interface IWorld {
  getState: () => IDataSet;
  assert: IAssertFn;
  find: IFindFn;
  retract: IRetractFn;
  rule: IRuleFn;
}

export const descriptor = <V = any>(
  identifier: IIdentifierWithPlaceholder,
  namespace: string,
  value: V | IPlaceholder,
): IDescriptor | IDescriptorWithPlaceholders => {
  if (identifier === placeholder || value === placeholder) {
    return [identifier, namespace, value] as IDescriptorWithPlaceholders;
  } else {
    return [identifier, namespace, value] as IDescriptor;
  }
};

export const ident = <T = string>(namespace: string) => (
  value: T,
): IIdentifierTuple => [namespace, value];

export type IFindResult = IDescriptor[];
export type IFindFn = (query: IDescriptorWithPlaceholders) => IFindResult;

function find(data: IDataSet): IFindFn;
function find(data: IDataSet, query: IDescriptorWithPlaceholders): IFindResult;
function find(
  data: IDataSet,
  query?: IDescriptorWithPlaceholders,
): IFindFn | IFindResult {
  if (query) {
    return query ? [] : [];
  } else {
    return q => find(data, q);
  }
}

export type IAssertFn = (ds: IDescriptor | IDescriptor[]) => void;

function assert(data: IDataSet): IAssertFn;
function assert(data: IDataSet, ds: IDescriptor | IDescriptor[]): void;
function assert(
  data: IDataSet,
  ds?: IDescriptor | IDescriptor[],
): IAssertFn | void {
  if (ds) {
    return;
  } else {
    return finalDs => assert(data, finalDs);
  }
}

export type IRetractFn = (ds: IDescriptor | IDescriptor[]) => void;

function retract(data: IDataSet): IRetractFn;
function retract(data: IDataSet, ds: IDescriptor | IDescriptor[]): void;
function retract(
  data: IDataSet,
  ds?: IDescriptor | IDescriptor[],
): IRetractFn | void {
  if (ds) {
    return;
  } else {
    return finalDs => retract(data, finalDs);
  }
}

export type IRuleFn = (
  rules: IDescriptorWithPlaceholders | IDescriptorWithPlaceholders[],
  outcome: (variables: { [key: string]: any }) => any,
) => void;

function rule(data: IDataSet): IRuleFn;
function rule(
  data: IDataSet,
  rules: IDescriptorWithPlaceholders | IDescriptorWithPlaceholders[],
  outcome: (variables: { [key: string]: any }) => any,
): void;
function rule(
  data: IDataSet,
  rules?: IDescriptorWithPlaceholders | IDescriptorWithPlaceholders[],
  outcome?: (variables: { [key: string]: any }) => any,
): IRuleFn | void {
  if (rules && outcome) {
    // TODO, multiple rules
    find(data, rules[0]);

    outcome({});
  } else {
    return (finalRules, finalOutcome) => rule(data, finalRules, finalOutcome);
  }
}

export type IMergeSchemaFn = (previousSchema: ISchemaSet) => ISchemaSet;

export function schema(namespace: string, options: ISchema): IMergeSchemaFn;
export function schema(
  namespace: string,
  options: ISchema,
  previousSchema?: ISchemaSet,
): ISchemaSet;
export function schema(
  namespace: string,
  options: ISchema,
  previousSchema?: ISchemaSet,
): ISchemaSet | IMergeSchemaFn {
  if (previousSchema) {
    return {
      ...previousSchema,
      [namespace]: options,
    };
  } else {
    return s => schema(namespace, options, s);
  }
}

function createWorld(schema: ISchemaSet): IWorld {
  const data: IDataSet = Object.keys(schema).reduce((sum: IDataSet, k) => {
    sum[k] = new Map();
    return sum;
  }, {});

  return {
    getState: () => data,
    assert: assert(data),
    find: find(data),
    retract: retract(data),
    rule: rule(data),
  };
}

export function defineState(...schemas: IMergeSchemaFn[]): IWorld {
  let output = {};

  for (const s of schemas) {
    output = s(output);
  }

  return createWorld(output);
}

// tslint:disable-next-line:variable-name
export function entity(d: IDescriptor): IIdentifier {
  return d[0];
}

// tslint:disable-next-line:variable-name
export function namespace(d: IDescriptor): string {
  return d[1];
}

// tslint:disable-next-line:variable-name
export function value(d: IDescriptor) {
  return d[2];
}
