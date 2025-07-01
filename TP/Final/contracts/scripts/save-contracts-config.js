const fs = require("fs");
const path = require("path");

async function saveAllAddresses() {
  try {
    // Obtener el chainId de la red
    const chainId = await web3.eth.getChainId();

    // Obtener instancias de todos los contratos
    const ENSRegistry = artifacts.require("ens/ENSRegistry");
    const FIFSRegistrar = artifacts.require("ens/FIFSRegistrar");
    const UsuariosRegistrar = artifacts.require("ens/UsuariosRegistrar");
    const LlamadosRegistrar = artifacts.require("ens/LlamadosRegistrar");
    const ReverseRegistrar = artifacts.require("ens/ReverseRegistrar");
    const PublicResolver = artifacts.require("ens/PublicResolver");
    const CFPFactory = artifacts.require("business/CFPFactory");

    // Obtener direcciones
    const ens = await ENSRegistry.deployed();
    const fifsRegistrar = await FIFSRegistrar.deployed();
    const usuariosRegistrar = await UsuariosRegistrar.deployed();
    const llamadosRegistrar = await LlamadosRegistrar.deployed();
    const reverseRegistrar = await ReverseRegistrar.deployed();
    const publicResolver = await PublicResolver.deployed();
    const factory = await CFPFactory.deployed();

    // Configuración completa
    const config = {
      network: {
        chainId: chainId,
      },
      contracts: {
        // ENS
        ensRegistry: ens.address,
        fifsRegistrar: fifsRegistrar.address,
        usuariosRegistrar: usuariosRegistrar.address,
        llamadosRegistrar: llamadosRegistrar.address,
        reverseRegistrar: reverseRegistrar.address,
        publicResolver: publicResolver.address,

        // Business
        cfpFactory: factory.address,
      },
      domains: {
        tld: "cfp",
        usuarios: "usuarios.cfp",
        llamados: "llamados.cfp",
        reverse: "addr.reverse",
      },

      timestamp: new Date().toISOString(),
    };

    // Guardar en ambos directorios
    saveConfigToFile(config, "../../ui/contractsConfig.json");
    saveConfigToFile(config, "../../api/src/config/contractsConfig.json");

    console.log("Configuración guardada con chainId:", chainId);
  } catch (error) {
    console.error("Error al guardar las direcciones:", error);
    process.exit(1);
  }
}

// Función para guardar configuración en archivo
function saveConfigToFile(config, relativePath) {
  const configPath = path.join(__dirname, relativePath);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`- Config guardada en: ${configPath}`);
}

// Para ejecución con 'truffle exec'
module.exports = function (callback) {
  saveAllAddresses()
    .then(() => callback())
    .catch((err) => callback(err));
};
