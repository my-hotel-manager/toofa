import TooFA from '../index';
import http from 'http';

const getARandomNumber = async () => {
  const url =
    'https://www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new';
  http.get(url, (res) => {
    console.log(res);
  });
};

it('runs', async () => {
  // const authHandler = TooFa();
  getARandomNumber();
});

//
