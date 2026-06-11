// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {BrockToken} from "../src/BrockToken.sol";
import {MiningEngine} from "../src/MiningEngine.sol";
import {RewardDistributor} from "../src/RewardDistributor.sol";
import {Treasury} from "../src/Treasury.sol";

contract RewardDistributorTest is Test {
    BrockToken public token;
    MiningEngine public engine;
    Treasury public treasury;
    RewardDistributor public distributor;
    
    address admin = address(0x1);
    address miner1 = address(0x2);
    address miner2 = address(0x3);
    
    function setUp() public {
        vm.startPrank(admin);
        
        token = new BrockToken(admin);
        engine = new MiningEngine(type(uint256).max);
        treasury = new Treasury(address(token), admin);
        distributor = new RewardDistributor(address(token), address(engine), address(treasury));
        
        // Grant minter role to distributor
        token.grantRole(token.MINTER_ROLE(), address(distributor));
        
        vm.stopPrank();
    }
    
    function test_RewardCalculationAndClaim() public {
        // Miner 1 submits 3 proofs, Miner 2 submits 1 proof
        vm.startPrank(miner1);
        engine.submitProof(1);
        engine.submitProof(2);
        engine.submitProof(3);
        vm.stopPrank();
        
        vm.prank(miner2);
        engine.submitProof(4);
        
        // Fast forward and end round
        vm.warp(block.timestamp + engine.ROUND_DURATION() + 1);
        engine.startNextRound();
        
        // Miner 1 claims
        vm.prank(miner1);
        distributor.claimReward(1);
        
        // Total proofs = 4. 
        // BROCK_PER_ROUND = 100
        // Miner share = 80
        // Miner 1 MP = 3
        // Miner 1 reward = 80 * (3 / 4) = 60
        assertEq(token.balanceOf(miner1), 60 * 1e18);
        
        // Treasury gets its share for Miner 1's claim:
        // Treasury share = 20. Claimed for 3/4 = 15.
        assertEq(token.balanceOf(address(treasury)), 15 * 1e18);
        
        // Miner 2 claims
        vm.prank(miner2);
        distributor.claimReward(1);
        
        // Miner 2 reward = 80 * (1 / 4) = 20
        assertEq(token.balanceOf(miner2), 20 * 1e18);
        
        // Total treasury = 15 + 5 = 20
        assertEq(token.balanceOf(address(treasury)), 20 * 1e18);
    }
    
    function testRevert_ClaimRewardTooEarly() public {
        vm.prank(miner1);
        engine.submitProof(1);
        
        vm.expectRevert("Round not ended");
        vm.prank(miner1);
        distributor.claimReward(1);
    }
    
    function testRevert_ClaimRewardTwice() public {
        vm.prank(miner1);
        engine.submitProof(1);
        
        vm.warp(block.timestamp + engine.ROUND_DURATION() + 1);
        engine.startNextRound();
        
        vm.prank(miner1);
        distributor.claimReward(1);
        
        vm.expectRevert("Already claimed");
        vm.prank(miner1);
        distributor.claimReward(1);
    }
}
