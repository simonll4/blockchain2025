export class GetCallResponseDto {
  creator: string;
  cfp: string;
  description: string;

  constructor(call: GetCallResponseDto) {
    Object.assign(this, call);
  }
}
