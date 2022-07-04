const Dron = artifacts.require("Dron");
const Plot = artifacts.require("Plot");
const FumigationDronToken = artifacts.require("FumigationDronToken");
const Works = artifacts.require("Works");

module.exports = function (deployer) {
  deployer.deploy(FumigationDronToken).then(function () {
    return deployer.deploy(Dron);
  }).then(function () {
    return deployer.deploy(Plot);
  }).then(function () {
    return deployer.deploy(Works, Plot.address, Dron.address, FumigationDronToken.address);
  });
};
