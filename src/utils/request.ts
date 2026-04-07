import { YokoPayError } from "../errors/index.js";

export interface RequestConfig {
  baseUrl: string;
  method: "GET" | "POST";
  path: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeout?: number;
  params?: Record<string, string>;
}

export async function request<T>(config: RequestConfig): Promise<T> {
  const timeout = config.timeout ?? 30_000;

  let url = config.baseUrl + config.path;
  if (config.params) {
    const searchParams = new URLSearchParams(config.params);
    url += "?" + searchParams.toString();
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const headers: Record<string, string> = { ...config.headers };
  let requestBody: string | undefined;

  if (config.body) {
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, {
      method: config.method,
      headers,
      body: requestBody,
      signal: controller.signal,
    });

    const responseBody = await response.text();

    if (!response.ok) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(responseBody);
      } catch {
        parsed = responseBody;
      }
      throw new YokoPayError(
        `HTTP ${response.status}: ${responseBody}`,
        response.status,
        parsed,
      );
    }

    return JSON.parse(responseBody) as T;
  } catch (error) {
    if (error instanceof YokoPayError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new YokoPayError(`Request timeout after ${timeout}ms`, 0);
    }
    throw new YokoPayError(
      error instanceof Error ? error.message : "Unknown error",
      0,
    );
  } finally {
    clearTimeout(timer);
  }
}
