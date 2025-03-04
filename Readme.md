# Testing Instructions for Liqfinity Token (LFAI)

This document contains instructions for installing dependencies and running tests for the Liqfinity Token (LFAI).

## Prerequisites

- Node.js (recommended version 16.x or newer)
- npm (recommended version 8.x or newer)

## Project Structure

To properly configure the project, create the following directory structure:

```
liqfinity-token/
├── contracts/
│   └── LiqfinityToken.sol
├── test/
│   ├── LiqfinityToken.test.js
│   └── LiqfinityToken.extended.test.js
├── hardhat.config.js
├── package.json
└── README.md
```

## Installing Dependencies

1. Create a new Hardhat project:

```bash
mkdir liqfinity-token
cd liqfinity-token
npm init -y
```

2. Install Hardhat and necessary dependencies:

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox chai ethers@^6.0.0
```

3. Install OpenZeppelin Contracts:

```bash
npm install @openzeppelin/contracts
```

## Project Files

1. Place the `LiqfinityToken.sol` contract in the `contracts/` directory.
2. Place the basic test file `LiqfinityToken.test.js` in the `test/` directory.
3. Place the extended test file `LiqfinityToken.extended.test.js` in the `test/` directory.
4. Copy the Hardhat configuration to the `hardhat.config.js` file in the project's root directory.

## Running Tests

To run the tests, execute the following command in the project's root directory:

```bash
npx hardhat test
```

You should see the test results that verify all functionality of the Liqfinity Token contract.

## Test Description

### Basic Tests (`LiqfinityToken.test.js`)

The basic tests check the following aspects of the contract:

1. **Initialization**:
   - Correct name and symbol of the token
   - Allocation of initial supply to the owner
   - Setting the correct owner

2. **Token Transfers**:
   - Token transfer by the owner
   - Token transfers between users
   - Handling of invalid transfers (more than a user owns)

3. **Owner Functions**:
   - Withdrawal of tokens from the contract by the owner
   - Withdrawal of ETH from the contract by the owner
   - Restriction of function access to owner only

4. **Token Burning Function**:
   - Burning tokens by a user

5. **Receiving ETH**:
   - Receiving ETH by the contract and event emission

### Extended Tests (`LiqfinityToken.extended.test.js`)

The extended tests cover more advanced functionality and edge cases:

1. **Approval and TransferFrom Functionality**:
   - Token approval and allowance verification
   - Transferring tokens via transferFrom with sufficient allowance
   - Handling insufficient allowance cases
   - Increasing and decreasing allowances

2. **Event Testing**:
   - Verification of Transfer events on token movements
   - Verification of Transfer events on token burning
   - Verification of TokensWithdrawn events

3. **Edge Cases**:
   - Handling zero-value transfers
   - Preventing transfers to the zero address
   - Preventing token withdrawals to the zero address
   - Preventing zero-token withdrawals
   - Preventing withdrawals of more tokens than available

4. **Security Tests**:
   - Ownership transfer restrictions
   - Protection against reentrancy attacks
   - Preventing approvals to the zero address
   - Handling large token amount transfers