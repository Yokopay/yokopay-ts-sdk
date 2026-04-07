# yokopay

[YokoPay](https://yokopay.com) TypeScript SDK — type-safe client for deposit and withdrawal APIs with ECDSA signature authentication.

## Installation

```bash
npm install yokopay
# or
pnpm add yokopay
```

Requires Node.js 18+.

## Quick Start

```typescript
import { YokoPay } from "yokopay";

const client = new YokoPay({
  projectId: "your-project-id",
  privateKey: "0x...",
  publicKey: "0x...",
  platformPublicKey: "0x...",
});
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `baseUrl` | `string` | No | API base URL (default: `https://api.yokopay.com`) |
| `projectId` | `string` | Yes | Project UID from the dashboard |
| `privateKey` | `string` | Yes | Your ECDSA private key (`0x`-prefixed hex) |
| `publicKey` | `string` | Yes | Your ECDSA public key (`0x`-prefixed, uncompressed 65-byte) |
| `platformPublicKey` | `string` | Yes | YokoPay platform public key for callback verification |
| `timeout` | `number` | No | Request timeout in seconds (default: `30`) |

## Key Generation

```typescript
const keys = YokoPay.generateKeys();

console.log(keys.privateKey); // "0x..."
console.log(keys.publicKey);  // "0x04..."
console.log(keys.address);    // "0x..."
```

## Deposit Addresses

### Batch Generate

```typescript
const result = await client.generateDepositAddresses({
  count: 3,
  networkId: 11155111,
});

console.log(result.data.addresses);
```

### Single Generate

```typescript
const result = await client.generateDepositAddress({
  userUid: "PROJECT_UID-user123",
  networkId: 11155111,
});

console.log(result.address);
```

### Get by UID

```typescript
const result = await client.getDepositAddress("userUid", 11155111);

console.log(result.address);
```

## Deposits & Withdrawals

### Get Deposit Records

```typescript
const deposits = await client.getDeposits({ page: 1, pageSize: 10 });
```

### Get Withdrawal Records

```typescript
const withdrawals = await client.getWithdrawals({ page: 1, pageSize: 10 });
```

### Request Withdrawal

```typescript
const result = await client.requestWithdrawal({
  uid: "unique-withdrawal-id",
  assetId: 1,
  amount: 100.0,
  toAddress: "0x...",
  networkId: 11155111,
});

console.log(result.status); // "success"
```

## Callback Verification

YokoPay sends webhook callbacks for deposit/withdrawal events. Verify the platform signature before processing:

```typescript
app.post("/webhook", (req, res) => {
  try {
    const data = client.parseCallbackData(req.body);

    if (data.type === "deposit" && data.confirmed) {
      console.log(`Deposit ${data.floatAmount} ${data.assetName}`);
    }

    if (data.type === "withdraw") {
      console.log(`Withdrawal ${data.uid} status: ${data.status}`);
    }

    res.status(201).json({ message: "callback received" });
  } catch {
    res.status(401).json({ error: "Invalid signature" });
  }
});
```

Or verify manually:

```typescript
const isValid = client.verifyPlatformSignature(payload.verify_data, payload.sig);
```

## Constants

```typescript
import { NetworkId, AssetId, AssetName, TxStatus, WithdrawStatus } from "yokopay";

NetworkId.Sepolia;          // 11155111
AssetId.USDC;               // 1
AssetName.USDT;             // "USDT"
TxStatus.Confirmed;         // "confirmed"
WithdrawStatus.UnderReview;  // "under_review"
```

| Network | ID |
|---------|----|
| Ethereum Mainnet | `1` |
| BSC Mainnet | `66` |
| BSC Testnet | `67` |
| Sepolia | `11155111` |
| TRX | `4` |
| TRX Shasta | `5` |

## Error Handling

```typescript
import { YokoPayError } from "yokopay";

try {
  await client.requestWithdrawal(params);
} catch (error) {
  if (error instanceof YokoPayError) {
    console.error(error.code);    // HTTP status code
    console.error(error.message); // Error message
  }
}
```

## License

MIT
