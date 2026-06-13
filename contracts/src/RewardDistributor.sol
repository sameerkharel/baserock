// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BrockToken} from "./BrockToken.sol";
import {MiningEngine} from "./MiningEngine.sol";

/**
 * @title RewardDistributor
 * @notice Distributes BROCK rewards proportionally to miners based on Mining Power.
 * @dev Mints BROCK per round. Miners get 80%, Treasury gets 20%.
 */
contract RewardDistributor {
    BrockToken public token;
    MiningEngine public engine;
    address public treasury;
    
    uint256 public constant BROCK_PER_ROUND = 100 * 1e18; // 100 BROCK per round
    uint256 public constant MINER_SHARE = 80; // 80%
    uint256 public constant TREASURY_SHARE = 20; // 20%
    
    // roundId => miner => hasClaimed
    mapping(uint256 => mapping(address => bool)) public hasClaimed;
    
    event RewardClaimed(uint256 indexed roundId, address indexed miner, uint256 amount);
    
    constructor(address _token, address _engine, address _treasury) {
        token = BrockToken(_token);
        engine = MiningEngine(_engine);
        treasury = _treasury;
    }
    
    /**
     * @notice Claim reward for a specific round.
     * @param roundId The round to claim rewards for.
     */
    function claimReward(uint256 roundId) external {
        _claim(roundId, msg.sender);
    }
    
    /**
     * @notice Claim rewards for multiple rounds in a single transaction.
     * @param roundIds Array of round IDs to claim.
     */
    function batchClaim(uint256[] calldata roundIds) external {
        for (uint i = 0; i < roundIds.length; i++) {
            _claim(roundIds[i], msg.sender);
        }
    }
    
    /**
     * @notice View function to check claimable rewards for a miner in a given round.
     */
    function getClaimableReward(uint256 roundId, address miner) public view returns (uint256) {
        if (hasClaimed[roundId][miner]) return 0;
        
        (,,,, bool isEnded) = engine.rounds(roundId);
        if (!isEnded) return 0;
        
        uint256 minerPower = engine.getMinerPower(roundId, miner);
        if (minerPower == 0) return 0;
        
        (,,, uint256 totalProofs,) = engine.rounds(roundId);
        
        uint256 totalMinerReward = (BROCK_PER_ROUND * MINER_SHARE) / 100;
        
        return (totalMinerReward * minerPower) / totalProofs;
    }
    
    function _claim(uint256 roundId, address miner) internal {
        require(!hasClaimed[roundId][miner], "Already claimed");
        
        (,,,, bool isEnded) = engine.rounds(roundId);
        require(isEnded, "Round not ended");
        
        uint256 minerPower = engine.getMinerPower(roundId, miner);
        require(minerPower > 0, "No mining power");
        
        (,,, uint256 totalProofs,) = engine.rounds(roundId);
        
        uint256 totalMinerReward = (BROCK_PER_ROUND * MINER_SHARE) / 100;
        uint256 totalTreasuryReward = (BROCK_PER_ROUND * TREASURY_SHARE) / 100;
        
        uint256 minerReward = (totalMinerReward * minerPower) / totalProofs;
        uint256 treasuryReward = (totalTreasuryReward * minerPower) / totalProofs;
        
        hasClaimed[roundId][miner] = true;
        
        // Mint the rewards
        token.mint(miner, minerReward);
        token.mint(treasury, treasuryReward);
        
        emit RewardClaimed(roundId, miner, minerReward);
    }
}
