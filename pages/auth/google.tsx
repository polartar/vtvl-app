import useGoogleAuth from '@hooks/useGoogleAuth';

const GoogleCallback = () => {
  useGoogleAuth();
  return (
    <div>
      <h1>Google callback heree</h1>
    </div>
  );
};

export default GoogleCallback;
