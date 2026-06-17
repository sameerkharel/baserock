// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MiningEngine
 * @notice Core Proof-of-Useful-Work (PoUW) verification contract for Baserock.
 * @dev Issues mining challenges, verifies PoUW proofs, and tracks Mining Power (MP).
 * 
 * In the Baserock architecture, the Mining Engine serves as the base layer.
 * Miners submit verifiable proofs of performing external useful computations 
 * (such as AI inference or ZK-rollups). Each valid proof grants the miner 1 MP (Mining Power).
 * This MP is then utilized on the separate Territory Grid to claim multiplier sectors.
 */
contract MiningEngine {
    uint256 public constant ROUND_DURATION = 60 seconds;
    uint256 public constant TARGET_PROOFS_PER_ROUND = 100;
    
    struct Round {
        uint256 startTime;
        bytes32 challenge;
        uint256 difficulty;
        uint256 totalProofs;
        bool isEnded;
    }
    
    uint256 public currentRoundId;
    mapping(uint256 => Round) public rounds;
    // roundId => miner => MP
    mapping(uint256 => mapping(address => uint256)) public minerPower;
    
    // Prevent replay attacks (hash => bool)
    mapping(bytes32 => bool) public usedHashes;
    
    event RoundStarted(uint256 indexed roundId, bytes32 challenge, uint256 difficulty);
    event ProofSubmitted(uint256 indexed roundId, address indexed miner, uint256 nonce, bytes32 hash);
    event RoundEnded(uint256 indexed roundId, uint256 totalProofs, uint256 nextDifficulty);
    
    constructor(uint256 initialDifficulty) {
        _startNewRound(1, initialDifficulty);
    }
    
    /**
     * @notice Submits a Proof-of-Useful-Work solution for the current round.
     * @dev Front-running is prevented because the hash depends on `msg.sender`.
     * Validating this proof simulates verifying an external computational task.
     * Successfully submitting a proof yields exactly 1 MP (Mining Power) for the sender.
     * 
     * @param nonce The nonce that solves the PoUW challenge.
     */
    function submitProof(uint256 nonce) external {
        Round storage currentRound = rounds[currentRoundId];
        
        require(block.timestamp < currentRound.startTime + ROUND_DURATION, "Round is over, call startNextRound");
        
        bytes32 hash = keccak256(abi.encodePacked(currentRound.challenge, msg.sender, nonce));
        require(uint256(hash) <= currentRound.difficulty, "Invalid proof: difficulty not met");
        require(!usedHashes[hash], "Proof already submitted");
        
        usedHashes[hash] = true;
        currentRound.totalProofs += 1;
        minerPower[currentRoundId][msg.sender] += 1;
        
        emit ProofSubmitted(currentRoundId, msg.sender, nonce, hash);
    }
    
    /**
     * @notice Ends the current round and starts the next one.
     * @dev Can be called permissionlessly by anyone once the round duration has passed.
     */
    function startNextRound() external {
        Round storage currentRound = rounds[currentRoundId];
        require(block.timestamp >= currentRound.startTime + ROUND_DURATION, "Round duration not met");
        require(!currentRound.isEnded, "Already ended");
        
        currentRound.isEnded = true;
        
        uint256 nextDifficulty = _calculateNextDifficulty(currentRound.difficulty, currentRound.totalProofs);
        
        emit RoundEnded(currentRoundId, currentRound.totalProofs, nextDifficulty);
        
        _startNewRound(currentRoundId + 1, nextDifficulty);
    }
    
    /**
     * @notice Returns the mining power for a specific miner in a round.
     */
    function getMinerPower(uint256 roundId, address miner) external view returns (uint256) {
        return minerPower[roundId][miner];
    }
    
    function _startNewRound(uint256 roundId, uint256 difficulty) internal {
        currentRoundId = roundId;
        
        // Generate pseudo-random challenge using prevrandao (formerly difficulty) and timestamp
        bytes32 challenge = keccak256(abi.encodePacked(roundId, block.prevrandao, block.timestamp));
        
        rounds[roundId] = Round({
            startTime: block.timestamp,
            challenge: challenge,
            difficulty: difficulty,
            totalProofs: 0,
            isEnded: false
        });
        
        emit RoundStarted(roundId, challenge, difficulty);
    }
    
    function _calculateNextDifficulty(uint256 currentDifficulty, uint256 actualProofs) internal pure returns (uint256) {
        if (actualProofs == 0) {
            if (currentDifficulty > type(uint256).max / 2) return type(uint256).max;
            return currentDifficulty * 2;
        }
        
        // Clamp the difficulty change to 4x max in either direction early
        if (actualProofs <= TARGET_PROOFS_PER_ROUND / 4) {
            if (currentDifficulty > type(uint256).max / 4) return type(uint256).max;
            return currentDifficulty * 4;
        }
        
        if (actualProofs >= TARGET_PROOFS_PER_ROUND * 4) {
            return currentDifficulty / 4;
        }
        
        // For actualProofs between 26 and 399, max multiplier is < 4
        if (currentDifficulty > type(uint256).max / 4) {
            if (actualProofs < TARGET_PROOFS_PER_ROUND) {
                return type(uint256).max;
            } else {
                return (currentDifficulty / actualProofs) * TARGET_PROOFS_PER_ROUND;
            }
        }
        
        return (currentDifficulty * TARGET_PROOFS_PER_ROUND) / actualProofs;
    }
}
