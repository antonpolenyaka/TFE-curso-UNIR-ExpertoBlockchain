// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "./IPesticides.sol";

interface IDron is IPesticides {
    // =============================== Structs & Enums ============================================

    struct DronInfo {
        uint256 id;
        string name;
        uint256 minimumFlightHeight;
        uint256 maximumFlightHeight;
        uint256 price;
        Pesticides pesticide;
    }

    // =============================== Events =============================================

    event NewDronAdded(address owner, uint256 dronId);

    // =============================== Methods ============================================

    function addDron(
        string memory name_,
        uint256 maxHeight_,
        uint256 minHeight_,
        uint256 price_,
        Pesticides pesticide_
    ) external;

    function getDronOwner(uint256 dronId_) external view returns (address);

    function checkDronExist(uint256 dronId_) external view returns (bool);

    function getDronWorkPrice(uint256 dronId_) external view returns (uint256);

    function getDronInfo(uint256 dronId_)
        external
        view
        returns (DronInfo memory);
}
