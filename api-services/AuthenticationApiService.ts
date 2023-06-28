import MainApiService from '@api-services/MainApiService';
import { PLATFORM_NAME } from '@utils/constants';

class AuthenticationApiService {
  getGoogleAuthCallback = (payload: GoogleAuthCallbackRequest) =>
    MainApiService.post<string>('/auth/google-callback', payload);

  googleAuthLogin = (payload: GoogleAuthLoginRequest) =>
    MainApiService.post<AuthResponse>('/auth/google-login', payload);

  loginWithEmail = (payload: AuthWithEmailRequest) =>
    MainApiService.post<string>('/auth/login', { ...payload, platform: PLATFORM_NAME });

  signupWithEmail = (payload: AuthWithEmailRequest) =>
    MainApiService.post<string>('/auth/signup', { ...payload, platform: PLATFORM_NAME });

  validateVerificationCode = (payload: VerifyEmailRequest) =>
    MainApiService.post<AuthResponse>('/auth/validate', payload);

  connectWallet = (payload: ConnectWalletRequest) => MainApiService.post<AuthResponse>('/auth/wallet', payload);
}

export default new AuthenticationApiService();
