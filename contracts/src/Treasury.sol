// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BrockToken} from "./BrockToken.sol";
import {AccessControl} from "openzeppelin-contracts/contracts/access/AccessControl.sol";
import {SafeERC20} from "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

/**
 * @title Treasury
 * @notice Holds protocol fees, manages dev fund withdrawals, and allows token burns.
 */
contract Treasury is AccessControl {
    using SafeERC20 for IERC20;

    BrockToken public token;
    
    uint256 public totalBurned;
    
    event TokensBurned(uint256 amount);
    event DevFundWithdrawn(address to, uint256 amount);
    
    constructor(address _token, address admin) {
        token = BrockToken(_token);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }
    
    /**
     * @notice Burns BROCK tokens from the Treasury balance.
     * @param amount Amount to burn.
     */
    function burn(uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        totalBurned += amount;
        token.burn(amount);
        emit TokensBurned(amount);
    }
    
    /**
     * @notice Withdraws BROCK tokens for development funding.
     * @param to Address to send the funds to.
     * @param amount Amount to withdraw.
     */
    function withdrawDevFund(address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20(address(token)).safeTransfer(to, amount);
        emit DevFundWithdrawn(to, amount);
    }
}
