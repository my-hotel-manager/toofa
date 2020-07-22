import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import retry from 'async/retry';

interface TooFAOpts {
  apiPollInterval: number;
  apiRetries: number;
  childStdout: NodeJS.WriteStream;
}

const defaultOpts: TooFAOpts = {
  apiPollInterval: 500,
  apiRetries: 5,
  childStdout: process.stdout,
};

export default class TooFA {
  child: string;
  fetchToken: (callback: (err, res) => any, result: any) => any;
  childProcess: ChildProcessWithoutNullStreams;
  opts: Partial<TooFAOpts>;
  constructor(
    child: string,
    fetchToken: (callback: (err, res) => any, result: any) => any,
    opts = defaultOpts as Partial<TooFAOpts>
  ) {
    this.child = child;
    this.fetchToken = fetchToken;
    this.opts = { ...defaultOpts, ...opts };
  }

  _getTokenHandler() {
    return new Promise((resolve, reject) => {
      retry(
        { times: this.opts.apiRetries, interval: this.opts.apiPollInterval },
        this.fetchToken,
        (err, res) => {
          if (err) {
            reject(
              `fetchToken timed out after ${this.opts.apiRetries} attempts`
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
