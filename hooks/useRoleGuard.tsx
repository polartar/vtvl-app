import { useAuthContext } from '@providers/auth.context';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { IUser, IUserType } from 'types/models/member';
import { getCache, setCache } from 'utils/localStorage';
import { managerRoles, recipientRoles } from 'utils/routes';

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
  const { user, roleOverride, isAuthenticated } = useAuthContext();
  const [persistedUser, setPersistedUser] = useState<IUser | undefined>();

  // Checking of persisting user role
  useEffect(() => {
    const savedUser = getCache();
    if (savedUser?.user) {
      setPersistedUser(savedUser?.user as IUser);
    } else {
      setPersistedUser(undefined);
    }
    console.log('Getting cache works', savedUser?.user);
  }, []);

  // Whenever the user is updated, update the persistedUser
  useEffect(() => {
    console.log('CACHING WORKS', persistedUser, user);
    if (persistedUser) {
      setCache({ user: persistedUser });
    } else if (user) {
      setCache({ user });
    }
  }, [persistedUser, user]);

  // Watch for route changes
  useEffect(() => {
    const handleRouteChanges = (url: string) => {
      console.log('USE ROLE GUARD IN ACTION', url);
      // Gets the current path being accessed.
      const currentPath = url;
      const currentUser = persistedUser || user || undefined;

      // Check if the current route is protected.
      const currentRouteIsProtected = options.routes.find((route) => route.path === currentPath);

      // Do nothing if the route is not protected.
      if (!currentRouteIsProtected) return;

      // When not authenticated, make sure to block the user
      if (!isAuthenticated) {
        router.push(options.fallbackPath);
        return;
      }

      console.log('Current route is protected', currentRouteIsProtected, currentUser);

      // Check protected routes only when the user type is available.
      if (currentUser?.memberInfo?.type) {
        // Gets the current role of the user from the Auth Context.
        // Prioritise using the roleOverride if it is available.
        const userRole =
          (currentUser?.memberInfo?.type === 'founder' && roleOverride
            ? roleOverride
            : currentUser?.memberInfo?.type) ||
          currentUser?.memberInfo?.type ||
          '';

        // For protected routes, filter out all the allowedRoutes for that particular user role.
        // If the user is a founder, they are able to switch role into investor.
        const allowedRoutes = options.routes.filter((route) => route.allowedRoles.includes(userRole));

        // Check if the role is allowed in current path.
        const isAllowedRoute = allowedRoutes.some((route) => route.path === currentPath);

        // Redirect the user to the fallbackPath when the user is not allowed.
        if (!isAllowedRoute) {
          // Fallback path is determined based on the role group
          const fallbackTo = managerRoles.includes(userRole)
            ? '/dashboard'
            : recipientRoles.includes(userRole)
            ? '/claim-portal'
            : options.fallbackPath;
          console.log('FALLBACK', fallbackTo, userRole, currentUser);
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
  }, [user, roleOverride, persistedUser, options.routes, options.fallbackPath]);
};

export default useRoleGuard;
