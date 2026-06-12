// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {BrockToken} from "../src/BrockToken.sol";
import {MiningEngine} from "../src/MiningEngine.sol";
import {RewardDistributor} from "../src/RewardDistributor.sol";
import {Treasury} from "../src/Treasury.sol";

/**
 * @title Deploy
 * @notice Deploys all Baserock core contracts to Base Sepolia testnet.
 * @dev Run: forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify
 */
contract Deploy is Script {
    // Initial difficulty: high enough that not every hash is valid,
    // but low enough for testnet mining with browser WASM.
    // This means any hash whose uint256 value is <= this number is accepted.
    // ~1 in 16 hashes will be valid (4 leading zero bits).
    uint256 constant INITIAL_DIFFICULTY = type(uint256).max / 16;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("Deploying from:", deployer);
        console2.log("Chain ID:", block.chainid);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy BrockToken
        BrockToken token = new BrockToken(deployer);
        console2.log("BrockToken deployed at:", address(token));

        // 2. Deploy MiningEngine
        MiningEngine engine = new MiningEngine(INITIAL_DIFFICULTY);
        console2.log("MiningEngine deployed at:", address(engine));

        // 3. Deploy Treasury
        Treasury treasury = new Treasury(address(token), deployer);
        console2.log("Treasury deployed at:", address(treasury));

        // 4. Deploy RewardDistributor
        RewardDistributor distributor = new RewardDistributor(
            address(token),
            address(engine),
            address(treasury)
        );
        console2.log("RewardDistributor deployed at:", address(distributor));

        // 5. Grant MINTER_ROLE to RewardDistributor
        token.grantRole(token.MINTER_ROLE(), address(distributor));
        console2.log("MINTER_ROLE granted to RewardDistributor");

        vm.stopBroadcast();

        // Print summary
        console2.log("");
        console2.log("=== DEPLOYMENT SUMMARY ===");
        console2.log("BrockToken:        ", address(token));
        console2.log("MiningEngine:      ", address(engine));
        console2.log("Treasury:          ", address(treasury));
        console2.log("RewardDistributor: ", address(distributor));
        console2.log("==========================");
    }
}
