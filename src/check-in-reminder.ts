import pLimit from 'p-limit';
import { Browser } from 'puppeteer';
import Airbnb from './airbnb';
import { IReservation } from './types';
import dayjs from './utils/dayjs';
import logger from './utils/logger';

const CheckInReminder = async (chrome: Browser) => {
  return {
    async execute() {
      try {
        logger.info('start check-in reminder!');

        const airbnb = await Airbnb(chrome);

        await airbnb.login();

        const reservations = await airbnb.getReservations();

        const filterCheckInOrOut = (reservation: IReservation) => {
          const now = dayjs(new Date());
          const start = dayjs(reservation.startDate!);
          const end = dayjs(reservation.endDate!);
          return now.isSame(start, 'day') || now.isSame(end, 'day');
        };

        const MAX_CHROME_TABS = 3;
        const concurrent = pLimit(MAX_CHROME_TABS);
        const sendMessagePromises = reservations
          .filter(filterCheckInOrOut)
          .map(reservation =>
            concurrent(() => airbnb.sendMessage(reservation)),
          );

        await Promise.all(sendMessagePromises);

        logger.info('end check-in reminder!');
      } catch (error) {
        logger.error(error.stack);
      }
    },
  };
};

export default CheckInReminder;
