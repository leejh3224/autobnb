import { format, isAfter, parse, subMinutes } from 'date-fns';
import koLocale from 'date-fns/locale/ko';
import imap from 'imap-simple';
import { simpleParser } from 'mailparser';
import { IReservation } from './types';

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

  const result = await connection.search(['UNSEEN'], {
    bodies: ['TEXT'],
    markSeen: true,
  });

  const checkIsNewMail = (date: Date) => {
    const reservationResponderInterval = process.env[
      'reservation-responder.interval'
    ] as string;
    return isAfter(
      date,
      subMinutes(new Date(), parseInt(reservationResponderInterval, 10)),
    );
  };

  const transformMailBodys = (): string[] => {
    return result
      .filter(res => checkIsNewMail(res.attributes.date))
      .map(res => {
        return res.parts
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

      const parseDate = (date: string) =>
        parse(date, 'yyyy년 MM월 dd일', new Date(), {
          locale: koLocale,
        });

      return {
        startDate: format(parseDate(startDate), 'yyyy-MM-dd'),
        endDate: format(parseDate(endDate), 'yyyy-MM-dd'),
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
    const matchRoomName = /포항 영일대 해수욕장 도보5분 [A-Z0-9]{2} Joy's Cozy House/;
    const matched = text.match(matchRoomName);

    if (matched) {
      return {
        roomId: matched[0],
      };
    } else {
      throw new Error('숙소 이름을 찾을 수 없습니다.');
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
