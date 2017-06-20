"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Store_1 = require("../Store");
const createStore = Store_1.createStoreCreator({
    state: {
        value: 0,
    },
    // Possibly rename to "derived"
    computed: (state) => ({
        get doubleValue() {
            return state.value * 2;
        },
    }),
    actions: (state) => ({
        setValue(value) {
            state.value = value;
        },
        incrementValue() {
            state.value = state.value + 1;
        },
    }),
});
describe('Store', () => {
    it('should be distinct from each other', () => {
        const store1 = createStore();
        store1.setValue(1);
        const store2 = createStore();
        store2.setValue(2);
        const store3 = createStore();
        expect(store1.state.value).toEqual(1);
        expect(store2.state.value).toEqual(2);
        expect(store3.state.value).toEqual(0);
    });
    it('should able to have a custom initial state', () => {
        const store = createStore({ value: 15 });
        expect(store.state.value).toEqual(15);
    });
    it('should keep state readonly', () => {
        const store = createStore();
        expect(store.state.value).toEqual(0);
        expect(() => {
            store.state.value = 2;
        }).toThrow();
    });
    it('should able to increment', () => {
        const store = createStore();
        expect(store.state.value).toEqual(0);
        store.incrementValue();
        expect(store.state.value).toEqual(1);
        store.incrementValue();
        expect(store.state.value).toEqual(2);
    });
    it('should have computed state', () => {
        let callCount = 0;
        const createComputedStore = Store_1.createStoreCreator({
            state: {
                value: 0,
            },
            // Possibly rename to "derived"
            computed: (state) => ({
                get doubleValue() {
                    callCount += 1;
                    return state.value * 2;
                },
            }),
            actions: (state) => ({
                incrementValue() {
                    state.value = state.value + 1;
                },
            }),
        });
        const store = createComputedStore();
        expect(store.computed.doubleValue).toEqual(0);
        expect(callCount).toEqual(1);
        store.incrementValue();
        expect(store.computed.doubleValue).toEqual(2);
        store.incrementValue();
        expect(store.computed.doubleValue).toEqual(4);
        // Extra check, shouldn't recompute.
        expect(store.computed.doubleValue).toEqual(4);
        expect(callCount).toEqual(3);
    });
    it('should have change events', () => {
        const store = createStore();
        let changes = [];
        function changeCallback(_, key) {
            changes.push(key);
        }
        store.onChange(changeCallback);
        expect(changes).toEqual([]);
        store.incrementValue();
        expect(changes).toEqual(['value']);
        store.incrementValue();
        expect(changes).toEqual(['value', 'value']);
        store.offChange(changeCallback);
        store.incrementValue();
        expect(changes).toEqual(['value', 'value']);
    });
});
//# sourceMappingURL=Store.spec.js.map