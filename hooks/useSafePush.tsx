// Came from an answer in the Next.JS Abort fetching component for route: "page" error
// https://stackoverflow.com/a/75872313
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const useSafePush = () => {
  const [onChanging, setOnChanging] = useState(false);
  const handleRouteChange = () => {
    setOnChanging(false);
  };
  const router = useRouter();
  // safePush is used to avoid route pushing errors when users click multiple times or when the network is slow:  "Error: Abort fetching component for route"
  const safePush = (path: any) => {
    if (onChanging) {
      return;
    }
    setOnChanging(true);
    router.push(path);
  };

  useEffect(() => {
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router, setOnChanging]);
  return { safePush };
};

export default useSafePush;
