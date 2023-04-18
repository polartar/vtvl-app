import { useAuthContext } from '@providers/auth.context';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { IUserType } from 'types/models/member';

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
  const { user, switchRole } = useAuthContext();

  useEffect(() => {
    // Gets the current path being accessed.
    const currentPath = router.pathname;

    // Check if the current route is protected.
    const currentRouteIsProtected = options.routes.find((route) => route.path === currentPath);

    // Do nothing if the route is not protected.
    if (!currentRouteIsProtected) return;

    // Check protected routes only when the user type is available.
    if (user?.memberInfo?.type) {
      // Gets the current role of the user from the Auth Context.
      const userRole = user?.memberInfo?.type || '';

      // For protected routes, filter out all the allowedRoutes for that particular user role.
      // If the user is a founder, they are able to switch role into investor.
      const allowedRoutes = options.routes.filter((route) =>
        switchRole
          ? route.allowedRoles.includes(userRole) || route.allowedRoles.includes(switchRole)
          : route.allowedRoles.includes(userRole)
      );

      // Check if the role is allowed in current path.
      const isAllowedRoute = allowedRoutes.some((route) => route.path === currentPath);

      // Redirect the user to the fallbackPath when the user is not allowed.
      if (!isAllowedRoute) {
        router.push(options.fallbackPath);
      }
    }
  }, [user?.memberInfo?.type, options.routes, options.fallbackPath]);
};

export default useRoleGuard;
