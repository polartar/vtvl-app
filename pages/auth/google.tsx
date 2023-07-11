import useGoogleAuth from '@hooks/useGoogleAuth';

const GoogleCallback = () => {
  useGoogleAuth();
  return (
    <div>
      <h1>Redirecting to connect wallet page...</h1>
    </div>
  );
};

export default GoogleCallback;
