// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {BrockToken} from "../src/BrockToken.sol";

contract BrockTokenTest is Test {
    BrockToken public token;

    address admin = address(0x1);
    address minter = address(0x2);
    address user1 = address(0x3);
    address user2 = address(0x4);

    function setUp() public {
        vm.startPrank(admin);
        token = new BrockToken(admin);
        token.grantRole(token.MINTER_ROLE(), minter);
        vm.stopPrank();
    }

    function test_InitialState() public view {
        assertEq(token.name(), "Baserock");
        assertEq(token.symbol(), "BROCK");
        assertEq(token.decimals(), 18);
        assertEq(token.totalSupply(), 0);
        assertTrue(token.hasRole(token.DEFAULT_ADMIN_ROLE(), admin));
        assertTrue(token.hasRole(token.MINTER_ROLE(), minter));
    }

    function test_Mint() public {
        uint256 amount = 100 * 1e18;
        
        vm.prank(minter);
        token.mint(user1, amount);

        assertEq(token.balanceOf(user1), amount);
        assertEq(token.totalSupply(), amount);
    }

    function testRevert_MintNonMinter() public {
        uint256 amount = 100 * 1e18;
        
        vm.expectRevert();
        vm.prank(user1);
        token.mint(user1, amount);
    }

    function testRevert_MintMaxSupplyExceeded() public {
        uint256 maxSupply = token.MAX_SUPPLY();
        
        vm.prank(minter);
        token.mint(user1, maxSupply);

        vm.expectRevert(BrockToken.MaxSupplyExceeded.selector);
        vm.prank(minter);
        token.mint(user1, 1);
    }

    function test_Burn() public {
        uint256 amount = 100 * 1e18;
        
        vm.prank(minter);
        token.mint(user1, amount);

        vm.prank(user1);
        token.burn(50 * 1e18);

        assertEq(token.balanceOf(user1), 50 * 1e18);
        assertEq(token.totalSupply(), 50 * 1e18);
    }

    function test_BurnFrom() public {
        uint256 amount = 100 * 1e18;
        
        vm.prank(minter);
        token.mint(user1, amount);

        vm.prank(user1);
        token.approve(user2, 50 * 1e18);

        vm.prank(user2);
        token.burnFrom(user1, 50 * 1e18);

        assertEq(token.balanceOf(user1), 50 * 1e18);
        assertEq(token.totalSupply(), 50 * 1e18);
    }
}
