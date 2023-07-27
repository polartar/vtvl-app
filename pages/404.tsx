import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { IRole } from 'types/models/settings';
import { getCache } from 'utils/localStorage';
import { managerRoles, recipientRoles } from 'utils/routes';

const Page = () => {
  const router = useRouter();
  const [fallbackPath, setFallbackPath] = useState('/onboarding');
  // Get cached data for the user
  useEffect(() => {
    const persistedUser = getCache();
    const { user, roleOverride } = persistedUser;
    const userRole =
      (user?.memberInfo?.role === IRole.FOUNDER && roleOverride ? roleOverride : user?.memberInfo?.role) ||
      user?.memberInfo?.role ||
      IRole.ANONYMOUS;
    const fallbackTo = managerRoles.includes(userRole)
      ? '/dashboard'
      : recipientRoles.includes(userRole)
      ? '/claim-portal'
      : '/onboarding';
    setFallbackPath(fallbackTo);
  }, []);

  return (
    <div className="absolute left-0 top-0 bottom-0 right-0 flex justify-center items-center">
      <div className="relative w-[800px] h-[800px]">
        <Image src="/images/404.gif" layout="fill" alt="Page not found" />
        <div
          className="absolute bottom-[80px] left-0 right-0 flex flex-col
         items-center">
          <h2 className="text-3xl text-[#101828] text-center font-semibold">Oops!</h2>
          <p className="p-5 text-center text-[#667085] text-lg font-medium">
            We can’t seem to find the page you are looking for
          </p>
          <button className="secondary" onClick={() => router.push(fallbackPath)}>
            Go back home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
