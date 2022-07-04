// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "./external/ERC721Enumerable.sol";
import "./external/Counters.sol";
import "./IDron.sol";

contract Dron is IDron, ERC721Enumerable {
    // =============================== Usings =============================================

    using Counters for Counters.Counter;

    // =============================== Properties =========================================

    Counters.Counter private _tokenIds;
    mapping(uint256 => DronInfo) private _dronIdToInfo;

    // =============================== Constructors =======================================

    constructor() ERC721("Dron", "Dron") {
        _tokenIds.increment(); // Not accept id 0
    }

    // =============================== Methods ============================================

    function addDron(
        string memory name_,
        uint256 maxHeight_,
        uint256 minHeight_,
        uint256 price_,
        Pesticides pesticide_
    ) external {
        // Check
        require(bytes(name_).length > 0, "ERROR: Name is blank!");
        require(minHeight_ > 0, "ERROR: Min flight = 0!");
        require(maxHeight_ > minHeight_, "ERROR: Min flight <= max!");
        require(price_ > 0, "ERROR: Price = 0!");
        // Work
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _dronIdToInfo[newItemId] = DronInfo({
            id: newItemId,
            name: name_,
            minimumFlightHeight: minHeight_,
            maximumFlightHeight: maxHeight_,
            price: price_,
            pesticide: pesticide_
        });
        _tokenIds.increment();

        emit NewDronAdded(msg.sender, newItemId);
    }

    function getDronOwner(uint256 dronId_) external view returns (address) {
        return ownerOf(dronId_);
    }

    function checkDronExist(uint256 dronId_) external view returns (bool) {
        require(
            dronId_ > 0 && dronId_ < _tokenIds.current(),
            "ERROR: Id = 0 or > max counter"
        );
        DronInfo memory dron = _dronIdToInfo[dronId_];
        bool dronExist = dron.id == dronId_;
        return dronExist;
    }

    function getDronWorkPrice(uint256 dronId_) external view returns (uint256) {
        return _dronIdToInfo[dronId_].price;
    }

    function getDronInfo(uint256 dronId_)
        external
        view
        returns (DronInfo memory)
    {
        return _dronIdToInfo[dronId_];
    }
}
