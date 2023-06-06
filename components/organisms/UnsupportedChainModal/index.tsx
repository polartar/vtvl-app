import Button from '@components/atoms/Button/Button';
import { useWeb3React } from '@web3-react/core';
import WarningIcon from 'public/icons/warning.svg';
import React, { useEffect, useRef, useState } from 'react';
import Fade from 'react-reveal/Fade';
import { toast } from 'react-toastify';
import { SafeSupportedChains, SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { truncateLabel } from 'utils/shared';
import { toHex } from 'utils/web3';

interface IUnsupportedChainModalProps {
  hideModal: () => void;
}

const UnsupportedChainModal: React.FC<IUnsupportedChainModalProps> = ({ hideModal }) => {
  const { library, account, active, chainId } = useWeb3React();
  const [showNetworks, setShowNetworks] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<{ id: number; icon: string; title: string; code: string }>();
  const promptToast = useRef(null);

  const selectNetwork = async (network: any) => {
    // By default close prompt
    toast.dismiss(promptToast.current!);
    console.log('we have network here ', network);
    // Try and request initial changing of network
    const { icon, title, code, id, rpc } = network;
    try {
      // Do nothing and just return if selecting the same network
      if (id === selectedNetwork?.id) return;
      // Attempt to request to change network
      await library.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: toHex(id) }]
      });
      setSelectedNetwork({ id, icon, title, code });
      toast.success(`You've switched to ${title} network.`);
    } catch (switchError: any) {
      // Check for errors
      if (switchError.code === 4902) {
        try {
          // Try to request to add the chain first
          await library.provider.request({
            method: 'wallet_addEthereumChain',
            params: [{ chainId: toHex(id), chainName: title, rpcUrls: [rpc] }]
          });
          setSelectedNetwork({ id, icon, title, code });
          toast.success(`You've added and switched to ${title} network.`);
        } catch (error: any) {
          // If unsuccessful, display an error
          console.log('ERROR trying to add', error);
          toast.error(`Switching to ${title} network failed!`);
        }
      } else {
        // Just display a default message based on the thrown error
        toast.error(`Switching to ${title} network failed!`);
      }
    }
  };

  const promptNetworkChange = async (network: any) => {
    // By default closes the network options and existing prompt
    setShowNetworks(false);
    toast.dismiss(promptToast.current!);

    // Show warning prompt
    toast.warning(
      <div>
        <p>Switch to {network.title} network?</p>
        <div className="flex flex-row gap-1 items-center mt-2">
          <Button danger outline size="small" onClick={() => toast.dismiss(promptToast.current!)}>
            Nope!
          </Button>
          <Button primary size="small" onClick={() => selectNetwork(network)}>
            Yeah
          </Button>
        </div>
      </div>,
      { autoClose: false, icon: false }
    );
  };

  useEffect(() => {
    if (chainId && SafeSupportedChains.find((c) => c === chainId)) {
      hideModal();
    }
  }, [chainId, hideModal]);

  return (
    <div className="p-6 rounded-3xl border border-[#d0d5dd] bg-white">
      <div className="p-2 w-full">
        {account ? (
          <h1 className="text-center text-[#101828] text-3xl font-semibold">
            {account.slice(0, 6)}...{account.slice(4)}
          </h1>
        ) : null}
        <div className="px-2 py-1 bg-[#fee2e2] text-[#ef4444] text-xs rounded-8 text-center mt-2">
          Your wallet is on an unsupported chain by Safe. <br />
          Please select a supported chain to proceed with creating a new Safe wallet.
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div className="text-sm text-[#192126] font-medium">Current Network</div>
        <div className="text-sm text-[#344054]">{SupportedChains[chainId as SupportedChainId]?.title}</div>
      </div>
      <div className="relative w-full mt-5" tabIndex={0} onBlur={() => setShowNetworks(false)}>
        <div
          className="flex flex-row items-center justify-between sm:gap-1 md:gap-3 bg-white border border-gray-200 rounded-xl px-2 sm:px-3"
          onClick={() => setShowNetworks(!showNetworks)}>
          {selectedNetwork ? (
            <>
              <div className="h-10 shrink-0 grow flex flex-row items-center sm:gap-2 cursor-pointer">
                <img src={selectedNetwork.icon} className="shrink-0 w-6 h-6 rounded-full" alt={selectedNetwork.title} />
                <p className="text-sm text-primary-900 font-medium">
                  <span className="hidden sm:block lg:hidden">{selectedNetwork.code}</span>
                  <span className="hidden lg:block">{truncateLabel(selectedNetwork.title, 10)}</span>
                </p>
              </div>
              <img
                src="/chevron-down.svg"
                alt="More"
                className="hidden sm:block sm:h-4"
                style={{
                  rotate: showNetworks ? '180deg' : '0deg',
                  transition: 'all 0.2s ease'
                }}
              />
            </>
          ) : (
            <div className="h-10 shrink-0 grow flex flex-row items-center sm:gap-1 cursor-pointer w-full">
              <WarningIcon className="hidden sm:block sm:h-4 text-warning-500" />
              <p className="text-sm text-primary-900 font-medium text-center whitespace-nowrap">Unsupported Network</p>
              <img
                src="/chevron-down.svg"
                alt="More"
                className="hidden sm:block sm:h-4 ml-auto"
                style={{
                  rotate: showNetworks ? '180deg' : '0deg',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>
          )}
        </div>
        {showNetworks && (
          <div className="absolute z-10 top-12 flex flex-col bg-white border border-gray-200 rounded-3xl w-full py-1 px-2 sm:px-3">
            <Fade cascade bottom duration={300}>
              {SafeSupportedChains.map((chainId: number) => (
                <div
                  key={chainId}
                  className="h-10 flex flex-row items-center sm:gap-2 cursor-pointer transition-all hover:translate-x-1"
                  onClick={async () => await promptNetworkChange(SupportedChains[chainId as SupportedChainId])}>
                  <img
                    className="w-6 h-6 rounded-full"
                    src={SupportedChains[chainId as SupportedChainId].icon}
                    alt={SupportedChains[chainId as SupportedChainId].title}
                  />
                  <p className="text-sm text-primary-900 font-medium">
                    <span className="hidden sm:block lg:hidden">
                      {SupportedChains[chainId as SupportedChainId].code}
                    </span>
                    <span className="hidden lg:block" title={SupportedChains[chainId as SupportedChainId].title}>
                      {truncateLabel(SupportedChains[chainId as SupportedChainId].title, 12)}
                    </span>
                  </p>
                </div>
              ))}
            </Fade>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnsupportedChainModal;
