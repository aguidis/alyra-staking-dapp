// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DappToken is ERC20 {
    constructor() ERC20("DApp Token", "DAPP") {
        // Fixed supply : 1000 tokens
        // @link https://vitto.cc/how-to-create-and-deploy-an-erc20-token-in-20-minutes/#note-on-decimals
        _mint(msg.sender, 1000 * 10**18);
    }
}
