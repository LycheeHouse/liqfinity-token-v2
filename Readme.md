# Liqfinity AI Token (LFAI)

Liqfinity AI Token (LFAI) is an ERC20 token implementation built on EVM-compatible networks with owner functionality, token and ETH withdrawal capabilities, and a total supply of 1 billion tokens.

## Features

- ERC20 standard compliant token
- Token name: Liqfinity AI
- Token symbol: LFAI
- Total supply: 1,000,000,000 tokens
- Owner functionality with restricted access to critical functions
- Token withdrawal mechanism
- ETH withdrawal mechanism
- Token burning capability

## Prerequisites

- Node.js (recommended version 16.x or newer)
- npm (recommended version 8.x or newer)
- Git

## Project Structure

```
liqfinity-token/
├── .github/
│   └── workflows/
│       └── solidity-test.yml
├── contracts/
│   └── LiqfinityToken.sol
├── test/
│   ├── LiqfinityToken.test.js
│   └── LiqfinityToken.extended.test.js
├── .gitignore
├── .solhint.json
├── hardhat.config.js
├── package.json
└── README.md
```

## Getting Started

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/liqfinity-token.git
cd liqfinity-token
```

2. Install dependencies:

```bash
npm install
```

### Compiling Contracts

Compile the smart contracts:

```bash
npx hardhat compile
```

### Running Tests

Run the test suite to verify the functionality:

```bash
npx hardhat test
```

### Linting Solidity Code

Check your code for style and best practices:

```bash
npx solhint 'contracts/**/*.sol'
```

## Contract Details

The Liqfinity Token implements the following interfaces:

- ERC20: Standard token interface
- ERC20Burnable: Adds token burning capabilities
- Ownable: Provides access control mechanisms

Key functions include:

- `withdrawTokens`: Allows owner to withdraw tokens from the contract
- `withdrawETH`: Allows owner to withdraw ETH from the contract
- `receive()`: Enables the contract to receive ETH
- `increaseAllowance`/`decreaseAllowance`: Enhanced approval mechanisms

## Test Coverage

### Basic Tests (`LiqfinityToken.test.js`)

These tests verify the fundamental functionality of the token:

1. **Initialization**:
   - Correct name and symbol of the token
   - Allocation of initial supply to the owner
   - Setting the correct owner

2. **Token Transfers**:
   - Token transfer by the owner
   - Token transfers between users
   - Handling of invalid transfers

3. **Owner Functions**:
   - Withdrawal of tokens from the contract by the owner
   - Withdrawal of ETH from the contract by the owner
   - Restriction of function access to owner only

4. **Token Burning Function**:
   - Burning tokens by a user

5. **Receiving ETH**:
   - Receiving ETH by the contract and event emission

### Extended Tests (`LiqfinityToken.extended.test.js`)

These tests cover more advanced functionality and edge cases:

1. **Approval and TransferFrom Functionality**:
   - Token approval and allowance verification
   - Transferring tokens via transferFrom with sufficient allowance
   - Handling insufficient allowance cases
   - Updating allowances

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

## Continuous Integration

The project uses GitHub Actions for continuous integration. On each push or pull request to the main branches, the workflow will:

1. Compile the contracts
2. Run the test suite
3. Lint the Solidity code

To view the workflow results, check the Actions tab in the GitHub repository.

## Deployment

To deploy the contract to a network, update the `hardhat.config.js` file with your network configuration and then run:

```bash
npx hardhat run scripts/deploy.js --network <network-name>
```

Note: You'll need to create a deployment script first in a `scripts` directory.

## Security

This contract has not been audited. Use at your own risk.

## License

MIT

---

For any questions or issues, please open an issue in the GitHub repository.