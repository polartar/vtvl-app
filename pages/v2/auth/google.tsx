import useAuthAPI from '@api-hooks/useAuth';
import { REDIRECT_URIS } from '@utils/constants';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const GoogleSignIn = () => {
  const { loginWithGoogle } = useAuthAPI();
  const router = useRouter();

  const login = async () => {
    try {
      const params: any = new URL(window.location.toString());
      const code = params.searchParams.get('code');
      console.log('Google Sign in', params);

      const signing = await loginWithGoogle({ code, redirectUri: REDIRECT_URIS.AUTH_GOOGLE_LOGIN });
      // Redirect to connect wallet page after verifying the code from google login
      router.push(REDIRECT_URIS.AUTH_GOOGLE_LOGIN);
    } catch (error) {
      console.log('Google signin: Something went wrong', error);
    }
  };

  useEffect(() => {
    login();
  }, []);

  return (
    <div className="pt-12 flex flex-col items-center justify-center h-full">
      <h1>Google sign in here</h1>
    </div>
  );
};

export default GoogleSignIn;
