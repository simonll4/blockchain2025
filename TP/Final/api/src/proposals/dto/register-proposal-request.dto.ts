import { IsHexadecimal, Length } from 'class-validator';

export class RegisterProposalRequestDto {
  @IsHexadecimal()
  @Length(66, 66, {
    message: 'callId must be a 32-byte hex string (0x + 64 chars)',
  })
  callId: string;

  @IsHexadecimal()
  @Length(66, 66, {
    message: 'proposal must be a 32-byte hex string (0x + 64 chars)',
  })
  proposal: string;
}
