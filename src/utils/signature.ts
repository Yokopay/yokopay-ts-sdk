import * as secp256k1 from "@noble/secp256k1";
import { sha256 } from "@noble/hashes/sha2";
import { hmac } from "@noble/hashes/hmac";
import { keccak_256 } from "@noble/hashes/sha3";
import { toSortedJson } from "./sort-json.js";

// Required for @noble/secp256k1 v2 — set up hmac for deterministic signing
secp256k1.etc.hmacSha256Sync = (k, ...m) => {
  const h = hmac.create(sha256, k);
  for (const msg of m) h.update(msg);
  return h.digest();
};

function hexToBytes(hex: string): Uint8Array {
  const h = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(h.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function signRequest(
  path: string,
  body: Record<string, unknown> | null,
  privateKey: string,
): string {
  const message = body != null ? path + toSortedJson(body) : path;
  const messageHash = sha256(new TextEncoder().encode(message));

  const privKeyBytes = hexToBytes(privateKey);
  const sig = secp256k1.sign(messageHash, privKeyBytes, { lowS: true });

  // Construct 65-byte signature: r (32) + s (32) + recovery (1)
  const compact = sig.toCompactRawBytes();
  const signature = new Uint8Array(65);
  signature.set(compact);
  signature[64] = sig.recovery;

  return "0x" + bytesToHex(signature);
}

export function verifySignature(
  publicKey: string,
  signature: string,
  message: string,
): boolean {
  const messageHash = sha256(new TextEncoder().encode(message));

  const sigBytes = hexToBytes(signature);
  // Use first 64 bytes (strip recovery byte), matching Go SDK behavior
  const sigCompact = sigBytes.slice(0, 64);

  let pubKeyBytes = hexToBytes(publicKey);
  // If 64 bytes, prepend 0x04 for uncompressed format
  if (pubKeyBytes.length === 64) {
    const full = new Uint8Array(65);
    full[0] = 0x04;
    full.set(pubKeyBytes, 1);
    pubKeyBytes = full;
  }

  return secp256k1.verify(sigCompact, messageHash, pubKeyBytes);
}

export interface Keys {
  privateKey: string;
  publicKey: string;
  address: string;
}

export function generateKeys(): Keys {
  const privKey = secp256k1.utils.randomPrivateKey();
  // Uncompressed public key: 65 bytes starting with 0x04
  const pubKey = secp256k1.getPublicKey(privKey, false);

  // Ethereum address: keccak256 of public key bytes [1..64], last 20 bytes
  const pubKeyHash = keccak_256(pubKey.slice(1));
  const addressBytes = pubKeyHash.slice(-20);

  return {
    privateKey: "0x" + bytesToHex(privKey),
    publicKey: "0x" + bytesToHex(pubKey),
    address: "0x" + bytesToHex(addressBytes),
  };
}
