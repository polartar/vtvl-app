import Chip from '@components/atoms/Chip/Chip';
import MediaAsset from '@components/atoms/MediaAsset/MediaAsset';
import { useAuthContext } from '@providers/auth.context';
import { useGlobalContext } from '@providers/global.context';
import { useOnboardingContext } from '@providers/onboarding.context';
import { useTokenContext } from '@providers/token.context';
import { useWeb3React } from '@web3-react/core';
import { NextPage } from 'next';
import { useEffect } from 'react';

const TeamWelcome: NextPage = () => {
  const { library } = useWeb3React();
  const { mintFormState } = useTokenContext();
  const {
    website: { assets }
  } = useGlobalContext();
  const { user } = useAuthContext();
  const { setInProgress, completeOnboarding } = useOnboardingContext();

  // Handles the importation of token
  // Prompts the user's wallet platform
  const handleImportToken = async () => {
    try {
      if (!library || !mintFormState) return;
      await library.provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: mintFormState?.address,
            symbol: mintFormState?.symbol,
            decimals: mintFormState?.decimals || 18,
            image: mintFormState?.logo
          }
        }
      });

      // Check if successful or rejects
      // on success, redirect the user to /claim-portal page
      completeOnboarding();
    } catch (error) {
      // on reject, just close the prompt and do nothing
      console.error(error);
    }
  };

  useEffect(() => {
    setInProgress(true);
  }, []);

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center text-center p-10">
      <Chip label="Organization" rounded color="gray" />
      <MediaAsset src={assets?.logoImage?.src} className="h-10 md:h-12 mt-7 mb-8" />
      <MediaAsset src="/limewire-one.json" animated={true} active={true} className="h-80" />
      <h1 className="h2 font-medium text-center mt-3">
        Hello, {user?.memberInfo?.name || user?.memberInfo?.email || 'you'}!
      </h1>
      <p className="paragraphy-small neutral-text mt-4 mb-8">
        You're almost there! Let's start claiming your tokens. To get started, first let's add{' '}
        {mintFormState.symbol || mintFormState.name || 'Token'} to your wallet by clicking "
        <strong>Import {mintFormState.symbol} to your wallet</strong>"
      </p>
      <button type="button" className="primary flex" onClick={handleImportToken}>
        <span>
          Import <strong>{mintFormState.symbol || mintFormState.name || 'Token'}</strong> to your wallet
        </span>
      </button>
    </div>
  );
};

export default TeamWelcome;
