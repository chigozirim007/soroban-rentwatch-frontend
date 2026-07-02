export function decimalToString(value: { toString(): string } | number | string | null | undefined): string {
  if (value === null || value === undefined) return "0.0000000";
  const parsed = Number(value.toString());
  if (!Number.isFinite(parsed)) return "0.0000000";
  return parsed.toFixed(7);
}

export function shortKey(value: string, head = 4, tail = 4): string {
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

export function ledgersToTime(ledgers: number | null | undefined): string {
  if (!ledgers || ledgers <= 0) return "0m";
  const seconds = ledgers * 5;
  const hours = seconds / 3600;
  const days = hours / 24;
  if (days >= 1) return `~${days.toFixed(1)}d`;
  if (hours >= 1) return `~${hours.toFixed(1)}h`;
  return `~${Math.max(1, Math.round(seconds / 60))}m`;
}

export function timeAgo(input: string | Date | null | undefined): string {
  if (!input) return "Never";
  const date = typeof input === "string" ? new Date(input) : input;
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
