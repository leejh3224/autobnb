import { Browser } from 'puppeteer';
import Airbnb from './airbnb';
import MailReader from './mail-reader';
import logger from './utils/logger';

const ReservationResponder = async (chrome: Browser) => {
  const airbnb = await Airbnb(chrome);
  const mailReader = await MailReader();

  return {
    async exectute() {
      try {
        logger.info('start reservation responder!');

        const newReservations = await mailReader.getMailBodys();

        await airbnb.login();

        /**
         * don't need to derive users checkin status based on `startDate` and `endDate`
         * when user made reservation
         */
        const reservationsWithoutPeriod = newReservations.map(
          ({ startDate, endDate, ...rest }) => {
            return rest;
          },
        );

        await Promise.all(reservationsWithoutPeriod.map(airbnb.sendMessage));

        logger.info('end reservation responder!');
      } catch (error) {
        logger.error(error.stack);
      }
    },
  };
};

export default ReservationResponder;
