import TooFA from '../index';
import http from 'http';

let RAND_NUM: number;

const generateGetter = (min: number, max: number) => {
  return (callback: (err, res) => any, result: any) => {
    const postNum = Math.floor(Math.random() * (max - min + 1) + min);
    RAND_NUM = postNum;
    console.log(RAND_NUM);
    const url = `http://jsonplaceholder.typicode.com/posts/${postNum}`;
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const parsedData = JSON.parse(data);
        const out = { status: res.statusCode, data: parsedData.id };
        if (res.statusCode > 200) {
          callback(res.statusCode, null);
        } else {
          callback(null, out);
        }
      });
    });
  };
};

it('runs', async () => {
  const authHandler = new TooFA(
    './__tests__/spaceship.sh',
    generateGetter(1, 101)
  );
  try {
    const stdoutData = await authHandler.authorize();
    expect(stdoutData).toEqual(
      expect.stringContaining(`It\'s nice to meet you ${RAND_NUM}`)
    );
  } catch (error) {
    if (error) throw error;
  }
});

it('times out', async () => {
  const retries = 10;
  const authHandler = new TooFA(
    './__tests__/spaceship.sh',
    generateGetter(101, 200),
    {
      apiRetries: retries,
    }
  );
  try {
    const stdoutData = await authHandler.authorize();
  } catch (err) {
    expect(err).toEqual(
      expect.stringContaining(`timed out after ${retries} attempts`)
    );
  }
});
