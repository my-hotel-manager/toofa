import TooFA from './src/tooFA';

const tFAHandler = new TooFA('./spaceship', 'www.google.com', {
  apiPollInterval: 69,
});
console.log(tFAHandler.opts);
