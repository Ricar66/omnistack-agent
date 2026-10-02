export function listOpenTasks(tasks) {
  return tasks.filter(task => !task.done);
}