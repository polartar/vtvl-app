import useAuthAPI from '@api-hooks/useAuth';
import { REDIRECT_URIS } from '@utils/constants';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function useGoogleAuth() {
  let timeout: NodeJS.Timeout;

  const { loginWithGoogle } = useAuthAPI();
  const router = useRouter();

  const initializeGoogleAuth = async () => {
    try {
      const params: any = new URL(window.location.toString());
      const code = decodeURIComponent(params.searchParams.get('code'));
      console.log('Google Sign in', params, code);

      const signing = await loginWithGoogle({ code, redirectUri: REDIRECT_URIS.AUTH_GOOGLE_LOGIN });
      // Redirect to connect wallet page after verifying the code from google login
      console.log('GOOGLE SIGNING STATUS', signing);
      if (signing !== undefined) {
        router.push(REDIRECT_URIS.AUTH_GOOGLE_LOGIN);
      } else throw signing;
    } catch (error) {
      console.log('Google signin: Something went wrong', error);
      router.push(REDIRECT_URIS.AUTH_REGISTER);
    }
  };

  useEffect(() => {
    // Ensure that initialization only happens once by debouncing it
    timeout = setTimeout(initializeGoogleAuth, 600);
    return () => {
      clearTimeout(timeout);
    };
  }, []);
}
