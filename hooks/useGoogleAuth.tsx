import useAuthAPI from '@api-hooks/useAuth';
import useSafePush from '@hooks/useSafePush';
import { REDIRECT_URIS } from '@utils/constants';
import { useEffect } from 'react';

export default function useGoogleAuth() {
  let timeout: NodeJS.Timeout;

  const { loginWithGoogle } = useAuthAPI();
  const { safePush } = useSafePush();

  const initializeGoogleAuth = async () => {
    try {
      const params: any = new URL(window.location.toString());
      const code = decodeURIComponent(params.searchParams.get('code'));
      console.log('Google Sign in', params, code);

      await loginWithGoogle({ code, redirectUri: REDIRECT_URIS.AUTH_GOOGLE_CALLBACK });
      safePush(REDIRECT_URIS.AUTH_GOOGLE_LOGIN);
    } catch (error) {
      console.log('Google signin: Something went wrong', error);
      safePush(REDIRECT_URIS.AUTH_GOOGLE_LOGIN);
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
