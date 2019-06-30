import { isAfter } from 'date-fns';
import { Browser } from 'puppeteer';
import Airbnb from './airbnb';
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
        await Promise.all(oldReservations.map(airbnb.sendMessage));

        const newReservations = oldReservations.filter(reservation =>
          isAfter(new Date(reservation.endDate), new Date()),
        );
        await file.updateReservationsList(newReservations);

        logger.info('end check-in reminder!');
      } catch (error) {
        logger.error(error.stack);
      }
    },
  };
};

export default CheckInReminder;
