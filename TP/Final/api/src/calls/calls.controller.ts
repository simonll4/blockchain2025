import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
  Post,
  HttpCode,
  Body,
  BadRequestException,
  ForbiddenException,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { CallsService } from './calls.service';
import { MESSAGES } from '../common/messages';
import { GetCallResponseDto } from './dto/get-call-response.dto';
import { CreateCallDto } from './dto/create-call.dto';

@Controller()
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Get('/calls/:callId')
  async getCall(@Param('callId') callId: string) {
    try {
      const call = await this.callsService.getCall(callId);

      return new GetCallResponseDto({
        creator: call.creator,
        cfp: call.cfpAddress,
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      console.error('Error in getCall:', error);
      throw new HttpException(
        { message: MESSAGES.INTERNAL_ERROR },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/calls')
  async getAllCalls() {
    try {
      return await this.callsService.getAllCalls();
    } catch (error) {
      console.error('Error in getAllCalls:', error);
      throw new HttpException(
        { message: MESSAGES.INTERNAL_ERROR },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/closing-time/:callId')
  async getClosingTime(@Param('callId') callId: string) {
    try {
      return await this.callsService.getClosingTime(callId);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      console.error('Error in getClosingTime:', error);
      throw new HttpException(
        { message: MESSAGES.INTERNAL_ERROR },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('/create')
  @HttpCode(HttpStatus.CREATED)
  async createCall(@Body() body: CreateCallDto, @Req() req: Request) {
    const contentTypeHeader = req.headers['content-type'] as string | undefined;

    if (contentTypeHeader !== 'application/json') {
      throw new BadRequestException({ message: MESSAGES.INVALID_MIMETYPE });
    }

    try {
      return await this.callsService.createCall(body);
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
}
