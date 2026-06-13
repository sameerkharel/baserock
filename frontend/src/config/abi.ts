export const miningEngineABI = [
  {
    "type": "function",
    "name": "currentRoundId",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "rounds",
    "inputs": [{"name": "roundId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [
      {"name": "startTime", "type": "uint256", "internalType": "uint256"},
      {"name": "challenge", "type": "bytes32", "internalType": "bytes32"},
      {"name": "difficulty", "type": "uint256", "internalType": "uint256"},
      {"name": "totalProofs", "type": "uint256", "internalType": "uint256"},
      {"name": "isEnded", "type": "bool", "internalType": "bool"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "submitProof",
    "inputs": [{"name": "nonce", "type": "uint256", "internalType": "uint256"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "startNextRound",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
] as const;
