import Lottie from 'lottie-react';
import VTVLLoaderData from 'public/VTVL_Loader.json';

interface IPageLoaderProps {
  loader?: 'default' | 'global';
}

const PageLoader = ({ loader = 'default' }: IPageLoaderProps) => {
  return (
    <div className="w-full flex items-start justify-center absolute top-0 bottom-0 left-0 right-0 z-20 bg-white pt-32 px-6">
      <div className="mx-auto text-center">
        {loader === 'global' ? (
          <img src="/global-loader.gif" className="h-32 w-32 mx-auto" />
        ) : (
          <Lottie animationData={VTVLLoaderData} style={{ width: 132, margin: 'auto' }} />
        )}
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
