// SPDX-License-Identifier: MIT

//                        @@.
//                    .---@@=--                                              ---.
//             :    =**###@@###*-                       .:.               =%%@@@@%%+.
//             @#:   -=   @@.   =##=                   *@@%#+           :#@@@@@@@@@@@=
// *@@@@@@@*+  @@#.  =@%  @@. =@@+*%*                *@@@@#*@*          -@@@@-   :*@@@%
// @@@*---+@@# -@@:  =@%  @*  *@%*#@@   *     -**+  +@@=.  .+@%         .=@@*      .+@@#
// @@*.     .@@ =%+=%@@%  @=  *@+  .=- .@.   =#+#@  %@@.    :@%           *@@       .#@#
// @@=.      #@  =*%@@*.  @@. .+#++%@= =@%. +@= =@  %@@+.   :%+   --       :*%+=.    -@.
// @@*:      +@    +@@*   #@.   .::::  @@@: *%==%@  :*@@%:  .=  -**@%+.   -- :+@%#+-::+
// #@@-     .@@    +@@*   .@.   -=:.   @@@: =%@@%@    #@@-     #@= .#@%+  %@:  :+@@@@+.
//  #@*    :*@+    :%@*.  *%    =@@%+  @@@:  .=:.-    -=##=    %@*..+%@*  -@@    -*@@@@-
//  #@#+++*@@@@++.  *@@%  @+     *@@@  @@@*:            *@@+    =%@@@*:   -@@      :+@@=
//  #@@@@@@++++@@*   +@%  @+    :%@@@@=% %@=      +@@+.  *@+     -        -@@  -=%=  .*@@@=.
//  #@=         @@:  +@%  @     .#@#.@@% %@=    +@@*.    *@+   -@@@=      @@@  %@-     #@@@@.
//   %+         @@:  +@%  @%    +@@# #@% .%*   -@@.      *@*.  @@@@@@-    @@@ =@@=.    =@@@@@
//   #@:        @@-  +@*  @@    +@@* .%#  #@-   +@:.     *@@#  @@@%@@%=.  %@@  %@@@+:=%@@@@@@
//   +%:        -%+.-#+   =@    +@*       #@-  .%@@@*    *@*:  @@@ :%@@@**#@@  %@@@@@@@@@@@@@
//    *@%**%*@@@@@#:      *@    +@*        +@+ .==@@@@@@@@@+   @@@   :#@@@@@@    :*@@@@@@@@@+
//   -=======-            @@    +@*        +@+     =@@@@*.     @@:    :*@@@@@      :======
//                        @@    +@*         *+                 @=      .**@@@
//                        @:    -=.         *+                 *:         ***

import "./abstract/ReaperBaseStrategy.sol";
import "./interfaces/IUniswapRouter.sol";
import "./interfaces/IPaymentRouter.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

pragma solidity 0.8.9;

/**
 * @dev This is a strategy to stake Boo into xBoo, and then stake xBoo in different pools to collect more rewards
 * The strategy will compound the pool rewards into Boo which will be deposited into the strategy for more yield.
 */
contract ReaperAutoCompoundScreamFlashloan is ReaperBaseStrategy {
    using SafeERC20 for IERC20;

    /**
     * @dev Tokens Used:
     * {WFTM} - Required for liquidity routing when doing swaps. Also used to charge fees on yield.
     * {WANT} - Token the strategy will grow
     * {SC_WANT} - Scream Token of the token manipulated in the strategy.
     * {REWARD_TOKEN} - Rewarded token to compound into the strategy.
     */
    IERC20 public constant WFTM =
        IERC20(0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83);
    IERC20 public WANT; //todo immutabe
    IERC20 public SC_WANT; //todo immutabe
    IERC20 public constant REWARD_TOKEN =
        IERC20(0xC5e2B037D30a390e62180970B3aa4E91868764cD);

    /**
     * @dev Third Party Contracts:
     * {UNI_ROUTER} - the UNI_ROUTER for target DEX
     * {SCREAM_COMPTROLLER} - Comptroller the strategy will interface with for borrowing and lending operations
     */
    address public constant UNI_ROUTER =
        0xF491e7B69E4244ad4002BC14e878a34207E38c29;
    address public constant SCREAM_COMPTROLLER =
        0x260E596DAbE3AFc463e75B6CC05d8c46aCAcFB09;

    /**
     * @dev Routes we take to swap tokens
     * {wftmToWantRoute} - Route we take to get from {WFTM} into {WANT}.
     */
    address[] public wftmToWantRoute;
    address[] public rewardTokenToWftmRoute = [
        address(REWARD_TOKEN),
        address(WFTM)
    ];

    /**
     * @dev Initializes the strategy. Sets parameters, saves routes, and gives allowances.
     * @notice see documentation for each variable above its respective declaration.
     */
    constructor(
        address _vault,
        address[] memory _feeRemitters,
        address[] memory _strategists
    ) ReaperBaseStrategy(_vault, _feeRemitters, _strategists) {
        _giveAllowances();
    }

    //CORE FUNCTIONS

    /**
     * @dev Function that puts the funds to work.
     * It gets called whenever someone deposits in the strategy's vault contract.
     * It deposits {WANT} to mint(SC_WANT), deposit and borrow
     * for {SC_WANT} rewards and {REWARD_TOKEN}
     */
    function deposit() public whenNotPaused {
        uint256 wantBal = WANT.balanceOf(address(this));
        // todo Should I FlashLoan?
        //          Yes: FlashLoan and deposit
        //          No: Leverage and deposit
    }

    /**
     * @dev Withdraws funds and sends them back to the vault.
     * It withdraws {SC_WANT} from the market and deleverages accordingly to get back to the target LTV.
     * Redeems the underlying {WANT} token
     */
    function withdraw(uint256 _amount) external {}

    /**
     * @dev Core function of the strat, in charge of collecting and re-investing rewards.
     * 1. Claims {REWARD_TOKEN} from the comptroller.
     * 2. Swaps {REWARD_TOKEN} to {WFTM}.
     * 2. Adjusts the position if necessary.
     * 3. Claims fees for the harvest caller and treasury.
            The strat does not need to try to claim fees from the {WANT} as borrow APY > lending APY
     * 4. Swaps the {WFTM} token for {WANT}
     * 5. Deposits.
     */
    function _harvestCore() internal override {
        //todo
        //  _claimRewards();
        //  profit = _swapRewardToWftm();
        //  profit = _adjustPosition(profit);
        //  _chargeFees(profit);
        //  _swapToWant();
        //  deposit();
    }

    /**
     * @dev Gives max allowance of {WANT} to the {SC_WANT} contract,
     * {REWARD_TOKEN} allowance for the {UNI_ROUTER} contract.
     */
    function _giveAllowances() internal {
        IERC20(WANT).safeApprove(address(SC_WANT), type(uint256).max);
        IERC20(REWARD_TOKEN).safeApprove(UNI_ROUTER, type(uint256).max);
    }

    /**
     * @dev Removes all allowance.
     */
    function _removeAllowances() internal {
        IERC20(WANT).safeApprove(address(SC_WANT), 0);
        IERC20(REWARD_TOKEN).safeApprove(UNI_ROUTER, 0);
    }

    //VIEW FUNCTIONS

    /**
     * @dev Returns the approx amount of profit from harvesting.
     *      Profit is denominated in {WFTM}, and takes fees into account.
     */
    function estimateHarvest()
        external
        view
        override
        returns (uint256 profit, uint256 callFeeToUser)
    {}

    /**
     * @dev Function to calculate the total underlying {WANT} held by the strat.
     * It takes into account both the funds in hand, as the funds in the market
     */
    function balanceOf() public view override returns (uint256) {
        return 0;
    }

    // ADMIN FUNCTIONS

    /**
     * @dev Function that has to be called as part of strat migration. It sends all the available funds back to the
     * vault, ready to be migrated to the new strat.
     */
    function retireStrat() external {}

    /**
     * @dev Pauses deposits. Withdraws all funds from the AceLab contract, leaving rewards behind.
     */
    function panic() public {
        _onlyStrategistOrOwner();
        pause();
    }

    /**
     * @dev Pauses the strat.
     */
    function pause() public {
        _onlyStrategistOrOwner();
        _pause();
        _removeAllowances();
    }

    /**
     * @dev Unpauses the strat.
     */
    function unpause() external {
        _onlyStrategistOrOwner();
        _unpause();

        _giveAllowances();

        deposit();
    }
}
