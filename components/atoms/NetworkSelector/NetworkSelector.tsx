import { useWeb3React } from '@web3-react/core';
import React, { useEffect } from 'react';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { toHex } from 'utils/web3';

const NetworkSelector = () => {
  const { library, account, active, chainId } = useWeb3React();
  const [showNetworks, setShowNetworks] = React.useState(false);
  const [selectedNetwork, setSelectedNetwork] = React.useState({
    icon: '/icons/chains/ethereum.svg',
    title: 'Ethereum',
    code: 'ETH'
  });

  useEffect(() => {
    if (!active) setShowNetworks(false);
    if (chainId) {
      setSelectedNetwork({
        icon: SupportedChains[chainId as SupportedChainId].icon,
        title: SupportedChains[chainId as SupportedChainId].title,
        code: SupportedChains[chainId as SupportedChainId].code
      });
    }
  }, [active, chainId]);

  const selectNetwork = async (network: any) => {
    setShowNetworks(false);
    console.log('we have network here ', network);
    try {
      await library.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: toHex(network.id) }]
      });
      console.log('switched success ');
      setSelectedNetwork({
        icon: network.icon,
        title: network.title,
        code: network.code
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await library.provider.request({
            method: 'wallet_addEthereumChain',
            params: [{ chainId: toHex(network.id), chainName: network.title, rpcUrls: [network.rpc] }]
          });
          setSelectedNetwork({
            icon: network.icon,
            title: network.title,
            code: network.code
          });
        } catch (error) {
          console.log(error);
        }
      }
    }
  };

  return (
    <div className="relative sm:w-32 lg:w-44 shrink-0" tabIndex={0} onBlur={() => setShowNetworks(false)}>
      <div
        className="flex flex-row items-center justify-between sm:gap-1 md:gap-3 bg-gray-50 border border-gray-200 rounded-3xl px-2 sm:px-3"
        onClick={() => setShowNetworks(!showNetworks)}>
        <div className="h-10 shrink-0 grow flex flex-row items-center sm:gap-2 cursor-pointer">
          <img src={selectedNetwork.icon} className="shrink-0" alt={selectedNetwork.title} />
          <p className="text-sm text-primary-900 font-medium">
            <span className="hidden sm:block lg:hidden">{selectedNetwork.code}</span>
            <span className="hidden lg:block">{selectedNetwork.title}</span>
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
      </div>
      {showNetworks && (
        <div className="absolute z-10 top-12 flex flex-col bg-gray-50 border border-gray-200 rounded-3xl w-full py-1 px-2 sm:px-3">
          {Object.keys(SupportedChains).map((key: any, idx: number) => (
            <div
              key={key}
              className="h-10 flex flex-row items-center sm:gap-2 cursor-pointer transition-all hover:translate-x-1"
              onClick={async () => await selectNetwork(SupportedChains[key as SupportedChainId])}>
              <img
                src={SupportedChains[key as SupportedChainId].icon}
                alt={SupportedChains[key as SupportedChainId].title}
              />
              <p className="text-sm text-primary-900 font-medium">
                <span className="hidden sm:block lg:hidden">{SupportedChains[key as SupportedChainId].code}</span>
                <span className="hidden lg:block">{SupportedChains[key as SupportedChainId].title}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NetworkSelector;
