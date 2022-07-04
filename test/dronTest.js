const Dron = artifacts.require("Dron");

contract('Dron', (accounts) => {
  // PRE-ARRANGE
  const [firstAccount] = accounts;

  it("1. Despues del despliegue no tienen que haver drones creados", async () => {
    // ARRANGE
    const dron = await Dron.new();

    // ACT
    const totalSupplyResult = await dron.totalSupply();
    const totalSupplyExpected = 0;

    // ASSERT
    assert.equal(totalSupplyExpected, totalSupplyResult); // ALERT: Total supply after deploy contract is not zero
  });

  it("2. Despues de anyadir nuevo dron, su owner tiene que ser cuenta de la primera cuenta", async () => {
    // ARRANGE
    const dron = await Dron.new();

    // ACT
    await dron.addDron("Dron x1", 100, 1, 10000, 0); // IPesticides.Pesticides.Pesticide_A = 0
    const resultDronId = await dron.totalSupply();
    const resultOwner = await dron.getDronOwner(resultDronId);
    const expectedOwner = firstAccount;
    const expectedDronId = 1;

    // ASSERT
    assert.equal(expectedDronId, resultDronId); // ALERT: After contract creation and add dron, his is not 1
    assert.equal(expectedOwner, resultOwner); // ALERT: An owner of dron is different of my owner
  });

  it("3. Comprueba si el precio es correcto despues de añadir dron a blockchain", async () => {
    // ARRANGE
    const dron = await Dron.new();

    // ACT
    const expectedPrice = 9900;
    await dron.addDron("Dron x2", 100, 1, expectedPrice, 0); // IPesticides.Pesticides.Pesticide_A = 0
    const dronId = await dron.totalSupply();
    const result = await dron.getDronWorkPrice(dronId);

    // ASSERT
    assert.equal(expectedPrice, result); // ALERT: Work price is not correct, after add dron to blockchian
  });

  it("4. Comprueba que el dron existe", async () => {
    // ARRANGE
    const dron = await Dron.new();

    // ACT
    const expectedExist = true;
    await dron.addDron("Dron x3", 100, 1, 5000, 0); // IPesticides.Pesticides.Pesticide_A = 0
    const dronId = await dron.totalSupply();
    const result = await dron.checkDronExist(dronId);

    // ASSERT
    assert.equal(expectedExist, result); // ALERT: Dron not exist after add and check in blockchain
  });

  it("5. Comprueba que información sobre dron esta añadida correctamente", async () => {
    // ARRANGE
    const dron = await Dron.new();

    // ACT
    const idExpected = 1;
    const nameExpected = "Dron x5";
    const maximumFlightHeightExpected = 200;
    const minimumFlightHeightExpected = 20;
    const priceExpected = 7000;
    const pesticideExpected = 1; // IPesticides.Pesticides.Pesticide_B = 1
    await dron.addDron(nameExpected, maximumFlightHeightExpected, minimumFlightHeightExpected, priceExpected, pesticideExpected);
    const dronId = await dron.totalSupply();
    const result = await dron.getDronInfo(dronId);

    // ASSERT
    assert.equal(idExpected, result.id); // ALERT: Dron id is not correct after add to blockchain
    assert.equal(nameExpected, result.name); // ALERT: Dron name is not correct after add to blockchain
    assert.equal(maximumFlightHeightExpected, result.maximumFlightHeight); // ALERT: Dron maximumFlightHeight is not correct after add to blockchain
    assert.equal(minimumFlightHeightExpected, result.minimumFlightHeight); // ALERT: Dron minimumFlightHeight is not correct after add to blockchain
    assert.equal(priceExpected, result.price); // ALERT: Dron price is not correct after add to blockchain
    assert.equal(pesticideExpected, result.pesticide); // ALERT: Dron pesticide is not correct after add to blockchain
  });

});
