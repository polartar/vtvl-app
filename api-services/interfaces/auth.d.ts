interface GoogleAuthCallbackRequest {
  redirectUri: string;
}

interface GoogleAuthLoginRequest {
  code: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

interface AuthWithEmailRequest {
  email: string;
}

interface VerifyEmailRequest {
  email: string;
  code: string;
}

interface ConnectWalletRequest {
  signature: string;
  address: string;
  utcTime: UTCString;
}
