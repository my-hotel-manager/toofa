import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

interface Response<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: any;
  request?: any;
}

interface TooFAOpts {
  apiPollInterval: number;
  apiRetries: number;
}

const defaultOpts: TooFAOpts = {
  apiPollInterval: 500,
  apiRetries: 50,
};

export default class TooFA {
  child: string;
  fetchToken: () => Promise<Response<any>>;
  childProcess: ChildProcessWithoutNullStreams;
  opts: Partial<TooFAOpts>;
  constructor(
    child: string,
    fetchToken: () => Promise<Response<any>>,
    opts = defaultOpts
  ) {
    this.child = child;
    this.fetchToken = fetchToken;
    this.opts = { ...defaultOpts, ...opts };
  }

  async _getTokenHandler() {
    for (let idx = 0; idx < this.opts.apiRetries; idx++) {
      setTimeout(async () => {
        const res = await this.fetchToken();
        if (res.status === 200) {
          return res.data.data;
        }
      }, this.opts.apiPollInterval);
    }
    throw new Error(
      `fetchToken timed out after ${this.opts.apiRetries} attempts`
    );
  }

  async authorize() {
    if (this.childProcess) {
      this.childProcess.kill();
    }
    this.childProcess = spawn(this.child);
    try {
      const token = await this._getTokenHandler();
      this.childProcess.stdin.write(token);
      this.childProcess.stdin.end();
    } catch (error) {
      if (error) throw error;
    }
  }
}
