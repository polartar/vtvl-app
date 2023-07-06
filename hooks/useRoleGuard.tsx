import { ILocalStorage } from 'interfaces/localStorage';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { IUserType } from 'types/models/member';
import { getCache } from 'utils/localStorage';
import { managerRoles, recipientRoles } from 'utils/routes';

import { useShallowState } from './useShallowState';

export type Route = {
  path: string;
  allowedRoles: IUserType[];
};

type RoleGuardOptions = {
  routes: Route[];
  fallbackPath: string;
};

const useRoleGuard = (options: RoleGuardOptions) => {
  const router = useRouter();
  const [auth, setAuth] = useShallowState<ILocalStorage | null>(null);

  const updateRoleGuardState = async () => {
    const persistedUser = await getCache();
    // Check if user exists
    if (persistedUser) {
      const stringAuth = JSON.stringify(auth);
      const stringCache = JSON.stringify(persistedUser);
      // Only update the states if there is an update.
      if (stringAuth !== stringCache) {
        await setAuth(persistedUser);
      }
    }
  };

  // Waits and sets the global auth state based on persisted user details
  useEffect(() => {
    updateRoleGuardState();
  }, []);

  // Watch for route changes
  useEffect(() => {
    // Only run this if auth is present already
    if (auth) {
      const { user, roleOverride, isAuthenticated } = auth;

      const handleRouteChanges = (url: string) => {
        // Check if the current route is protected.
        const currentRouteIsProtected = options.routes.find((route) => route.path === url);

        // Do nothing if the route is not protected.
        if (!currentRouteIsProtected) return;

        // When not authenticated, make sure to block the user
        if (!isAuthenticated) {
          router.push(options.fallbackPath);
          return;
        }

        // Check protected routes only when the user type is available.
        if (user?.memberInfo?.type) {
          // Gets the current role of the user from the Auth Context.
          // Prioritise using the roleOverride if it is available.
          const userRole =
            (user?.memberInfo?.type === 'founder' && roleOverride ? roleOverride : user?.memberInfo?.type) ||
            user?.memberInfo?.type ||
            '';

          // For protected routes, filter out all the allowedRoutes for that particular user role.
          // If the user is a founder, they are able to switch role into investor.
          const allowedRoutes = options.routes.filter((route) => route.allowedRoles.includes(userRole));

          // Check if the role is allowed in current path.
          const isAllowedRoute = allowedRoutes.some((route) => route.path === url);

          // Redirect the user to the fallbackPath when the user is not allowed.
          if (!isAllowedRoute) {
            // Fallback path is determined based on the role group
            const fallbackTo = managerRoles.includes(userRole)
              ? '/dashboard'
              : recipientRoles.includes(userRole)
                ? '/claim-portal'
                : options.fallbackPath;
            router.push(fallbackTo);
          }
          return;
        }
      };

      // Initial load or when refreshed
      handleRouteChanges(router.pathname);

      // Succeeding and navigational redirects
      router.events.on('routeChangeStart', handleRouteChanges);

      // Unsubscribe to avoid bubbling
      return () => {
        router.events.off('routeChangeStart', handleRouteChanges);
      };
    }
  }, [auth, options.routes, options.fallbackPath]);

  // Return the updateRoleGuardState to allow other components to use it to update the Role Guard's state.
  return { updateRoleGuardState };
};

export default useRoleGuard;
