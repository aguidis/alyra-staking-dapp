# DÉFI#4 - Staking dapp
Un utilisateur pourra stoker un token ERC-20 spécifique et pourra générer des intérêt en fonction de la période où ses token sont stakés.

## Règles
Pour des raisons pédagogiques et de simplicité, certains raccourcis sont faits :

- un utilisateur doit withdraw ses jetons stakés avant d'en staker à nouveau
- Le token autorisé est le token ERC-20 [FAU](https://erc20faucet.com/)
- 1 FAU = 1 DAI
- Le token de récompense est celui que nous avons créé : DAPP
- 1 DAPP = 100$
- Le contrat offre 0.1% de reward par heure

## Stack
- Ethereum in memory blockchain, Ganache Version 2.5.4 (GUI or CLI)
- Truffle v5.4.18 (core: 5.4.18)
- Solidity v0.8.11 (solc-js)
- Node v15.5.0
- Web3.js v1.5.3

## Améliorations possibles

- Permettre à un utilisateur de staker plusieurs fois sans withdraw. 

Créer une *struct* qui va stocker le `sender` et ces stakes et une autre *struct* qui va stocker le `amount` et le `timestamp` de l'opération.

```
struct Staker {
    address user;
    Stake[] stakes;
}

struct Stake {
    uint256 amount;
    uint256 since;
}
```
