import pLimit from 'p-limit';
import { Browser } from 'puppeteer';
import Airbnb from './airbnb';
import dayjs from './utils/dayjs';
import File from './utils/file';
import logger from './utils/logger';

const CheckInReminder = async (chrome: Browser) => {
  return {
    async execute() {
      try {
        logger.info('start check-in reminder!');

        const airbnb = await Airbnb(chrome);
        const file = File();

        await airbnb.login();

        const oldReservations = await file.readReservationsList();
        const willCheckInOrOut = oldReservations.filter(reservation => {
          const now = dayjs(new Date());
          const start = dayjs(reservation.startDate!);
          const end = dayjs(reservation.endDate!);

          return now.isSame(start, 'day') || now.isSame(end, 'day');
        });

        const MAX_CHROME_TABS = 5;
        const concurrent = pLimit(MAX_CHROME_TABS);
        const sendMessagePromises = willCheckInOrOut.map(reservation =>
          concurrent(() => airbnb.sendMessage(reservation)),
        );

        await Promise.all(sendMessagePromises);

        const newReservations = oldReservations.filter(reservation => {
          const end = dayjs(reservation.endDate!);
          return end.isAfter(dayjs(new Date()), 'day');
        });
        await file.updateReservationsList(newReservations);

        logger.info('end check-in reminder!');
      } catch (error) {
        logger.error(error.stack);
      }
    },
  };
};

export default CheckInReminder;
