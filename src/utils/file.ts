import { promises as fs } from 'fs';
import path from 'path';
import reservations from '../../reservations.json';
import { IReservation } from '../types';

const File = () => {
  const reservationsListPath = path.resolve('reservations.json');

  return {
    async updateReservationsList(newReservations: IReservation[]) {
      return fs.writeFile(
        reservationsListPath,
        JSON.stringify(newReservations),
      );
    },
    async readReservationsList(): Promise<IReservation[]> {
      return reservations;
    },
  };
};

export default File;
