const Factory = artifacts.require("business/CFPFactory");

module.exports = function (deployer) {
  deployer.deploy(Factory);
};
