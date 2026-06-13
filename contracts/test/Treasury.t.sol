// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {BrockToken} from "../src/BrockToken.sol";
import {Treasury} from "../src/Treasury.sol";

contract TreasuryTest is Test {
    BrockToken public token;
    Treasury public treasury;
    
    address admin = address(0x1);
    address dev = address(0x2);
    
    function setUp() public {
        vm.startPrank(admin);
        
        token = new BrockToken(admin);
        treasury = new Treasury(address(token), admin);
        
        // Mint some tokens to treasury directly to test burns/withdrawals
        token.grantRole(token.MINTER_ROLE(), admin);
        token.mint(address(treasury), 100 * 1e18);
        
        vm.stopPrank();
    }
    
    function test_WithdrawDevFund() public {
        vm.prank(admin);
        treasury.withdrawDevFund(dev, 50 * 1e18);
        
        assertEq(token.balanceOf(dev), 50 * 1e18);
        assertEq(token.balanceOf(address(treasury)), 50 * 1e18);
    }
    
    function test_Burn() public {
        vm.prank(admin);
        treasury.burn(50 * 1e18);
        
        assertEq(treasury.totalBurned(), 50 * 1e18);
        assertEq(token.totalSupply(), 50 * 1e18); // 100 minted, 50 burned
    }
    
    function testRevert_UnauthorizedBurn() public {
        vm.expectRevert(); // Will revert with AccessControlUnauthorizedAccount
        vm.prank(dev);
        treasury.burn(50 * 1e18);
    }
}
