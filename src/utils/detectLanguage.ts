import { Translate } from '@google-cloud/translate';
import { ILangauge } from '../types';

const detectLanguage = async (text: string): Promise<'ko' | 'en'> => {
  const translate = new Translate({
    projectId: process.env.GOOGLE_PROJECT_ID,
  });

  const [
    _,
    {
      data: { detections },
    },
  ]: any = await translate.detect(text);

  if (detections.length && detections[0].length) {
    const detected: ILangauge = detections[0][0].language;

    return detected === 'und' || detected === 'ko' ? 'ko' : 'en';
  }

  return 'ko';
};

export default detectLanguage;
