import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { MESSAGES } from 'src/common/messages';
import { RegisterAccountDto } from './dto/register-account.dto';

@Controller()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get('/authorized/:address')
  async isAuthorized(@Param('address') address: string) {
    try {
      const authorized = await this.accountsService.isAuthorized(address);
      return { authorized };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        { message: MESSAGES.INTERNAL_ERROR },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('/register')
  @HttpCode(200)
  async register(@Body() body: RegisterAccountDto, @Req() req: Request) {
    // Validación de Content-Type
    const contentTypeHeader = req.headers['content-type'] as string | undefined;

    if (contentTypeHeader !== 'application/json') {
      throw new BadRequestException({ message: MESSAGES.INVALID_MIMETYPE });
    }

    try {
      await this.accountsService.register(body.address, body.signature);
      return { message: MESSAGES.OK };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new HttpException(
        { message: MESSAGES.INTERNAL_ERROR },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/creators')
  async getAllCreators() {
    try {
      const creators = await this.accountsService.getAllCreators();
      return { creators };
    } catch (error) {
      console.error('Error in getAllCreators:', error);
      throw new HttpException(
        { message: MESSAGES.INTERNAL_ERROR },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/pendings')
  async getPendings() {
    try {
      const pending = await this.accountsService.getPendings();
      return { pending };
    } catch (error) {
      console.error('Error in getPendings:', error);
      throw new HttpException(
        { message: MESSAGES.INTERNAL_ERROR },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
