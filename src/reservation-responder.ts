import unionBy from 'lodash.unionby';
import { Browser } from 'puppeteer';
import Airbnb from './airbnb';
import MailReader from './mail-reader';
import File from './utils/file';
import logger from './utils/logger';

const ReservationResponder = async (chrome: Browser) => {
  const airbnb = await Airbnb(chrome);
  const mailReader = await MailReader();
  const file = File();

  return {
    async exectute() {
      try {
        logger.info('start reservation responder!');

        const oldReservations = await file.readReservationsList();
        const newReservations = await mailReader.getMailBodys();

        if (!newReservations.length) {
          logger.info('end reservation responder!');
          return;
        }

        logger.info(`new mails are ${JSON.stringify(newReservations)}`);

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

        await file.updateReservationsList(
          unionBy(oldReservations, newReservations, 'reservationCode'),
        );

        logger.info('end reservation responder!');
      } catch (error) {
        logger.error(error.stack);
      }
    },
  };
};

export default ReservationResponder;
