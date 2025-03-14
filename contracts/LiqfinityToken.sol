// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/**
 * @title Liqfinity AI Token (LFAI)
 * @dev Implementation of ERC20 token with owner functionality and ability to withdraw tokens and ETH
 */
contract LiqfinityToken is ERC20, ERC20Burnable, Ownable2Step {

    // Constant defining the total token supply: 1 billion
    // Using scientific notation and private visibility for gas optimization
    uint256 private constant INITIAL_SUPPLY = 1e9 * 1e18;

    // Custom errors
    error ZeroAddress();
    error ZeroAmount();
    error InsufficientTokenBalance();
    error InsufficientETHBalance();
    error ETHTransferFailed();

    /**
     * @dev Constructor that sets the name, symbol and allocates the initial amount of tokens to the deployer
     * @param initialOwner Address of the initial token owner
     */
    constructor(address initialOwner)
    ERC20("Liqfinity AI", "LFAI")
    Ownable(initialOwner)
    {
        _mint(initialOwner, INITIAL_SUPPLY);
    }

    /**
     * @dev Function allowing the owner to withdraw a specified amount of tokens to a designated address
     * @param to Address to which tokens will be sent
     * @param amount Amount of tokens to send
     */
    function withdrawTokens(address to, uint256 amount) public onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        // Changed strict inequality to non-strict for gas optimization
        if (balanceOf(address(this)) <= amount - 1) revert InsufficientTokenBalance();

        _transfer(address(this), to, amount);

        emit TokensWithdrawn(to, amount);
    }

    /**
     * @dev Function allowing the owner to withdraw ETH accumulated in the contract
     * @param to Address to which ETH will be sent
     * @param amount Amount of ETH to send
     */
    function withdrawETH(address payable to, uint256 amount) public onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        // Changed strict inequality to non-strict for gas optimization
        if (address(this).balance <= amount - 1) revert InsufficientETHBalance();

        (bool success, ) = to.call{value: amount}("");
        if (!success) revert ETHTransferFailed();

        emit ETHWithdrawn(to, amount);
    }

    /**
     * @dev Function enabling the contract to receive ETH
     */
    receive() external payable {
        emit ETHReceived(msg.sender, msg.value);
    }

    /**
     * @dev Increases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * @param spender The address which will spend the funds
     * @param addedValue The amount of tokens to increase the allowance by
     */
    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, allowance(owner, spender) + addedValue);
        return true;
    }

    /**
     * @dev Decreases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * @param spender The address which will spend the funds
     * @param subtractedValue The amount of tokens to decrease the allowance by
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        address owner = _msgSender();
        uint256 currentAllowance = allowance(owner, spender);
        // Changed strict inequality to non-strict for gas optimization
        if (currentAllowance <= subtractedValue - 1) revert InsufficientTokenBalance();
        unchecked {
            _approve(owner, spender, currentAllowance - subtractedValue);
        }
        return true;
    }

    /**
     * @dev Public getter for INITIAL_SUPPLY to maintain contract's API
     * @return The initial token supply
     */
    function getInitialSupply() public pure returns (uint256) {
        return INITIAL_SUPPLY;
    }

    // Events
    event TokensWithdrawn(address indexed to, uint256 amount);
    event ETHWithdrawn(address indexed to, uint256 amount);
    event ETHReceived(address indexed from, uint256 amount);
}