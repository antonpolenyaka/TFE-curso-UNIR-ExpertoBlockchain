const Plot = artifacts.require("Plot");

contract('Plot', (accounts) => {
  // PRE-ARRANGE
  const [firstAccount] = accounts;

  it("1. Despues del despliegue no tienen que haver parcelas creadas", async () => {
    // ARRANGE
    const plot = await Plot.new();

    // ACT
    const totalSupplyResult = await plot.totalSupply();
    const totalSupplyExpected = 0;

    // ASSERT
    assert.equal(totalSupplyExpected, totalSupplyResult); // ALERT: Total supply after deploy contract is not zero
  });

  it("2. Despues de anyadir nueva parcela, su owner tiene que ser cuenta de la primera cuenta", async () => {
    // ARRANGE
    const plot = await Plot.new();

    // ACT
    await plot.addPlot("Plot x1", 1, 100, 0); // IPesticides.Pesticides.Pesticide_A = 0
    const resultPlotId = await plot.totalSupply();
    const resultOwner = await plot.getPlotOwner(resultPlotId);
    const expectedOwner = firstAccount;
    const expectedPlotId = 1;

    // ASSERT
    assert.equal(expectedPlotId, resultPlotId); // ALERT: After contract creation and add plot, his is not 1
    assert.equal(expectedOwner, resultOwner); // ALERT: An owner of plot is different of my owner
  });

  it("3. Comprueba que información sobre parcela esta añadida correctamente", async () => {
    // ARRANGE
    const plot = await Plot.new();

    // ACT
    const idExpected = 1;
    const nameExpected = "Plot x2";
    const allowedMaximumFlightHeightExpected = 200;
    const allowedMinimumFlightHeightExpected = 20;
    const pesticideExpected = 1; // IPesticides.Pesticides.Pesticide_B = 1
    await plot.addPlot(nameExpected, allowedMinimumFlightHeightExpected, allowedMaximumFlightHeightExpected, pesticideExpected);
    const plotId = await plot.totalSupply();
    const result = await plot.getPlotInfo(plotId);

    // ASSERT
    assert.equal(idExpected, result.id); // ALERT: Plot id is not correct after add to blockchain
    assert.equal(nameExpected, result.name); // ALERT: Plot name is not correct after add to blockchain
    assert.equal(allowedMaximumFlightHeightExpected, result.allowedMaximumFlightHeight); // ALERT: Plot maximumFlightHeight is not correct after add to blockchain
    assert.equal(allowedMinimumFlightHeightExpected, result.allowedMinimumFlightHeight); // ALERT: Plot minimumFlightHeight is not correct after add to blockchain
    assert.equal(pesticideExpected, result.allowedPesticide); // ALERT: Plot pesticide is not correct after add to blockchain
  });

});
