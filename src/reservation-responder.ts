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
        const oldReservations = await file.readReservationsList();
        const newReservations = await mailReader.getMailBodys();

        await airbnb.login();

        await Promise.all(
          newReservations
            .map(reservation => ({
              ...reservation,
              type: 'reservation-confirmed',
            }))
            .map(airbnb.sendMessage),
        );

        // when saving don't save type
        newReservations.forEach(reservation => {
          delete reservation.type;
        });

        await file.updateReservationsList(
          unionBy(oldReservations, newReservations, 'reservationCode'),
        );
      } catch (error) {
        logger.error(error.stack);
      }
    },
  };
};

export default ReservationResponder;
