import { EMilestoneType, IMilestoneInput } from 'types/milestone';

export interface IMilestoneTemplate {
  name: string;
  type: EMilestoneType;
  allocation: string;
  milestones: IMilestoneInput[];
  organizationId: string;
  createdAt?: number;
}
