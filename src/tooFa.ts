import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import async from 'async';

type RetryFetchTokenT = (err: number, res: TooFaResponseT) => any;

export type FetchTokenT = (arg0: RetryFetchTokenT, result: any) => any;
interface TooFaResponseT {
  status: number;
  data: number;
}
interface TooFaOpts {
  apiPollInterval: number;
  apiRetries: number;
  childStdout: NodeJS.WriteStream;
}

const defaultOpts: TooFaOpts = {
  apiPollInterval: 500,
  apiRetries: 5,
  childStdout: process.stdout,
};

export default class TooFa {
  child: string;
  fetchToken: FetchTokenT;
  childProcess: ChildProcessWithoutNullStreams;
  opts: Partial<TooFaOpts>;
  constructor(
    child: string,
    fetchToken: FetchTokenT,
    opts = defaultOpts as Partial<TooFaOpts>
  ) {
    this.child = child;
    this.fetchToken = fetchToken;
    this.opts = { ...defaultOpts, ...opts };
  }

  _getTokenHandler() {
    return new Promise((resolve, reject) => {
      async.retry(
        { times: this.opts.apiRetries, interval: this.opts.apiPollInterval },
        this.fetchToken,
        (err: number, res: TooFaResponseT) => {
          if (err) {
            reject(
              `fetchToken timed out after ${this.opts.apiRetries} attempts with status code ${err}`
            );
          } else {
            resolve(res);
          }
        }
      );
    });
  }

  authorize() {
    if (this.childProcess) {
      this.childProcess.kill();
    }
    let output = '';
    this.childProcess = spawn(this.child);
    this.childProcess.stdout.pipe(this.opts.childStdout);
    this.childProcess.stdout.on('data', (chunk) => {
      output += chunk.toString();
    });
    return new Promise((resolve, reject) => {
      this.childProcess.stdout.on('close', () => {
        resolve(output);
      });
      this._getTokenHandler()
        .then((res) => {
          this.childProcess.stdin.write((res as any).data.toString(), () => {
            this.childProcess.stdin.end();
          });
        })
        .catch((err) => {
          reject(err);
          this.childProcess.kill();
        });
    });
  }
}
