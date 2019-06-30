import MailReader from './mail-reader';

describe('mail-reader', () => {
  it('retrieves mails', async () => {
    const mailReader = await MailReader();
    const mails = await mailReader.getMailBodys();

    expect(mails).toHaveLength(4);
    console.log(mails);
  });
});
