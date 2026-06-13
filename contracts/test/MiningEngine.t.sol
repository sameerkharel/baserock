// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {MiningEngine} from "../src/MiningEngine.sol";

contract MiningEngineTest is Test {
    MiningEngine public engine;
    
    address miner1 = address(0x1);
    address miner2 = address(0x2);
    
    function setUp() public {
        // Max difficulty so any hash is valid
        engine = new MiningEngine(type(uint256).max);
    }
    
    function test_InitialRoundStarted() public view {
        assertEq(engine.currentRoundId(), 1);
        (uint256 startTime, , uint256 difficulty, uint256 totalProofs, bool isEnded) = engine.rounds(1);
        
        assertEq(startTime, block.timestamp);
        assertEq(difficulty, type(uint256).max);
        assertEq(totalProofs, 0);
        assertFalse(isEnded);
    }
    
    function test_SubmitProof() public {
        uint256 nonce = 1;
        
        vm.prank(miner1);
        engine.submitProof(nonce);
        
        (,,, uint256 totalProofs,) = engine.rounds(1);
        assertEq(totalProofs, 1);
        assertEq(engine.getMinerPower(1, miner1), 1);
    }
    
    function testRevert_SubmitDuplicateProof() public {
        uint256 nonce = 1;
        
        vm.prank(miner1);
        engine.submitProof(nonce);
        
        vm.expectRevert("Proof already submitted");
        vm.prank(miner1);
        engine.submitProof(nonce);
    }
    
    function test_MultipleMinersSubmit() public {
        vm.prank(miner1);
        engine.submitProof(1);
        
        // Same nonce is fine for different miner (hash includes msg.sender)
        vm.prank(miner2);
        engine.submitProof(1);
        
        (,,, uint256 totalProofs,) = engine.rounds(1);
        assertEq(totalProofs, 2);
        assertEq(engine.getMinerPower(1, miner1), 1);
        assertEq(engine.getMinerPower(1, miner2), 1);
    }
    
    function testRevert_StartNextRoundTooEarly() public {
        vm.expectRevert("Round duration not met");
        engine.startNextRound();
    }
    
    function test_StartNextRound() public {
        vm.warp(block.timestamp + engine.ROUND_DURATION() + 1);
        
        engine.startNextRound();
        
        assertEq(engine.currentRoundId(), 2);
        (,,,, bool isEnded1) = engine.rounds(1);
        assertTrue(isEnded1);
        
        (,,,, bool isEnded2) = engine.rounds(2);
        assertFalse(isEnded2);
    }
    
    function testRevert_SubmitProofAfterRoundOver() public {
        vm.warp(block.timestamp + engine.ROUND_DURATION() + 1);
        
        vm.expectRevert("Round is over, call startNextRound");
        vm.prank(miner1);
        engine.submitProof(1);
    }
}
