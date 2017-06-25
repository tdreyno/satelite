import { computed, initializeStore, observable } from "../Store3";

// export default
initializeStore((() => {
  const state = observable({
    value: 0,
  });

  function setValue(v: number): void {
    state.value = v;
  }

  function incrementValue() {
    state.value = state.value + 1;
  }

  function _doubleValue() {
    return state.value * 2;
  }

  const doubleValue = computed(_doubleValue);

  function doubleSquared() {
    return doubleValue() * doubleValue();
  }

  return { state, setValue, incrementValue, doubleValue, doubleSquared };
})());
