"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
function createStateProxy(state, onChange) {
    return new Proxy(state, {
        get(target, key) {
            return target[key];
        },
        set(target, key, value) {
            if (target[key] !== value) {
                target[key] = value;
                onChange(key);
            }
            return true;
        }
    });
}
function createReadonlyStateProxy(state) {
    return new Proxy(state, {
        get(target, key) {
            return target[key];
        },
        set(target, key) {
            if (target.hasOwnProperty(key)) {
                throw new Error(`Cannot directly modify state object. ${key}`);
            }
            return false;
        }
    });
}
function createStoreCreator({ state, actions, computed }) {
    let currentState;
    return function createStore(initialState) {
        let callbacks = new Set();
        const stateInfo = {
            ref: Object.assign({}, state, initialState || {}),
            version: 0,
        };
        currentState = createStateProxy(stateInfo.ref, (key) => {
            stateInfo.version += 1;
            callbacks.forEach((cb) => {
                cb(currentState, key);
            });
        });
        const readOnlyState = createReadonlyStateProxy(stateInfo.ref);
        const computedGetters = computed ? computed(readOnlyState) : {};
        const memoizedComputed = Object.keys(computedGetters).reduce((sum, key) => {
            let lastSeenVersion = -1;
            let cached;
            Object.defineProperty(sum, key, {
                set: function () {
                    throw new Error(`Cannot modify computed object. ${key}`);
                },
                get: function () {
                    if (lastSeenVersion === stateInfo.version) {
                        return cached;
                    }
                    cached = computedGetters[key];
                    lastSeenVersion = stateInfo.version;
                    return cached;
                },
                enumerable: true
            });
            return sum;
        }, {});
        return Object.assign({
            state: readOnlyState,
            computed: memoizedComputed,
            onChange(cb) {
                callbacks.add(cb);
            },
            offChange(cb) {
                callbacks.delete(cb);
            }
        }, actions ? actions(currentState) : {});
    };
}
exports.createStoreCreator = createStoreCreator;
//# sourceMappingURL=Store.js.map