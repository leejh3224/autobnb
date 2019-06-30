import express from 'express';
import cron, { ScheduleOptions } from 'node-cron';

import CheckInReminder from './check-in-reminder';
import ReservationResponder from './reservation-responder';
import logger from './utils/logger';
import openChrome from './utils/openChrome';

const Server = () => {
  const app = express();
  const { port } = process.env;

  return {
    async start() {
      await this.startJobs();

      app.listen(port, () => {
        logger.info(`listening on port ${port}`);
      });

      process.on('uncaughtException', error => {
        logger.error(error.stack || 'uncaughtException');
      });
      process.on('unhandledRejection', error => {
        logger.error(error || 'unhandledRejection');
      });
    },
    async startJobs() {
      const debug =
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'test';
      const chrome = await openChrome(debug);

      const reservationResponder = await ReservationResponder(chrome);
      const checkInReminder = await CheckInReminder(chrome);

      const schedulerOptions: ScheduleOptions = {
        timezone: 'Asia/Seoul',
      };

      const reservationResponderInterval =
        process.env['reservation-responder.interval'];

      cron.schedule('12 8 * * *', checkInReminder.execute, schedulerOptions);
      cron.schedule(
        `*/${reservationResponderInterval} * * * *`,
        reservationResponder.exectute,
        schedulerOptions,
      );
    },
  };
};

export default Server;
