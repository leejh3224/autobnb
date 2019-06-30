import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);
dayjs.locale('ko');

export default dayjs;
