// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

interface IFumigationDronToken {
    // =============================== Events =============================================

    event TokensBuyed(address wallet, uint256 amount);
    event TokensReturned(
        address wallet,
        uint256 tokensSelled,
        uint256 etherReturned
    );

    // =============================== Methods ============================================

    function tokenPrice(uint256 amount) external pure returns (uint256);

    function buy(uint256 amount) external payable;

    function sell(uint256 amount) external payable;

    function transferFromTo(
        address sender,
        address receiver,
        uint256 amount
    ) external;

    function myBalance() external view returns (uint256);
}
