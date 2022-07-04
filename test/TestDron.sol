// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../src/contracts/Dron.sol";

contract TestDron {
    // 1. Despues del despliegue no tienen que haver drones creados
    function testDeployAndGetTotalSupply() public {
        // ARRANGE
        Dron dron = new Dron();

        // ACT
        uint256 totalSupplyResult = dron.totalSupply();
        uint256 totalSupplyExpected = 0;

        // ASSERT
        Assert.equal(totalSupplyExpected, totalSupplyResult, "ALERT: Total supply after deploy contract is not zero");
    }

    // 2. Despues de anyadir nuevo dron, su owner tiene que ser cuenta del contrato actual
    function testSettingAnOwnerOfDeployedContract() public {
        // ARRANGE
        Dron dron = new Dron();

        // ACT
        dron.addDron("Dron x1", 100, 1, 10000, IPesticides.Pesticides.Pesticide_A);
        uint256 resultDronId = dron.totalSupply();
        address resultOwner = dron.getDronOwner(resultDronId);
        address expectedOwner = address(this);
        uint256 expectedDronId = 1;

        // ASSERT
        Assert.equal(expectedDronId, resultDronId, "ALERT: After contract creation and add dron, his id is not 1");
        Assert.equal(expectedOwner, resultOwner, "ALERT: An owner of dron is different of my owner");
    }

    // 3. Comprueba si el precio es correcto despues de añadir dron a blockchain
    function testDronWorkPrice() public {
        // ARRANGE
        Dron dron = new Dron();

        // ACT
        uint256 expectedPrice = 9900;
        dron.addDron("Dron x2", 100, 1, expectedPrice, IPesticides.Pesticides.Pesticide_A);
        uint256 dronId = dron.totalSupply();
        uint256 result = dron.getDronWorkPrice(dronId);

        // ASSERT
        Assert.equal(expectedPrice, result, "ALERT: Work price is not correct, after add dron to blockchian");
    }

    // 4. Comprueba que el dron existe
    function testCheckIfDronExist() public {
        // ARRANGE
        Dron dron = new Dron();

        // ACT
        bool expectedExist = true;
        dron.addDron("Dron x3", 100, 1, 5000, IPesticides.Pesticides.Pesticide_A);
        uint256 dronId = dron.totalSupply();
        bool result = dron.checkDronExist(dronId);

        // ASSERT
        Assert.equal(expectedExist, result, "ALERT: Dron not exist after add and check in blockchain");
    }

    // 5. Comprueba que información sobre dron esta añadida correctamente
    function testCheckDronInformation() public {
        // ARRANGE
        Dron dron = new Dron();

        // ACT
        uint256 idExpected = 1;
        string memory nameExpected = "Dron x5";
        uint256 maximumFlightHeightExpected = 200;
        uint256 minimumFlightHeightExpected = 20;
        uint256 priceExpected = 7000;
        IPesticides.Pesticides pesticideExpected = IPesticides.Pesticides.Pesticide_B;
        dron.addDron(nameExpected, maximumFlightHeightExpected, minimumFlightHeightExpected, priceExpected, pesticideExpected);
        uint256 dronId = dron.totalSupply();
        IDron.DronInfo memory result = dron.getDronInfo(dronId);

        // ASSERT
        Assert.equal(idExpected, result.id, "ALERT: Dron id is not correct after add to blockchain");
        Assert.equal(nameExpected, result.name, "ALERT: Dron name is not correct after add to blockchain");
        Assert.equal(maximumFlightHeightExpected, result.maximumFlightHeight, "ALERT: Dron maximumFlightHeight is not correct after add to blockchain");
        Assert.equal(minimumFlightHeightExpected, result.minimumFlightHeight, "ALERT: Dron minimumFlightHeight is not correct after add to blockchain");
        Assert.equal(priceExpected, result.price, "ALERT: Dron price is not correct after add to blockchain");
        Assert.equal(uint256(pesticideExpected), uint256(result.pesticide), "ALERT: Dron pesticide is not correct after add to blockchain");
    }
}
