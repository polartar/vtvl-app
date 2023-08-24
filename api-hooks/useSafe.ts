import SafeApiService from '@api-services/SafeApiService';
import { TOAST_NOTIFICATION_IDS } from '@utils/constants';
import { ISafeRequest } from 'interfaces/safe';
import { useCallback } from 'react';
import { toast } from 'react-toastify';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from './messages';

const useSafeAPI = () => {
  // Adding new safe to our DB
  const addSafeWallet = useCallback((payload: ISafeRequest) => {
    return SafeApiService.addSafeWallet(payload)
      .then((res) => {
        // Do something with the response
        toast.success(SUCCESS_MESSAGES.EN.CREATE_SAFE, { toastId: TOAST_NOTIFICATION_IDS.SUCCESS });
        return res;
      })
      .catch((error) => {
        // Do something when there was an error adding a safe wallet
        toast.error(ERROR_MESSAGES.EN.CREATE_SAFE, { toastId: TOAST_NOTIFICATION_IDS.ERROR });
        return error;
      });
  }, []);

  // Updating existing safe from our DB
  const updateSafeWallet = useCallback((payload: ISafeRequest) => {
    return SafeApiService.updateSafeWallet(payload)
      .then((res) => {
        // Do something with the response
        toast.success(SUCCESS_MESSAGES.EN.UPDATE_SAFE, { toastId: TOAST_NOTIFICATION_IDS.SUCCESS });
        return res;
      })
      .catch((error) => {
        // Do something when there was an error updating a safe wallet
        toast.error(ERROR_MESSAGES.EN.UPDATE_SAFE, { toastId: TOAST_NOTIFICATION_IDS.ERROR });
        return error;
      });
  }, []);

  // Getting all safe wallets based on organization
  const getSafeWalletsByOrganization = useCallback((organizationId: string) => {
    return SafeApiService.getSafeWalletsByOrganization(organizationId)
      .then((res) => {
        // Do something with the response
        return res;
      })
      .catch((error) => {
        // Do something when there was an error adding a safe wallet
        toast.error(ERROR_MESSAGES.EN.GET_SAFE, { toastId: TOAST_NOTIFICATION_IDS.ERROR });
        return error;
      });
  }, []);

  // Getting safe wallet based on address
  const getSafeWalletsByAddress = useCallback((address: string) => {
    return SafeApiService.getSafeWalletsByAddress(address)
      .then((res) => {
        // Do something with the response
        return res;
      })
      .catch((error) => {
        // Do something when there was an error adding a safe wallet
        toast.error(ERROR_MESSAGES.EN.GET_SAFE, { toastId: TOAST_NOTIFICATION_IDS.ERROR });
        return error;
      });
  }, []);

  return {
    addSafeWallet,
    updateSafeWallet,
    getSafeWalletsByOrganization,
    getSafeWalletsByAddress
  };
};

export default useSafeAPI;
