import { useEffect } from 'react';

// Dynamically import the stylesheet
const ThemeLoader = ({ url }: { url: string }) => {
  useEffect(() => {
    const link = document.createElement('link');
    link.href = url;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    document.body.appendChild(link);
    return () => {
      document.body.removeChild(link);
    };
  }, [url]);

  return null;
};

export default ThemeLoader;
