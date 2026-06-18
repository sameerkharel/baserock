import { createWalletClient, http, publicActions, parseAbi, keccak256, encodePacked } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import fs from 'fs';

const env = fs.readFileSync('../contracts/.env', 'utf-8');
const pkMatch = env.match(/PRIVATE_KEY=(0x[a-fA-F0-9]+)/);
const privateKey = pkMatch[1];
const account = privateKeyToAccount(privateKey);

const client = createWalletClient({
  account,
  chain: base,
  transport: http()
}).extend(publicActions);

const address = "0xddfeCeeAAB024B3262991F6411F41B3f38e7d7b3";
const abi = parseAbi([
  "function submitProof(uint256 nonce) external",
  "function startNextRound() external",
  "function getMinerPower(uint256 roundId, address miner) external view returns (uint256)",
  "function currentRoundId() external view returns (uint256)",
  "function rounds(uint256) external view returns (uint256 startTime, bytes32 challenge, uint256 difficulty, uint256 totalProofs, bool isEnded)"
]);

async function main() {
  let roundId = await client.readContract({
    address, abi, functionName: 'currentRoundId'
  });
  console.log("Current Round ID (Pre-Start):", roundId);

  let started = false;
  console.log("Starting Next Round...");
  try {
    const txStart = await client.writeContract({
      address, abi, functionName: 'startNextRound', args: []
    });
    console.log("TxStart Hash:", txStart);
    await client.waitForTransactionReceipt({ hash: txStart, confirmations: 2 });
    started = true;
  } catch (e) {
    console.log("Round may already be started, continuing...", e.shortMessage);
  }

  if (started) {
    let newRoundId = roundId;
    while (newRoundId === roundId) {
      newRoundId = await client.readContract({
        address, abi, functionName: 'currentRoundId'
      });
      if (newRoundId !== roundId) break;
      await new Promise(r => setTimeout(r, 1000));
    }
    roundId = newRoundId;
  }
  console.log("Current Round ID (Post-Start):", roundId);

  const roundData = await client.readContract({
    address, abi, functionName: 'rounds', args: [roundId]
  });
  const challenge = roundData[1];
  const difficulty = roundData[2];
  console.log("Challenge:", challenge);
  console.log("Difficulty:", difficulty);

  console.log("Computing valid PoUW nonce...");
  let nonce = 0n;
  while (true) {
      const hashHex = keccak256(encodePacked(['bytes32', 'address', 'uint256'], [challenge, account.address, nonce]));
      const hashInt = BigInt(hashHex);
      if (hashInt <= difficulty) {
          console.log("Found valid nonce:", nonce);
          break;
      }
      nonce++;
  }

  console.log("Submitting proof to Mainnet...");
  const txProof = await client.writeContract({
    address, abi, functionName: 'submitProof', args: [nonce]
  });
  console.log("TxProof Hash:", txProof);
  await client.waitForTransactionReceipt({ hash: txProof });
  
  console.log("Fetching Miner Power...");
  const mp = await client.readContract({
    address, abi, functionName: 'getMinerPower', args: [roundId, account.address]
  });
  console.log("Success! You now have MP:", mp.toString(), "for Round", roundId.toString());
}

main().catch(console.error);
