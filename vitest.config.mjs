export default {
  test: {
    root: import.meta.dirname,
    // Each test builds real git repos; on Windows a git spawn takes up to ~2s.
    testTimeout: 30_000,
  },
};
