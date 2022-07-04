// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "./external/Counters.sol";
import "./Dron.sol";
import "./Plot.sol";
import "./FumigationDronToken.sol";
import "./IWorks.sol";

contract Works is IWorks {
    // =============================== Usings =============================================

    using Counters for Counters.Counter;

    // =============================== Properties =========================================

    Counters.Counter private _workIds;
    mapping(uint256 => WorkInfo) private _workIdToInfo;
    Plot public immutable plotContract;
    Dron public immutable dronContract;
    FumigationDronToken public immutable token;
    // Key - manager firm wallet, value - list of work id's pending to do
    mapping(address => uint256[]) private _notFinishedWorks;

    // =============================== Constructors =======================================

    constructor(
        address plotContractAddress_,
        address dronContractAddress_,
        address fumigationDronTokenAddress_
    ) {
        plotContract = Plot(plotContractAddress_);
        dronContract = Dron(dronContractAddress_);
        token = FumigationDronToken(fumigationDronTokenAddress_);
        _workIds.increment(); // Not accept 0 id
    }

    // =============================== Modifiers ==========================================

    modifier onlyPlotOwner(uint256 plotId_) {
        address plotOwner = plotContract.getPlotOwner(plotId_);
        require(plotOwner == msg.sender, "ERROR: only owner of plot!");
        _;
    }

    modifier onlyDronOwner(uint256 workId_) {
        WorkInfo memory work = _workIdToInfo[workId_];
        address dronOwner = dronContract.getDronOwner(work.dronId);
        require(dronOwner == msg.sender, "ERROR: only owner of dron!");
        _;
    }

    // =============================== Methods ============================================

    function addWork(uint256 plotId_, uint256 dronId_)
        external
        onlyPlotOwner(plotId_)
    {
        // Check input data
        require(plotId_ > 0, "ERROR: plot id = 0!");
        require(dronId_ > 0, "ERROR: dron id = 0!");
        bool dronExist = dronContract.checkDronExist(dronId_);
        require(dronExist, "ERROR: dron with this id don't exist");
        // Check hight min/max plot and dron, if is compatibility for work
        IDron.DronInfo memory dron = dronContract.getDronInfo(dronId_);
        IPlot.PlotInfo memory plot = plotContract.getPlotInfo(plotId_);
        require(
            dron.maximumFlightHeight >= plot.allowedMinimumFlightHeight,
            "ERROR: The minimum flight height!"
        );
        require(
            dron.minimumFlightHeight <= plot.allowedMaximumFlightHeight,
            "ERROR: The maximum flight height!"
        );
        require(
            dron.pesticide == plot.allowedPesticide,
            "ERROR: The type of pesticide!"
        );

        // Create new work
        uint256 newItemId = _workIds.current();
        _workIdToInfo[newItemId] = WorkInfo({
            id: newItemId,
            plotId: plotId_,
            dronId: dronId_,
            tokensToPay: dron.price,
            timestampCreate: block.timestamp,
            timestampWorkFinished: 0,
            payed: false
        });
        _workIds.increment();
        address dronManagerFirm = dronContract.getDronOwner(dronId_);
        _notFinishedWorks[dronManagerFirm].push(newItemId);

        // Transfer tokens from plot owner to contract like block tokens to pay to dron owner
        token.transferFromTo(msg.sender, address(this), dron.price);

        emit NewWorkAdded(plotId_, dronId_, dron.price);
    }

    function getNotFinishedWorks(address managerFirm_)
        external
        view
        returns (uint256[] memory)
    {
        return _notFinishedWorks[managerFirm_];
    }

    function _getWorkIndexFromArray(uint256 workId_, uint256[] memory list_)
        internal
        pure
        returns (bool, uint256)
    {
        uint256 workIndex = 0;
        bool exist = false;
        for (uint256 i = 0; i < list_.length; i++) {
            if (list_[i] == workId_) {
                exist = true;
                workIndex = i;
                break;
            }
        }
        return (exist, workIndex);
    }

    function _removeWorkFromNotFinished(uint256 workId_, address managerFirm)
        internal
    {
        uint256[] storage works = _notFinishedWorks[managerFirm];
        if (works.length > 0) {
            (bool exist, uint256 workIndex) = _getWorkIndexFromArray(
                workId_,
                works
            );
            if (exist) {
                works[workIndex] = works[works.length - 1];
                works.pop();
            }
        }
    }

    function doFumigationWork(uint256 workId_) external onlyDronOwner(workId_) {
        // Check input data
        WorkInfo storage work = _workIdToInfo[workId_];
        require(work.id == workId_, "ERROR: Not exist!");
        require(work.payed == false, "ERROR: Already payed!");
        // Set work is finished
        work.timestampWorkFinished = block.timestamp;
        address dronManagerFirm = dronContract.getDronOwner(work.dronId);
        _removeWorkFromNotFinished(workId_, dronManagerFirm);
        // Pay for work
        work.payed = true;
        token.transfer(dronManagerFirm, work.tokensToPay);
        // Emit event
        emit PlotAlreadyFumigated(work.plotId, work.dronId, work.tokensToPay);
    }

    function balanceTokens() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function getWorkInfo(uint256 workId_)
        external
        view
        returns (WorkInfo memory)
    {
        return _workIdToInfo[workId_];
    }
}
