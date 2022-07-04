// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "./IPesticides.sol";

interface IPlot is IPesticides {
    // =============================== Structs & Enums ============================================

    struct PlotInfo {
        uint256 id;
        string name;
        uint256 allowedMaximumFlightHeight;
        uint256 allowedMinimumFlightHeight;
        Pesticides allowedPesticide;
    }

    // =============================== Events =============================================

    event NewPlotAdded(address owner, uint256 plotId);

    // =============================== Methods ============================================

    function addPlot(
        string memory name_,
        uint256 minHeight_,
        uint256 maxHeight_,
        Pesticides pesticide_
    ) external;

    function getPlotOwner(uint256 plotId_) external view returns (address);

    function getPlotInfo(uint256 plotId_)
        external
        view
        returns (PlotInfo memory);
}
