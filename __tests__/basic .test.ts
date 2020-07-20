import TooFA from '../index';
import http from 'http';

const getARandomNumber = () => {
  const postNum = Math.floor(Math.random() * 101);
  const url = `http://jsonplaceholder.typicode.com/posts/${postNum}`;
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const parsedData = JSON.parse(data);
        const out = { status: res.statusCode, data: parsedData.id };
        resolve(out);
      });
    });
  });
};

// (async () => {
//   const authHandler = new TooFA('./__tests__/spaceship.sh', getARandomNumber, {
//     apiPollInterval: 10,
//   });
//   try {
//     await authHandler.authorize();
//   } catch (error) {
//     if (error) throw error;
//   }
// })();

it('runs', async () => {
  const authHandler = new TooFA('./__tests__/spaceship.sh', getARandomNumber);
  try {
    await authHandler.authorize();
  } catch (error) {
    if (error) throw error;
  }
});
