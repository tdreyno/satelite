import { computed, observable } from "../Store3";

export const state = observable({
  value: 0,
});

export function setValue(v: number): void {
  state.value = v;
}

export function incrementValue() {
  state.value = state.value + 1;
}

export function _doubleValue() {
  return state.value * 2;
}

export const doubleValue = computed(_doubleValue);

export function doubleSquared() {
  return doubleValue() * doubleValue();
}
