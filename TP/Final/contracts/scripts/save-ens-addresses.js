const fs = require('fs');
const path = require('path');

// Script para guardar las direcciones de los registradores ENS
async function saveENSAddresses() {
  try {
    // Obtener las direcciones de los contratos desplegados
    const UsuariosRegistrar = artifacts.require("ens/UsuariosRegistrar");
    const LlamadosRegistrar = artifacts.require("ens/LlamadosRegistrar");
    
    const usuariosRegistrar = await UsuariosRegistrar.deployed();
    const llamadosRegistrar = await LlamadosRegistrar.deployed();
    
    // Crear objeto de configuración
    const config = {
      networkId: "5777", // Ganache
      addresses: {
        usuariosRegistrar: usuariosRegistrar.address,
        llamadosRegistrar: llamadosRegistrar.address
      },
      domains: {
        tld: "cfp",
        usuarios: "usuarios.cfp",
        llamados: "llamados.cfp"
      }
    };
    
    // Guardar en archivo
    const configPath = path.join(__dirname, '../../ui/src/utils/ensAddresses.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    console.log('ENS addresses saved to:', configPath);
    console.log('Config:', config);
    
  } catch (error) {
    console.error('Error saving ENS addresses:', error);
  }
}

module.exports = function(callback) {
  saveENSAddresses()
    .then(() => callback())
    .catch(callback);
}; 