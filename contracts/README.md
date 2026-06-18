# BaseRock Smart Contracts

This repository contains the core smart contracts for the BaseRock Gamified Mining Protocol, powered by Foundry.

## Deployed Addresses (Base Mainnet)

The protocol is officially live and verified on the Base Mainnet!

| Contract | Address |
| --- | --- |
| **BrockToken ($BROCK)** | `0xB84431f74b4D3441baC3f766a7273E0210c02C33` |
| **MiningEngine** | `0xddfeCeeAAB024B3262991F6411F41B3f38e7d7b3` |
| **Treasury** | `0x1273E11a46bF29c88025a18e4cE13D4A796F8231` |
| **RewardDistributor** | `0x2936E3F8a958DbaF7aBDCD809A3301d4CB1b6884` |

## Architecture

- **`MiningEngine.sol`**: Manages the Proof-of-Useful-Work (PoUW) challenges. Miners submit off-chain proofs to earn Mining Power (MP).
- **`RewardDistributor.sol`**: Distributes `$BROCK` proportionally based on the MP earned in each round (80% to miners, 20% to Treasury).
- **`BrockToken.sol`**: Hard-capped ERC-20 reward token (21,000,000 max supply).
- **`Treasury.sol`**: Secure vault managing protocol taxes and dev funds.

## Development

```shell
# Build
forge build

# Test
forge test

# Format
forge fmt
```
