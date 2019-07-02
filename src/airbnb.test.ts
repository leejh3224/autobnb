import Airbnb from './airbnb';
import openChrome from './utils/openChrome';

describe('login', () => {
  beforeAll(() => {
    jest.setTimeout(150000);
  });

  it('login', async () => {
    const chrome = await openChrome(true);
    const airbnb = await Airbnb(chrome);

    const reservations = await airbnb.getReservations();

    expect(reservations).toHaveLength(4);
  });
});
