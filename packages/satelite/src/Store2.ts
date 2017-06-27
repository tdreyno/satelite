type IObservableState<T> = { [P in keyof T]: T[P] };

interface IState {
  [key: string]: any;
}

type IFinalStore<T, A> = {
  state: IObservableState<T>;
  onChange: (cb: () => void) => void;
} & A;

type IObservableStore<T, A> = () => IFinalStore<T, A>;

function observable<T extends IState>(state: T): IObservableState<T> {
  return new Proxy(state, {
    get(target, key) {
      return target[key];
    },

    set(target, key, value) {
      target[key] = value;
      return true;
    }
  });
}

const satelite = function makeStoreCreator<T, A>(
  initialState: T,
  fn: (state: IObservableState<T>) => A
): IObservableStore<T, A> {
  const state = observable(initialState);

  return () =>
    Object.assign({}, { state }, fn(state), {
      onChange: (cb: () => void) => {
        cb();
      }
    });
};

export default satelite(
  {
    value: 0
  },
  state => {
    function doubleValue() {
      return state.value * 2;
    }

    function incrementValue() {
      state.value = state.value + 1;
    }

    function getCombo() {
      return state.value / doubleValue();
    }

    return { doubleValue, incrementValue, getCombo };
  }
);
