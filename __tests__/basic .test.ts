import TooFA from '../index';
import http from 'http';
import { createWriteStream } from 'fs';

let RAND_NUM: number;

const getARandomNumber = () => {
  const postNum = Math.floor(Math.random() * 101);
  RAND_NUM = postNum;
  console.log(`randNum: ${RAND_NUM}`);
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
        console.log(out);
        if (res.statusCode > 200) {
          reject(res.statusCode);
        } else {
          resolve(out);
        }
      });
    });
  });
};

(async () => {
  const authHandler = new TooFA('./__tests__/spaceship.sh', getARandomNumber);
  try {
    const stdoutData = await authHandler.authorize();
    console.log(stdoutData);
  } catch (error) {
    if (error) throw error;
  }
})();

// it('runs', async () => {
//   const authHandler = new TooFA('./__tests__/spaceship.sh', getARandomNumber);
//   try {
//     const stdoutData = await authHandler.authorize();
//     expect(stdoutData).toBe(
//       `What is the password?\nIt\'s nice to meet you ${RAND_NUM}`
//     );
//   } catch (error) {
//     if (error) throw error;
//   }
// });
