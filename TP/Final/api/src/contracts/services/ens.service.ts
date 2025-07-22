import { Injectable, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';

import { ConfigService } from '../../config/config.service';
import { ContractLoader } from '../utils/contract-loader';
import { PublicResolver, ReverseRegistrar } from '../types';

@Injectable()
export class ENSService implements OnModuleInit {
  private provider: ethers.JsonRpcProvider;
  private reverse: ReverseRegistrar;
  private resolver: PublicResolver;

  constructor(
    private readonly configService: ConfigService,
    private readonly loader: ContractLoader,
  ) {}

  onModuleInit() {
    this.provider = new ethers.JsonRpcProvider(
      this.configService.getGanacheUrl(),
    );
    this.reverse = this.loader.loadReverseRegistrar(this.provider);
    this.resolver = this.loader.loadPublicResolver(this.provider);
  }

  /**
   * Intenta resolver un nombre ENS asociado a una dirección Ethereum.
   *
   * El proceso consta de dos pasos:
   * 1. **Resolución Reversa**: Consulta el registro de ENS inverso (reverse registrar)
   *    para obtener el nombre ENS (si existe) vinculado a la dirección dada.
   *
   * 2. **Validación Directa (Forward Check)**: Asegura que el nombre ENS obtenido realmente
   *    apunta de vuelta a la dirección original. Esto es necesario porque cualquiera puede
   *    registrar un nombre ENS y asociarlo con una dirección en la resolución inversa,
   *    incluso si no es dueño del nombre.
   *
   * Si ambos pasos son exitosos y coherentes, se devuelve el nombre ENS.
   * Si falla la validación o no hay nombre asociado, se devuelve la dirección original.
   *
   * @param address Dirección Ethereum a resolver.
   * @returns Nombre ENS validado, o la dirección original si no se puede validar.
   */
  async resolveAddress(address: string): Promise<string> {
    try {
      // Paso 1: Resolución reversa (obtener el nombre desde la dirección)
      const reverseNode = await this.reverse.node(address);
      const name = await this.resolver.name(reverseNode);

      if (!name) return address;

      // Paso 2: Validación forward (el nombre realmente apunta a la dirección original)
      const forwardNode = ethers.namehash(name);
      const resolvedAddress = await this.resolver.addr(forwardNode);

      if (
        resolvedAddress &&
        resolvedAddress.toLowerCase() === address.toLowerCase()
      ) {
        return name; // Resolución ENS válida
      }

      // El nombre no corresponde realmente a esta dirección
      return address;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //console.error('[ENSService] Error resolving address:', error);
      return address;
    }
  }

  /**
   * Obtiene el nombre ENS y su descripción asociados a una dirección Ethereum,
   * realizando una validación de seguridad para verificar que el nombre ENS
   * realmente le pertenece a la dirección indicada.
   *
   * Proceso de resolución:
   * 1. Se consulta el registro reverso (reverse record) de la dirección:
   *    address → ENS name.
   * 2. Luego se verifica que ese nombre ENS resuelva nuevamente hacia la
   *    misma dirección (forward validation): name → address.
   * 3. Si la validación es exitosa, se extrae la descripción del ENS
   *    (si existe) usando el registro `text`.
   * 4. Si no hay nombre ENS válido, se devuelve la dirección original como fallback.
   *
   * ⚠️ Esta validación doble (reverso + directo) es fundamental para evitar
   * suplantación o asociaciones maliciosas de nombres ENS que no pertenecen
   * a la dirección consultada.
   *
   * @param address Dirección Ethereum a consultar.
   * @returns Un objeto que contiene:
   *   - `name`: el nombre ENS validado o la dirección original si no hay uno válido.
   *   - `description`: el texto descriptivo del ENS si existe, o `undefined` si no está definido.
   */

  async getNameAndDescription(
    address: string,
  ): Promise<{ name: string; description?: string }> {
    try {
      // Paso 1: Reverso - obtener nombre desde address
      const reverseNode = await this.reverse.node(address);
      const name = await this.resolver.name(reverseNode);

      if (!name) return { name: address };

      // Paso 2: Forward - validar que el nombre apunta a la misma dirección
      const forwardNode = ethers.namehash(name);
      const resolvedAddress = await this.resolver.addr(forwardNode);

      const isValid =
        resolvedAddress &&
        resolvedAddress.toLowerCase() === address.toLowerCase();

      if (!isValid) return { name: address };

      // Paso 3: Obtener descripción (si existe)
      let description: string | undefined;
      try {
        description = await this.resolver.text(forwardNode, 'description');
      } catch {
        description = undefined;
      }

      return { name, description };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //console.error('[ENSService] Error getting name and description:', error);
      return { name: address };
    }
  }

  /**
  //  * Obtiene el nombre y la descripción de un nombre ENS.
  //  * @param address Dirección Ethereum a consultar.
  //  * @returns Un objeto que contiene el nombre ENS y su descripción (si existe).
  //  */
  // async getNameAndDescription(
  //   address: string,
  // ): Promise<{ name: string; description?: string }> {
  //   try {
  //     // Obtener el node del reverse
  //     const reverseNode = await this.reverse.node(address);

  //     // Resolver el nombre ENS asociado a ese node
  //     const name = await this.resolver.name(reverseNode);

  //     // Resolver la descripción del nombre ENS si existe
  //     const forwardNode = ethers.namehash(name);
  //     let description: string | undefined;

  //     try {
  //       description = await this.resolver.text(forwardNode, 'description');
  //     } catch {
  //       description = undefined;
  //     }

  //     return { name, description };
  //   } catch (error) {
  //     console.error('[ENSService] Error getting name and description:', error);
  //     return { name: address };
  //   }
  // }
}
