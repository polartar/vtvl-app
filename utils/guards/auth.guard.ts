import { useAuthContext } from '@providers/auth.context';
import { GetServerSidePropsContext } from 'next';

export const authGuard = (context: GetServerSidePropsContext) => {
  const { isAuthenticated } = useAuthContext();

  if (!isAuthenticated) {
    context.res.writeHead(302, { Location: '/onboarding/sign-up' });
    context.res.end();
  }
};
