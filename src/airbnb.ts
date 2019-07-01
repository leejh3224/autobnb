import { Browser, Page } from 'puppeteer';
import { IReservation, IReservationStatus } from './types';
import dayjs from './utils/dayjs';
import detectLanguage from './utils/detectLanguage';
import logger from './utils/logger';
import Message from './utils/messages';

const Airbnb = async (chrome: Browser) => {
  // selectors
  const $emailInput = '#signin_email';
  const $passwordInput = '#signin_password';
  const $submitButton = '#user-login-btn';

  // urls
  const loginUrl = 'https://www.airbnb.com/login';
  const messageUrl = 'https://www.airbnb.com/messaging/qt_for_reservation';

  const getStatus = (startDate: string, endDate: string) => {
    const now = dayjs(new Date());
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    if (now.isSame(start, 'day')) {
      return 'check-in';
    } else if (now.isSame(end, 'day')) {
      return 'check-out';
    }
    return 'no-message';
  };

  const getLanguage = async (page: Page) => {
    const $messagesList = '.message-text > .interweave';
    const messagesList = await page.$$($messagesList);

    // if guest doesn't send message, just assume he/she speaks korean
    if (!messagesList.length) {
      return 'ko';
    }

    const [element] = messagesList.slice(-1);
    const firstGuestMessage = await page.evaluate(
      el => el.textContent,
      element,
    );

    return detectLanguage(firstGuestMessage);
  };

  return {
    async login() {
      const page = await chrome.newPage();
      await page.goto(loginUrl, { waitUntil: 'networkidle0' });
      const isLoggedIn = page.url() !== loginUrl;

      if (!isLoggedIn) {
        const email = process.env['airbnb.email'] as string;
        const password = process.env['airbnb.password'] as string;

        await Promise.all([
          page.waitForSelector($emailInput),
          page.waitForSelector($passwordInput),
        ]);
        await page.type($emailInput, email);
        await page.type($passwordInput, password);
        await Promise.all([
          page.click($submitButton),
          page.waitForNavigation({ waitUntil: 'networkidle0' }),
        ]);
      }

      await page.close();
    },
    async sendMessage({
      reservationCode,
      startDate,
      endDate,
      roomId,
    }: IReservation) {
      const $sendMessageTextarea = '#send_message_textarea';
      const $messageSubmitButton = 'button[type="submit"]';

      const page = await chrome.newPage();

      await page.goto(`${messageUrl}/${reservationCode}`, {
        waitUntil: 'networkidle0',
      });
      const language = await getLanguage(page);

      let status: IReservationStatus;

      if (!startDate || !endDate) {
        status = 'reservation-confirmed';
      } else {
        status = getStatus(startDate, endDate);
      }

      const messages = Message.get(status, roomId)[language];

      for await (const msg of messages) {
        await page.type($sendMessageTextarea, msg);
        await page.click($messageSubmitButton);
      }

      await page.close();

      if (!startDate || !endDate) {
        logger.info(
          `예약 번호 ${reservationCode}에 대해 ${status} 메시지를 전송했습니다.`,
        );
        return;
      }

      logger.info(
        `${startDate} ~ ${endDate} 예약 번호 ${reservationCode}에 대해 ${status} 메시지를 전송했습니다.`,
      );
    },
  };
};

export default Airbnb;
