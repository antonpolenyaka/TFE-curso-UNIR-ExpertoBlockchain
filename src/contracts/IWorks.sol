// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

interface IWorks {
    // =============================== Structs & Enums ============================================

    struct WorkInfo {
        uint256 id;
        uint256 plotId;
        uint256 dronId;
        uint256 tokensToPay;
        uint256 timestampCreate;
        uint256 timestampWorkFinished;
        bool payed;
    }

    // =============================== Events =============================================

    event PlotAlreadyFumigated(
        uint256 plotId_,
        uint256 dronId_,
        uint256 tokensPayed_
    );
    event NewWorkAdded(uint256 plotId_, uint256 dronId_, uint256 tokensToPay_);

    // =============================== Methods ============================================

    function addWork(uint256 plotId_, uint256 dronId_) external;

    function getNotFinishedWorks(address managerFirm_)
        external
        returns (uint256[] memory);

    function doFumigationWork(uint256 workId_) external;

    function balanceTokens() external view returns (uint256);

    function getWorkInfo(uint256 workId_)
        external
        view
        returns (WorkInfo memory);
}
