import {
  Auth2ServiceTokenInterface,
  ServiceNames,
  UserServiceMetaInterface,
  WahooAPIAuth2ServiceTokenInterface
} from '..';

describe('user service contracts', () => {
  it('exposes Wahoo in the complete service-name registry', () => {
    expect(Object.values(ServiceNames)).toEqual([
      ServiceNames.SuuntoApp,
      ServiceNames.GarminAPI,
      ServiceNames.COROSAPI,
      ServiceNames.WahooAPI
    ]);
    expect(ServiceNames.WahooAPI).toBe('Wahoo API');
  });

  it('keeps the stable Wahoo user ID on the OAuth token contract', () => {
    const wahooToken: WahooAPIAuth2ServiceTokenInterface = {
      id: 'token-1',
      serviceName: ServiceNames.WahooAPI,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      tokenType: 'bearer',
      expiresAt: 1_752_835_600_000,
      scope: 'user_read workouts_read offline_data',
      dateRefreshed: 1_752_828_400_000,
      dateCreated: 1_752_828_000_000,
      wahooUserID: 'wahoo-user-42'
    };
    const providerNeutralToken: Auth2ServiceTokenInterface = wahooToken;

    expect(providerNeutralToken.serviceName).toBe(ServiceNames.WahooAPI);
    expect(wahooToken.wahooUserID).toBe('wahoo-user-42');
    expect(wahooToken.scope.split(' ')).toEqual(['user_read', 'workouts_read', 'offline_data']);
  });

  it('supports Wahoo history state in provider-keyed user service metadata', () => {
    const services: Partial<Record<ServiceNames, UserServiceMetaInterface>> = {
      [ServiceNames.WahooAPI]: {
        didLastHistoryImport: 1_752_828_400_000,
        processedActivitiesFromLastHistoryImportCount: 27
      }
    };

    expect(services[ServiceNames.WahooAPI]).toEqual({
      didLastHistoryImport: 1_752_828_400_000,
      processedActivitiesFromLastHistoryImportCount: 27
    });
    expect(services[ServiceNames.WahooAPI]).not.toHaveProperty('uploadedRoutesCount');
  });
});
