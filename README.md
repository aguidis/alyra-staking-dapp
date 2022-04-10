# DÉFI#4 - Staking dapp

*Lien du projet* : https://aguidis.github.io/alyra-staking-dapp/

*Testnet* : KOVAN

Un utilisateur pourra staker un token ERC-20 spécifique et pourra générer des intérêts en fonction de la période pendant laquelle ses tokens sont stakés.

## Règles
- Le token autorisé est le token ERC-20 [FAU](https://erc20faucet.com/)
- 1 FAU = 1 DAI
- Le paire DAI / USD de Chainlink est utilisée (Price data feed)
- Le token de récompense est celui que nous avons créé : DAPP
- 1 DAPP = 100$
- Le contrat offre 0.1% de reward par heure

## Stack
- Ethereum in memory blockchain, Ganache Version 2.5.4 (GUI or CLI)
- Truffle v5.4.18 (core: 5.4.18)
- Solidity v0.8.11 (solc-js)
- Node v15.5.0
- Web3.js v1.5.3
