const MockERC20Token = artifacts.require('test/MockERC20Token')
const DappToken = artifacts.require("DappToken");
const TokenFarm = artifacts.require("TokenFarm");

function tokens(n) {
    return web3.utils.toWei(n, "ether");
}

module.exports = async function (deployer, network, accounts) {
    // Deploy TokenFarm
    const dappToken = await DappToken.deployed();
    await deployer.deploy(TokenFarm, dappToken.address);
    const tokenFarm = await TokenFarm.deployed();
    await dappToken.transfer(tokenFarm.address, tokens("1000"));

    if (network.startsWith("develop")) {
        const alice = accounts[1]

        const mockERC20Token = await deployer.deploy(MockERC20Token);

        // Transfer 100 mockERC20Token tokens to alice
        await mockERC20Token.transfer(alice, tokens("100"))

        await tokenFarm.setAllowedToken(mockERC20Token.address);
    }

    // @see https://docs.chain.link/docs/ethereum-addresses/
    if (network.startsWith("kovan")) {
        // FAU Token address
        await tokenFarm.setAllowedToken("0xfab46e002bbf0b4509813474841e0716e6730136");
        // Pretending FAU is DAI - DAI/USD chainlink price feed
        await tokenFarm.setPriceFeedAddress("0x777A68032a88E5A84678A77Af2CD65A7b3c0775a");
    }
};
