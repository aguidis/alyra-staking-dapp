const DappToken = artifacts.require("DappToken");
const MockERC20 = artifacts.require("MockERC20");
const TokenFarm = artifacts.require("TokenFarm");

function tokens(n) {
    return web3.utils.toWei(n, "ether");
}

contract("TokenFarm", async accounts => {
    let dappToken, mockERC20, tokenFarm;

    const alice = accounts[1]

    before(async () => {
        // Load Contracts
        dappToken = await DappToken.new();
        mockERC20 = await MockERC20.new();
        tokenFarm = await TokenFarm.new(dappToken.address);

        // Transfer 100 MockERC20 tokens to owner
        await mockERC20.transfer(alice, tokens("100"));

        // Transfer all Dapp tokens to farm (1000 tokens)
        await dappToken.transfer(tokenFarm.address, tokens("1000"));

        // Set allowed token in TokenFarm
        await tokenFarm.setAllowedToken(mockERC20.address)
    });

    describe("Dapp Token deployment", async () => {
        it("has a name", async () => {
            const name = await dappToken.name();
            assert.equal(name, "DApp Token");
        });
    });

    describe("mockERC20 Token deployment", async () => {
        it("has a name", async () => {
            const name = await mockERC20.name();
            assert.equal(name, "Mock ERC20");
        });

        it("Alice has 100 tokens", async () => {
            let balance = await mockERC20.balanceOf(alice);
            assert.equal(balance.toString(), tokens("100"));
        });
    });

    describe("Token Farm deployment", async () => {
        it("tokenFarm has tokens", async () => {
            let balance = await dappToken.balanceOf(tokenFarm.address);
            assert.equal(balance.toString(), tokens("1000"));
        });

        it("allowed token is defined", async () => {
            const allowedToken = await tokenFarm.allowedToken()
            assert.equal(allowedToken, mockERC20.address);
        });
    });

    describe("Staking", async () => {
        /*
        it("Staking 100x2", async () => {
            devToken = await DevToken.deployed();

            // Stake 100 is used to stake 100 tokens twice and see that stake is added correctly and money burned
            let owner = accounts[0];
            // Set owner, user and a stake_amount
            let stake_amount = 100;
            // Add som tokens on account 1 asweel
            await devToken.mint(accounts[1], 1000);
            // Get init balance of user
            balance = await devToken.balanceOf(owner)

            // Stake the amount, notice the FROM parameter which specifes what the msg.sender address will be

            stakeID = await devToken.stake(stake_amount, { from: owner });
            // Assert on the emittedevent using truffleassert
            // This will capture the event and inside the event callback we can use assert on the values returned
            truffleAssert.eventEmitted(
                stakeID,
                "Staked",
                (ev) => {
                    // In here we can do our assertion on the ev variable (its the event and will contain the values we emitted)
                    assert.equal(ev.amount, stake_amount, "Stake amount in event was not correct");
                    assert.equal(ev.index, 1, "Stake index was not correct");
                    return true;
                },
                "Stake event should have triggered");

        });
        */
    });
});
