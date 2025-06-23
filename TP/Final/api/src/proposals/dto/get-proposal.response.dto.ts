export class GetProposalResponseDto {
  sender: string;
  blockNumber: number;
  timestamp: string;

  constructor(proposal: GetProposalResponseDto) {
    Object.assign(this, proposal);
  }
}
