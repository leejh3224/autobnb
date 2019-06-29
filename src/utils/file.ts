import { promises as fs } from 'fs';
import path from 'path';
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
      const json = await fs.readFile(reservationsListPath);
      return JSON.parse(json.toString());
    },
  };
};

export default File;
