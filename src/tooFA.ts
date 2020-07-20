import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

interface TooFAOpts {
  apiPollInterval: number;
  apiRetries: number;
  childStdout: NodeJS.WriteStream;
}

const defaultOpts: TooFAOpts = {
  apiPollInterval: 500,
  apiRetries: 50,
  childStdout: process.stdout,
};

export default class TooFA {
  child: string;
  fetchToken: () => Promise<any>;
  childProcess: ChildProcessWithoutNullStreams;
  opts: Partial<TooFAOpts>;
  constructor(
    child: string,
    fetchToken: () => Promise<any>,
    opts = defaultOpts as Partial<TooFAOpts>
  ) {
    this.child = child;
    this.fetchToken = fetchToken;
    this.opts = { ...defaultOpts, ...opts };
  }

  async _getTokenHandler() {
    return new Promise((resolve, reject) => {
      for (let idx = 0; idx < this.opts.apiRetries; idx++) {
        setTimeout(async () => {
          const res = await this.fetchToken();
          if (res.status === 200) {
            resolve(res.data);
          }
        }, this.opts.apiPollInterval);
      }
      // reject(`fetchToken timed out after ${this.opts.apiRetries} attempts`);
    });
  }

  async authorize() {
    if (this.childProcess) {
      this.childProcess.kill();
    }
    this.childProcess = spawn(this.child);
    this.childProcess.stdout.pipe(this.opts.childStdout);
    try {
      const data = await this._getTokenHandler();
      this.childProcess.stdin.write(data.toString());
      this.childProcess.stdin.end();
    } catch (error) {
      if (error) throw error;
    }
  }
}
