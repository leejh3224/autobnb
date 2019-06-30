import imap from 'imap-simple';
import { simpleParser } from 'mailparser';
import { IReservation } from './types';
import dayjs from './utils/dayjs';
import logger from './utils/logger';

const MailReader = async () => {
  const user = process.env['imap.user'] as string;
  const password = process.env['imap.password'] as string;

  const config = {
    imap: {
      user,
      password,
      host: 'imap.naver.com',
      port: 993,
      tls: true,
    },
  };

  const connection = await imap.connect(config);

  await connection.openBox('AIRBNB');

  const result = await connection.search(['ALL'], {
    bodies: ['TEXT'],
  });

  const filterOldMails = (date: Date) => {
    const interval = parseInt(
      process.env['reservation-responder.interval'] as string,
      10,
    );
    const receivedAt = dayjs(date);
    const now = dayjs(new Date());
    const basis = now.subtract(interval, 'minute');

    logger.info(`receivedAt: ${receivedAt}, basis: ${basis}`);

    return basis.unix() < receivedAt.unix() && now.unix() > receivedAt.unix();
  };

  const transformMailBodys = (): string[] => {
    return result
      .filter(body => filterOldMails(body.attributes.date))
      .map(body => {
        return body.parts
          .filter(part => part.which === 'TEXT')
          .map(part => part.body);
      })
      .reduce((acc, val) => acc.concat(val), []);
  };

  const checkPeriod = (text: string) => {
    const matchPeriod = /20\d{2}년 \d{1,2}월 \d{1,2}일/g;
    const matched = text.match(matchPeriod);

    if (matched && matched.length >= 2) {
      const [startDate, endDate] = matched;

      return {
        startDate: dayjs(startDate, 'YYYY년 M월 D일', 'ko').format(
          'YYYY-MM-DD',
        ),
        endDate: dayjs(endDate, 'YYYY년 M월 D일', 'ko').format('YYYY-MM-DD'),
      };
    } else {
      throw new Error('예약 날짜를 찾을 수 없습니다.');
    }
  };

  const checkReservationCode = (text: string) => {
    const matchReservationCode = /HM[A-Z0-9]{8}/;
    const matched = text.match(matchReservationCode);

    if (matched) {
      return {
        reservationCode: matched[0],
      };
    } else {
      throw new Error('예약코드를 찾을 수 없습니다.');
    }
  };

  const checkRoomId = (text: string) => {
    const matchRoomId = /https:\/\/www.airbnb.co.kr\/rooms\/([0-9]{8})/;
    const matched = text.match(matchRoomId);

    if (matched && matched.length >= 2) {
      return {
        roomId: matched[1],
      };
    } else {
      throw new Error('숙소 ID를 찾을 수 없습니다.');
    }
  };

  return {
    getMailBodys(): Promise<IReservation[]> {
      const mailBodys = transformMailBodys();
      return Promise.all(
        mailBodys.map(async body => {
          const { text } = await simpleParser(body);

          return {
            ...checkPeriod(text),
            ...checkReservationCode(text),
            ...checkRoomId(text),
          };
        }),
      );
    },
  };
};

export default MailReader;
