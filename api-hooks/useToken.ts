import TokenApiService from '@api-services/TokenApiService';
import { ICreateDeployedTokenRequest, IImportTokenRequest } from 'interfaces/token';
import { useCallback, useMemo } from 'react';

const useTokenApi = () => {
  const createToken = useCallback((payload: ICreateDeployedTokenRequest) => {
    return TokenApiService.createToken(payload)
      .then((res) => {
        console.log('createToken - ', res);
        return res;
      })
      .catch((error) => {
        // toast.error(ERROR_MESSAGES.EN.GET_MEMBERS, { toastId: TOAST_NOTIFICATION_IDS.ERROR });
        console.error('createToken - ', error);
      });
  }, []);

  const importToken = useCallback((payload: IImportTokenRequest) => {
    return TokenApiService.importToken(payload)
      .then((res) => {
        console.log('importToken - ', res);
        return res;
      })
      .catch((error) => {
        // toast.error(ERROR_MESSAGES.EN.GET_MEMBERS, { toastId: TOAST_NOTIFICATION_IDS.ERROR });
        console.error('importToken - ', error);
      });
  }, []);

  return useMemo(
    () => ({
      createToken,
      importToken
    }),
    [createToken, importToken]
  );
};

export default useTokenApi;
