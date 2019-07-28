import Airbnb from './airbnb';
import dayjs from './utils/dayjs';
import openChrome from './utils/openChrome';

describe('Airbnb', () => {
  let chrome;
  let airbnb;

  beforeAll(async () => {
    chrome = await openChrome(true);
    airbnb = await Airbnb(chrome);
    await airbnb.login();
    jest.setTimeout(150000);
  });

  it('send checkin message', async () => {
    const today = dayjs(new Date());

    await airbnb.sendMessage({
      reservationCode: 'HMANSB888T',
      roomId: '32050698',
      startDate: today,
      endDate: today.add(1, 'day'),
    });
  });
});
