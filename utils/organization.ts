import parse from 'date-fns/parse';
import { IOrganizationResponse } from 'interfaces/organization';
import { IOrganization } from 'types/models';

// Transforms the data coming from the NEW API response into the OLD API-readable format
export const transformOrganization: (organization: IOrganizationResponse) => IOrganization = (organization) => {
  const {
    organization: { name, email },
    userId: user_id,
    createdAt,
    updatedAt
  } = organization;
  return {
    name,
    email,
    user_id,
    createdAt: parse(createdAt, 'yyyy-MM-dd', new Date()).getTime(),
    updatedAt: parse(updatedAt, 'yyyy-MM-dd', new Date()).getTime()
  };
};
