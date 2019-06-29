export default () => {
  // puppeteer test takes longer time than usual tests.
  // so override default jest timeout not to interrupt test
  jest.setTimeout(150000);
};
