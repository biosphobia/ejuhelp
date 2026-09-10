// In-flight model calls, keyed by a client-supplied job id.
//
// An iPad puts the browser to sleep mid-request: the fetch dies, but the model
// call is already running (and already paid for). Keeping the job here means the
// client can re-send the identical request — or just ask for the job by id when
// it wakes up — and get the same answer instead of an error.

const TTL_MS = 40 * 60_000; // keep a finished answer this long
const MAX_JOBS = 400;

export interface Job {
  id: string;
  ts: number;
  done: boolean;
  result?: unknown;
  error?: unknown;
  promise: Promise<unknown>;
}

const jobs = new Map<string, Job>();

function prune() {
  const now = Date.now();
  for (const [id, j] of jobs) if (j.done && now - j.ts > TTL_MS) jobs.delete(id);
  while (jobs.size > MAX_JOBS) {
    const oldest = jobs.keys().next().value as string | undefined;
    if (!oldest) break;
    jobs.delete(oldest);
  }
}

/** Start the work, or return the job already running/finished under this id. */
export function startJob(id: string, fn: () => Promise<unknown>): Job {
  prune();
  const existing = jobs.get(id);
  if (existing) return existing;
  const job: Job = { id, ts: Date.now(), done: false, promise: Promise.resolve() };
  job.promise = fn().then(
    (r) => {
      job.result = r;
      job.done = true;
      job.ts = Date.now();
      return r;
    },
    (e) => {
      job.error = e;
      job.done = true;
      job.ts = Date.now();
      throw e;
    }
  );
  job.promise.catch(() => undefined); // the route reports the error; don't crash the process
  jobs.set(id, job);
  return job;
}

export function getJob(id: string): Job | undefined {
  prune();
  return jobs.get(id);
}

export type JobOutcome = { status: 'done'; result: unknown } | { status: 'error'; error: unknown } | { status: 'pending' };

/** Wait up to `ms` for the job; report "pending" rather than holding the socket open forever. */
export async function awaitJob(job: Job, ms: number): Promise<JobOutcome> {
  if (!job.done) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<'timeout'>((resolve) => {
      timer = setTimeout(() => resolve('timeout'), ms);
    });
    try {
      const which = await Promise.race([job.promise.then(() => 'settled' as const, () => 'settled' as const), timeout]);
      if (which === 'timeout') return { status: 'pending' };
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
  if (job.error) return { status: 'error', error: job.error };
  return { status: 'done', result: job.result };
}
