function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (value !== null && typeof value === "object") {
    return sortObject(value as Record<string, unknown>);
  }
  return value;
}

function sortObject(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  const sorted: Record<string, unknown> = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = sortValue(obj[key]);
  }
  return sorted;
}

export function toSortedJson(value: unknown): string {
  const parsed =
    typeof value === "string"
      ? JSON.parse(value)
      : JSON.parse(JSON.stringify(value));
  return JSON.stringify(sortValue(parsed));
}
