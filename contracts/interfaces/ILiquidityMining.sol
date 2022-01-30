// SPDX-License-Identifier: MIT

pragma solidity 0.8.11;

interface ILiquidityMining {
    function claimRewards(
        address[] memory holders,
        address[] memory cTokens,
        address[] memory rewards,
        bool borrowers,
        bool suppliers
    ) external;

    function rewardSupplySpeeds(address, address)
        external
        view
        returns (
            uint256,
            uint256,
            uint256
        );

    function rewardTokensMap(address) external view returns (bool);
}
