// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "./external/ERC721Enumerable.sol";
import "./external/Counters.sol";
import "./IPlot.sol";

contract Plot is ERC721Enumerable, IPlot {
    // =============================== Usings =============================================

    using Counters for Counters.Counter;

    // =============================== Properties =========================================

    Counters.Counter private _tokenIds;
    mapping(uint256 => PlotInfo) private _plotIdToInfo;

    // =============================== Constructors =======================================

    constructor() ERC721("Plot", "Plot") {
        _tokenIds.increment(); // Not accept id 0
    }

    // =============================== Methods ============================================

    function addPlot(
        string memory name_,
        uint256 minHeight_,
        uint256 maxHeight_,
        Pesticides pesticide_
    ) external {
        // Check
        require(bytes(name_).length > 0, "ERROR: Name is blank!");
        require(minHeight_ > 0, "ERROR: Minimun flight = 0!");
        require(maxHeight_ > minHeight_, "ERROR: Min flight <= max!");
        // Work
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _plotIdToInfo[newItemId] = PlotInfo({
            id: newItemId,
            name: name_,
            allowedMinimumFlightHeight: minHeight_,
            allowedMaximumFlightHeight: maxHeight_,
            allowedPesticide: pesticide_
        });
        _tokenIds.increment();

        emit NewPlotAdded(msg.sender, newItemId);
    }

    function getPlotOwner(uint256 plotId_) external view returns (address) {
        return ownerOf(plotId_);
    }

    function getPlotInfo(uint256 plotId_)
        external
        view
        returns (PlotInfo memory)
    {
        return _plotIdToInfo[plotId_];
    }
}
