interface GoogleAuthCallbackRequest {
  redirectUri: string;
}

interface GoogleAuthLoginRequest {
  code: string;
  redirectUri: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

interface AuthWithEmailRequest {
  email: string;
  redirectUri: string;
  platform?: string;
}

interface VerifyEmailRequest {
  code: string;
}

interface ConnectWalletRequest {
  signature: string;
  address: string;
  utcTime: UTCString;
}
