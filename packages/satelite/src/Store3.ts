interface IObservableState {
  __id: number;
  __version: number;
  [key: string]: any;
}

export interface IStore {
  // tslint:disable-next-line:ban-types
  onChange: (fn: Function) => void;
  // tslint:disable-next-line:ban-types
  offChange: (fn: Function) => void;
}

function swappable<T extends object>(initialState: T): T {
  const cloneOfInitial = Object.assign({}, initialState);

  let currentState: any = initialState;

  return new Proxy(cloneOfInitial as T, {
    get(_, key) {
      if (key === "__initialState") {
        return initialState;
      }

      if (key === "__currentState") {
        return currentState;
      }

      // console.log('getting value of', key, 'on', currentState);

      return currentState[key];
    },

    set(_, key, value) {
      if (key === "__currentState") {
        currentState = value;
        return true;
      }

      // console.log('setting value of', key, 'on', currentState, 'to', value);

      currentState[key] = value;

      return true;
    }
  });
}

let counter = 0;

// tslint:disable-next-line:ban-types
function _observable(
  state: object,
  callbacks: Set<Function>
): {
  writable: IObservableState;
  readonly: IObservableState;
} {
  const internalState: IObservableState = Object.assign({}, state, {
    __id: counter++,
    __version: 0
  });

  const writable = new Proxy(state, {
    get(_, key) {
      return internalState[key];
    },

    set(_, key, value) {
      internalState[key] = value;
      internalState.__version += 1;

      callbacks.forEach(cb => {
        cb(internalState, key);
      });

      return true;
    }
  }) as IObservableState;

  const readonly = new Proxy(state, {
    get(_, key) {
      return internalState[key];
    },

    set(_, key) {
      if (internalState.hasOwnProperty(key)) {
        throw new Error(`Cannot directly modify state object. ${key}`);
      }

      return false;
    }
  }) as IObservableState;

  return { writable, readonly };
}

// tslint:disable-next-line:ban-types
export function computed<T extends Function>(fn: T): T {
  (fn as any).__computed = true;

  return fn;
}

export function observable<T extends object>(initialState: T): T {
  return swappable(initialState);
}

// tslint:disable-next-line:ban-types
function wrapFunction(
  fn: Function,
  store: IObservableState,
  swappable: any,
  isComputed: boolean
) {
  let lastSeenVersion = -1;
  let cached: any;

  return (...args: any[]) => {
    if (isComputed) {
      // console.log('iscomputed', lastSeenVersion, store.__version)
      if (lastSeenVersion === store.__version) {
        return cached;
      }
    }

    const previousState = swappable.__currentState;

    swappable.__currentState = store;

    const result = fn(...args);

    if (isComputed) {
      cached = result;
      lastSeenVersion = store.__version;
      // console.log('storing', store.__version)
    }

    swappable.__currentState = previousState;

    return result;
  };
}

export type IFinalStore<T> = T & IStore;

export function initializeStore<T>(mod: T): IFinalStore<T> {
  const { state, ...fns } = mod as any;

  const { actions, computed } = Object.keys(fns).reduce(
    (sum, fnName) => {
      const fn = fns[fnName];

      if (fn.__computed) {
        sum.computed[fnName] = fn;
      } else {
        sum.actions[fnName] = fn;
      }

      return sum;

      // tslint:disable-next-line:no-object-literal-type-assertion
    },
    { actions: {} as typeof fns, computed: {} as typeof fns }
  );

  // tslint:disable-next-line:ban-types
  const callbacks = new Set<Function>();

  const { writable, readonly } = _observable(state.__initialState, callbacks);

  const scopedFns = Object.keys(actions).reduce((sum, fnName) => {
    sum[fnName] = wrapFunction(fns[fnName], writable, state, false);

    return sum;

    // tslint:disable-next-line:no-object-literal-type-assertion
  }, {} as typeof fns);

  const computedFns = Object.keys(computed).reduce((sum, fnName) => {
    sum[fnName] = wrapFunction(fns[fnName], writable, state, true);

    return sum;

    // tslint:disable-next-line:no-object-literal-type-assertion
  }, {} as typeof fns);

  return {
    state: readonly,
    ...scopedFns,
    ...computedFns,

    // tslint:disable-next-line:ban-types
    onChange(cb: Function): void {
      callbacks.add(cb);
    },

    // tslint:disable-next-line:ban-types
    offChange(cb: Function): void {
      callbacks.delete(cb);
    }
  };
}
