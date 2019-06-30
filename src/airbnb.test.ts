import Airbnb from './airbnb';
import detectLanguage from './utils/detectLanguage';
import openChrome from './utils/openChrome';

describe('login', () => {
  beforeAll(() => {
    jest.setTimeout(150000);
  });
  it('login', async () => {
    const chrome = await openChrome(true);
    const c = await Airbnb(chrome);
    await c.login();
    expect('x').toBe('x');
  });
});
