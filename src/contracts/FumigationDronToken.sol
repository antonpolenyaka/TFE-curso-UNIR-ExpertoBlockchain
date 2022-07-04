// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "./external/ERC20.sol";
import "./external/Ownable.sol";
import "./IFumigationDronToken.sol";

contract FumigationDronToken is ERC20, Ownable, IFumigationDronToken {
    // =============================== Constructors =======================================

    constructor() ERC20("Fumigation Dron Token", "FDT") {}

    // =============================== Methods ============================================

    function decimals() public pure override returns (uint8) {
        return 2;
    }

    function tokenPrice(uint256 amount) public pure returns (uint256) {
        return (amount * 0.01 ether) / 10**decimals(); // amount X tokens to buy with 2 decimal
    }

    function buy(uint256 amount) external payable {
        // Calculate the cost of tokens
        uint256 cost = tokenPrice(amount);
        // It is required that the value of ethers paid is equivalent to the cost
        require(
            msg.value >= cost,
            "ERROR: Buy less"
        );
        // Difference to pay
        uint256 returnValue = msg.value - cost;
        // Difference transfer
        payable(msg.sender).transfer(returnValue);
        // Transfer of tokens to the buyer
        _mint(msg.sender, amount);
        // Issue the token purchase event
        emit TokensBuyed(msg.sender, amount);
    }

    function sell(uint256 amount) external payable {
        // The number of tokens to return must be greater than 0
        require(
            amount > 0,
            "ERROR: Amount = 0"
        );
        // The user/client must have the tokens they want to return
        uint256 accountTokens = balanceOf(msg.sender);
        require(
            amount <= accountTokens,
            "ERROR: Low balance"
        );
        // RETURN:
        // 1. The client returns the tokens
        // 2. The system pays the returned tokens in ethers
        //_transfer(sender, receiver, amount);
        _burn(msg.sender, amount);
        uint256 tokenPriceInEther = tokenPrice(amount);
        payable(msg.sender).transfer(tokenPriceInEther);
        // Broadcast of the event
        emit TokensReturned(msg.sender, amount, tokenPriceInEther);
    }

    function transferFromTo(
        address sender,
        address receiver,
        uint256 amount
    ) external {
        require(
            amount <= balanceOf(sender),
            "ERROR: exceed balance of sender"
        );
        _transfer(sender, receiver, amount);
    }

    function myBalance() external view returns (uint256) {
        return balanceOf(msg.sender);
    }

    function contractBalanceETH() external view returns (uint256) {
        return address(this).balance;
    }
}
