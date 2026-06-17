// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {AccessControl} from "openzeppelin-contracts/contracts/access/AccessControl.sol";

/**
 * @title BrockToken (BROCK)
 * @notice The core utility and reward token for the Baserock protocol.
 * @dev ERC20 token with capped supply, role-based access for minting, and a public burn mechanism.
 */
contract BrockToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    uint256 public constant MAX_SUPPLY = 21_000_000 * 1e18; // 21 million max supply

    event MaxSupplyReached();
    error MaxSupplyExceeded();

    constructor(address defaultAdmin) ERC20("Baserock", "BROCK") {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
    }

    /**
     * @notice Mints new BROCK tokens. Only callable by addresses with MINTER_ROLE.
     * @param to The address to receive the minted tokens.
     * @param amount The amount of tokens to mint.
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        if (totalSupply() + amount > MAX_SUPPLY) {
            revert MaxSupplyExceeded();
        }
        _mint(to, amount);
        
        if (totalSupply() == MAX_SUPPLY) {
            emit MaxSupplyReached();
        }
    }

    /**
     * @notice Burns tokens from the caller's balance.
     * @param amount The amount of tokens to burn.
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /**
     * @notice Burns tokens from another address using the allowance mechanism.
     * @param from The address from which to burn tokens.
     * @param amount The amount of tokens to burn.
     */
    function burnFrom(address from, uint256 amount) external {
        _spendAllowance(from, msg.sender, amount);
        _burn(from, amount);
    }
}
