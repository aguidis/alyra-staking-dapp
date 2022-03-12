// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title A staking contract for the ERC-20 FAU token
/// @author Adrien Guidis
/// @notice You can use this contract for only the most basic ERC-20 staking simulation
/// @custom:experimental This is an educational project.
contract TokenFarm is ChainlinkClient, Ownable {
    IERC20 public dappToken;

    /// @notice The reward token DAPP's value is 100$
    uint8 constant DAPP_PRICE = 100;
    /// @notice It represents 0.001, since we only use integer numbers. This will give users 0.1% reward for each staked token / H
    uint16 constant rewardPerHour = 1000;

    /// @notice Only a spcific ERC-20 token is allowed to be staked in this contract
    address public allowedToken;
    /// @notice Chainlink price feed to chack the value of our staked token in dollars (DAI/USD)
    address public priceFeedAddress;

    /// @notice Stores all current stakers addresses
    address[] public stakers;
    /// @notice uniqueStaker is used to keep track of the INDEX for the stakers in the stakers array
    mapping(address => uint256) internal stakerIndexes;

    mapping(address => uint256) public stakingBalance;
    mapping(address => uint256) public stakingStartTime;
    mapping(address => uint256) public rewardBalance;

    /// @notice Staked event is triggered whenever a user stakes tokens, address is indexed to make it filterable
    event Staked(address indexed user, uint256 timestamp, uint256 amount);
    /// @notice Unstaked event is triggered whenever a user unstakes tokens, address is indexed to make it filterable
    event Unstaked(
        address indexed user,
        uint256 timestamp,
        uint256 amount,
        uint256 rewardAmount
    );

    event Debug(
        uint256 stakerStartTime,
        uint256 stakerEndTime,
        uint256 stakePeriodInSeconds,
        uint256 stakePeriodInHours,
        uint256 amount,
        uint256 stakerBalanceByHours,
        uint256 rewardAmount
    );

    constructor(address _dappTokenAddress) public {
        dappToken = IERC20(_dappTokenAddress);
    }

    /// @notice stakeTokens is used to stake a token amount from a user
    function stakeTokens(uint256 amount, address token) public {
        require(token == allowedToken, "ERC20 Token not allowed");
        require(amount > 0, "Amount cannot be empty");
        require(
            stakingBalance[msg.sender] == 0,
            "You must unstake before staking again"
        );

        // We need to approve this transfer because the contract is not the owner of those tokens
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + amount;

        // block.timestamp = timestamp of the current block in seconds since the epoch
        stakingStartTime[msg.sender] = block.timestamp;

        stakers.push(msg.sender);

        stakerIndexes[msg.sender] = stakers.length - 1;

        emit Staked(msg.sender, block.timestamp, amount);
    }

    /// @notice Used to withdraw stakes from the account holder
    function unstakeTokens() public {
        require(stakingBalance[msg.sender] > 0, "staking balance cannot be 0");

        // Issue reward
        uint256 rewardAmount = computeRewardTokenAmount(msg.sender);
        dappToken.transfer(msg.sender, rewardAmount);

        // Contract is the owner so we don't need approval step
        IERC20(allowedToken).transfer(msg.sender, stakingBalance[msg.sender]);

        // Reset sender staking information
        stakingBalance[msg.sender] = 0;
        stakingStartTime[msg.sender] = 0;

        // Finally remove sender from our stakers array
        uint256 stakerIndex = stakerIndexes[msg.sender];
        stakers[stakerIndex] = stakers[stakers.length - 1];
        stakers.pop();

        emit Unstaked(
            msg.sender,
            block.timestamp,
            stakingBalance[msg.sender],
            rewardAmount
        );
    }

    /// @notice Returns the staked tokens value in dollars
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

    /// @notice Returns the current DAI dollar price from Chailink price feed
    /// @dev The price calcultation is based the pair DAI/USD
    function getTokenDollarValue() public view returns (uint256, uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            priceFeedAddress
        );
        (, int256 price, , , ) = priceFeed.latestRoundData();
        uint256 decimals = uint256(priceFeed.decimals());
        return (uint256(price), decimals);
    }

    function setAllowedToken(address token) public onlyOwner {
        allowedToken = token;
    }

    function setPriceFeedAddress(address priceFeed) public onlyOwner {
        priceFeedAddress = priceFeed;
    }

    /// @notice Compute how much a user should be rewarded for their stake
    function computeRewardTokenAmount(address user)
        internal
        view
        returns (uint256)
    {
        if (stakingBalance[user] == 0) {
            return 0;
        }

        uint256 interest = computeStakeInterest(user, block.timestamp);

        (uint256 price, uint256 decimals) = getTokenDollarValue();
        uint256 interestValue = ((interest * price) / (10**decimals));

        return interestValue / DAPP_PRICE;
    }

    /// @notice Compute the stake interest based on the duration of the active stake
    function computeStakeInterest(address staker, uint256 endTime)
        public
        view
        returns (uint256)
    {
        if (stakingBalance[staker] == 0) {
            return 0;
        }

        // First calculate how long the stake has been active
        // Use current seconds since epoch - the seconds since epoch the stake was made
        // The output will be duration in SECONDS ,
        // We will reward the user 0.1% per Hour So thats 0.1% per 3600 seconds
        // the alghoritm is  seconds = endTime - start stake time (in seconds)
        // hours = seconds / 3600 (seconds /3600) 3600 is an variable in Solidity names hours
        // we then multiply each token by the hours staked , then divide by the rewardPerHour rate
        uint256 stakerBalance = stakingBalance[staker];
        uint256 stakerStartTime = stakingStartTime[staker];
        uint256 stakePeriodInSeconds = endTime - stakerStartTime;
        uint256 stakePeriodInHours = stakePeriodInSeconds / 3600;
        uint256 stakerBalanceByHours = stakePeriodInHours * stakerBalance;
        uint256 reward = stakerBalanceByHours / rewardPerHour;

        return reward;
    }
}
