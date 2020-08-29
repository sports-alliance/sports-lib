export interface Auth2ServiceTokenInterface {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: number;
  scope: string;
  dateRefreshed: number;
  dateCreated: number;
  userName?: string;
  openid?: string;
}

export interface SuuntoAPIAuth2ServiceTokenInterface extends Auth2ServiceTokenInterface{
  userName: string;
}

export interface COROSAPIAuth2ServiceTokenInterface extends Auth2ServiceTokenInterface{
  openid: string;
}
