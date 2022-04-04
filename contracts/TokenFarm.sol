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

    /// @notice Only a specific ERC-20 token is allowed to be staked in this contract
    address public allowedToken;
    /// @notice Chainlink price feed to chack the value of our staked token in dollars (DAI/USD)
    address public priceFeedAddress;

    /// @notice Stores all current stakers addresses
    address[] public stakers;

    /// @notice This struct will contain the amount staked and a timestamp, the date of staking
    struct Stake {
        uint256 amount;
        uint256 since;
    }
    /// @notice This struct will contain the global staking balance and the number of stakes per user
    struct StakeSummary {
        uint256 balance;
        uint256 rewardBalance;
    }
    /// @notice stakeHolders is used to keep track of the stakes made by each users
    mapping(address => Stake[]) public stakeHolders;
    /// @notice stakeSummaries is used to aggregate staking information for each users
    mapping(address => StakeSummary) public stakeSummaries;

    /// @notice Staked event is triggered whenever a user stakes tokens, address is indexed to make it filterable
    event Staked(address indexed user, uint256 timestamp, uint256 amount);
    /// @notice Unstaked event is triggered whenever a user unstakes tokens, address is indexed to make it filterable
    event Unstaked(
        address indexed user,
        uint256 timestamp,
        uint256 rewardAmount
    );

    event Debug(uint256 amount, bool isOk);

    constructor(address _dappTokenAddress) public {
        dappToken = IERC20(_dappTokenAddress);
    }

    function approveSpender(uint256 amount, address token) public {
        IERC20(token).approve(address(this), amount);
    }

    /// @notice stakeTokens is used to stake a token amount from a user
    function stake(uint256 amount, address token) public {
        require(token == allowedToken, "ERC20 Token not allowed");
        require(amount > 0, "Amount cannot be empty");

        // We need to approve this transfer because the contract is not the owner of those tokens
        IERC20(token).transferFrom(msg.sender, address(this), amount);

        // Keep track of each user stakes
        stakeHolders[msg.sender].push(Stake(amount, block.timestamp));

        // Update user staking summary
        StakeSummary storage userStakeSummary = stakeSummaries[msg.sender];
        userStakeSummary.balance = userStakeSummary.balance + amount;

        emit Staked(msg.sender, block.timestamp, amount);
    }

    /// @notice Used to withdraw a specific stake
    function withdraw(uint256 stakeIndex) public {
        // Fetch user stake summary
        StakeSummary storage userStakeSummary = stakeSummaries[msg.sender];
        require(userStakeSummary.balance > 0, "You need to stake first");

        // Grab the desired Stake with the given index
        Stake memory selectedStake = stakeHolders[msg.sender][stakeIndex];

        require(selectedStake.amount > 0, "Selected stake is invalid");

        // Issue reward
        uint256 rewardAmount = computeRewardTokenAmount(selectedStake);
        dappToken.transfer(msg.sender, rewardAmount);

        // Contract is the owner so we don't need approval step
        IERC20(allowedToken).transfer(msg.sender, selectedStake.amount);

        // Update sender staking information
        userStakeSummary.balance =
            userStakeSummary.balance -
            selectedStake.amount;
        userStakeSummary.rewardBalance =
            userStakeSummary.rewardBalance +
            rewardAmount;

        // Finally remove sender from our stakers array
        Stake[] storage userStakes = stakeHolders[msg.sender];

        userStakes[stakeIndex] = userStakes[userStakes.length - 1]; // overwrite it with the last struct
        userStakes[userStakes.length - 1] = selectedStake; // overwrite the last struct with the struct we want to delete
        userStakes.pop(); // remove the last struct (which should be the one we want to delete)

        emit Unstaked(msg.sender, block.timestamp, rewardAmount);
    }

    /// @notice Returns the staked tokens value in dollars
    function getStakingBalanceValue(address user)
        public
        view
        returns (uint256)
    {
        StakeSummary storage userStakeSummary = stakeSummaries[user];
        if (userStakeSummary.balance == 0) {
            return 0;
        }

        (uint256 price, uint256 decimals) = getTokenDollarValue();
        return ((userStakeSummary.balance * price) / (10**decimals));
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
    function computeRewardTokenAmount(Stake memory selectedStake)
        internal
        view
        returns (uint256)
    {
        if (selectedStake.amount == 0) {
            return 0;
        }

        uint256 interest = computeStakeInterest(
            selectedStake.amount,
            selectedStake.since,
            block.timestamp
        );

        (uint256 price, uint256 decimals) = getTokenDollarValue();
        uint256 interestValue = ((interest * price) / (10**decimals));

        return interestValue / DAPP_PRICE;
    }

    /// @notice Compute the stake interest based on the duration of the active stake
    function computeStakeInterest(
        uint256 amount,
        uint256 startTime,
        uint256 endTime
    ) public pure returns (uint256) {
        if (amount == 0) {
            return 0;
        }

        // First calculate how long the stake has been active
        // Use current seconds since epoch - the seconds since epoch the stake was made
        // The output will be duration in SECONDS ,
        // We will reward the user 0.1% per Hour So thats 0.1% per 3600 seconds
        // the alghoritm is  seconds = endTime - start stake time (in seconds)
        // hours = seconds / 3600 (seconds /3600) 3600 is an variable in Solidity names hours
        // we then multiply each token by the hours staked , then divide by the rewardPerHour rate
        uint256 stakePeriodInSeconds = endTime - startTime;
        uint256 stakePeriodInHours = stakePeriodInSeconds / 3600;
        uint256 stakerBalanceByHours = stakePeriodInHours * amount;
        uint256 reward = stakerBalanceByHours / rewardPerHour;

        return reward;
    }

    /// @notice Return the current sender DappToken balance
    function getDappTokenBalance() public view returns (uint256) {
        return dappToken.balanceOf(msg.sender);
    }

    /// @notice Return the all stakes for a specific user
    function getStakes() public view returns (Stake[] memory) {
        return stakeHolders[msg.sender];
    }
}
