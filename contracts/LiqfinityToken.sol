// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/**
 * @title Liqfinity Token (LFAI)
 * @dev Implementation of ERC20 token with owner functionality and ability to withdraw tokens and ETH
 */
contract LiqfinityToken is ERC20, ERC20Burnable, Ownable {

    // Constant defining the total token supply: 1 billion
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**18;

    /**
     * @dev Constructor that sets the name, symbol and allocates the initial amount of tokens to the deployer
     * @param initialOwner Address of the initial token owner
     */
    constructor(address initialOwner) ERC20("Liqfinity", "LFAI") Ownable(initialOwner) {
        _mint(initialOwner, INITIAL_SUPPLY);
    }

    /**
     * @dev Function allowing the owner to withdraw a specified amount of tokens to a designated address
     * @param to Address to which tokens will be sent
     * @param amount Amount of tokens to send
     */
    function withdrawTokens(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "LiqfinityToken: cannot withdraw to zero address");
        require(amount > 0, "LiqfinityToken: amount must be greater than zero");

        require(balanceOf(address(this)) >= amount, "LiqfinityToken: insufficient token balance");

        _transfer(address(this), to, amount);

        emit TokensWithdrawn(to, amount);
    }

    /**
     * @dev Function allowing the owner to withdraw ETH accumulated in the contract
     * @param to Address to which ETH will be sent
     * @param amount Amount of ETH to send
     */
    function withdrawETH(address payable to, uint256 amount) public onlyOwner {
        require(to != address(0), "LiqfinityToken: cannot withdraw to zero address");
        require(amount > 0, "LiqfinityToken: amount must be greater than zero");
        require(address(this).balance >= amount, "LiqfinityToken: insufficient ETH balance");

        (bool success, ) = to.call{value: amount}("");
        require(success, "LiqfinityToken: ETH transfer failed");

        emit ETHWithdrawn(to, amount);
    }

    /**
     * @dev Function enabling the contract to receive ETH
     */
    receive() external payable {
        emit ETHReceived(msg.sender, msg.value);
    }

    // Events
    event TokensWithdrawn(address indexed to, uint256 amount);
    event ETHWithdrawn(address indexed to, uint256 amount);
    event ETHReceived(address indexed from, uint256 amount);
}