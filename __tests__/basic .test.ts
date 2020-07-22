import TooFA from '../index';
import http from 'http';

let RAND_NUM: number;

const getARandomNumber = (callback: (err, res) => any, result: any) => {
  const postNum = Math.floor(Math.random() * 201);
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

it('runs', async () => {
  const authHandler = new TooFA('./__tests__/spaceship.sh', getARandomNumber);
  try {
    const stdoutData = await authHandler.authorize();
    expect(stdoutData).toEqual(
      expect.stringContaining(`It\'s nice to meet you ${RAND_NUM}`)
    );
  } catch (error) {
    if (error) throw error;
  }
});
