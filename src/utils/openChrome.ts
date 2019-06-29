import puppeteer, { Browser } from 'puppeteer';

let instance: Browser | null = null;

const openChrome = async (debug: boolean = false) => {
  if (!instance) {
    instance = await puppeteer.launch({
      headless: !debug,
      args: [
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-zygote',
      ],

      // persist user sessions
      userDataDir: 'userDataDir',
    });
  }

  instance.on('disconnected', openChrome);

  return instance;
};

export default openChrome;
