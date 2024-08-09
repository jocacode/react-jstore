import { useSyncExternalStore } from 'react';

export type StoreListener<Store> = (store?: Store) => void;

export type StoreValue<Store> =
  | Store
  | Partial<Store>
  | ((currentState: Store) => Store | Partial<Store>);

export type SetState<Store> = (updater: StoreValue<Store>) => void;

export type StoreCreator<Store> = (
  setState: SetState<Store>,
  getState: () => Store,
) => Store;

/**
 * Function will create external store witch can be access across the app.
 * @param {number} createState function with setter and getter methods
 * for defining states and functions in external store.
 * @return {Function} Result will be React hook for accessing and subscribing
 * to an specified external state value.
 */
export const createStore = <Store extends Record<string, any>>(
  createState: StoreCreator<Store>,
) => {
  let state: Store;
  const listeners = new Set<StoreListener<Store>>();

  const updateState = (value: StoreValue<Store>) => {
    const newState = typeof value === 'function' ? value(state) : value;
    return Object.assign({}, state, newState);
  };

  const setState: SetState<Store> = (value: StoreValue<Store>) => {
    state = updateState(value);
    listeners.forEach((listener: StoreListener<Store>) => listener(state));
  };

  const getState = (): Store => {
    return state;
  };

  const subscribe = (listener: StoreListener<Store>) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  state = createState(setState, getState);

  return <Selector = Store>(selector?: (state: Store) => Selector) => {
    const snapshot = () => (selector ? selector(state) : state) as Selector;
    return useSyncExternalStore(subscribe, snapshot);
  };
};

export default createStore;
