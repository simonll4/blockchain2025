const ENSRegistry = artifacts.require("ens/ENSRegistry.sol");
const FIFSRegistrar = artifacts.require("ens/FIFSRegistrar.sol");
const UsuariosRegistrar = artifacts.require("ens/UsuariosRegistrar.sol");
const LlamadosRegistrar = artifacts.require("ens/LlamadosRegistrar.sol");
const ReverseRegistrar = artifacts.require("ens/ReverseRegistrar.sol");
const PublicResolver = artifacts.require("ens/PublicResolver.sol");

const namehash = require("eth-ens-namehash");
const keccak256 = web3.utils.keccak256;

module.exports = async function (deployer, network, accounts) {
  const tld = "cfp";
  const ensOwner = accounts[0];

  // 1. Deploy ENSRegistry
  await deployer.deploy(ENSRegistry);
  const ens = await ENSRegistry.deployed();

  // 2. Deploy PublicResolver
  await deployer.deploy(PublicResolver, ENSRegistry.address);
  const resolver = await PublicResolver.deployed();

  // 3. Set up "resolver" node
  await ens.setSubnodeOwner("0x0", keccak256("resolver"), ensOwner);
  await ens.setResolver(namehash.hash("resolver"), resolver.address);
  await resolver.setAddr(namehash.hash("resolver"), resolver.address);

  // 4. Deploy FIFSRegistrar for TLD "cfp"
  await deployer.deploy(FIFSRegistrar, ENSRegistry.address, namehash.hash(tld));
  const tldRegistrar = await FIFSRegistrar.deployed();

  // 5. Transfer TLD ownership to its registrar
  await ens.setSubnodeOwner("0x0", keccak256(tld), tldRegistrar.address);

  // 6. Register "usuarios" and "llamados" under TLD using the TLD registrar
  // Register "usuarios"
  await tldRegistrar.register(keccak256("usuarios"), ensOwner, {
    from: ensOwner,
  });
  // Register "llamados"
  await tldRegistrar.register(keccak256("llamados"), ensOwner, {
    from: ensOwner,
  });

  // 7. Deploy UsuariosRegistrar for "usuarios.cfp"
  const usuariosNode = namehash.hash("usuarios." + tld);
  await deployer.deploy(UsuariosRegistrar, ENSRegistry.address, usuariosNode);
  const usuariosRegistrar = await UsuariosRegistrar.deployed();
  // Transfer ownership of "usuarios.cfp" to its registrar
  await ens.setOwner(usuariosNode, usuariosRegistrar.address, {
    from: ensOwner,
  });

  // 8. Deploy LlamadosRegistrar for "llamados.cfp"
  const llamadosNode = namehash.hash("llamados." + tld);
  await deployer.deploy(LlamadosRegistrar, ENSRegistry.address, llamadosNode);
  const llamadosRegistrar = await LlamadosRegistrar.deployed();
  // Transfer ownership of "llamados.cfp" to its registrar
  await ens.setOwner(llamadosNode, llamadosRegistrar.address, {
    from: ensOwner,
  });

  // 9. Deploy ReverseRegistrar for addr.reverse
  await deployer.deploy(
    ReverseRegistrar,
    ENSRegistry.address,
    resolver.address
  );
  const reverse = await ReverseRegistrar.deployed();

  await ens.setSubnodeOwner("0x0", keccak256("reverse"), ensOwner);
  await ens.setSubnodeOwner(
    namehash.hash("reverse"),
    keccak256("addr"),
    reverse.address
  );

  console.log("ENS Deployment completed successfully!");
  console.log("ENSRegistry:", ens.address);
  console.log("PublicResolver:", resolver.address);
  console.log("TLD Registrar (cfp):", tldRegistrar.address);
  console.log("Usuarios Registrar:", usuariosRegistrar.address);
  console.log("Llamados Registrar:", llamadosRegistrar.address);
  console.log("Reverse Registrar:", reverse.address);
};
