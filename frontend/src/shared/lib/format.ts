export function formatDateTime(ms: number) {
  const d = new Date(ms);
  return d.toLocaleString();
}

export function shortAddr(a: string) {
  const v = (a || '').trim();
  if (v.length <= 12) return v;
  return `${v.slice(0, 6)}…${v.slice(-6)}`;
}

