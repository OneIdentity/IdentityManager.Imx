import { PortalApplication } from 'imx-api-aob';
import { CollectionLoadParameters, TypedEntity } from 'imx-qbm-dbts';

export interface AccountDetails {
  count: number;
  first: TypedEntity;
  uidApplication: string;
}
