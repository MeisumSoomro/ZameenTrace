const STORAGE_KEY = 'zameentrace-offline-queue';

function readQueue() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (_error) {
    return [];
  }
}

function writeQueue(queue) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function enqueueOfflineAction(action) {
  const queue = readQueue();
  const actionId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  queue.push({
    id: actionId,
    queuedAt: new Date().toISOString(),
    ...action,
  });

  writeQueue(queue);
  return queue;
}

export function getOfflineQueue() {
  return readQueue();
}

export function clearOfflineQueue() {
  writeQueue([]);
}
