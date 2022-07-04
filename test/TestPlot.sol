// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../src/contracts/Plot.sol";

contract TestPlot {
    // 1. Despues del despliegue no tienen que haver parcelas creadas
    function testDeployAndGetTotalSupply() public {
        // ARRANGE
        Plot plot = new Plot();

        // ACT
        uint256 totalSupplyResult = plot.totalSupply();
        uint256 totalSupplyExpected = 0;

        // ASSERT
        Assert.equal(totalSupplyExpected, totalSupplyResult, "ALERT: Total supply after deploy contract is not zero");
    }

    // 2. Despues de anyadir nueva parcela, su owner tiene que ser cuenta del contrato actual
    function testSettingAnOwnerOfDeployedContract() public {
        // ARRANGE
        Plot plot = new Plot();

        // ACT
        plot.addPlot("Plot x1", 1, 100, IPesticides.Pesticides.Pesticide_A);
        uint256 resultPlotId = plot.totalSupply();
        address resultOwner = plot.getPlotOwner(resultPlotId);
        address expectedOwner = address(this);
        uint256 expectedPlotId = 1;

        // ASSERT
        Assert.equal(expectedPlotId, resultPlotId, "ALERT: After contract creation and add plot, his id is not 1");
        Assert.equal(expectedOwner, resultOwner, "ALERT: An owner of plot is different of my owner");
    }

    // 3. Comprueba que información sobre parcela esta añadida correctamente
    function testCheckPlotInformation() public {
        // ARRANGE
        Plot plot = new Plot();

        // ACT
        uint256 idExpected = 1;
        string memory nameExpected = "Plot x2";
        uint256 allowedMaximumFlightHeightExpected = 200;
        uint256 allowedMinimumFlightHeightExpected = 20;
        IPesticides.Pesticides allowedPesticideExpected = IPesticides.Pesticides.Pesticide_B;
        plot.addPlot(nameExpected, allowedMinimumFlightHeightExpected, allowedMaximumFlightHeightExpected, allowedPesticideExpected);
        uint256 plotId = plot.totalSupply();
        IPlot.PlotInfo memory result = plot.getPlotInfo(plotId);

        // ASSERT
        Assert.equal(idExpected, result.id, "ALERT: Plot id is not correct after add to blockchain");
        Assert.equal(nameExpected, result.name, "ALERT: Plot name is not correct after add to blockchain");
        Assert.equal(allowedMaximumFlightHeightExpected, result.allowedMaximumFlightHeight, "ALERT: Plot maximumFlightHeight is not correct after add to blockchain");
        Assert.equal(allowedMinimumFlightHeightExpected, result.allowedMinimumFlightHeight, "ALERT: Plot minimumFlightHeight is not correct after add to blockchain");
        Assert.equal(uint256(allowedPesticideExpected), uint256(result.allowedPesticide), "ALERT: Plot pesticide is not correct after add to blockchain");
    }
}
