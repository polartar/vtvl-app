import CoreAPIService from './CoreAPIService';

class AuthAPIService {
  getGoogleAuthCallback = (payload: GoogleAuthCallbackRequest) =>
    CoreAPIService.post<string>('/auth/google-callback', payload);

  googleAuthLogin = (payload: GoogleAuthLoginRequest) =>
    CoreAPIService.post<AuthResponse>('/auth/google-login', payload);

  loginWithEmail = (payload: AuthWithEmailRequest) => CoreAPIService.post<string>('/auth/login', payload);

  signupWithEmail = (payload: AuthWithEmailRequest) => CoreAPIService.post<string>('/auth/signup', payload);

  validateVerificationCode = (payload: VerifyEmailRequest) =>
    CoreAPIService.post<AuthResponse>('/auth/validate', payload);

  connectWallet = (payload: ConnectWalletRequest) => CoreAPIService.post<AuthResponse>('/auth/wallet', payload);
}

export default new AuthAPIService();
