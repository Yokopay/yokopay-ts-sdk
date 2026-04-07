export class YokoPayError extends Error {
  public readonly code: number;
  public readonly responseBody?: unknown;

  constructor(message: string, code: number, responseBody?: unknown) {
    super(message);
    this.name = "YokoPayError";
    this.code = code;
    this.responseBody = responseBody;
  }
}
