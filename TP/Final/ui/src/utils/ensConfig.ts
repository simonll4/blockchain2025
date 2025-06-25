// Configuración de direcciones ENS para Ganache (Network ID: 5777)
export const ENS_CONFIG = {
  // Direcciones de los registradores específicos
  USUARIOS_REGISTRAR_ADDRESS: "0x54332cAA4C8e14502764689A0B7c4679d8527F95", // Reemplazar con la dirección real
  LLAMADOS_REGISTRAR_ADDRESS: "0x54332cAA4C8e14502764689A0B7c4679d8527F95", // Reemplazar con la dirección real
  
  // Dominios
  TLD: "cfp",
  USUARIOS_DOMAIN: "usuarios.cfp",
  LLAMADOS_DOMAIN: "llamados.cfp",
  
  // Configuración de red
  NETWORK_ID: "5777", // Ganache
};

// Función para obtener la dirección del registrador según el dominio
export function getRegistrarAddress(domain: string): string {
  switch (domain) {
    case ENS_CONFIG.USUARIOS_DOMAIN:
      return ENS_CONFIG.USUARIOS_REGISTRAR_ADDRESS;
    case ENS_CONFIG.LLAMADOS_DOMAIN:
      return ENS_CONFIG.LLAMADOS_REGISTRAR_ADDRESS;
    default:
      throw new Error(`Dominio no soportado: ${domain}`);
  }
} 