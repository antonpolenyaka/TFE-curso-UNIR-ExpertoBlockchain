const FumigationDronToken = artifacts.require("FumigationDronToken");

contract('FumigationDronToken', (accounts) => {
  // PRE-ARRANGE
  const [generalAccount, senderAccount, receiverAccount] = accounts;

  it("1. Averiguar el precio del un token en ETH", async () => {
    // ARRANGE
    const token = await FumigationDronToken.new();

    // ACT
    const decimals = await token.decimals();
    const tokenPriceResultWei = await token.tokenPrice(1 * Math.pow(10, decimals)); // 1 Token with 2 decimals = 100
    const tokenPriceResultEth = web3.utils.fromWei(tokenPriceResultWei.toString());
    const tokenPriceExpected = 0.01;

    // ASSERT
    assert.equal(tokenPriceExpected.toString(), tokenPriceResultEth.toString());
  });

  it("2. Comprar 100 tokens y verificar balance", async () => {
    // ARRANGE
    const token = await FumigationDronToken.new();

    // ACT
    const valueToPay = web3.utils.toWei('1', 'ether'); // 1 ETH = 100 FDT (FDT has 2 decimals)
    const decimals = await token.decimals();
    const tokensToBuy = 100 * Math.pow(10, decimals);
    await token.buy(tokensToBuy.toString(), { value: valueToPay });
    const balanceAddressExpected = tokensToBuy;
    const balanceAddressResult = await token.myBalance();

    // ASSERT
    assert.equal(balanceAddressExpected.toString(), balanceAddressResult.toString());
  });

  it("3. Comprar 100 tokens. Vender 90. Verificar balance", async () => {
    // ARRANGE
    const token = await FumigationDronToken.new();

    // ACT
    const valueToPay = web3.utils.toWei('1', 'ether'); // 1 ETH = 100 FDT (FDT has 2 decimals)
    const decimals = await token.decimals();
    const tokensToBuy = 100 * Math.pow(10, decimals);
    await token.buy(tokensToBuy.toString(), { value: valueToPay });
    const tokensToSell = 90 * Math.pow(10, decimals);
    await token.sell(tokensToSell.toString(), { value: 0 });
    const balanceAddressExpected = 10 * Math.pow(10, decimals);
    const balanceAddressResult = await token.myBalance();

    // ASSERT
    assert.equal(balanceAddressExpected.toString(), balanceAddressResult.toString());
  });

  it("4. Comprar 100 tokens. Transferir a otra cuenta. Verificar balance en las dos cuentas", async () => {
    // ARRANGE
    const token = await FumigationDronToken.new();

    // ACT
    const valueToPay = web3.utils.toWei('1', 'ether'); // 1 ETH = 100 FDT (FDT has 2 decimals)
    const decimals = await token.decimals();
    const tokensToBuyAndTransfer = 100 * Math.pow(10, decimals);
    await token.buy(tokensToBuyAndTransfer.toString(), { value: valueToPay, from: senderAccount });
    await token.transferFromTo(senderAccount, receiverAccount, tokensToBuyAndTransfer.toString(), { from: senderAccount });
    const balanceReceiverExpected = tokensToBuyAndTransfer;
    const balanceSenderExpected = 0;
    const balanceReceiverResult = await token.balanceOf(receiverAccount);
    const balanceSenderResult = await token.balanceOf(senderAccount);

    // ASSERT
    assert.equal(balanceReceiverExpected.toString(), balanceReceiverResult.toString());
    assert.equal(balanceSenderExpected.toString(), balanceSenderResult.toString());
  });

});
