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


// Right click on the script name and hit "Run" to execute
(async () => {
    try {
        console.log('Running deployWithEthers script...')

        const contractName = 'DappToken' // Change this for other contract
        const constructorArgs = []    // Put constructor args (if any) here for your contract

        // Note that the script needs the ABI which is generated from the compilation artifact.
        // Make sure contract is compiled and artifacts are generated
        const artifactsPath = `browser/contracts/artifacts/${contractName}.json` // Change this for different path

        const metadata = JSON.parse(await remix.call('fileManager', 'getFile', artifactsPath))
        // 'web3Provider' is a remix global variable object
        const signer = (new ethers.providers.Web3Provider(web3Provider)).getSigner()

        let factory = new ethers.ContractFactory(metadata.abi, metadata.data.bytecode.object, signer);

        let contract = await factory.deploy(...constructorArgs);

        console.log('DappToken Contract Address: ', contract.address);

        // The contract is NOT deployed yet; we must wait until it is mined
        await contract.deployed()
        console.log('Deployment successful.')
    } catch (e) {
        console.log(e.message)
    }
})()
