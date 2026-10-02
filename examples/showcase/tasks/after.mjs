export function listOpenTasks(tasks, limit) {
  if (limit !== undefined && (!Number.isSafeInteger(limit) || limit < 0)) {
    throw new RangeError('limit must be a non-negative safe integer');
  }
  const openTasks = tasks.filter(task => !task.done);
  return limit === undefined ? openTasks : openTasks.slice(0, limit);
}