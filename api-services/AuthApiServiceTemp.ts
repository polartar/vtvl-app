import CoreApiService from '@api-services/CoreApiServiceTemp';
import { PLATFORM_NAME } from '@utils/constants';

class AuthApiService {
  getGoogleAuthCallback = (payload: GoogleAuthCallbackRequest) =>
    CoreApiService.post<string>('/auth/google-callback', payload);

  googleAuthLogin = (payload: GoogleAuthLoginRequest) =>
    CoreApiService.post<AuthResponse>('/auth/google-login', payload);

  loginWithEmail = (payload: AuthWithEmailRequest) =>
    CoreApiService.post<string>('/auth/login', { ...payload, platform: PLATFORM_NAME });

  signupWithEmail = (payload: AuthWithEmailRequest) =>
    CoreApiService.post<string>('/auth/signup', { ...payload, platform: PLATFORM_NAME });

  validateVerificationCode = (payload: VerifyEmailRequest) =>
    CoreApiService.post<AuthResponse>('/auth/validate', payload);

  connectWallet = (payload: ConnectWalletRequest) => CoreApiService.post<AuthResponse>('/auth/wallet', payload);
}

export default new AuthApiService();
