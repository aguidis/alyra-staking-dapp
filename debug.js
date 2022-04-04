const { ethers } = require("ethers")
const Artifact = require("./client/src/contracts/TokenFarm.json")

// For example here, interact with Alchemy JSON-RPC
const provider = new ethers.providers
    .JsonRpcProvider("HTTP://127.0.0.1:7545");

const contractAddress = "0xb9ca4fDE5cE9f9e3Cd22caaAa8a6469023D5c493";

const contract = new ethers.Contract(
    contractAddress,
    Artifact.abi,
    provider
);

// Call a getter method
contract.getStakes({ from: '0x757E71eA0845e9c063C7c21113b254690A1fb1f3' }).then((response) => {
    console.log(response);
});

