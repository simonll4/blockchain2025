import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ethers, BigNumberish } from 'ethers';

import { CFPFactory } from '../contracts/types/CFPFactory';
import { CFP } from '../contracts/types/CFP';
import { CFPFactoryService } from '../contracts/services/business.service';
import { Call } from './interfaces/call.interface';
import { MESSAGES } from 'src/common/messages';
import { CreateCallDto } from './dto/create-call.dto';
import { ENSService } from 'src/contracts/services/ens.service';

@Injectable()
export class CallsService {
  constructor(
    private readonly contractsService: CFPFactoryService,
    private readonly ensService: ENSService,
  ) {}

  /**
   * Obtiene los detalles de un llamado (call) por su ID.
   * @param callId ID del llamado a buscar.
   * @returns Detalles del llamado.
   * @throws BadRequestException si el ID no es válido.
   * @throws NotFoundException si el llamado no existe.
   */
  async getCall(callId: string): Promise<Call> {
    if (!ethers.isHexString(callId, 32)) {
      throw new BadRequestException(MESSAGES.INVALID_CALLID);
    }

    const factory = this.contractsService.getFactory();
    const call = await factory.calls(callId);

    if (call.creator === ethers.ZeroAddress) {
      throw new NotFoundException(MESSAGES.CALLID_NOT_FOUND);
    }

    // Obtener nombre del creador
    const creator = await this.ensService.resolveAddress(call.creator);

    // Obtener nombre y descripción del CFP (llamado)
    const cfpAddress = call.cfp;
    const { name: cfp, description } =
      await this.ensService.getNameAndDescription(cfpAddress);

    let closingTime: string | null = null;
    try {
      const cfpContract = this.contractsService.getCfp(cfpAddress);
      const ct = await cfpContract.closingTime();
      closingTime = new Date(Number(ct) * 1000).toISOString();
    } catch {
      closingTime = null;
    }

    return {
      callId,
      creator,
      cfp,
      description: description || '', // si no tiene descripción, devolver string vacío
      closingTime,
    };
  }

  /**
   * Obtiene todos los llamados (calls) registrados en el contrato.
   * @returns Lista de llamados.
   * @throws InternalServerErrorException si ocurre un error al obtener los llamados.
   */
  async getAllCalls(): Promise<Call[]> {
    try {
      const factory = this.contractsService.getFactory();
      const callIds = await factory.allCallIds();

      const calls: (Call | null)[] = await Promise.all(
        callIds.map(async (callId) => {
          const call = await factory.calls(callId);

          // Validar si existe
          if (call.creator === ethers.ZeroAddress) {
            return null;
          }

          const creator = await this.ensService.resolveAddress(call.creator);
          const cfpAddress = call.cfp;

          // Obtener nombre ENS y descripción del CFP
          const { name: cfp, description } =
            await this.ensService.getNameAndDescription(cfpAddress);

          let closingTime: string | null = null;
          try {
            const cfpContract = this.contractsService.getCfp(cfpAddress);
            const ct = await cfpContract.closingTime();
            closingTime = new Date(Number(ct) * 1000).toISOString();
          } catch {
            closingTime = null;
          }

          return {
            callId,
            creator,
            cfp,
            description: description || '',
            closingTime,
          };
        }),
      );

      // Filtrar los nulos si hubo llamados inválidos (como los del ZeroAddress)
      return calls.filter(Boolean) as Call[];
    } catch (error) {
      console.error('Error in getAllCalls:', error);
      throw new InternalServerErrorException(MESSAGES.INTERNAL_ERROR);
    }
  }

  /**
   * Obtiene el tiempo de cierre de un llamado (call) por su ID.
   * @param callId ID del llamado a buscar.
   * @returns Tiempo de cierre en formato ISO 8601.
   * @throws BadRequestException si el ID no es válido.
   * @throws NotFoundException si el llamado no existe.
   * @throws InternalServerErrorException si ocurre un error al obtener el tiempo de cierre.
   */
  async getClosingTime(callId: string): Promise<{ closingTime: string }> {
    if (!ethers.isHexString(callId, 32)) {
      throw new BadRequestException(MESSAGES.INVALID_CALLID);
    }

    const factory: CFPFactory = this.contractsService.getFactory();
    const call = await factory.calls(callId);
    const creator: string = call.creator;
    const cfpAddress: string = call.cfp;

    if (creator === ethers.ZeroAddress) {
      throw new NotFoundException(MESSAGES.CALLID_NOT_FOUND);
    }

    try {
      const cfpContract: CFP = this.contractsService.getCfp(cfpAddress);
      const ct: BigNumberish = await cfpContract.closingTime();
      return { closingTime: new Date(Number(ct) * 1000).toISOString() };
    } catch (err) {
      console.error('Error in getClosingTime:', err);
      throw new InternalServerErrorException(MESSAGES.INTERNAL_ERROR);
    }
  }

  /**
   * Crea un nuevo llamado (call) en el contrato CFPFactory.
   * @param dto Datos del llamado a crear (callId, closingTime, signature).
   * @returns Objeto con mensaje de éxito y hash de la transacción ejecutada.
   * @throws BadRequestException si el callId no es válido (debe ser hex de 32 bytes),
   *         si el formato de tiempo no es ISO 8601 válido, si la fecha de cierre es pasada,
   *         o si la firma digital es inválida.
   * @throws ForbiddenException si el firmante no está autorizado en el contrato
   *         o si ya existe un llamado con el mismo ID.
   * @throws InternalServerErrorException si hay errores de conexión RPC o del contrato.
   */
  async createCall(
    dto: CreateCallDto,
  ): Promise<{ message: string; transactionHash: string }> {
    const { callId, closingTime, signature } = dto;

    if (!ethers.isHexString(callId, 32)) {
      throw new BadRequestException(MESSAGES.INVALID_CALLID);
    }

    const ISO_8601_REGEX =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

    if (!ISO_8601_REGEX.test(closingTime)) {
      throw new BadRequestException({ message: MESSAGES.INVALID_TIME_FORMAT });
    }

    const parsedMs = Date.parse(closingTime);
    if (isNaN(parsedMs)) {
      throw new BadRequestException({ message: MESSAGES.INVALID_TIME_FORMAT });
    }

    const timestamp = Math.floor(parsedMs / 1000);
    if (timestamp <= Math.floor(Date.now() / 1000)) {
      throw new BadRequestException({ message: MESSAGES.INVALID_CLOSING_TIME });
    }

    const factory = this.contractsService.getFactory();
    const signerAddress = this.recoverSigner(
      factory.target as string,
      callId,
      signature,
    );

    const isAuthorized = await factory.isAuthorized(signerAddress);
    if (!isAuthorized) {
      throw new ForbiddenException({ message: MESSAGES.UNAUTHORIZED });
    }

    const existingCall = await factory.calls(callId);
    if (existingCall.creator !== ethers.ZeroAddress) {
      throw new ForbiddenException({ message: MESSAGES.ALREADY_CREATED });
      //throw new Error(MESSAGES.ALREADY_CREATED);
    }

    const txRequest = await factory.createFor.populateTransaction(
      callId,
      timestamp,
      signerAddress,
    );

    const receipt = await this.contractsService.sendTransaction(txRequest);

    return {
      message: MESSAGES.OK,
      transactionHash: receipt.hash,
    };
  }

  /**
   * Recupera el firmante de una firma digital.
   * @param factoryAddress Dirección del contrato factory.
   * @param callId ID del llamado (call).
   * @param signature Firma digital.
   * @returns Dirección del firmante.
   * @throws BadRequestException si la firma es inválida o no se puede recuperar el firmante.
   */
  // Esta función es privada porque solo se usa internamente en el servicio
  private recoverSigner(
    factoryAddress: string,
    callId: string,
    signature: string,
  ): string {
    try {
      // Validar formato mínimo (opcional)
      if (
        !signature ||
        !signature.startsWith('0x') ||
        signature.length !== 132
      ) {
        throw new BadRequestException({ message: MESSAGES.INVALID_SIGNATURE });
      }

      const factoryBytes = ethers.getBytes(factoryAddress); // 20 bytes
      const callIdBytes = ethers.getBytes(callId); // 32 bytes
      if (factoryBytes.length !== 20 || callIdBytes.length !== 32) {
        throw new BadRequestException({ message: MESSAGES.INVALID_SIGNATURE });
      }

      const messageBytes = new Uint8Array([...factoryBytes, ...callIdBytes]);

      // Ethers hace encode_defunct internamente
      const recovered = ethers.verifyMessage(messageBytes, signature);
      return ethers.getAddress(recovered);
    } catch (err) {
      console.error('Error al verificar firma:', err);
      throw new BadRequestException({ message: MESSAGES.INVALID_SIGNATURE });
    }
  }
}
