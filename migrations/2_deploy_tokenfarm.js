const DappToken = artifacts.require("DappToken");
const TokenFarm = artifacts.require("TokenFarm");

module.exports = async function (deployer, network, accounts) {
    // Deploy TokenFarm
    const dappToken = await DappToken.deployed();
    await deployer.deploy(TokenFarm, dappToken.address);
    const tokenFarm = await TokenFarm.deployed();
    await dappToken.transfer(tokenFarm.address, "1000000000000000000000000");

    // @see https://docs.chain.link/docs/ethereum-addresses/
    if (network.startsWith("kovan")) {
        // FAU Token address - Pretending FAU is DAI
        await tokenFarm.setAllowedToken("0xFab46E002BbF0b4509813474841E0716E6730136");
        // DAI/USD
        await tokenFarm.setPriceFeedAddress("0x777A68032a88E5A84678A77Af2CD65A7b3c0775a");
    }
};
