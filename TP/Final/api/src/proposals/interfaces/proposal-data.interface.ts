import { BigNumberish } from 'ethers';

export interface ProposalData {
  sender: string;
  blockNumber: BigNumberish;
  timestamp: BigNumberish;
}
