export default {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: ['/', '/es/', '/pt/'],
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
