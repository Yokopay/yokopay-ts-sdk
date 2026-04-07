export interface YokoPayConfig {
  baseUrl?: string;
  projectId: string;
  privateKey: string;
  publicKey: string;
  platformPublicKey: string;
  timeout?: number;
}
