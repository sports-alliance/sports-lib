import { ServiceNames } from '../meta-data/event-meta-data.interface';

export interface Auth2ServiceTokenInterface {
  id: string,
  serviceName: ServiceNames
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: number;
  scope: string;
  dateRefreshed: number;
  dateCreated: number;
  userName?: string;
  openId?: string;
}

export interface SuuntoAPIAuth2ServiceTokenInterface extends Auth2ServiceTokenInterface {
  userName: string;
}

export interface COROSAPIAuth2ServiceTokenInterface extends Auth2ServiceTokenInterface {
  openId: string;
}
