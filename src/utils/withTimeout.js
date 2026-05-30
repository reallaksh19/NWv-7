export class TimeoutError extends Error {
  constructor(message = 'Operation timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export function withTimeout(promise, timeoutMs = 12000, options = {}) {
  const message = options.message || `Operation timed out after ${timeoutMs}ms`;

  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new TimeoutError(message));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

export async function fetchWithTimeout(url, options = {}) {
  const { timeoutMs = 12000, ...fetchOptions } = options;

  return withTimeout(fetch(url, fetchOptions), timeoutMs, {
    message: `Fetch timed out after ${timeoutMs}ms: ${url}`,
  });
}
