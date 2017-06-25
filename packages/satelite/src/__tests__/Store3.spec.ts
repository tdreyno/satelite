import { computed, initializeStore, observable } from "../Store3";

const BaseStore = (() => {
  const state = observable({
    value: 0,
  });

  function setValue(v: number): void {
    state.value = v;
  }

  const doubleValue = computed(() => {
    return state.value * 2;
  });

  function incrementValue() {
    state.value = state.value + 1;
  }

  return {
    state, setValue, doubleValue, incrementValue,
  };
})();

const createStore = () => initializeStore(BaseStore);

describe("Store", async () => {
  it("should be distinct from each other", async () => {
    const store1 = await createStore();
    store1.setValue(1);

    const store2 = await createStore();
    store2.setValue(2);

    const store3 = await createStore();

    expect(store1.state.value).toEqual(1);
    expect(store2.state.value).toEqual(2);
    expect(store3.state.value).toEqual(0);
  });

  it("should keep state readonly", async () => {
    const store = await createStore();
    expect(store.state.value).toEqual(0);

    expect(() => {
      (store.state as any).value = 2;
    }).toThrow();
  });

  it("should able to increment", async () => {
    const store = await createStore();

    expect(store.state.value).toEqual(0);

    store.incrementValue();
    expect(store.state.value).toEqual(1);

    store.incrementValue();
    expect(store.state.value).toEqual(2);
  });

  it("should have memoized computed state", async () => {
    let callCount = 0;

    const { state, ...fns } = BaseStore;

    const createComputedStore = () => initializeStore({
      state,

      ...fns,

      doubleValue: computed(() => {
        callCount += 1;
        return state.value * 2;
      }),
    });

    const store = createComputedStore();
    expect(store.doubleValue()).toEqual(0);
    expect(callCount).toEqual(1);

    store.incrementValue();
    expect(store.doubleValue()).toEqual(2);

    store.incrementValue();
    expect(store.doubleValue()).toEqual(4);

    // Extra check, shouldn't recompute.
    expect(store.doubleValue()).toEqual(4);
    expect(callCount).toEqual(3);
  });

  it("should have change events", async () => {
    const store = await createStore();
    const changes: PropertyKey[] = [];

    function changeCallback(_: any, key: PropertyKey) {
      changes.push(key);
    }

    store.onChange(changeCallback);

    expect(changes).toEqual([]);
    store.incrementValue();
    expect(changes).toEqual(["value"]);

    store.incrementValue();
    expect(changes).toEqual(["value", "value"]);

    store.offChange(changeCallback);
    store.incrementValue();
    expect(changes).toEqual(["value", "value"]);
  });
});
