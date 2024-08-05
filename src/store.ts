import { useSyncExternalStore } from 'react';

type StoreListener<Store> = (state?: Store) => void;

type SetState<Store> = (
  updater:
    | Store
    | Partial<Store>
    | ((currentState: Store) => Store | Partial<Store>),
) => void;

type StoreCreator<Store> = (
  setState: SetState<Store>,
  getState: () => Store,
) => Store;

export const createStore = <Store extends Record<string, any>>(
  createState: StoreCreator<Store>,
) => {
  let state: Store;
  const listeners = new Set<StoreListener<Store>>();

  const updateState = (value: any) => {
    const newState = typeof value === 'function' ? value(state) : value;
    return Object.assign({}, state, newState);
  };

  const setState: SetState<Store> = (value) => {
    state = updateState(value);
    listeners.forEach((listener: StoreListener<Store>) => listener(state));
  };

  const getState = () => {
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
