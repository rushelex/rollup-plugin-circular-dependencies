export function format(message) {
  return `[${new Date().toISOString()}] ${message}`;
}
