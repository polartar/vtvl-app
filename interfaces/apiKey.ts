export interface IAPIKey {
  key: string;
  createdAt: string;
  id: string;
}

export interface IAPIKeyCreate {
  organizationId: string;
}
