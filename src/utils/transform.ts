function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function transformKeys(
  obj: unknown,
  transformFn: (key: string) => string,
): unknown {
  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeys(item, transformFn));
  }
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[transformFn(key)] = transformKeys(value, transformFn);
    }
    return result;
  }
  return obj;
}

export function toSnakeCase<T = Record<string, unknown>>(obj: unknown): T {
  return transformKeys(obj, camelToSnake) as T;
}

export function toCamelCase<T = Record<string, unknown>>(obj: unknown): T {
  return transformKeys(obj, snakeToCamel) as T;
}
