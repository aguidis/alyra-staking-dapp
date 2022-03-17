const { assert } = require('chai')
const truffleAssert = require('truffle-assertions')

const DappToken = artifacts.require("DappToken")
const MockERC20Token = artifacts.require("mockERC20Token")
const TokenFarm = artifacts.require("TokenFarm")

function tokens(n) {
    return web3.utils.toWei(n, "ether");
}

contract("TokenFarm", async accounts => {
    let dappToken, mockERC20Token, tokenFarm

    const owner = accounts[0]
    const alice = accounts[1]

    before(async () => {
        // Load Contracts
        dappToken = await DappToken.new()
        mockERC20Token = await MockERC20Token.new()
        tokenFarm = await TokenFarm.new(dappToken.address)

        // Transfer 100 mockERC20Token tokens to alice
        await mockERC20Token.transfer(alice, tokens("100"))

        // Transfer 900 Dapp tokens to farm (owner will keep 100 tokens)
        await dappToken.transfer(tokenFarm.address, tokens("900"))

        // Set allowed token in TokenFarm
        await tokenFarm.setAllowedToken(mockERC20Token.address)
    });

    describe("Dapp Token deployment", async () => {
        it("has a name", async () => {
            const name = await dappToken.name()
            assert.equal(name, "DApp Token")
        });

        it("Owner has 100 tokens", async () => {
            let balance = await dappToken.balanceOf(owner);
            assert.equal(balance.toString(), tokens("100"))
        });
    });

    describe("mockERC20Token Token deployment", async () => {
        it("has a name", async () => {
            const name = await mockERC20Token.name();
            assert.equal(name, "Mock ERC20");
        });

        it("Alice has 100 tokens", async () => {
            let balance = await mockERC20Token.balanceOf(alice)
            assert.equal(balance.toString(), tokens("100"))
        });
    });

    describe("Token Farm deployment", async () => {
        it("tokenFarm has tokens", async () => {
            let balance = await dappToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(), tokens("900"))
        });

        it("allowed token is defined", async () => {
            const allowedToken = await tokenFarm.allowedToken()
            assert.equal(allowedToken, mockERC20Token.address)
        });
    });

    describe("Staking", async () => {
        it("cannot stake not allowed token", async () => {
            try {
                const amountToStake = tokens("10")
                await tokenFarm.stakeTokens(amountToStake, dappToken.address, { from: owner })
            } catch (error) {
                assert.equal(error.reason, "ERC20 Token not allowed");
            }
        });

        it("cannot stake empty amount", async () => {
            try {
                await tokenFarm.stakeTokens(0, mockERC20Token.address, { from: alice })
            } catch (error) {
                assert.equal(error.reason, "Amount cannot be empty");
            }
        });

        it("Alice can stake 50 mERC tokens", async () => {
            const amountToStake = tokens("50")

            await mockERC20Token.approve(tokenFarm.address, amountToStake, { from: alice })
            const result = await tokenFarm.stakeTokens(amountToStake, mockERC20Token.address, { from: alice })

            truffleAssert.eventEmitted(
                result,
                "Staked",
                (ev) => {
                    // In here we can do our assertion on the ev variable (its the event and will contain the values we emitted)
                    assert.equal(ev.amount, amountToStake, "Stake amount in event was not correct");
                    return true
                },
                "Staked event should have triggered")

            const aliceStakingBalance = await tokenFarm.stakingBalance(alice)

            assert.equal(aliceStakingBalance, amountToStake)
        });

        it("Alice wins 0,1 interests after staking 50 tokens for 2 hours", async () => {
            // Now + 2 hours
            const now = Math.floor(Date.now() / 1000);
            const nowPlus2Hours = now + 7200;

            const estimatedInterest = await tokenFarm.computeStakeInterest(alice, nowPlus2Hours)

            assert.equal(0.1, web3.utils.fromWei(estimatedInterest, 'ether'))
        });
    });
});
