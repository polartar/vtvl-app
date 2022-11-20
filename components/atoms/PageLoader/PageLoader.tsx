import Lottie from 'lottie-react';
import VTVLLoaderData from 'public/VTVL_Loader.json';

const PageLoader = () => {
  return (
    <div className="w-full flex items-center justify-center">
      <div className="mx-auto text-center">
        <Lottie animationData={VTVLLoaderData} style={{ width: 132, margin: 'auto' }} />
        <p className="sora text-h1 font-semibold mb-4">Drum roll please...</p>
        <p className="text-sm text-neutral-500">
          We’re putting everything together.
          <br />
          This will only take only a few seconds or 15 drum rolls :)
        </p>
      </div>
    </div>
  );
};

export default PageLoader;
