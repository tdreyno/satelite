export type IIdentifierTuple = [string, any];
export type IIdentifier = IIdentifierTuple | symbol | string | number;
export type IIdentifierWithPlaceholder = IIdentifier | IPlaceholder;

export const placeholder = "__secret__placeholder__";
export type IPlaceholder = typeof placeholder;

export type IDescriptor<V = any> = [IIdentifier, string, V];

export type IDescriptorWithPlaceholders<V = any> = [
  IIdentifierWithPlaceholder,
  string,
  V | IPlaceholder
];

export const t = {
  Number<T>(s: T): boolean {
    return typeof s === "number";
  },

  String<T>(s: T): boolean {
    return typeof s === "string";
  },

  Boolean<T>(s: T): boolean {
    return typeof s === "boolean";
  }
};

interface ISchema {
  type: typeof t.String | typeof t.Boolean;
  isMultiple?: boolean;
}

interface ISchemaSet {
  [namespace: string]: ISchema;
}

type IDatum = Map<any, any>;

interface IDataSet {
  [key: string]: IDatum;
}

interface IWorld {
  getState: () => IDataSet;
  assert: IAssertFn;
  find: IFindFn;
  retract: IRetractFn;
}

export const descriptor = <V = any>(
  identifier: IIdentifierWithPlaceholder,
  namespace: string,
  value: V | IPlaceholder
): IDescriptor | IDescriptorWithPlaceholders => {
  if (identifier === placeholder || value === placeholder) {
    return [identifier, namespace, value] as IDescriptorWithPlaceholders;
  } else {
    return [identifier, namespace, value] as IDescriptor;
  }
};

type IScopeValueFn<T, V> = (
  value: V | IPlaceholder
) => IDescriptor | IDescriptorWithPlaceholders;

export function scope<V, T = any>(
  identifier: IIdentifier,
  namespace: string
): IScopeValueFn<T, V> {
  return function scopeValue(
    value: V | IPlaceholder
  ): IDescriptor | IDescriptorWithPlaceholders {
    return descriptor(identifier, namespace, value);
  };
}

export const ident = <T = string>(namespace: string) => (
  value: T
): IIdentifierTuple => [namespace, value];

type IFindResult = IDescriptor[];
type IFindFn = (query: IDescriptorWithPlaceholders) => IFindResult;

function find(data: IDataSet): IFindFn;
function find(data: IDataSet, query: IDescriptorWithPlaceholders): IFindResult;
function find(
  data: IDataSet,
  query?: IDescriptorWithPlaceholders
): IFindFn | IFindResult {
  if (query) {
    return query ? [] : [];
  } else {
    return q => find(data, q);
  }
}

type IAssertFn = (ds: IDescriptor | IDescriptor[]) => void;

function assert(data: IDataSet): IAssertFn;
function assert(data: IDataSet, ds: IDescriptor | IDescriptor[]): void;
function assert(
  data: IDataSet,
  ds?: IDescriptor | IDescriptor[]
): IAssertFn | void {
  if (ds) {
    return;
  } else {
    return finalDs => assert(data, finalDs);
  }
}

type IRetractFn = (ds: IDescriptor | IDescriptor[]) => void;

function retract(data: IDataSet): IRetractFn;
function retract(data: IDataSet, ds: IDescriptor | IDescriptor[]): void;
function retract(
  data: IDataSet,
  ds?: IDescriptor | IDescriptor[]
): IRetractFn | void {
  if (ds) {
    return;
  } else {
    return finalDs => retract(data, finalDs);
  }
}

type IMergeSchemaFn = (previousSchema: ISchemaSet) => ISchemaSet;

export function schema(namespace: string, options: ISchema): IMergeSchemaFn;
export function schema(
  namespace: string,
  options: ISchema,
  previousSchema?: ISchemaSet
): ISchemaSet;
export function schema(
  namespace: string,
  options: ISchema,
  previousSchema?: ISchemaSet
): ISchemaSet | IMergeSchemaFn {
  if (previousSchema) {
    return {
      ...previousSchema,
      [namespace]: options
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
    retract: retract(data)
  };
}

export function defineState(...schemas: IMergeSchemaFn[]): IWorld {
  let output = {};

  for (const s of schemas) {
    output = s(output);
  }

  return createWorld(output);
}
