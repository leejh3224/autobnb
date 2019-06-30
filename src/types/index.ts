export type IReservationStatus =
  | 'reservation-confirmed'
  | 'check-in'
  | 'check-out'
  | 'no-message';

export interface IReservation {
  reservationCode: string;
  startDate?: string;
  endDate?: string;
  roomId: string;
}

/**
 * Google Translation Api classification codes:
 * ko: Korean
 * en: English
 * und: Unknown
 */
export type ILangauge = 'ko' | 'en' | 'und';
