import chevrondown from '@assets/chevron-down.svg';
import avalanche from '@assets/icons/chains/avalanche.svg';
import bsc from '@assets/icons/chains/bsc.svg';
import cronos from '@assets/icons/chains/cronos.svg';
import ethereum from '@assets/icons/chains/ethereum.svg';
import fantom from '@assets/icons/chains/fantom.svg';
import polygon from '@assets/icons/chains/polygon.svg';
import React from 'react';

export const NetworkSelector = () => {
  const [showNetworks, setShowNetworks] = React.useState(false);
  const [selectedNetwork, setSelectedNetwork] = React.useState({ icon: ethereum, title: 'Ethereum', code: 'ETH' });
  const networkList = [
    { id: 1, icon: ethereum, title: 'Ethereum', code: 'ETH' },
    { id: 2, icon: bsc, title: 'BSC', code: 'BSC' },
    { id: 3, icon: polygon, title: 'Polygon', code: 'MATIC' },
    { id: 4, icon: avalanche, title: 'Avalanche', code: 'AVAX' },
    { id: 5, icon: fantom, title: 'Fantom', code: 'FTM' },
    { id: 5, icon: cronos, title: 'Cronos', code: 'CRO' }
  ];
  const selectNetwork = (network: any) => {
    setShowNetworks(false);
    setSelectedNetwork({
      icon: network.icon,
      title: network.title,
      code: network.code
    });
  };
  return (
    <div className="relative sm:w-32 lg:w-44 shrink-0">
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
          src={chevrondown}
          alt="More"
          className="hidden sm:block sm:h-4"
          style={{ rotate: showNetworks ? '180deg' : '0deg', transition: 'all 0.2s ease' }}
        />
      </div>
      {showNetworks && (
        <div className="absolute top-12 flex flex-col bg-gray-50 border border-gray-200 rounded-3xl w-full py-1 px-2 sm:px-3">
          {networkList.map((network: any) => (
            <div
              key={network.id}
              className="h-10 flex flex-row items-center sm:gap-2 cursor-pointer transition-all hover:translate-x-1"
              onClick={() => selectNetwork(network)}>
              <img src={network.icon} alt={network.title} />
              <p className="text-sm text-primary-900 font-medium">
                <span className="hidden sm:block lg:hidden">{network.code}</span>
                <span className="hidden lg:block">{network.title}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
