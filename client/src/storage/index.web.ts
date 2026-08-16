class MockCollection {
  query() { return { fetch: async () => [] }; }
  find() { return Promise.reject(new Error("Not found")); }
}

export const database = {
  get: () => new MockCollection(),
  action: async (cb: any) => cb(),
  batch: async () => {}
} as any;

export * from './mmkv';
