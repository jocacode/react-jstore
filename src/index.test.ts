import { createStore } from './';

describe('createStore', () => {
  it('createStore - should create external store', async () => {
    expect(createStore(() => ({})));
  });
});
