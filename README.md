# CHALLENGE #4 - Staking dapp

*Project link*: https://aguidis.github.io/alyra-staking-dapp/

*Testnet*: KOVAN

A user will be able to stake a specific ERC-20 token and will be able to generate interest based on the period during which his tokens are staked.

## Rules
- The authorized token is the ERC-20 token [FAU](https://erc20faucet.com/)
- 1 FAU = 1 DAI
- The DAI / USD pair of Chainlink is used (Price data feed)
- The reward token is the one we created : DAPP
- 1 DAPP = $100
- The contract offers 0.1% reward per hour

## Stack
- Ethereum in memory blockchain, Ganache Version 2.5.4 (GUI or CLI)
- Truffle v5.4.18 (core: 5.4.18)
- Solidity v0.8.11 (solc-js)
- Node v15.5.0
- Web3.js v1.5.3
