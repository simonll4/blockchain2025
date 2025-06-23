export class GetCallResponseDto {
  creator: string;
  cfp: string;

  constructor(call: GetCallResponseDto) {
    Object.assign(this, call);
  }
}
