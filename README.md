# @tetherto/wdk-wallet-sui

[![npm version](https://img.shields.io/npm/v/%40tetherto%2Fwdk-wallet-sui?style=flat-square)](https://www.npmjs.com/package/@tetherto/wdk-wallet-sui)
[![npm downloads](https://img.shields.io/npm/dw/%40tetherto%2Fwdk-wallet-sui?style=flat-square)](https://www.npmjs.com/package/@tetherto/wdk-wallet-sui)
[![license](https://img.shields.io/npm/l/%40tetherto%2Fwdk-wallet-sui?style=flat-square)](https://github.com/tetherto/wdk-wallet-sui/blob/main/LICENSE)
[![docs](https://img.shields.io/badge/docs-docs.wdk.tether.io-0A66C2?style=flat-square)](https://docs.wdk.tether.io/sdk/wallet-modules/wallet-sui)

**Note**: This package is currently in beta. Please test thoroughly in development environments before using in production.

A simple and secure package to manage BIP-44 wallets for the Sui blockchain. This package provides a clean API for creating, managing, and interacting with Sui wallets using BIP-39 seed phrases and Sui-specific derivation paths.

## About WDK

This module is part of the [**WDK (Wallet Development Kit)**](https://docs.wdk.tether.io/) project, which empowers developers to build secure, non-custodial wallets with unified blockchain access, stateless architecture, and complete user control.

For detailed documentation about the complete WDK ecosystem, visit [docs.wdk.tether.io](https://docs.wdk.tether.io).

## Installation

```bash
npm install @tetherto/wdk-wallet-sui
```

## Quick Start

```javascript
import WalletManagerSui from '@tetherto/wdk-wallet-sui'
import { getFullnodeUrl } from '@mysten/sui/client'

const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

const wallet = new WalletManagerSui(seedPhrase, {
  rpcUrl: getFullnodeUrl('testnet'),
})

const account = await wallet.getAccount(0)
const address = await account.getAddress()
console.log('Address:', address)

wallet.dispose()
```

## Key Capabilities

- **BIP-39 Seed Phrase Support**: Generate and validate mnemonic seed phrases
- **Sui Derivation Paths**: Standard Sui derivation (m/44'/784')
- **Multi-Account Management**: Derive multiple accounts from a single seed phrase
- **Transaction Support**: Sign and execute Sui transactions
- **Sui Token Support**: Query balances and transfer coins
- **Message Signing**: Sign and verify messages
- **Fee Estimation**: Real-time network fee rates with normal/fast tiers
- **Secure Memory Disposal**: Clear private keys from memory when done

## Documentation

| Topic | Description | Link |
|-------|-------------|------|
| Overview | Module overview and feature summary | [Wallet Sui Overview](https://docs.wdk.tether.io/sdk/wallet-modules/wallet-sui) |
| Usage | End-to-end integration walkthrough | [Wallet Sui Usage](https://docs.wdk.tether.io/sdk/wallet-modules/wallet-sui/usage) |
| Configuration | Provider, fees, and network configuration | [Wallet Sui Configuration](https://docs.wdk.tether.io/sdk/wallet-modules/wallet-sui/configuration) |
| Error Handling | Transaction and transfer error management | [Wallet Sui Error Handling](https://docs.wdk.tether.io/sdk/wallet-modules/wallet-sui/error-handling) |
| API Reference | Complete class and type reference | [Wallet Sui API Reference](https://docs.wdk.tether.io/sdk/wallet-modules/wallet-sui/api-reference) |

## Testing

To run the test suites for this module, use the following commands:

- Run unit tests (Jest):
```bash
npm run test:unit
```
- Run integration tests (brittle):
```bash
npm run test:integration
```
- Run test coverage:
```bash
npm run test:coverage
```

## Community

Join the [WDK Discord](https://discord.gg/arYXDhHB2w) to connect with other developers.

## Support

For support, please [open an issue](https://github.com/tetherto/wdk-wallet-sui/issues) on GitHub or reach out via [email](mailto:wallet-info@tether.io).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
