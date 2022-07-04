const Works = artifacts.require("Works");
const Dron = artifacts.require("Dron");
const Plot = artifacts.require("Plot");
const FumigationDronToken = artifacts.require("FumigationDronToken");

contract('Works', (accounts) => {
  // PRE-ARRANGE
  const [generalAccount, plotOwner, dronOwner] = accounts;

  it("1. Despues del despliegue no tienen que haver tokens en el saldo del contrato", async () => {
    // ARRANGE
    const dron = await Dron.new();
    const plot = await Plot.new();
    const token = await FumigationDronToken.new();
    const works = await Works.new(plot.address, dron.address, token.address);

    // ACT
    const balanceTokensResult = await works.balanceTokens();
    const balanceTokensExpected = 0;

    // ASSERT
    assert.equal(balanceTokensExpected, balanceTokensResult); // ALERT: Total balance tokens is not zero
  });

  it("2. Añadir trabajo al pool de trabajos y se obtiene este trabajo desde blockchain. Tambien se verifica balance reservado en contrato.", async () => {
    // ARRANGE
    const dron = await Dron.new();
    const plot = await Plot.new();
    const token = await FumigationDronToken.new();
    const works = await Works.new(plot.address, dron.address, token.address);

    // ACT
    const tokensToPayExpected = 10000;
    await dron.addDron("Dron 1", 100, 1, tokensToPayExpected, 0); // IPesticides.Pesticides.Pesticide_A = 0
    await plot.addPlot("Plot 1", 2, 99, 0); // IPesticides.Pesticides.Pesticide_A = 0
    const plotIdExpected = 1;
    const dronIdExpected = 1;
    const valueToPay = web3.utils.toWei('1', 'ether'); // 1 ETH = 100 FDT (FDT has 2 decimals)
    await token.buy(tokensToPayExpected.toString(), { value: valueToPay });
    await works.addWork(plotIdExpected, dronIdExpected);
    const workIdExpected = 1;
    const work = await works.getWorkInfo(workIdExpected);
    const timestampWorkFinishedExpected = 0;
    const payedExpected = false;
    const balanceTokensResult = await works.balanceTokens();
    const balanceTokensExpected = tokensToPayExpected;

    // ASSERT
    assert.equal(workIdExpected, work.id); // ALERT: After contract creation and add work, his id is not 1
    assert.equal(plotIdExpected, work.plotId); // ALERT: In work, expected plotId is not correct
    assert.equal(dronIdExpected, work.dronId); // ALERT: In work, expected dronId is not correct
    assert.equal(tokensToPayExpected, work.tokensToPay); // ALERT: In work, expected tokens to pay is not correct
    assert.equal(timestampWorkFinishedExpected, work.timestampWorkFinished); // ALERT: In work, expected timestamp of work finished is not correct
    assert.equal(payedExpected, work.payed); // ALERT: In work, expected payed status is not correct
    assert.equal(balanceTokensExpected, balanceTokensResult); // ALERT: In work contract is not reserved expected token balance
  });

  it("3. Añadir trabajo y verificar que este trabajo aún no esta finalizado", async () => {
    // ARRANGE
    const dron = await Dron.new();
    const plot = await Plot.new();
    const token = await FumigationDronToken.new();
    const works = await Works.new(plot.address, dron.address, token.address);

    // ACT
    const tokensToPay = 10000;
    await dron.addDron("Dron 1", 100, 1, tokensToPay, 0); // IPesticides.Pesticides.Pesticide_A = 0
    await plot.addPlot("Plot 1", 2, 99, 0); // IPesticides.Pesticides.Pesticide_A = 0
    const valueToPay = web3.utils.toWei('1', 'ether'); // 1 ETH = 100 FDT (FDT has 2 decimals)
    await token.buy(tokensToPay.toString(), { value: valueToPay });
    await works.addWork(1, 1);
    const workIdExpected = 1;
    const notFinishedWorks = await works.getNotFinishedWorks(generalAccount);

    // ASSERT
    assert.equal(workIdExpected.toString(), notFinishedWorks[0].toString()); // ALERT: We don't have expected not finished works
  });

  it("4. Realizar el trabajo de fumigacion, recibir tokens por el trabajo y trabajo tener marcado como finalizado", async () => {
    // ARRANGE
    const dron = await Dron.new({ from: generalAccount });
    const plot = await Plot.new({ from: generalAccount });
    const token = await FumigationDronToken.new({ from: generalAccount });
    const works = await Works.new(plot.address, dron.address, token.address, { from: generalAccount });

    // ACT
    const tokensToPay = 10000;
    await dron.addDron("Dron 1", 100, 1, tokensToPay, 0, { from: dronOwner }); // IPesticides.Pesticides.Pesticide_A = 0
    await plot.addPlot("Plot 1", 2, 99, 0, { from: plotOwner }); // IPesticides.Pesticides.Pesticide_A = 0
    const plotIdExpected = 1;
    const dronIdExpected = 1;
    const valueToPay = web3.utils.toWei('1', 'ether'); // 1 ETH = 100 FDT (FDT has 2 decimals)
    await token.buy(tokensToPay.toString(), { value: valueToPay, from: plotOwner });
    await works.addWork(plotIdExpected, dronIdExpected, { from: plotOwner });
    await works.doFumigationWork(1, { from: dronOwner });
    const balanceDronOwnerExpected = tokensToPay;
    const balancePlotOwnerExpected = 0;
    const balanceWorksContractExpected = 0;
    const balanceDronOwnerResult = await token.balanceOf(dronOwner);
    const balancePlotOwnerResult = await token.balanceOf(plotOwner);
    const balanceWorksContractResult = await token.balanceOf(works.address);
    const payedExpected = true;
    const work = await works.getWorkInfo(1);

    // ASSERT
    assert.equal(balanceDronOwnerExpected, balanceDronOwnerResult);
    assert.equal(balancePlotOwnerExpected, balancePlotOwnerResult);
    assert.equal(balanceWorksContractExpected, balanceWorksContractResult);
    assert.equal(payedExpected, work.payed);
  });

});
