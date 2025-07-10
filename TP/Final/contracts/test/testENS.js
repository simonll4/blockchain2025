const ENSRegistry = artifacts.require("ens/ENSRegistry.sol");
const FIFSRegistrar = artifacts.require("ens/FIFSRegistrar.sol");
const ReverseRegistrar = artifacts.require("ens/ReverseRegistrar.sol");
const PublicResolver = artifacts.require("ens/PublicResolver.sol");

const namehash = require("@ensdomains/eth-ens-namehash");
const sha3 = require("web3-utils").sha3;
const keccak256 = web3.utils.keccak256;
const { exceptions } = require("@ensdomains/test-utils");

contract("ENS System", (accounts) => {
  const owner = accounts[0];
  const user = accounts[1];
  const otherUser = accounts[2];

  let ens, resolver, reverse, usuariosRegistrar, llamadosRegistrar;

  const tld = "cfp";
  const usuariosDomain = "usuarios.cfp";
  const llamadosDomain = "llamados.cfp";

  before(async () => {
    ens = await ENSRegistry.deployed();
    resolver = await PublicResolver.deployed();
    reverse = await ReverseRegistrar.deployed();

    const usuariosNode = namehash.hash(usuariosDomain);
    const llamadosNode = namehash.hash(llamadosDomain);

    const usuariosRegistrarAddress = await ens.owner(usuariosNode);
    const llamadosRegistrarAddress = await ens.owner(llamadosNode);

    usuariosRegistrar = await FIFSRegistrar.at(usuariosRegistrarAddress);
    llamadosRegistrar = await FIFSRegistrar.at(llamadosRegistrarAddress);
  });

  it("permite registrar un usuario en usuarios.cfp", async () => {
    const label = keccak256("juan");
    const fullNode = namehash.hash("juan.usuarios.cfp");

    await usuariosRegistrar.register(label, user, { from: user });
    const ownerOf = await ens.owner(fullNode);
    assert.equal(ownerOf, user, "El dueño del nombre ENS no es el usuario");
  });

  it("permite asignar un resolver y setear una address", async () => {
    const node = namehash.hash("juan.usuarios.cfp");

    await ens.setResolver(node, resolver.address, { from: user });
    await resolver.setAddr(node, user, { from: user });

    const resolved = await resolver.addr(node);
    assert.equal(resolved, user, "La dirección resuelta no coincide");
  });

  it("permite registrar un llamado en llamados.cfp", async () => {
    const label = keccak256("llamado1");
    const fullNode = namehash.hash("llamado1.llamados.cfp");

    await llamadosRegistrar.register(label, user, { from: user });
    const ownerOf = await ens.owner(fullNode);
    assert.equal(ownerOf, user, "El dueño del llamado no es el usuario");
  });

  it("permite asignar una descripción a un llamado", async () => {
    const node = namehash.hash("llamado1.llamados.cfp");

    await ens.setResolver(node, resolver.address, { from: user });
    await resolver.setText(node, "description", "Llamado de prueba", { from: user });

    const desc = await resolver.text(node, "description");
    assert.equal(desc, "Llamado de prueba");
  });

  it("permite hacer resolución inversa de dirección", async () => {
    await reverse.setName("juan.usuarios.cfp", { from: user });

    const node = await reverse.node(user);
    const name = await resolver.name(node);

    assert.equal(name, "juan.usuarios.cfp");
  });

  it("verifica que el resolver soporte EIP-165 (supportsInterface)", async () => {
    const supportsAddr = await resolver.supportsInterface("0x3b3b57de");
    const supportsText = await resolver.supportsInterface("0x59d1d43c");
    const supportsName = await resolver.supportsInterface("0x691f3431");

    assert.isTrue(supportsAddr, "No soporta addr()");
    assert.isTrue(supportsText, "No soporta text()");
    assert.isTrue(supportsName, "No soporta name()");
  });

  it("no permite actualizar el owner de un nombre ENS ya registrado", async () => {
    const label = keccak256("juan");
    const fullNode = namehash.hash("juan.usuarios.cfp");

    try {
      await usuariosRegistrar.register(label, otherUser, { from: otherUser });
      assert.fail("Se permitió registrar un nombre ya tomado");
    } catch (err) {
      assert.include(err.message, "revert", "La transacción no fue revertida como se esperaba");
    }

    const currentOwner = await ens.owner(fullNode);
    assert.equal(currentOwner, user, "El dueño no debería haber cambiado");
  });

  it("resuelve correctamente de addr → name → addr", async () => {
    const label = keccak256("lucas");
    const node = namehash.hash("lucas.usuarios.cfp");

    await usuariosRegistrar.register(label, otherUser, { from: otherUser });

    await ens.setResolver(node, resolver.address, { from: otherUser });
    await resolver.setAddr(node, otherUser, { from: otherUser });

    await reverse.setName("lucas.usuarios.cfp", { from: otherUser });

    const reverseNode = await reverse.node(otherUser);
    const name = await resolver.name(reverseNode);
    assert.equal(name, "lucas.usuarios.cfp");

    const resolvedAddr = await resolver.addr(namehash.hash(name));
    assert.equal(resolvedAddr, otherUser);
  });
});

contract("ENS Solidity (Core Registry)", function (accounts) {
  let ens;
  const owner = accounts[0];
  const user = accounts[1];
  const otherUser = accounts[2];


  beforeEach(async () => {
    ens = await ENSRegistry.new();
  });

  it("permite transferir propiedad de un nodo", async () => {
    const addr = "0x0000000000000000000000000000000000001234";
    const result = await ens.setOwner("0x0", addr, { from: owner });

    assert.equal(await ens.owner("0x0"), addr);

    const args = result.logs[0].args;
    assert.equal(args.node, "0x0000000000000000000000000000000000000000000000000000000000000000");
    assert.equal(args.owner, addr);
  });

  it("prohíbe transferencias de propiedad por no-duenios", async () => {
    try {
      await ens.setOwner("0x1", otherUser, { from: owner });
    } catch (err) {
      return exceptions.ensureException(err);
    }
    assert.fail("transferencia no falló");
  });

  it("permite asignar un resolver", async () => {
    const addr = "0x0000000000000000000000000000000000001234";
    const result = await ens.setResolver("0x0", addr, { from: owner });

    assert.equal(await ens.resolver("0x0"), addr);

    const args = result.logs[0].args;
    assert.equal(args.resolver, addr);
  });

  it("prohíbe asignar resolver por no-duenios", async () => {
    try {
      await ens.setResolver("0x1", otherUser, { from: owner });
    } catch (err) {
      return exceptions.ensureException(err);
    }
    assert.fail("resolver no falló");
  });

  it("permite asignar TTL", async () => {
    const result = await ens.setTTL("0x0", 3600, { from: owner });

    assert.equal((await ens.ttl("0x0")).toNumber(), 3600);

    const args = result.logs[0].args;
    assert.equal(args.ttl.toNumber(), 3600);
  });

  it("prohíbe asignar TTL por no-duenios", async () => {
    try {
      await ens.setTTL("0x1", 3600, { from: owner });
    } catch (err) {
      return exceptions.ensureException(err);
    }
    assert.fail("TTL no falló");
  });

  it("permite crear subnodos", async () => {
    const result = await ens.setSubnodeOwner("0x0", sha3("eth"), user, { from: owner });

    assert.equal(await ens.owner(namehash.hash("eth")), user);

    const args = result.logs[0].args;
    assert.equal(args.label, sha3("eth"));
    assert.equal(args.owner, user);
  });

  it("prohíbe crear subnodos por no-duenios", async () => {
    try {
      await ens.setSubnodeOwner("0x0", sha3("eth"), user, { from: user });
    } catch (err) {
      return exceptions.ensureException(err);
    }
    assert.fail("subnodo no falló");
  });
});
