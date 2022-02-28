// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenFarm is ChainlinkClient, Ownable {
    uint8 constant DAPP_PRICE = 100;

    string public name = "Dapp Token Farm";
    IERC20 public dappToken;

    mapping(address => uint256) public stakingBalance;
    mapping(address => uint256) public stakingStartTime;
    mapping(address => uint256) public rewardBalance;

    address public priceFeedAddress;

    address allowedToken;
    address[] public stakers;

    /**
     * @notice
      rewardPerHour is 1000 because it is used to represent 0.001, since we only use integer numbers
      This will give users 0.1% reward for each staked token / H
     */
    uint256 internal rewardPerHour = 1000;

    constructor(address _dappTokenAddress) public {
        dappToken = IERC20(_dappTokenAddress);
    }

    function setAllowedToken(address token) public onlyOwner {
        allowedToken = token;
    }

    function setPriceFeedAddress(address priceFeed) public onlyOwner {
        priceFeedAddress = priceFeed;
    }

    function stakeTokens(uint256 amount, address token) public {
        require(amount > 0, "amount cannot be 0");
        require(allowedToken == token, "token not allowed");
        require(
            stakingBalance[msg.sender] == 0,
            "You must unstake before staking again"
        );

        // We need to approve this transfer because the contract is not the owner of those tokens
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + amount;

        // block.timestamp = timestamp of the current block in seconds since the epoch
        uint256 timestamp = block.timestamp;
        stakingStartTime[msg.sender] = timestamp;

        stakers.push(msg.sender);

        // TODO Emit eventz
    }

    function unstakeTokens() public {
        uint256 balance = stakingBalance[msg.sender];

        require(balance > 0, "staking balance cannot be 0");

        // Issue reward
        uint256 rewardTokenAmout = computeRewardTokenAmount(msg.sender);
        dappToken.transfer(msg.sender, rewardTokenAmout);

        // Contract is the owner so we don't need approval step
        IERC20(allowedToken).transfer(msg.sender, balance);

        // Reset sender staking information
        stakingBalance[msg.sender] = 0;
        stakingStartTime[msg.sender] = 0;

        // TODO emit event
    }

    function computeRewardTokenAmount(address user)
        internal
        view
        returns (uint256)
    {
        if (stakingBalance[user] == 0) {
            return 0;
        }

        uint256 interest = calculateStakeInterest(user);

        (uint256 price, uint256 decimals) = getTokenDollarValue();
        uint256 interestValue = ((interest * price) / (10**decimals));

        return interestValue / DAPP_PRICE;
    }

    /**
     *
     * Issue reward based off the value of those token
     * Il faut stocker la date de stacking par token par user
     * On va dire que chaque token staké rapporte 10% par jour
     * et que le token de récompense = 0.1ETH
     * U = stakend token amount
     * valeur du token stacké en $ = U x 0,1 x Nb Jours stacked x Prix Token/ETH
     * nombre de token de récompense = valeur du token stacké en ETH / 0.1
     *
     * @notice
     * calculateStakeReward is used to calculate how much a user should be rewarded for their stakes
     * and the duration the stake has been active
     */
    function calculateStakeInterest(address staker)
        internal
        view
        returns (uint256)
    {
        // First calculate how long the stake has been active
        // Use current seconds since epoch - the seconds since epoch the stake was made
        // The output will be duration in SECONDS ,
        // We will reward the user 0.1% per Hour So thats 0.1% per 3600 seconds
        // the alghoritm is  seconds = block.timestamp - stake seconds (block.timestap - _stake.since)
        // hours = Seconds / 3600 (seconds /3600) 3600 is an variable in Solidity names hours
        // we then multiply each token by the hours staked , then divide by the rewardPerHour rate
        uint256 stakerBalance = stakingBalance[staker];
        uint256 stakerStartTime = stakingStartTime[staker];
        uint256 totalSecondsStacked = block.timestamp - stakerStartTime;
        uint256 stakerBalanceByHours = (totalSecondsStacked / 1 hours) *
            stakerBalance;

        return stakerBalanceByHours / rewardPerHour;
    }

    function getStakingBalanceValue(address user)
        public
        view
        returns (uint256)
    {
        if (stakingBalance[user] == 0) {
            return 0;
        }

        (uint256 price, uint256 decimals) = getTokenDollarValue();
        return ((stakingBalance[user] * price) / (10**decimals));
    }

    function getTokenDollarValue() public view returns (uint256, uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            priceFeedAddress
        );
        (, int256 price, , , ) = priceFeed.latestRoundData();
        uint256 decimals = uint256(priceFeed.decimals());
        return (uint256(price), decimals);
    }
}
