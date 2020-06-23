export interface OAuth2OAuth2ServiceTokenInterface {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: number;
  scope: string;
  userName: string;
  dateRefreshed: number;
  dateCreated: number;
}

