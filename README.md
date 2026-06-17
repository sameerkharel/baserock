# BaseRock: Gamified Proof-of-Useful-Work Mining

BaseRock is a revolutionary decentralized protocol on Base Sepolia that transforms cryptocurrency mining from a passive, energy-wasting lottery into a highly competitive, strategic territory control game powered by Proof of Useful Work (PoUW).

## The Core Concept

In traditional Proof-of-Work (like Bitcoin), your computer consumes massive amounts of electricity solving useless math puzzles just to guess a random number. BaseRock flips this model on its head:

1. **Proof of Useful Work (PoUW)**: Instead of guessing random numbers, your "Mining Rig" performs valuable real-world computations—such as AI inference, Zero-Knowledge Proof (ZKP) generation, and scientific simulations. 
2. **Mining Power (MP)**: By completing these useful tasks, your node generates a resource called `Mining Power (MP)`.
3. **Territory Control (The Grid)**: You use your MP to claim sectors on a 10x10 global map. Different terrains offer different multipliers (e.g., Deep Caverns offer a 2.0x bonus). If someone holds a sector you want, you can use your MP to attack them and steal their territory!

## Key Features

- **Cyberpunk Terminal UI**: An immersive, brutalist, hacker-themed interface that makes you feel like a true cypherpunk node operator.
- **Dynamic Leaderboards**: Track the most powerful miners and Guilds across the network.
- **Smart Contract Security**: Built on robust Solidity contracts deployed to Base Sepolia.
- **Treasury Economy**: Claim your `$BROCK` tokens directly from the decentralized reward distributor based on your strategic map placement.

## Getting Started

### Prerequisites
- Node.js & npm
- A Web3 Wallet (MetaMask, Rabby)
- Base Sepolia testnet ETH

### Running Locally
```bash
# Clone the repository
cd Gamified-Mining-Concept-Improvision/frontend

# Install dependencies
npm install

# Start the local terminal interface
npm run dev
```

## Architecture

- **Frontend**: React, Vite, Wagmi, viem, lucide-react
- **Smart Contracts**: Foundry, Solidity
- **Mining Engine**: Rust (WASM) background worker [IN DEVELOPMENT]

---
*> SYS_END_OF_FILE*
