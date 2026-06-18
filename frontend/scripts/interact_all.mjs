import { createWalletClient, http, publicActions, parseAbi } from 'viem';
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

const BROCK_TOKEN = "0xB84431f74b4D3441baC3f766a7273E0210c02C33";
const MINING_ENGINE = "0xddfeCeeAAB024B3262991F6411F41B3f38e7d7b3";
const TREASURY = "0x1273E11a46bF29c88025a18e4cE13D4A796F8231";
const REWARD_DISTRIBUTOR = "0x2936E3F8a958DbaF7aBDCD809A3301d4CB1b6884";

const engineAbi = parseAbi([
  "function startNextRound() external",
  "function rounds(uint256) external view returns (uint256 startTime, bytes32 challenge, uint256 difficulty, uint256 totalProofs, bool isEnded)"
]);

const distributorAbi = parseAbi([
  "function claimReward(uint256 roundId) external",
  "function hasClaimed(uint256, address) external view returns (bool)"
]);

const treasuryAbi = parseAbi([
  "function withdrawDevFund(address to, uint256 amount) external"
]);

const tokenAbi = parseAbi([
  "function balanceOf(address account) external view returns (uint256)"
]);

async function main() {
  console.log("Checking Round 3 status...");
  const round3 = await client.readContract({
    address: MINING_ENGINE, abi: engineAbi, functionName: 'rounds', args: [3n]
  });

  if (!round3[4]) { // isEnded is false
    console.log("Ending Round 3...");
    const tx1 = await client.writeContract({
      address: MINING_ENGINE, abi: engineAbi, functionName: 'startNextRound'
    });
    console.log("Tx1 Hash (End Round):", tx1);
    await client.waitForTransactionReceipt({ hash: tx1 });
  } else {
    console.log("Round 3 is already ended.");
  }

  const claimed = await client.readContract({
    address: REWARD_DISTRIBUTOR, abi: distributorAbi, functionName: 'hasClaimed', args: [3n, account.address]
  });

  if (!claimed) {
    console.log("Claiming rewards for Round 3...");
    const tx2 = await client.writeContract({
      address: REWARD_DISTRIBUTOR, abi: distributorAbi, functionName: 'claimReward', args: [3n]
    });
    console.log("Tx2 Hash (Claim):", tx2);
    await client.waitForTransactionReceipt({ hash: tx2 });
  } else {
    console.log("Rewards already claimed.");
  }

  console.log("Withdrawing 1 BROCK from Treasury...");
  const tx3 = await client.writeContract({
    address: TREASURY, abi: treasuryAbi, functionName: 'withdrawDevFund', args: [account.address, 1n * 10n ** 18n]
  });
  console.log("Tx3 Hash (Withdraw):", tx3);
  await client.waitForTransactionReceipt({ hash: tx3 });

  const balance = await client.readContract({
    address: BROCK_TOKEN, abi: tokenAbi, functionName: 'balanceOf', args: [account.address]
  });
  console.log("Final BROCK Balance:", balance.toString());
  console.log("Success! Interacted with all 4 contracts.");
}

main().catch(console.error);
