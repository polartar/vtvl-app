import { CliffDuration, ReleaseFrequency } from 'types/constants/schedule-configuration';
import { IRole } from 'types/models/settings';

interface IRecipient {
  name: string;
  email: string;
  address: string;
  allocations: string;
  role: IRole;
}

interface IVestingSchedule {
  id?: string;
  organizationId: string;
  tokenId: string;
  vestingContractId: string;
  name: string;
  startedAt: string;
  endedAt?: string;
  releaseFrequencyType: ReleaseFrequency;
  releaseFrequency: number;
  cliffDurationType: CliffDuration;
  cliffDuration: number;
  cliffAmount: string;
  amount: string;
  status?: IVestingStatus;
  recipes: IRecipient[];
}
