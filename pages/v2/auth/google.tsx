import useGoogleAuth from '@hooks/useGoogleAuth';

const GoogleSignIn = () => {
  useGoogleAuth();
  return (
    <div className="pt-12 flex flex-col items-center justify-center h-full">
      <h1>Google sign in here</h1>
    </div>
  );
};

export default GoogleSignIn;
