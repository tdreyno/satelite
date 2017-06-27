let value = 0;

export function setValue(v: number) {
  value = v;
}

export function incrementValue() {
  value = value + 1;
}

export function doubleValue() {
  return value * 2;
}
