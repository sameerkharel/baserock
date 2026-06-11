# BASEROCK ($BROCK)

> "Mine to the bedrock."

A gamified Proof-of-Useful-Compute mining dApp built on Base chain. BASEROCK replaces the gambling dynamics of traditional crypto lotteries with a positive-sum, deterministic reward system where miners allocate real compute power across a strategic resource grid.

## Features

- **Real Proof-of-Work**: Browser-based Rust/WASM mining engine ensures miners actually perform cryptographic work.
- **Resource Allocation Strategy**: Earned Mining Power (MP) is deployed across a 5x5 grid with dynamic yield rates.
- **Synthetix Reward Distribution**: Gas-efficient O(1) reward calculation for proportional distribution of $BROCK and ETH.
- **Progression System**: Earn XP, level up ranks, and unlock bonuses.
- **Crews**: Form mining guilds with up to 50 players to stack multiplier bonuses.

## Project Structure

- `/contracts`: Foundry project with Solidity smart contracts.
- `/mining-engine`: Rust to WebAssembly module for keccak256 mining loops.
- `/frontend`: React + Vite + wagmi UI.
- `/backend`: Node.js + Express for off-chain progression and coordination.

## Development

### Prerequisites
- Node.js 18+
- Foundry
- Rust & Cargo
- wasm-pack

### License
MIT
